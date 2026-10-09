# 창세기전 3 파트 2 창모드 통합 런처 구현 계획서

## 1. 개요 및 요구사항
- **대상 게임**: 창세기전 3 파트 2 (`z:\my\창세기전\창세기전3 파트2\G3PartII.exe`)
- **현재 문제**:
  - Windows 11 환경에서 구동 시 DirectX 7 DirectDraw 독점 전체화면 모드로 인해 해상도가 800x600으로 강제 변경되고 모니터 전체 화면을 독점함.
  - 멀티태스킹 불가, 바탕화면 해상도 복구 오류, 다른 작업 병행 불가 문제 발생.
- **핵심 목표**:
  - 런처 자체가 모니터 전체를 가두지 않고 일반 창모드 윈도우로 동작.
  - **해당 런처 창 내부의 지정된 영역에서 게임이 부드럽게 실행되도록 임베딩(SetParent 도킹).**

---

## 2. 기술적 구현 가능성 분석 및 핵심 원리

### 2.1 DirectDraw 윈도우 래핑 (창모드 전환)
- **도구**: `cnc-ddraw` (DirectDraw to Direct3D 9 / OpenGL / GDI 래퍼, 오픈소스)
- **원리**: 
  - `G3PartII.exe`와 `G3PartII.dll`은 DirectDraw(`DDRAW.dll`) API를 호출합니다.
  - 게임 실행 폴더에 커스텀 `ddraw.dll`과 `ddraw.ini`를 배치하면 DirectDraw 호출을 현대 그래픽 API로 변환하여 **창모드(Windowed Mode) 및 테두리 없는 창(Borderless)**으로 렌더링할 수 있습니다.
  - Windows 11의 16비트 컬러 렌더링 깜빡임 및 DirectDraw 멈춤 현상을 원천적으로 해결합니다.

### 2.2 Win32 API 기반 외부 HWND 런처 내 임베딩 (SetParent Docking)
- **원리**:
  1. 런처에서 `G3PartII.exe` 프로세스를 실행합니다.
  2. 게임의 메인 윈도우 핸들(`HWND`)을 탐색합니다.
  3. `SetWindowLongPtr`을 호출하여 윈도우 스타일을 `WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS`로 변경하여 독립된 외곽 테두리를 제거합니다.
  4. `SetParent(hGameWnd, hLauncherPanel)`을 호출하여 런처의 뷰포트 패널로 도킹합니다.
  5. `SetWindowPos`로 런처 패널의 크기(`800x600` 또는 스케일링된 크기)에 정확히 맞춥니다.
- **결과**:
  - 게임이 런처 창 내부의 일부분으로 완벽히 통합되어 실행됩니다.
  - 런처 창을 드래그하여 옮기면 게임 화면도 런처와 함께 이동합니다.

---

## 3. 추천 기술 스택 및 아키텍처

- **언어/프레임워크**: C# (.NET Framework 4.8 / WinForms)
  - **선정 이유**:
    - Windows 데스크톱의 HWND 핸들 제어(`SetParent`, `HwndHost`)에서 가장 안정적이고 입증된 프레임워크입니다.
    - 웹 기반(Electron/Tauri)에서 발생하는 GPU 하드웨어 가속 레이어와 Win32 HWND 간의 Airspace 충돌(화면 가림, 깜빡임)이 전혀 발생하지 않습니다.
    - 성능: 메모리 20MB 미만, 즉각 구동, 블러 효과 없이 빠르고 세련된 창세기전3 파트2 다크 테마 UI를 제공합니다.
    - 단일 바이너리(`G3P2Launcher.exe`)로 컴파일되어 추가 설치 없이 바로 실행 가능합니다.

---

## 4. 모듈별 파일 구성 (작은 파일 분리 설계)

모든 소스 파일은 700줄 이하를 엄격히 준수하도록 역할을 분리합니다:

1. `src/GameEmbedder.cs`:
   - Win32 API (`SetParent`, `FindWindow`, `SetWindowLongPtr`, `SetWindowPos`)를 래핑한 HWND 도킹 엔진.
   - 프로세스 생명주기 관리 (게임 시작 감지, 종료 이벤트 알림).
2. `src/DDrawManager.cs`:
   - `cnc-ddraw` 바이너리 및 `ddraw.ini` 설정 파일 생성/관리.
   - 창모드, 해상도, 마우스 가둠 설정 동적 구성.
3. `src/SaveManager.cs`:
   - `G3P_II00.sav` ~ `G3P_II09.sav` 세이브 파일 감지.
   - 파티원 정보, 챕터 확인 및 무제한 원클릭 백업/복원 기능.
4. `src/RegistryHelper.cs`:
   - 볼륨(`BGMVolume`, `EffVolume`) 등 게임 레지스트리 설정 읽기/쓰기.
5. `src/LauncherForm.cs` & `src/LauncherForm.Designer.cs`:
   - 런처 UI 뷰포트 패널 + 사이드바 컨트롤.
6. `src/Program.cs`:
   - 애플리케이션 진입점.
7. `build.sh` (WSL bash 빌드 스크립트):
   - csc 컴파일러를 호출하여 단일 실행 파일 빌드.

---

## 5. 형님을 위한 추가 아이디어 제안 (런처 플러스 기능)

기본 요청사항(창모드 런처 내 실행) 외에 창세기전3 파트2를 더욱 쾌적하게 즐기실 수 있도록 다음 기능들을 함께 설계했습니다:

1. **화면 배율 스케일러 (Preset Scale)**:
   - 1x (800x600 - 오리지널)
   - 1.25x (1000x750)
   - 1.5x (1200x900)
   - 런처 배율 버튼을 누르면 런처 창과 게임 화면이 비율을 유지하며 선명하게 확대됩니다.
2. **세이브 슬롯 매니저 & 원클릭 백업/복원**:
   - 이전 세이브 에디터 분석 자료(`editor222`)를 바탕으로, 현재 세이브 파일의 슬롯별 백업(`backup_20261010_1.sav`) 및 롤백 지원.
   - 중요한 분기나 보스전 전후로 원클릭 퀵 백업 가능!
3. **마우스 커서 자유 탈출 토글 (Mouse Unclip)**:
   - 게임 플레이 중 런처 창 밖으로 마우스를 자유롭게 빼서 공략을 보거나 다른 작업을 할 수 있는 토글 단축키(`F11` / `F12`) 제공.
4. **BGM / 효과음 볼륨 슬라이더**:
   - 게임을 켜기 전에 런처에서 사운드 볼륨을 미리 조절하여 레지스트리에 즉시 반영.

---

## 6. 단계별 작업 순서

- [ ] **Step 1: DirectDraw 창모드 래퍼 준비 및 검증**
  - `cnc-ddraw` 최신 안정화 바이너리 다운로드 및 게임 디렉토리 배치
  - `ddraw.ini` 설정 최적화 (창모드 활성화, 테두리 제거, D3D9 렌더러 적용)
- [ ] **Step 2: HWND 도킹 엔진 (`GameEmbedder.cs`) 구현**
  - 게임 프로세스 실행 후 메인 HWND 탐색 루프 구현
  - `SetParent` 및 `SetWindowLongPtr` 자식 창 스타일 적용 및 정렬
- [ ] **Step 3: 런처 UI 구현 (`LauncherForm.cs`)**
  - 좌측: 800x600 게임 뷰포트 패널
  - 우측: 게임 실행/종료, 배율 조절, 세이브 백업, 사운드 볼륨 슬라이더
- [ ] **Step 4: WSL bash 기반 빌드 스크립트 작성 및 컴파일**
  - csc 컴파일러를 통해 `bin/G3P2Launcher.exe` 빌드
- [ ] **Step 5: 실제 게임 구동 및 런처 내 임베딩 통합 테스트**
  - 런처 창 이동/리사이즈 시 게임 연동 확인
  - 게임 종료 시 런처 정상 복귀 확인
  - APP_MAP.md 최신화
