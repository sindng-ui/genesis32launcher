using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using G3P2Launcher.Core;
using G3P2Launcher.Win32;

namespace G3P2Launcher.UI
{
    public class LauncherForm : Form
    {
        private const int HOTKEY_ID_MOUSE = 0x5411;
        private const int HOTKEY_ID_TOPMOST = 0x5412;
        private const int VK_F11 = 0x7A;
        private const int VK_F12 = 0x7B;
        private const int SIDEBAR_WIDTH = 310;
        private const int CONTENT_WIDTH = 270;
        private const int PADDING_X = 20;

        private readonly string _gameDir;
        private readonly string _gameExe;
        private readonly string _assetsDir;

        private readonly GameEmbedder _embedder;
        private readonly DDrawConfig _ddrawConfig;
        private readonly LauncherConfig _launcherConfig;

        // UI Controls
        private Panel _viewportPanel;
        private Panel _sidebarPanel;
        private Label _lblTitle;
        private ModernButton _btnLaunch;
        private ScaleSectionView _scaleSectionView;
        private Label _lblWindowSec;
        private ModernButton _btnTopMost;
        private ModernButton _btnMouseClip;
        private Label _lblStatus;

        // State
        private double _currentScale = 1.0;
        private bool _isMouseFree = true;
        private bool _isGameRunning = false;

        public LauncherForm(string gameDir, string assetsDir)
        {
            _gameDir = gameDir;
            _gameExe = Path.Combine(gameDir, "G3PartII.exe");
            _assetsDir = assetsDir;

            _launcherConfig = LauncherConfig.Load();
            _currentScale = _launcherConfig.CurrentScale;

            _embedder = new GameEmbedder();
            _ddrawConfig = new DDrawConfig(_gameDir, _assetsDir);

            _embedder.StatusChanged += OnEmbedderStatusChanged;
            _embedder.GameEmbedded += OnGameEmbedded;
            _embedder.GameExited += OnGameExited;

            InitializeComponent();

            // Register F11 & F12 hotkeys
            Win32Api.RegisterHotKey(this.Handle, HOTKEY_ID_MOUSE, Win32Api.MOD_NONE, VK_F11);
            Win32Api.RegisterHotKey(this.Handle, HOTKEY_ID_TOPMOST, Win32Api.MOD_NONE, VK_F12);
        }

        private void InitializeComponent()
        {
            Text = "창세기전 3 파트 2 통합 런처 (Windowed Launcher)";
            BackColor = LauncherTheme.BackgroundDark;
            ForeColor = LauncherTheme.TextPrimary;
            Font = LauncherTheme.BodyFont;
            FormBorderStyle = FormBorderStyle.FixedSingle;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;

            // 1. Sidebar Panel (Right - expanded to 310px)
            _sidebarPanel = new Panel
            {
                Width = SIDEBAR_WIDTH,
                Dock = DockStyle.Right,
                BackColor = LauncherTheme.SidebarDark,
                AutoScroll = true
            };

            BuildSidebarControls();

            // 2. Viewport Panel (Left / Fill)
            _viewportPanel = new Panel
            {
                BackColor = LauncherTheme.ViewportBackground,
                Dock = DockStyle.Fill
            };
            _viewportPanel.Paint += OnViewportPaint;
            _viewportPanel.Resize += (s, e) =>
            {
                if (_isGameRunning)
                {
                    _embedder.ResizeViewport(_viewportPanel.ClientSize.Width, _viewportPanel.ClientSize.Height);
                }
            };

            Controls.Add(_viewportPanel);
            Controls.Add(_sidebarPanel);

            // Apply loaded user scale
            SetScale(_currentScale);
        }

        private void BuildSidebarControls()
        {
            // Title
            _lblTitle = new Label
            {
                Text = "THE WAR OF GENESIS III\nPART 2 LAUNCHER",
                Font = LauncherTheme.HeaderFont,
                ForeColor = LauncherTheme.AccentGold,
                Location = new Point(PADDING_X, 16),
                Size = new Size(CONTENT_WIDTH, 44),
                TextAlign = ContentAlignment.TopCenter
            };
            _sidebarPanel.Controls.Add(_lblTitle);

            // Launch Button
            _btnLaunch = new ModernButton
            {
                Text = "▶  START GAME",
                Location = new Point(PADDING_X, 70),
                Size = new Size(CONTENT_WIDTH, 48),
                BaseColor = Color.FromArgb(30, 80, 50),
                HoverColor = Color.FromArgb(40, 110, 68),
                AccentColor = LauncherTheme.AccentGreen,
                ShowAccentBorder = true
            };
            _btnLaunch.Click += OnLaunchButtonClicked;
            _sidebarPanel.Controls.Add(_btnLaunch);

            // Dynamic Scale Section View
            _scaleSectionView = new ScaleSectionView(_launcherConfig, CONTENT_WIDTH)
            {
                Location = new Point(PADDING_X, 130)
            };
            _scaleSectionView.ScaleSelected += (s, scale) => SetScale(scale);
            _scaleSectionView.LayoutChanged += (s, e) => UpdateSidebarVerticalLayout();
            _sidebarPanel.Controls.Add(_scaleSectionView);

            // Window / Mouse Behavior Header
            _lblWindowSec = new Label
            {
                Text = "WINDOW & MOUSE",
                Font = LauncherTheme.SubheaderFont,
                ForeColor = LauncherTheme.TextSecondary,
                UseMnemonic = false,
                Size = new Size(CONTENT_WIDTH, 18)
            };
            _sidebarPanel.Controls.Add(_lblWindowSec);

            // TopMost Toggle Button [F12]
            _btnTopMost = new ModernButton
            {
                Text = "📌 Always on Top [F12] (OFF)",
                Size = new Size(CONTENT_WIDTH, 36),
                BaseColor = Color.FromArgb(28, 45, 65),
                AccentColor = LauncherTheme.AccentCyan,
                ShowAccentBorder = true
            };
            _btnTopMost.Click += (s, e) => ToggleTopMost();
            _sidebarPanel.Controls.Add(_btnTopMost);

            // Mouse Lock Button [F11]
            _btnMouseClip = new ModernButton
            {
                Text = "🖱️ Mouse Free [F11]",
                Size = new Size(CONTENT_WIDTH, 36),
                BaseColor = Color.FromArgb(28, 45, 65),
                AccentColor = LauncherTheme.AccentCyan,
                ShowAccentBorder = true
            };
            _btnMouseClip.Click += (s, e) => ToggleMouseLock();
            _sidebarPanel.Controls.Add(_btnMouseClip);

            // Status Bar at bottom
            _lblStatus = new Label
            {
                Text = "STATUS: Ready",
                Font = LauncherTheme.SmallFont,
                ForeColor = LauncherTheme.TextMuted,
                Dock = DockStyle.Bottom,
                Height = 36,
                TextAlign = ContentAlignment.MiddleCenter
            };
            _sidebarPanel.Controls.Add(_lblStatus);

            UpdateSidebarVerticalLayout();
        }

        private void UpdateSidebarVerticalLayout()
        {
            if (_scaleSectionView == null) return;

            int curY = _scaleSectionView.Bottom + 16;

            _lblWindowSec.Location = new Point(PADDING_X, curY);
            curY += 24;

            _btnTopMost.Location = new Point(PADDING_X, curY);
            curY += 44;

            _btnMouseClip.Location = new Point(PADDING_X, curY);
            curY += 44;
        }

        private void SetScale(double scale)
        {
            _currentScale = scale;
            int vpWidth = (int)(800 * scale);
            int vpHeight = (int)(600 * scale);

            ClientSize = new Size(vpWidth + _sidebarPanel.Width, vpHeight);

            // Sync ddraw.ini target dimensions
            _ddrawConfig.WriteOptimizedIni(Path.Combine(_gameDir, "ddraw.ini"), vpWidth, vpHeight);

            if (_isGameRunning)
            {
                _embedder.ResizeViewport(_viewportPanel.ClientSize.Width, _viewportPanel.ClientSize.Height);
            }
        }

        private void ToggleTopMost()
        {
            TopMost = !TopMost;

            if (TopMost)
            {
                _btnTopMost.Text = "📌 Always on Top [F12] (ON)";
                _btnTopMost.BaseColor = Color.FromArgb(24, 60, 45);
                _btnTopMost.AccentColor = LauncherTheme.AccentGold;
            }
            else
            {
                _btnTopMost.Text = "📌 Always on Top [F12] (OFF)";
                _btnTopMost.BaseColor = Color.FromArgb(28, 45, 65);
                _btnTopMost.AccentColor = LauncherTheme.AccentCyan;
            }
            _btnTopMost.Invalidate();
        }

        private void ToggleMouseLock()
        {
            _isMouseFree = !_isMouseFree;

            if (_isMouseFree)
            {
                Win32Api.ClipCursor(IntPtr.Zero);
                _btnMouseClip.Text = "🖱️ Mouse Free [F11]";
                _btnMouseClip.BaseColor = Color.FromArgb(28, 45, 65);
                _btnMouseClip.AccentColor = LauncherTheme.AccentCyan;
            }
            else
            {
                if (_isGameRunning)
                {
                    var rect = new Win32Api.RECT();
                    Win32Api.GetClientRect(_viewportPanel.Handle, out rect);
                    Point p1 = _viewportPanel.PointToScreen(new Point(rect.Left, rect.Top));
                    Point p2 = _viewportPanel.PointToScreen(new Point(rect.Right, rect.Bottom));
                    rect.Left = p1.X;
                    rect.Top = p1.Y;
                    rect.Right = p2.X;
                    rect.Bottom = p2.Y;
                    Win32Api.ClipCursor(ref rect);
                }
                _btnMouseClip.Text = "🔒 Mouse Locked [F11]";
                _btnMouseClip.BaseColor = Color.FromArgb(70, 35, 35);
                _btnMouseClip.AccentColor = LauncherTheme.AccentRed;
            }
            _btnMouseClip.Invalidate();
        }

        private async void OnLaunchButtonClicked(object sender, EventArgs e)
        {
            if (_isGameRunning)
            {
                _embedder.TerminateGame();
                return;
            }

            _btnLaunch.Enabled = false;
            _lblStatus.Text = "STATUS: Setting up ddraw...";

            int vpWidth = _viewportPanel.ClientSize.Width > 0 ? _viewportPanel.ClientSize.Width : (int)(800 * _currentScale);
            int vpHeight = _viewportPanel.ClientSize.Height > 0 ? _viewportPanel.ClientSize.Height : (int)(600 * _currentScale);

            // 1. Ensure cnc-ddraw is copied and configured with target dimensions
            _ddrawConfig.EnsureWrapperInstalled(vpWidth, vpHeight);

            // 2. Launch and embed game
            bool ok = await _embedder.LaunchAndEmbedAsync(_gameExe, _viewportPanel.Handle, vpWidth, vpHeight);

            if (!ok)
            {
                _btnLaunch.Enabled = true;
            }
        }

        private void OnGameEmbedded(object sender, IntPtr hWnd)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<object, IntPtr>(OnGameEmbedded), sender, hWnd);
                return;
            }

            _isGameRunning = true;
            _btnLaunch.Text = "■  STOP GAME";
            _btnLaunch.BaseColor = Color.FromArgb(80, 30, 30);
            _btnLaunch.HoverColor = Color.FromArgb(110, 40, 40);
            _btnLaunch.AccentColor = LauncherTheme.AccentRed;
            _btnLaunch.Enabled = true;
            _btnLaunch.Invalidate();
            _viewportPanel.Invalidate();

            // Force resize once embedded to ensure 100% full fill
            _embedder.ResizeViewport(_viewportPanel.ClientSize.Width, _viewportPanel.ClientSize.Height);
        }

        private void OnGameExited(object sender, EventArgs e)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<object, EventArgs>(OnGameExited), sender, e);
                return;
            }

            _isGameRunning = false;
            Win32Api.ClipCursor(IntPtr.Zero);
            _btnLaunch.Text = "▶  START GAME";
            _btnLaunch.BaseColor = Color.FromArgb(30, 80, 50);
            _btnLaunch.HoverColor = Color.FromArgb(40, 110, 68);
            _btnLaunch.AccentColor = LauncherTheme.AccentGreen;
            _btnLaunch.Enabled = true;
            _btnLaunch.Invalidate();
            _viewportPanel.Invalidate();
        }

        private void OnEmbedderStatusChanged(object sender, string msg)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<object, string>(OnEmbedderStatusChanged), sender, msg);
                return;
            }
            _lblStatus.Text = "STATUS: " + msg;
        }

        private void OnViewportPaint(object sender, PaintEventArgs e)
        {
            if (!_isGameRunning)
            {
                Graphics g = e.Graphics;
                g.Clear(LauncherTheme.ViewportBackground);

                string title = "창세기전 3 PART 2";
                string sub = "우측 사이드바의 [▶ START GAME] 버튼을 누르면 이 창 안에서 게임이 실행됩니다.";
                string note = "단축키: [F11] 마우스 자유 이동 토글  |  [F12] 항상 최상단 표시 토글";

                using (var brush = new SolidBrush(LauncherTheme.AccentGold))
                using (var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
                {
                    g.DrawString(title, LauncherTheme.HeaderFont, brush, new RectangleF(0, _viewportPanel.Height / 2 - 50, _viewportPanel.Width, 30), sf);
                }

                using (var brush = new SolidBrush(LauncherTheme.TextSecondary))
                using (var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
                {
                    g.DrawString(sub, LauncherTheme.BodyFont, brush, new RectangleF(0, _viewportPanel.Height / 2 - 10, _viewportPanel.Width, 30), sf);
                }

                using (var brush = new SolidBrush(LauncherTheme.TextMuted))
                using (var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
                {
                    g.DrawString(note, LauncherTheme.SmallFont, brush, new RectangleF(0, _viewportPanel.Height / 2 + 30, _viewportPanel.Width, 30), sf);
                }
            }
        }

        protected override void WndProc(ref Message m)
        {
            if (m.Msg == Win32Api.WM_HOTKEY)
            {
                int hotkeyId = m.WParam.ToInt32();
                if (hotkeyId == HOTKEY_ID_MOUSE)
                {
                    ToggleMouseLock();
                }
                else if (hotkeyId == HOTKEY_ID_TOPMOST)
                {
                    ToggleTopMost();
                }
            }
            base.WndProc(ref m);
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            Win32Api.UnregisterHotKey(this.Handle, HOTKEY_ID_MOUSE);
            Win32Api.UnregisterHotKey(this.Handle, HOTKEY_ID_TOPMOST);
            Win32Api.ClipCursor(IntPtr.Zero);

            if (_isGameRunning)
            {
                _embedder.TerminateGame();
            }
            base.OnFormClosing(e);
        }
    }
}
