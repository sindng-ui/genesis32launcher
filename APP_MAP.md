# APP_MAP: 창세기전 3 파트 2 런처 (Genesis3 Part2 Launcher)

## 1. 개요
본 문서는 **창세기전 3 파트 2**를 현대 Windows 11 환경에서 전체화면 고정이 아닌 **창모드 런처 내부에서 구동**하기 위한 런처 프로젝트의 아키텍처, 컴포넌트, 인터페이스 및 파일 매핑을 정의합니다.

## 2. 시스템 아키텍처 및 핵심 기술 메커니즘
```
+-------------------------------------------------------------------+
|               창세기전 3 파트 2 통합 런처 (Launcher)               |
|                                                                   |
|  +-----------------------------+  +----------------------------+  |
|  |     게임 뷰포트 영역         |  |      확장 사이드바 (310px)  |  |
|  |     (Game Viewport Panel)   |  |     (Sidebar Controls)     |  |
|  |                             |  |                            |  |
|  |   [G3PartII.exe HWND 도킹]  |  |   [▶ 게임 시작 / 중지]     |  |
|  |   - DirectDraw 래퍼(cnc-ddraw)|  |   [배율 조절 섹션 (270px)] |  |
|  |     기반 창모드 렌더링       |  |    (1.0x, 1.25x, 1.5x,     |  |
|  |   - G4MainWnd 정확 매칭     |  |     2.0x, 2.2x ... 버튼들) |  |
|  |   - SetParent(game, panel)  |  |    [배율 입력] [ + Add ]   |  |
|  |   - fixchilds=0 업스케일링   |  |   [마우스 자유 토글 (F11)] |  |
|  |   - 동적 배율 ini 자동 주입 |  |   [사운드 볼륨 제어]       |  |
|  |   - 배율 설정 영구 저장     |  |    (BGM / SFX 슬라이더)    |  |
|  |   - 동적 세로 자동 정렬     |  |                            |  |
|  +-----------------------------+  +----------------------------+  |
+-------------------------------------------------------------------+
```

### 2.1 DirectDraw 윈도우 래핑 (창모드 전환 및 업스케일링)
- **대상 게임**: `z:\my\창세기전\창세기전3 파트2\G3PartII.exe` (`G3PartII.dll`)
- **DirectDraw 래퍼**: `cnc-ddraw` (`ddraw.dll` + `ddraw.ini`)
- **동작 원리**: 게임의 DirectDraw Exclusive Fullscreen 모드를 D3D9 기반 Windowed 모드로 전환. 모니터 전체화면 독점 및 해상도 강제 변경 방지.
- **최적화 설정**:
  - `fixchilds=0`: 기본값인 2일 경우 자식 윈도우 감지 시 업스케일링이 강제 비활성화(Disables upscaling)되는 문제를 방지하여 뷰포트 크기에 맞추어 업스케일링 유지.
  - `width`, `height`: 런처에서 선택한 배율(800x600, 1000x750, 1200x900, 1600x1200 및 커스텀 배율)에 맞추어 `ddraw.ini`에 동적으로 반영.
  - `maintas=false`, `boxing=false`: 레터박스/필러박스 없는 뷰포트 100% 꽉 찬 화면 출력
  - `posX=0`, `posY=0`, `border=false`: 패널 최상단 좌측 정렬 및 창 테두리 제거

### 2.2 Win32 HWND 임베딩 (SetParent Docking)
- **동작 원리**:
  1. `DDrawConfig.CleanCompatibilityFlags()`로 구형 Win98 호환성 격리 레이어 자동 정리
  2. `Process.Start`로 게임 프로세스 구동
  3. `G4MainWnd` 클래스명을 가진 실제 게임 메인 렌더링 윈도우 핸들(`HWND`) 정밀 매칭
  4. `SetParent(hGame, hViewportPanel)`로 런처 창 내부 패널에 도킹
  5. `_viewportPanel.ClientSize` 실제 픽셀 크기를 넘겨주고, `Resize` 이벤트 및 `StartDockKeeper`를 통해 뷰포트 영역 전체를 동기화

---

## 3. 디렉토리 및 파일 매핑

| 파일 / 디렉토리 경로 | 역할 및 설명 | 상태 | 라인 수 |
| :--- | :--- | :--- | :--- |
| `.gitignore` | Git 버전 관리 제외 목록 (빌드 산출물, 임시 스크립트 등) | 생성됨 | 35 lines |
| `G3P2Launcher.exe` | 최상위 실행용 32비트 GUI 런처 바이너리 | 최신 빌드 완료 | 바이너리 (41KB) |
| `run.bat` | UTF-8 환경 런처 원클릭 실행 배치 파일 | 구현됨 | 5 lines |
| `build.sh` | WSL bash 기반 컴파일 스크립트 (csc.exe 연동 및 루트 자동 복사) | 개선 완료 | 54 lines |
| `src/Program.cs` | 진입점 및 애플리케이션 초기화 (DPI, 경로 탐색) | 구현됨 | 51 lines |
| `src/Win32/Win32Api.cs` | Win32 P/Invoke 정의 (SetParent, SetWindowPos 등) | 구현됨 | 154 lines |
| `src/Core/LauncherConfig.cs` | 선택 배율 및 사용자 커스텀 배율 리스트 영구 저장/로드 모듈 (루트/bin 동적 경로 탐색) | 개선 완료 | 160 lines |
| `src/Core/GameEmbedder.cs` | `G4MainWnd` 정밀 타겟팅 및 ClientRect 꽉 채움 동기화 도킹 엔진 | 구현 완료 | 308 lines |
| `src/Core/DDrawConfig.cs` | fixchilds=0 및 동적 해상도 반영 ddraw.ini 구성 | 개선 완료 | 168 lines |
| `src/Core/AudioRegistryHelper.cs` | 볼륨(BGM/SFX) 레지스트리 읽기/쓰기 헬퍼 | 구현됨 | 131 lines |
| `src/UI/LauncherTheme.cs` | 사이버 다크 테마 컬러 팔레트 및 폰트 정의 | 구현됨 | 30 lines |
| `src/UI/ModernButton.cs` | 블러 없는 세련된 커스텀 플랫 버튼 컨트롤 | 구현됨 | 103 lines |
| `src/UI/ModernSlider.cs` | 볼륨 조절용 커스텀 트랙바 슬라이더 컨트롤 | 구현됨 | 154 lines |
| `src/UI/ScaleSectionView.cs` | 고정 좌표 그리드, 오름차순 정렬 및 동적 높이 반응형 배율 UI (우클릭 삭제 지원) | 개선 완료 | 248 lines |
| `src/UI/LauncherForm.cs` | 310px 시원한 확장 사이드바 및 동적 세로 자동 정렬 런처 메인 폼 | 개선 완료 | 456 lines |
| `assets/cnc-ddraw/` | cnc-ddraw v7.1.0.0 바이너리 및 셰이더 리소스 | 준비됨 | 리소스 |
| `docs/implementation_plan.md` | 구현 계획서 | 작성됨 | 문서 |
| `docs/task.md` | 작업 단계별 체크리스트 | 작성됨 | 문서 |
| `docs/test_results.txt` | 빌드 및 검증 테스트 보고서 | 작성됨 | 문서 |

---

## 4. 컴포넌트 인터페이스 명세

### 4.1 LauncherConfig (`src/Core/LauncherConfig.cs`)
- `static LauncherConfig Load()`: `launcher_settings.ini`에서 사용자 설정 불러오기
- `void Save()`: 현재 설정 및 커스텀 배율 리스트 파일에 저장
- `bool AddCustomScale(double scale)`: 사용자 지정 커스텀 배율 등록 (0.5 ~ 4.0 사이, 중복 방지)
- `bool RemoveCustomScale(double scale)`: 등록된 커스텀 배율 삭제
- `double CurrentScale`: 현재 활성화된 배율 (기본 1.0)
- `List<double> CustomScales`: 사용자가 등록한 커스텀 배율 목록

### 4.2 ScaleSectionView (`src/UI/ScaleSectionView.cs`)
- `event EventHandler<double> ScaleSelected`: 배율 버튼 클릭 또는 커스텀 배율 추가 시 발생하는 이벤트
- `event EventHandler LayoutChanged`: 배율 버튼이 늘어나서 패널 높이가 변경될 때 발생하는 레이아웃 동기화 이벤트
- `void SelectScale(double scale)`: 특정 배율 활성화 및 하이라이트 갱신
- `void RebuildScaleButtons()`: 기본 프리셋(1.0x, 1.25x, 1.5x, 2.0x)과 커스텀 배율 버튼들 동적 재구성 (우클릭 삭제 메뉴 지원)

### 4.3 LauncherForm (`src/UI/LauncherForm.cs`)
- `void UpdateSidebarVerticalLayout()`: 배율 섹션 크기 변화에 따라 하위 섹션(마우스/사운드 등)의 세로 위치를 자동으로 유연하게 재정렬
- `void SetScale(double scale)`: 배율에 따른 런처 창 크기 및 뷰포트 크기 변경, ddraw.ini 해상도 자동 동기화
