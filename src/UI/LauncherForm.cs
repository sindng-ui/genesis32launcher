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
        private const int VK_F11 = 0x7A;

        private readonly string _gameDir;
        private readonly string _gameExe;
        private readonly string _assetsDir;

        private readonly GameEmbedder _embedder;
        private readonly DDrawConfig _ddrawConfig;

        // UI Controls
        private Panel _viewportPanel;
        private Panel _sidebarPanel;
        private ModernButton _btnLaunch;
        private ModernButton _btnScale10;
        private ModernButton _btnScale125;
        private ModernButton _btnScale150;
        private ModernButton _btnMouseClip;
        private ModernSlider _sliderBgm;
        private ModernSlider _sliderSfx;
        private Label _lblBgm;
        private Label _lblSfx;
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

            _embedder = new GameEmbedder();
            _ddrawConfig = new DDrawConfig(_gameDir, _assetsDir);

            _embedder.StatusChanged += OnEmbedderStatusChanged;
            _embedder.GameEmbedded += OnGameEmbedded;
            _embedder.GameExited += OnGameExited;

            InitializeComponent();
            ApplyInitialAudioSettings();

            // Register F11 hotkey for toggling mouse lock/unlock
            Win32Api.RegisterHotKey(this.Handle, HOTKEY_ID_MOUSE, Win32Api.MOD_NONE, VK_F11);
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

            // 1. Sidebar Panel (Right)
            _sidebarPanel = new Panel
            {
                Width = 250,
                Dock = DockStyle.Right,
                BackColor = LauncherTheme.SidebarDark,
                Padding = new Padding(16)
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

            // Apply default scale 1.0x (800x600 viewport + sidebar)
            SetScale(1.0);
        }

        private void BuildSidebarControls()
        {
            int curY = 16;

            // Header Title
            var lblTitle = new Label
            {
                Text = "THE WAR OF GENESIS III\nPART 2 LAUNCHER",
                Font = LauncherTheme.HeaderFont,
                ForeColor = LauncherTheme.AccentGold,
                Location = new Point(16, curY),
                Size = new Size(218, 44),
                TextAlign = ContentAlignment.TopCenter
            };
            _sidebarPanel.Controls.Add(lblTitle);
            curY += 56;

            // Launch / Stop Button
            _btnLaunch = new ModernButton
            {
                Text = "▶  START GAME",
                Location = new Point(16, curY),
                Size = new Size(218, 46),
                BaseColor = Color.FromArgb(30, 80, 50),
                HoverColor = Color.FromArgb(40, 110, 68),
                AccentColor = LauncherTheme.AccentGreen,
                ShowAccentBorder = true
            };
            _btnLaunch.Click += OnLaunchButtonClicked;
            _sidebarPanel.Controls.Add(_btnLaunch);
            curY += 58;

            // Scale Section Header
            var lblScaleSec = new Label
            {
                Text = "DISPLAY SCALE",
                Font = LauncherTheme.SubheaderFont,
                ForeColor = LauncherTheme.TextSecondary,
                Location = new Point(16, curY),
                Size = new Size(218, 20)
            };
            _sidebarPanel.Controls.Add(lblScaleSec);
            curY += 24;

            // Scale Buttons
            int btnW = 68;
            _btnScale10 = CreateScaleButton("1.0x", 1.0, 16, curY, btnW);
            _btnScale125 = CreateScaleButton("1.25x", 1.25, 91, curY, btnW);
            _btnScale150 = CreateScaleButton("1.5x", 1.5, 166, curY, btnW);

            _sidebarPanel.Controls.Add(_btnScale10);
            _sidebarPanel.Controls.Add(_btnScale125);
            _sidebarPanel.Controls.Add(_btnScale150);
            curY += 46;

            // Mouse Lock Toggle Button
            var lblMouseSec = new Label
            {
                Text = "MOUSE BEHAVIOR",
                Font = LauncherTheme.SubheaderFont,
                ForeColor = LauncherTheme.TextSecondary,
                Location = new Point(16, curY),
                Size = new Size(218, 20)
            };
            _sidebarPanel.Controls.Add(lblMouseSec);
            curY += 24;

            _btnMouseClip = new ModernButton
            {
                Text = "🖱️ Mouse Free [F11]",
                Location = new Point(16, curY),
                Size = new Size(218, 36),
                BaseColor = Color.FromArgb(28, 45, 65),
                AccentColor = LauncherTheme.AccentCyan,
                ShowAccentBorder = true
            };
            _btnMouseClip.Click += (s, e) => ToggleMouseLock();
            _sidebarPanel.Controls.Add(_btnMouseClip);
            curY += 48;

            // Audio Section Header
            var lblAudioSec = new Label
            {
                Text = "SOUND VOLUME",
                Font = LauncherTheme.SubheaderFont,
                ForeColor = LauncherTheme.TextSecondary,
                Location = new Point(16, curY),
                Size = new Size(218, 20)
            };
            _sidebarPanel.Controls.Add(lblAudioSec);
            curY += 24;

            // BGM Volume Slider
            _lblBgm = new Label
            {
                Text = "BGM Volume: 90%",
                Font = LauncherTheme.SmallFont,
                ForeColor = LauncherTheme.TextPrimary,
                Location = new Point(16, curY),
                Size = new Size(218, 16)
            };
            _sidebarPanel.Controls.Add(_lblBgm);
            curY += 18;

            _sliderBgm = new ModernSlider
            {
                Location = new Point(16, curY),
                Size = new Size(218, 22),
                Value = AudioRegistryHelper.GetBgmVolume(),
                FillColor = LauncherTheme.AccentGold
            };
            _sliderBgm.ValueChanged += (s, e) =>
            {
                _lblBgm.Text = string.Format("BGM Volume: {0}%", _sliderBgm.Value);
                AudioRegistryHelper.SetBgmVolume(_sliderBgm.Value);
            };
            _sidebarPanel.Controls.Add(_sliderBgm);
            curY += 34;

            // SFX Volume Slider
            _lblSfx = new Label
            {
                Text = "SFX Volume: 100%",
                Font = LauncherTheme.SmallFont,
                ForeColor = LauncherTheme.TextPrimary,
                Location = new Point(16, curY),
                Size = new Size(218, 16)
            };
            _sidebarPanel.Controls.Add(_lblSfx);
            curY += 18;

            _sliderSfx = new ModernSlider
            {
                Location = new Point(16, curY),
                Size = new Size(218, 22),
                Value = AudioRegistryHelper.GetSfxVolume(),
                FillColor = LauncherTheme.AccentCyan
            };
            _sliderSfx.ValueChanged += (s, e) =>
            {
                _lblSfx.Text = string.Format("SFX Volume: {0}%", _sliderSfx.Value);
                AudioRegistryHelper.SetSfxVolume(_sliderSfx.Value);
            };
            _sidebarPanel.Controls.Add(_sliderSfx);
            curY += 42;

            // Status Bar at bottom
            _lblStatus = new Label
            {
                Text = "STATUS: Ready",
                Font = LauncherTheme.SmallFont,
                ForeColor = LauncherTheme.TextMuted,
                Dock = DockStyle.Bottom,
                Height = 40,
                TextAlign = ContentAlignment.MiddleCenter
            };
            _sidebarPanel.Controls.Add(_lblStatus);
        }

        private ModernButton CreateScaleButton(string label, double scale, int x, int y, int width)
        {
            var btn = new ModernButton
            {
                Text = label,
                Location = new Point(x, y),
                Size = new Size(width, 34),
                BaseColor = Color.FromArgb(30, 38, 52)
            };
            btn.Click += (s, e) => SetScale(scale);
            return btn;
        }

        private void SetScale(double scale)
        {
            _currentScale = scale;
            int vpWidth = (int)(800 * scale);
            int vpHeight = (int)(600 * scale);

            ClientSize = new Size(vpWidth + _sidebarPanel.Width, vpHeight);

            // Highlight active scale button
            _btnScale10.ShowAccentBorder = (scale == 1.0);
            _btnScale125.ShowAccentBorder = (scale == 1.25);
            _btnScale150.ShowAccentBorder = (scale == 1.5);
            _btnScale10.Invalidate();
            _btnScale125.Invalidate();
            _btnScale150.Invalidate();

            // Sync ddraw.ini target dimensions
            _ddrawConfig.WriteOptimizedIni(Path.Combine(_gameDir, "ddraw.ini"), vpWidth, vpHeight);

            if (_isGameRunning)
            {
                _embedder.ResizeViewport(_viewportPanel.ClientSize.Width, _viewportPanel.ClientSize.Height);
            }
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
                string note = "단축키 F11: 마우스 런처 밖 자유 이동 / 잠금 토글";

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

        private void ApplyInitialAudioSettings()
        {
            _sliderBgm.Value = AudioRegistryHelper.GetBgmVolume();
            _lblBgm.Text = string.Format("BGM Volume: {0}%", _sliderBgm.Value);

            _sliderSfx.Value = AudioRegistryHelper.GetSfxVolume();
            _lblSfx.Text = string.Format("SFX Volume: {0}%", _sliderSfx.Value);
        }

        protected override void WndProc(ref Message m)
        {
            if (m.Msg == Win32Api.WM_HOTKEY && m.WParam.ToInt32() == HOTKEY_ID_MOUSE)
            {
                ToggleMouseLock();
            }
            base.WndProc(ref m);
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            Win32Api.UnregisterHotKey(this.Handle, HOTKEY_ID_MOUSE);
            Win32Api.ClipCursor(IntPtr.Zero);

            if (_isGameRunning)
            {
                _embedder.TerminateGame();
            }
            base.OnFormClosing(e);
        }
    }
}
