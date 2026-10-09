using System.Drawing;

namespace G3P2Launcher.UI
{
    public static class LauncherTheme
    {
        // Color Palette - Sleek Genesis III Sci-Fi Dark Theme
        public static readonly Color BackgroundDark = Color.FromArgb(16, 20, 28);
        public static readonly Color SidebarDark = Color.FromArgb(24, 30, 42);
        public static readonly Color PanelBorder = Color.FromArgb(42, 54, 76);
        public static readonly Color ViewportBackground = Color.FromArgb(8, 10, 14);

        // Accent Colors
        public static readonly Color AccentCyan = Color.FromArgb(0, 190, 230);
        public static readonly Color AccentGold = Color.FromArgb(235, 175, 55);
        public static readonly Color AccentGreen = Color.FromArgb(46, 204, 113);
        public static readonly Color AccentRed = Color.FromArgb(231, 76, 60);

        // Text Colors
        public static readonly Color TextPrimary = Color.FromArgb(240, 245, 250);
        public static readonly Color TextSecondary = Color.FromArgb(150, 165, 185);
        public static readonly Color TextMuted = Color.FromArgb(100, 115, 135);

        // Fonts
        public static readonly Font HeaderFont = new Font("Segoe UI", 12f, FontStyle.Bold);
        public static readonly Font SubheaderFont = new Font("Segoe UI", 9.5f, FontStyle.Bold);
        public static readonly Font BodyFont = new Font("Segoe UI", 9f, FontStyle.Regular);
        public static readonly Font SmallFont = new Font("Segoe UI", 8f, FontStyle.Regular);
    }
}
