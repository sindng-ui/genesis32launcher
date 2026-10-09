# 작업 계획: 창세기전 3 파트 2 창모드 런처 구현

- [x] 1. DirectDraw 창모드 래퍼(`cnc-ddraw`) 준비 및 환경 구성 <!-- id: 1 -->
  - `cnc-ddraw` 다운로드/설치 스크립트 작성 및 게임 폴더(`z:\my\창세기전\창세기전3 파트2`) 내 `ddraw.dll` / `ddraw.ini` 최적화 구성 완료
- [x] 2. Core 모듈 개발 (C# WinForms / Win32) <!-- id: 2 -->
  - `src/Win32/Win32Api.cs`: SetParent, SetWindowPos, FindWindow, RegisterHotKey 등 Win32 P/Invoke 정의 완료
  - `src/Core/GameEmbedder.cs`: 게임 프로세스 실행, HWND 탐색, 자식 창 스타일 적용 및 런처 패널 도킹 엔진 완료
  - `src/Core/DDrawConfig.cs`: ddraw.ini 읽기/쓰기 및 창모드/렌더러/마우스 클립 설정 관리 완료
  - `src/Core/AudioRegistryHelper.cs`: 사운드 및 BGM 볼륨 레지스트리 제어 완료
- [x] 3. 런처 UI 및 기능 연동 <!-- id: 3 -->
  - `src/UI/LauncherTheme.cs`: 창세기전 3 파트 2 다크 사이버 테마 스타일 정의 완료
  - `src/UI/ModernButton.cs` / `ModernSlider.cs`: 블러 없는 가벼운 GDI+ 커스텀 UI 완료
  - `src/UI/LauncherForm.cs`: 뷰포트 영역(Panel) + 사이드바 컨트롤(실행/중지, 배율 1x/1.25x/1.5x, 볼륨 슬라이더, 마우스 클립 토글 F11) 완료
  - `src/Program.cs`: 엔트리포인트 및 고해상도 DPI 인식 설정 완료
- [x] 4. 빌드 파이프라인 구성 (`build.sh`) <!-- id: 4 -->
  - WSL bash에서 Windows .NET csc.exe를 호출하여 `G3P2Launcher.exe` 32비트 GUI 단일 실행 파일 빌드 완료 (32 KB)
- [x] 5. 실제 구동 및 검증 테스트 <!-- id: 5 -->
  - 런처 바이너리 컴파일 및 구조 검증, 테스트 결과 보고서(`docs/test_results.txt`) 기록 완료
- [x] 6. APP_MAP.md 최신화 및 완료 보고 <!-- id: 6 -->
  - 컴포넌트 인터페이스 명세 및 파일 매핑 최신화 완료
