# [구현 계획서] 창세기전 3 파트 2 세이브 에디터 통합 및 런처 연동

## 1. 개요
기존 `z:\my\창세기전\editor222\`에 구현된 웹 기반 세이브 에디터를 본 프로젝트의 `editor/` 디렉토리로 통합하고, 런처 사이드바에 **상단 탭 전환 UI(GAME / SAVE)** 및 **초경량 내장 로컬 API 서버(`EditorHttpServer`)**를 구현하여 세이브 파일을 클릭 한 번으로 웹 에디터에 자동 로드하고 게임 폴더로 즉시 저장/백업할 수 있는 원스톱 연동 환경을 구축합니다.

---

## 2. 사용자 확정 방향
- **원클릭 자동 로드 & 게임 폴더 직저장 (로컬 API 연동)**:
  - 브라우저 수동 드래그앤드롭 및 다운로드 후 복사하는 번거로움 완전 제거
  - 런처에서 세이브 슬롯 클릭 시 기본 브라우저에 해당 세이브가 이미 파싱되어 즉시 열림
  - 웹 에디터에서 저장 시 게임 폴더(`G3P_IIxx.sav`)로 즉시 직저장 & 원본 `.bak` 자동 생성
- **상단 탭 전환 UI (Tab Switch)**:
  - 우측 사이드바(310px) 상단에 `[ 🎮 GAME ]` / `[ 💾 SAVE ]` 탭 버튼 배치
  - 화면 공간을 낭비하거나 스크롤 압박 없이 쾌적한 탭 전환 제공

---

## 3. 세부 아키텍처 및 모듈 설계

### 3.1 파일 구조 매핑
```
launcher/
├── editor/                      # editor222에서 이식된 모던 웹 세이브 에디터
│   ├── index.html               # 에디터 메인 UI (로컬 API 자동 로드/저장 확장)
│   ├── src/                     # css, js (saveCodec, saveParser, inventoryStore 등)
│   ├── Data/                    # 게임 ID 매핑 텍스트 파일들
│   └── sample_saves/            # 샘플 세이브 파일들
├── src/
│   ├── Core/
│   │   ├── EditorHttpServer.cs  # [신규] 내장 초경량 로컬 HTTP 서버 (정적 서빙 + 세이브 REST API)
│   │   └── ...
│   └── UI/
│       ├── SaveSectionView.cs   # [신규] 세이브 슬롯 리스트 및 액션 버튼 전담 패널
│       ├── LauncherForm.cs      # 탭 전환(GAME/SAVE) 및 EditorHttpServer 생명주기 관리
│       └── ...
```

### 3.2 핵심 컴포넌트 명세

#### 1) `EditorHttpServer.cs` (`src/Core/EditorHttpServer.cs`)
- **기술**: .NET Framework 4.0 기본 `System.Net.HttpListener` (외부 라이브러리 0개, 초고속 구동)
- **포트**: 사용 가능한 로컬 포트 자동 탐색 (기본 18080)
- **제공 엔드포인트**:
  - `GET /`, `GET /src/*`, `GET /Data/*`: `editor/` 디렉토리 정적 파일 서빙
  - `GET /api/saves`: 게임 폴더 내 세이브 파일 목록(`G3P_II00.sav` ~ `G3P_II20.sav`) JSON 응답
  - `GET /api/save?file=...`: 특정 세이브 파일 바이너리 스트림 응답
  - `POST /api/save?file=...`: 에디터에서 수정된 바이너리 수신 -> `.bak` 자동 백업 후 게임 폴더 파일 덮어쓰기
  - `POST /api/backup-all`: 전체 세이브 날짜별 스냅샷 백업

#### 2) `editor/` 웹 에디터 연동 스크립트 확장
- `index.html` 및 `src/js/app.js` 수정:
  - URL 쿼리스트링 `?file=G3P_II01.sav` 감지 시 `fetch('/api/save?file=...')`로 자동 데이터 로드
  - [📥 세이브 저장] 버튼 클릭 시 `fetch('/api/save?file=...', { method: 'POST', body: buffer })` 호출하여 게임 폴더에 즉시 반영

#### 3) `SaveSectionView.cs` (`src/UI/SaveSectionView.cs`)
- 사이드바 내 세이브 전용 패널 (너비 270px)
- **컨트롤 구성**:
  - `SAVE SLOTS` 헤더
  - 커스텀 다크 테마 세이브 목록 (슬롯 번호, 파일 크기, 최종 수정일시 표시)
  - `[ ✏️ Open in Editor ]` 버튼 (더블클릭 또는 선택 후 클릭 시 브라우저 호출)
  - `[ 🔄 Refresh ]` 버튼 (실시간 목록 새로고침)
  - `[ 📦 Backup All ]` 버튼 (원클릭 전체 백업)
  - `[ 📂 Open Folder ]` 버튼 (게임 세이브 폴더 탐색기 열기)

#### 4) `LauncherForm.cs` 상단 탭 전환 레이아웃
- 상단 탭 헤더:
  - `[ 🎮 GAME ]` / `[ 💾 SAVE ]` 플랫 토글 버튼
- 활성 탭에 따라 사이드바 하위 뷰 교체:
  - GAME 탭: START GAME + DISPLAY SCALE + WINDOW & MOUSE
  - SAVE 탭: SaveSectionView
- 런처 실행 시 `EditorHttpServer.Start()`, 종료 시 `Stop()`

---

## 4. 단계별 구현 계획

1. **에디터 리소스 복사 및 배치**
   - `editor222/`의 `index.html`, `src/`, `Data/`, `sample_saves/`를 `launcher/editor/`로 복사.
2. **`EditorHttpServer.cs` 구현**
   - 정적 파일 서빙 및 세이브 CRUD API 엔드포인트 구현 (C# 5 호환 문법).
3. **웹 에디터 자동 로드 / 직저장 연동**
   - `editor/src/js/app.js`에 로컬 API 통신 레이어 연동.
4. **`SaveSectionView.cs` 구현**
   - 세이브 슬롯 탐색, 리스트 렌더링, 에디터 호출 이벤트 구현.
5. **`LauncherForm.cs` 탭 전환 및 서버 바인딩**
   - 상단 탭 버튼 및 패널 전환 로직 구현.
6. **빌드, 테스트 및 검증**
   - `build.sh`로 컴파일, 세이브 슬롯 로드 및 브라우저 원클릭 연동/저장 동작 검증.
7. **문서화 (`APP_MAP.md`)**
   - 새로운 컴포넌트 인터페이스 및 아키텍처 최신화.

---

## 5. 규칙 및 제약사항 준수
- **코드 크기 제한**: 파일당 700줄 이하 엄격 준수 (모든 파일 450줄 이내).
- **성능 최적화**: UI blur 배제, 메모이제이션, 세이브 파일 스트림 비동기 처리.
- **안전성**: 세이브 저장 시 원본 `.bak` 자동 백업으로 데이터 손실 방지.
- **Git 커밋/푸시**: 형님의 별도 요청이 있을 때까지 커밋/푸시 보류.
