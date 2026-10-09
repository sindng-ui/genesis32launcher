using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using G3P2Launcher.Win32;

namespace G3P2Launcher.Core
{
    public class GameEmbedder
    {
        private Process _gameProcess;
        private IntPtr _gameHwnd = IntPtr.Zero;
        private IntPtr _parentContainerHwnd = IntPtr.Zero;
        private readonly object _lockObj = new object();
        private System.Windows.Forms.Timer _dockKeepTimer;

        public event EventHandler<IntPtr> GameEmbedded;
        public event EventHandler GameExited;
        public event EventHandler<string> StatusChanged;

        public bool IsRunning { get { return _gameProcess != null && !_gameProcess.HasExited; } }
        public IntPtr GameHwnd { get { return _gameHwnd; } }

        private void RaiseStatus(string msg)
        {
            var handler = StatusChanged;
            if (handler != null)
            {
                handler(this, msg);
            }
        }

        private void RaiseEmbedded(IntPtr hWnd)
        {
            var handler = GameEmbedded;
            if (handler != null)
            {
                handler(this, hWnd);
            }
        }

        private void RaiseExited()
        {
            var handler = GameExited;
            if (handler != null)
            {
                handler(this, EventArgs.Empty);
            }
        }

        public async Task<bool> LaunchAndEmbedAsync(string gameExePath, IntPtr parentPanelHwnd, int initialWidth, int initialHeight)
        {
            if (IsRunning)
            {
                RaiseStatus("Game is already running.");
                return false;
            }

            if (!File.Exists(gameExePath))
            {
                RaiseStatus("Game executable not found: " + gameExePath);
                return false;
            }

            _parentContainerHwnd = parentPanelHwnd;
            _gameHwnd = IntPtr.Zero;

            try
            {
                RaiseStatus("Starting game process...");

                string workDir = Path.GetDirectoryName(gameExePath);
                if (string.IsNullOrEmpty(workDir))
                {
                    workDir = string.Empty;
                }

                var psi = new ProcessStartInfo
                {
                    FileName = gameExePath,
                    WorkingDirectory = workDir,
                    UseShellExecute = true
                };

                _gameProcess = Process.Start(psi);
                if (_gameProcess == null)
                {
                    RaiseStatus("Failed to start game process.");
                    return false;
                }

                _gameProcess.EnableRaisingEvents = true;
                _gameProcess.Exited += OnProcessExited;

                RaiseStatus("Waiting for game window (G4MainWnd)...");

                int pid = _gameProcess.Id;
                IntPtr foundHwnd = await Task.Run(() => WaitForGameWindow(pid, 15000));

                if (foundHwnd == IntPtr.Zero)
                {
                    RaiseStatus("Could not find G4MainWnd game window.");
                    return false;
                }

                _gameHwnd = foundHwnd;

                // Perform embedding on the found window
                EmbedWindow(_gameHwnd, _parentContainerHwnd, initialWidth, initialHeight);

                RaiseStatus("Game successfully embedded inside launcher.");
                RaiseEmbedded(_gameHwnd);
                return true;
            }
            catch (Exception ex)
            {
                RaiseStatus("Error during launch/embed: " + ex.Message);
                return false;
            }
        }

        public void ResizeViewport(int width, int height)
        {
            lock (_lockObj)
            {
                if (_gameHwnd != IntPtr.Zero && Win32Api.IsWindowVisible(_gameHwnd))
                {
                    Win32Api.SetWindowPos(
                        _gameHwnd,
                        Win32Api.HWND_TOP,
                        0,
                        0,
                        width,
                        height,
                        Win32Api.SWP_NOACTIVATE | Win32Api.SWP_NOZORDER | Win32Api.SWP_FRAMECHANGED | Win32Api.SWP_SHOWWINDOW
                    );
                }
            }
        }

        public void FocusGame()
        {
            if (_gameHwnd != IntPtr.Zero)
            {
                Win32Api.SetForegroundWindow(_gameHwnd);
                Win32Api.SetFocus(_gameHwnd);
            }
        }

        public void TerminateGame()
        {
            try
            {
                if (_dockKeepTimer != null)
                {
                    _dockKeepTimer.Stop();
                    _dockKeepTimer.Dispose();
                    _dockKeepTimer = null;
                }

                if (IsRunning)
                {
                    RaiseStatus("Terminating game process...");
                    _gameProcess.CloseMainWindow();

                    Task.Run(() =>
                    {
                        if (!_gameProcess.WaitForExit(1500))
                        {
                            _gameProcess.Kill();
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                RaiseStatus("Error terminating game: " + ex.Message);
            }
        }

        private IntPtr WaitForGameWindow(int processId, int timeoutMs)
        {
            var sw = Stopwatch.StartNew();

            while (sw.ElapsedMilliseconds < timeoutMs)
            {
                if (_gameProcess == null || _gameProcess.HasExited)
                {
                    return IntPtr.Zero;
                }

                IntPtr candidate = FindGameMainWindow(processId);
                if (candidate != IntPtr.Zero)
                {
                    Thread.Sleep(200);
                    return candidate;
                }

                Thread.Sleep(100);
            }

            return IntPtr.Zero;
        }

        private IntPtr FindGameMainWindow(int processId)
        {
            IntPtr exactMatch = IntPtr.Zero;

            Win32Api.EnumWindows((hWnd, lParam) =>
            {
                uint pid;
                Win32Api.GetWindowThreadProcessId(hWnd, out pid);
                if (pid == (uint)processId && Win32Api.IsWindowVisible(hWnd))
                {
                    var sbClass = new StringBuilder(256);
                    Win32Api.GetClassName(hWnd, sbClass, sbClass.Capacity);
                    string className = sbClass.ToString();

                    if (className == "G4MainWnd")
                    {
                        exactMatch = hWnd;
                        return false;
                    }
                }
                return true;
            }, IntPtr.Zero);

            return exactMatch;
        }

        private void EmbedWindow(IntPtr childHwnd, IntPtr parentHwnd, int width, int height)
        {
            lock (_lockObj)
            {
                // 1. Dock to parent panel
                Win32Api.SetParent(childHwnd, parentHwnd);

                // 2. Adjust size and position to fit parent panel exactly
                Win32Api.SetWindowPos(
                    childHwnd,
                    Win32Api.HWND_TOP,
                    0,
                    0,
                    width,
                    height,
                    Win32Api.SWP_SHOWWINDOW | Win32Api.SWP_FRAMECHANGED | Win32Api.SWP_NOZORDER
                );

                // 3. Keep reinforcing position and dimensions to match parent container
                StartDockKeeper(childHwnd, parentHwnd);

                FocusGame();
            }
        }

        private void StartDockKeeper(IntPtr childHwnd, IntPtr parentHwnd)
        {
            int tickCount = 0;
            _dockKeepTimer = new System.Windows.Forms.Timer();
            _dockKeepTimer.Interval = 200;
            _dockKeepTimer.Tick += (s, e) =>
            {
                tickCount++;
                if (_gameProcess == null || _gameProcess.HasExited || tickCount > 15)
                {
                    _dockKeepTimer.Stop();
                    _dockKeepTimer.Dispose();
                    _dockKeepTimer = null;
                    return;
                }

                Win32Api.RECT parentRect;
                Win32Api.GetClientRect(parentHwnd, out parentRect);

                int targetW = parentRect.Width > 0 ? parentRect.Width : 800;
                int targetH = parentRect.Height > 0 ? parentRect.Height : 600;

                Win32Api.SetWindowPos(
                    childHwnd,
                    Win32Api.HWND_TOP,
                    0,
                    0,
                    targetW,
                    targetH,
                    Win32Api.SWP_SHOWWINDOW | Win32Api.SWP_FRAMECHANGED | Win32Api.SWP_NOZORDER
                );
            };
            _dockKeepTimer.Start();
        }

        private void OnProcessExited(object sender, EventArgs e)
        {
            if (_dockKeepTimer != null)
            {
                _dockKeepTimer.Stop();
                _dockKeepTimer.Dispose();
                _dockKeepTimer = null;
            }

            _gameHwnd = IntPtr.Zero;
            _gameProcess = null;
            RaiseStatus("Game closed.");
            RaiseExited();
        }
    }
}
