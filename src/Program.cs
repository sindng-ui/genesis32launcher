using System;
using System.IO;
using System.Windows.Forms;
using G3P2Launcher.UI;

namespace G3P2Launcher
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = AppDomain.CurrentDomain.BaseDirectory;

            // Determine game directory
            string gameDir = @"z:\my\창세기전\창세기전3 파트2";

            // If override argument passed
            if (args.Length > 0 && Directory.Exists(args[0]))
            {
                gameDir = args[0];
            }
            else if (!Directory.Exists(gameDir))
            {
                // Fallback to relative path if run from launcher dir
                string relativeGameDir = Path.GetFullPath(Path.Combine(appDir, @"..\창세기전3 파트2"));
                if (Directory.Exists(relativeGameDir))
                {
                    gameDir = relativeGameDir;
                }
            }

            // Assets directory
            string assetsDir = Path.Combine(appDir, @"assets\cnc-ddraw");
            if (!Directory.Exists(assetsDir))
            {
                // Try workspace root assets
                string fallbackAssets = Path.GetFullPath(Path.Combine(appDir, @"..\assets\cnc-ddraw"));
                if (Directory.Exists(fallbackAssets))
                {
                    assetsDir = fallbackAssets;
                }
            }

            Application.Run(new LauncherForm(gameDir, assetsDir));
        }
    }
}
