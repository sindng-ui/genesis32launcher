using System;
using System.Drawing;
using System.Windows.Forms;

namespace G3P2Launcher.UI
{
    public class ModernSlider : Control
    {
        private int _value = 50;
        private int _minimum = 0;
        private int _maximum = 100;
        private bool _isDragging = false;

        public event EventHandler ValueChanged;

        public Color TrackColor { get; set; }
        public Color FillColor { get; set; }
        public Color ThumbColor { get; set; }

        public int Minimum
        {
            get { return _minimum; }
            set
            {
                _minimum = value;
                Invalidate();
            }
        }

        public int Maximum
        {
            get { return _maximum; }
            set
            {
                _maximum = value;
                Invalidate();
            }
        }

        public int Value
        {
            get { return _value; }
            set
            {
                int clamped = Math.Max(_minimum, Math.Min(_maximum, value));
                if (_value != clamped)
                {
                    _value = clamped;
                    Invalidate();
                    if (ValueChanged != null)
                    {
                        ValueChanged(this, EventArgs.Empty);
                    }
                }
            }
        }

        public ModernSlider()
        {
            TrackColor = Color.FromArgb(35, 45, 60);
            FillColor = LauncherTheme.AccentCyan;
            ThumbColor = LauncherTheme.TextPrimary;

            SetStyle(ControlStyles.UserPaint |
                     ControlStyles.AllPaintingInWmPaint |
                     ControlStyles.OptimizedDoubleBuffer |
                     ControlStyles.ResizeRedraw, true);

            Size = new Size(180, 24);
            Cursor = Cursors.Hand;
        }

        protected override void OnMouseDown(MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                _isDragging = true;
                UpdateValueFromMouse(e.X);
            }
            base.OnMouseDown(e);
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            if (_isDragging)
            {
                UpdateValueFromMouse(e.X);
            }
            base.OnMouseMove(e);
        }

        protected override void OnMouseUp(MouseEventArgs e)
        {
            _isDragging = false;
            base.OnMouseUp(e);
        }

        private void UpdateValueFromMouse(int mouseX)
        {
            int padding = 8;
            int trackWidth = Width - (padding * 2);
            if (trackWidth <= 0) return;

            float ratio = (float)(mouseX - padding) / trackWidth;
            ratio = Math.Max(0f, Math.Min(1f, ratio));

            Value = _minimum + (int)Math.Round(ratio * (_maximum - _minimum));
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

            int padding = 8;
            int trackHeight = 6;
            int trackY = (Height - trackHeight) / 2;
            int trackWidth = Width - (padding * 2);

            // Draw background track
            using (var brush = new SolidBrush(TrackColor))
            {
                g.FillRectangle(brush, padding, trackY, trackWidth, trackHeight);
            }

            // Draw filled track
            float ratio = (float)(_value - _minimum) / (_maximum - _minimum);
            int fillWidth = (int)(trackWidth * ratio);

            if (fillWidth > 0)
            {
                using (var brush = new SolidBrush(FillColor))
                {
                    g.FillRectangle(brush, padding, trackY, fillWidth, trackHeight);
                }
            }

            // Draw thumb circle
            int thumbSize = 14;
            int thumbX = padding + fillWidth - (thumbSize / 2);
            int thumbY = (Height - thumbSize) / 2;

            using (var brush = new SolidBrush(ThumbColor))
            {
                g.FillEllipse(brush, thumbX, thumbY, thumbSize, thumbSize);
            }

            using (var pen = new Pen(FillColor, 1.5f))
            {
                g.DrawEllipse(pen, thumbX, thumbY, thumbSize, thumbSize);
            }
        }
    }
}
