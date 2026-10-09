using System;
using System.IO;
using System.Text;
using Microsoft.Win32;

namespace G3P2Launcher.Core
{
    public class DDrawConfig
    {
        private readonly string _gameDir;
        private readonly string _assetsDir;

        public DDrawConfig(string gameDir, string assetsDir)
        {
            _gameDir = gameDir;
            _assetsDir = assetsDir;
        }

        public bool EnsureWrapperInstalled(int targetWidth = 800, int targetHeight = 600)
        {
            try
            {
                if (!Directory.Exists(_gameDir))
                {
                    return false;
                }

                CleanCompatibilityFlags();

                string srcDll = Path.Combine(_assetsDir, "ddraw.dll");
                string destDll = Path.Combine(_gameDir, "ddraw.dll");

                if (File.Exists(srcDll))
                {
                    if (!File.Exists(destDll) || new FileInfo(srcDll).Length != new FileInfo(destDll).Length)
                    {
                        File.Copy(srcDll, destDll, true);
                    }
                }

                string srcShaders = Path.Combine(_assetsDir, "Shaders");
                string destShaders = Path.Combine(_gameDir, "Shaders");
                if (Directory.Exists(srcShaders) && !Directory.Exists(destShaders))
                {
                    CopyDirectory(srcShaders, destShaders);
                }

                WriteOptimizedIni(Path.Combine(_gameDir, "ddraw.ini"), targetWidth, targetHeight);
                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("DDrawConfig installation error: " + ex.Message);
                return false;
            }
        }

        public void CleanCompatibilityFlags()
        {
            string exePath = Path.Combine(_gameDir, "G3PartII.exe");
            string layerPath = @"Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers";

            try
            {
                using (var key = Registry.CurrentUser.OpenSubKey(layerPath, true))
                {
                    if (key != null && key.GetValue(exePath) != null)
                    {
                        key.DeleteValue(exePath, false);
                    }
                }
            }
            catch { }

            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(layerPath, true))
                {
                    if (key != null && key.GetValue(exePath) != null)
                    {
                        key.DeleteValue(exePath, false);
                    }
                }
            }
            catch { }
        }

        public void WriteOptimizedIni(string iniPath, int targetWidth = 800, int targetHeight = 600, bool unclipMouse = true)
        {
            try
            {
                if (targetWidth <= 0) targetWidth = 800;
                if (targetHeight <= 0) targetHeight = 600;

                var sb = new StringBuilder();
                sb.AppendLine("; cnc-ddraw configuration for The War of Genesis 3 Part 2 (Full Fill Embedded Mode)");
                sb.AppendLine("[ddraw]");
                sb.AppendLine("width=" + targetWidth);
                sb.AppendLine("height=" + targetHeight);
                sb.AppendLine("fullscreen=false");
                sb.AppendLine("windowed=true");
                sb.AppendLine("border=false");
                sb.AppendLine("maintas=false");
                sb.AppendLine("boxing=false");
                sb.AppendLine("resizable=true");
                sb.AppendLine("maxfps=60");
                sb.AppendLine("vsync=false");
                sb.AppendLine("adjmouse=true");
                sb.AppendLine("renderer=direct3d9");
                sb.AppendLine("nonexclusive=true");
                sb.AppendLine("noactivateapp=true");
                sb.AppendLine("singlecpu=false");
                sb.AppendLine("devmode=" + (unclipMouse ? "true" : "false"));
                sb.AppendLine("hook=3");
                sb.AppendLine("fix_not_responding=true");
                sb.AppendLine("posX=0");
                sb.AppendLine("posY=0");
                sb.AppendLine("fixchilds=0");
                sb.AppendLine("resolutions=2");
                sb.AppendLine();
                sb.AppendLine("[G3PartII]");
                sb.AppendLine("width=" + targetWidth);
                sb.AppendLine("height=" + targetHeight);
                sb.AppendLine("fullscreen=false");
                sb.AppendLine("windowed=true");
                sb.AppendLine("border=false");
                sb.AppendLine("maintas=false");
                sb.AppendLine("boxing=false");
                sb.AppendLine("resizable=true");
                sb.AppendLine("renderer=direct3d9");
                sb.AppendLine("nonexclusive=true");
                sb.AppendLine("noactivateapp=true");
                sb.AppendLine("devmode=" + (unclipMouse ? "true" : "false"));
                sb.AppendLine("posX=0");
                sb.AppendLine("posY=0");
                sb.AppendLine("fixchilds=0");
                sb.AppendLine("resolutions=2");
                sb.AppendLine();

                File.WriteAllText(iniPath, sb.ToString(), Encoding.ASCII);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Failed to write ddraw.ini: " + ex.Message);
            }
        }

        private static void CopyDirectory(string sourceDir, string destinationDir)
        {
            var dir = new DirectoryInfo(sourceDir);
            if (!dir.Exists) return;

            Directory.CreateDirectory(destinationDir);

            foreach (FileInfo file in dir.GetFiles())
            {
                string targetFilePath = Path.Combine(destinationDir, file.Name);
                file.CopyTo(targetFilePath, true);
            }

            foreach (DirectoryInfo subDir in dir.GetDirectories())
            {
                string nextTargetSubDir = Path.Combine(destinationDir, subDir.Name);
                CopyDirectory(subDir.FullName, nextTargetSubDir);
            }
        }
    }
}
