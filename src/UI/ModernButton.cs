using System;
using System.Drawing;
using System.Windows.Forms;

namespace G3P2Launcher.UI
{
    public class ModernButton : Button
    {
        private bool _isHovered;
        private bool _isPressed;

        public Color BaseColor { get; set; }
        public Color HoverColor { get; set; }
        public Color PressColor { get; set; }
        public Color BorderColor { get; set; }
        public Color AccentColor { get; set; }
        public bool ShowAccentBorder { get; set; }

        public ModernButton()
        {
            BaseColor = LauncherTheme.SidebarDark;
            HoverColor = Color.FromArgb(36, 46, 64);
            PressColor = Color.FromArgb(50, 64, 88);
            BorderColor = LauncherTheme.PanelBorder;
            AccentColor = LauncherTheme.AccentCyan;
            ShowAccentBorder = false;
            SetStyle(ControlStyles.UserPaint |
                     ControlStyles.AllPaintingInWmPaint |
                     ControlStyles.OptimizedDoubleBuffer |
                     ControlStyles.ResizeRedraw, true);

            FlatStyle = FlatStyle.Flat;
            FlatAppearance.BorderSize = 0;
            BackColor = BaseColor;
            ForeColor = LauncherTheme.TextPrimary;
            Font = LauncherTheme.SubheaderFont;
            Cursor = Cursors.Hand;
            Size = new Size(160, 38);
        }

        protected override void OnMouseEnter(EventArgs e)
        {
            _isHovered = true;
            Invalidate();
            base.OnMouseEnter(e);
        }

        protected override void OnMouseLeave(EventArgs e)
        {
            _isHovered = false;
            _isPressed = false;
            Invalidate();
            base.OnMouseLeave(e);
        }

        protected override void OnMouseDown(MouseEventArgs mevent)
        {
            if (mevent.Button == MouseButtons.Left)
            {
                _isPressed = true;
                Invalidate();
            }
            base.OnMouseDown(mevent);
        }

        protected override void OnMouseUp(MouseEventArgs mevent)
        {
            _isPressed = false;
            Invalidate();
            base.OnMouseUp(mevent);
        }

        protected override void OnPaint(PaintEventArgs pevent)
        {
            Graphics g = pevent.Graphics;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

            Color currentBg = _isPressed ? PressColor : (_isHovered ? HoverColor : BaseColor);

            using (var brush = new SolidBrush(currentBg))
            {
                g.FillRectangle(brush, ClientRectangle);
            }

            // Draw border
            Color currentBorder = ShowAccentBorder || _isHovered ? AccentColor : BorderColor;
            using (var pen = new Pen(currentBorder, 1.5f))
            {
                g.DrawRectangle(pen, 1, 1, Width - 2, Height - 2);
            }

            // Draw text
            TextRenderer.DrawText(
                g,
                Text,
                Font,
                ClientRectangle,
                Enabled ? ForeColor : LauncherTheme.TextMuted,
                TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis
            );
        }
    }
}
