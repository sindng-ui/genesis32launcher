# APP_MAP: 창세기전 3 파트 2 런처 (Genesis3 Part2 Launcher)

## 1. 개요
본 문서는 **창세기전 3 파트 2**를 현대 Windows 11 환경에서 전체화면 고정이 아닌 **창모드 런처 내부에서 구동**하기 위한 런처 프로젝트의 아키텍처, 컴포넌트, 인터페이스 및 파일 매핑을 정의합니다.

## 2. 시스템 아키텍처 및 핵심 기술 메커니즘
```
+-------------------------------------------------------------+
|              창세기전 3 파트 2 통합 런처 (Launcher)           |
|                                                             |
|  +-----------------------------+  +----------------------+  |
|  |     게임 뷰포트 영역         |  |   런처 제어 사이드바   |  |
|  |     (Game Viewport Panel)   |  |   (Sidebar Controls) |  |
|  |                             |  |                      |  |
|  |   [G3PartII.exe HWND 도킹]  |  | [▶ 게임 시작 / 중지] |  |
|  |   - DirectDraw 래퍼(cnc-ddraw)|  | [화면 배율 조절]     |  |
|  |     기반 창모드 렌더링       |  |  (1.0x, 1.25x, 1.5x) |  |
|  |   - G4MainWnd 정확 매칭     |  | [마우스 자유 토글]   |  |
|  |   - SetParent(game, panel)  |  |  (F11 단축키 지원)   |  |
|  |   - fixchilds=0 업스케일링   |  | [사운드 볼륨 제어]   |  |
|  |   - 동적 배율 ini 자동 주입 |  |  (BGM / SFX 슬라이더)|  |
|  +-----------------------------+  +----------------------+  |
+-------------------------------------------------------------+
```

### 2.1 DirectDraw 윈도우 래핑 (창모드 전환 및 업스케일링)
- **대상 게임**: `z:\my\창세기전\창세기전3 파트2\G3PartII.exe` (`G3PartII.dll`)
- **DirectDraw 래퍼**: `cnc-ddraw` (`ddraw.dll` + `ddraw.ini`)
- **동작 원리**: 게임의 DirectDraw Exclusive Fullscreen 모드를 D3D9 기반 Windowed 모드로 전환. 모니터 전체화면 독점 및 해상도 강제 변경 방지.
- **최적화 설정**:
  - `fixchilds=0`: 기본값인 2일 경우 자식 윈도우 감지 시 업스케일링이 강제 비활성화(Disables upscaling)되는 문제를 방지하여 뷰포트 크기에 맞추어 업스케일링 유지.
  - `width`, `height`: 런처에서 선택한 배율(800x600, 1000x750, 1200x900)에 맞추어 `ddraw.ini`에 동적으로 반영.
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
| `G3P2Launcher.exe` | 최상위 실행용 32비트 GUI 런처 바이너리 | 최신 빌드 완료 | 바이너리 (34KB) |
| `run.bat` | UTF-8 환경 런처 원클릭 실행 배치 파일 | 구현됨 | 5 lines |
| `build.sh` | WSL bash 기반 컴파일 스크립트 (csc.exe 연동) | 구현됨 | 42 lines |
| `src/Program.cs` | 진입점 및 애플리케이션 초기화 (DPI, 경로 탐색) | 구현됨 | 51 lines |
| `src/Win32/Win32Api.cs` | Win32 P/Invoke 정의 (SetParent, SetWindowPos 등) | 구현됨 | 154 lines |
| `src/Core/GameEmbedder.cs` | `G4MainWnd` 정밀 타겟팅 및 ClientRect 꽉 채움 동기화 도킹 엔진 | 구현 완료 | 308 lines |
| `src/Core/DDrawConfig.cs` | fixchilds=0 및 동적 해상도 반영 ddraw.ini 구성 | 개선 완료 | 168 lines |
| `src/Core/AudioRegistryHelper.cs` | 볼륨(BGM/SFX) 레지스트리 읽기/쓰기 헬퍼 | 구현됨 | 131 lines |
| `src/UI/LauncherTheme.cs` | 사이버 다크 테마 컬러 팔레트 및 폰트 정의 | 구현됨 | 30 lines |
| `src/UI/ModernButton.cs` | 블러 없는 세련된 커스텀 플랫 버튼 컨트롤 | 구현됨 | 103 lines |
| `src/UI/ModernSlider.cs` | 볼륨 조절용 커스텀 트랙바 슬라이더 컨트롤 | 구현됨 | 154 lines |
| `src/UI/LauncherForm.cs` | 런처 메인 UI 폼 (동적 배율 ddraw.ini 주입 및 Resize 동기화) | 개선 완료 | 470 lines |
| `assets/cnc-ddraw/` | cnc-ddraw v7.1.0.0 바이너리 및 셰이더 리소스 | 준비됨 | 리소스 |
| `docs/implementation_plan.md` | 구현 계획서 | 작성됨 | 문서 |
| `docs/task.md` | 작업 단계별 체크리스트 | 작성됨 | 문서 |
| `docs/test_results.txt` | 빌드 및 검증 테스트 보고서 | 작성됨 | 문서 |

---

## 4. 컴포넌트 인터페이스 명세

### 4.1 GameEmbedder (`src/Core/GameEmbedder.cs`)
- `Task<bool> LaunchAndEmbedAsync(string gameExePath, IntPtr parentPanelHwnd, int initialWidth, int initialHeight)`: 비동기로 게임을 구동하고 `G4MainWnd`를 탐색하여 지정된 패널에 도킹
- `void ResizeViewport(int width, int height)`: 도킹된 게임 윈도우의 해상도/크기 변경
- `void TerminateGame()`: 실행 중인 게임 프로세스 안전 종료
- `void FocusGame()`: 게임 창으로 포커스 및 전면 활성화 전달
- `event EventHandler<IntPtr> GameEmbedded`: 게임 창이 정상 도킹되었을 때 발생하는 이벤트
- `event EventHandler GameExited`: 게임 프로세스가 종료되었을 때 발생하는 이벤트
- `event EventHandler<string> StatusChanged`: 상태 변경 메시지 전달 이벤트

### 4.2 DDrawConfig (`src/Core/DDrawConfig.cs`)
- `bool EnsureWrapperInstalled(int targetWidth = 800, int targetHeight = 600)`: `ddraw.dll` 복사, 목표 해상도 및 `fixchilds=0` 설정 반영
- `void CleanCompatibilityFlags()`: 레지스트리에서 `G3PartII.exe`의 구형 `WIN98` 호환성 플래그 삭제
- `void WriteOptimizedIni(string iniPath, int targetWidth, int targetHeight, bool unclipMouse = true)`: 목표 해상도 주입 및 업스케일링 유지 ini 작성
