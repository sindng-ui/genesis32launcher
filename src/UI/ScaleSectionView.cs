using System;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.Windows.Forms;
using G3P2Launcher.Core;

namespace G3P2Launcher.UI
{
    public class ScaleSectionView : Panel
    {
        private const int BTN_WIDTH = 62;
        private const int BTN_HEIGHT = 30;
        private const int GAP_X = 6;
        private const int GAP_Y = 6;
        private const int BUTTONS_PER_ROW = 4;

        private readonly LauncherConfig _config;
        private readonly List<ModernButton> _scaleButtons = new List<ModernButton>();

        private Panel _buttonsContainer;
        private Panel _inputPanel;
        private TextBox _txtCustomScale;
        private ModernButton _btnAddScale;
        private Label _lblHeader;

        public event EventHandler<double> ScaleSelected;
        public event EventHandler LayoutChanged;

        public double ActiveScale { get; private set; }

        public ScaleSectionView(LauncherConfig config, int totalWidth)
        {
            _config = config;
            ActiveScale = config.CurrentScale;

            BackColor = LauncherTheme.SidebarDark;
            Width = totalWidth;

            InitializeUI();
            RebuildScaleButtons();
        }

        private void InitializeUI()
        {
            Controls.Clear();

            // 1. Header Label
            _lblHeader = new Label
            {
                Text = string.Format("DISPLAY SCALE ({0:0.##}x)", ActiveScale),
                Font = LauncherTheme.SubheaderFont,
                ForeColor = LauncherTheme.AccentCyan,
                Location = new Point(0, 0),
                Size = new Size(Width, 20)
            };
            Controls.Add(_lblHeader);

            // 2. Buttons container panel
            _buttonsContainer = new Panel
            {
                Location = new Point(0, 24),
                Width = Width,
                BackColor = LauncherTheme.SidebarDark
            };
            Controls.Add(_buttonsContainer);

            // 3. Custom Input Panel
            _inputPanel = new Panel
            {
                Width = Width,
                Height = 32,
                BackColor = LauncherTheme.SidebarDark
            };

            int inputW = Width - 82;
            _txtCustomScale = new TextBox
            {
                Location = new Point(0, 3),
                Size = new Size(inputW, 26),
                BackColor = Color.FromArgb(16, 22, 32),
                ForeColor = LauncherTheme.TextPrimary,
                BorderStyle = BorderStyle.FixedSingle,
                Font = LauncherTheme.BodyFont,
                Text = ""
            };
            _txtCustomScale.KeyDown += (s, e) =>
            {
                if (e.KeyCode == Keys.Enter)
                {
                    OnAddCustomScale();
                    e.Handled = true;
                    e.SuppressKeyPress = true;
                }
            };
            _inputPanel.Controls.Add(_txtCustomScale);

            _btnAddScale = new ModernButton
            {
                Text = "+ Add",
                Location = new Point(inputW + 6, 1),
                Size = new Size(74, 28),
                Font = LauncherTheme.SmallFont,
                BaseColor = Color.FromArgb(24, 45, 65),
                AccentColor = LauncherTheme.AccentCyan,
                ShowAccentBorder = true
            };
            _btnAddScale.Click += (s, e) => OnAddCustomScale();
            _inputPanel.Controls.Add(_btnAddScale);

            Controls.Add(_inputPanel);
        }

        public void RebuildScaleButtons()
        {
            _buttonsContainer.Controls.Clear();
            _scaleButtons.Clear();

            // All scales to display: Default Presets + Custom Scales
            var allScales = new List<double> { 1.0, 1.25, 1.5, 2.0 };
            foreach (double cs in _config.CustomScales)
            {
                if (!allScales.Contains(cs))
                {
                    allScales.Add(cs);
                }
            }
            allScales.Sort();

            int index = 0;
            foreach (double scale in allScales)
            {
                bool isCustom = (scale != 1.0 && scale != 1.25 && scale != 1.5 && scale != 2.0);

                int row = index / BUTTONS_PER_ROW;
                int col = index % BUTTONS_PER_ROW;

                int posX = col * (BTN_WIDTH + GAP_X);
                int posY = row * (BTN_HEIGHT + GAP_Y);

                var btn = new ModernButton
                {
                    Text = scale.ToString("0.##", CultureInfo.InvariantCulture) + "x",
                    Location = new Point(posX, posY),
                    Size = new Size(BTN_WIDTH, BTN_HEIGHT),
                    Font = LauncherTheme.SubheaderFont,
                    BaseColor = isCustom ? Color.FromArgb(46, 36, 62) : Color.FromArgb(30, 38, 52),
                    Tag = scale
                };

                double currentBtnScale = scale;
                btn.Click += (s, e) => SelectScale(currentBtnScale);

                if (isCustom)
                {
                    var contextMenu = new ContextMenuStrip();
                    var deleteItem = new ToolStripMenuItem("배율 삭제 (" + scale + "x)");
                    deleteItem.Click += (s, e) =>
                    {
                        bool wasActive = Math.Abs(ActiveScale - currentBtnScale) < 0.001;
                        _config.RemoveCustomScale(currentBtnScale);
                        RebuildScaleButtons();
                        if (wasActive)
                        {
                            SelectScale(1.0);
                        }
                    };
                    contextMenu.Items.Add(deleteItem);
                    btn.ContextMenuStrip = contextMenu;
                }

                _scaleButtons.Add(btn);
                _buttonsContainer.Controls.Add(btn);
                index++;
            }

            int totalRows = (allScales.Count + BUTTONS_PER_ROW - 1) / BUTTONS_PER_ROW;
            if (totalRows <= 0) totalRows = 1;

            int containerH = totalRows * (BTN_HEIGHT + GAP_Y);
            _buttonsContainer.Height = containerH;

            // Position input panel below buttons container
            _inputPanel.Location = new Point(0, _buttonsContainer.Bottom + 8);

            // Set total section height
            Height = _inputPanel.Bottom + 4;

            UpdateActiveHighlight();

            if (LayoutChanged != null)
            {
                LayoutChanged(this, EventArgs.Empty);
            }
        }

        private void OnAddCustomScale()
        {
            string text = _txtCustomScale.Text.Trim().Replace("x", "").Replace("X", "").Replace(',', '.');
            double val;
            if (double.TryParse(text, NumberStyles.Float, CultureInfo.InvariantCulture, out val))
            {
                if (val >= 0.5 && val <= 4.0)
                {
                    val = Math.Round(val, 2);
                    _config.AddCustomScale(val);
                    RebuildScaleButtons();
                    SelectScale(val);
                    _txtCustomScale.Text = "";
                    return;
                }
            }

            MessageBox.Show("유효한 배율을 입력해주세요. (0.5 ~ 4.0 사이의 숫자, 예: 2.2)", "알림", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        public void SelectScale(double scale)
        {
            ActiveScale = scale;
            _config.CurrentScale = scale;
            _config.Save();

            _lblHeader.Text = string.Format("DISPLAY SCALE ({0:0.##}x)", ActiveScale);

            UpdateActiveHighlight();

            if (ScaleSelected != null)
            {
                ScaleSelected(this, scale);
            }
        }

        private void UpdateActiveHighlight()
        {
            foreach (var btn in _scaleButtons)
            {
                if (btn.Tag is double)
                {
                    double s = (double)btn.Tag;
                    bool isActive = Math.Abs(s - ActiveScale) < 0.001;
                    btn.ShowAccentBorder = isActive;
                    btn.AccentColor = isActive ? LauncherTheme.AccentGold : LauncherTheme.AccentCyan;
                    btn.Invalidate();
                }
            }
        }
    }
}
