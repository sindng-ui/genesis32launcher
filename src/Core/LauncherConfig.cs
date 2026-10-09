using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;

namespace G3P2Launcher.Core
{
    public class LauncherConfig
    {
        private static string GetConfigPath()
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string localPath = Path.Combine(baseDir, "launcher_settings.ini");
            if (File.Exists(localPath)) return localPath;

            string parentDir = Path.GetDirectoryName(baseDir.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
            if (!string.IsNullOrEmpty(parentDir))
            {
                string parentPath = Path.Combine(parentDir, "launcher_settings.ini");
                if (File.Exists(parentPath)) return parentPath;
            }

            return localPath;
        }

        public double CurrentScale { get; set; }
        public List<double> CustomScales { get; private set; }
        public bool AlwaysOnTop { get; set; }

        public LauncherConfig()
        {
            CurrentScale = 1.0;
            CustomScales = new List<double>();
            AlwaysOnTop = false;
        }

        public static LauncherConfig Load()
        {
            var config = new LauncherConfig();
            string path = GetConfigPath();

            if (!File.Exists(path))
            {
                return config;
            }

            try
            {
                string[] lines = File.ReadAllLines(path, Encoding.UTF8);
                foreach (string line in lines)
                {
                    string trimmed = line.Trim();
                    if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith(";") || trimmed.StartsWith("#"))
                        continue;

                    string[] parts = trimmed.Split(new[] { '=' }, 2);
                    if (parts.Length != 2) continue;

                    string key = parts[0].Trim();
                    string val = parts[1].Trim();

                    if (key.Equals("CurrentScale", StringComparison.OrdinalIgnoreCase))
                    {
                        double s;
                        if (double.TryParse(val, NumberStyles.Float, CultureInfo.InvariantCulture, out s) && s >= 0.5 && s <= 4.0)
                        {
                            config.CurrentScale = s;
                        }
                    }
                    else if (key.Equals("CustomScales", StringComparison.OrdinalIgnoreCase))
                    {
                        string[] scaleList = val.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (string item in scaleList)
                        {
                            double s;
                            if (double.TryParse(item.Trim(), NumberStyles.Float, CultureInfo.InvariantCulture, out s) && s >= 0.5 && s <= 4.0)
                            {
                                if (!config.CustomScales.Contains(s))
                                {
                                    config.CustomScales.Add(s);
                                }
                            }
                        }
                    }
                    else if (key.Equals("AlwaysOnTop", StringComparison.OrdinalIgnoreCase))
                    {
                        bool b;
                        if (bool.TryParse(val, out b))
                        {
                            config.AlwaysOnTop = b;
                        }
                        else if (val == "1")
                        {
                            config.AlwaysOnTop = true;
                        }
                        else if (val == "0")
                        {
                            config.AlwaysOnTop = false;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Failed to load config: " + ex.Message);
            }

            return config;
        }

        public void Save()
        {
            try
            {
                var sb = new StringBuilder();
                sb.AppendLine("; G3P2Launcher User Settings");
                sb.AppendLine("[Settings]");
                sb.AppendLine("CurrentScale=" + CurrentScale.ToString("F2", CultureInfo.InvariantCulture));
                sb.AppendLine("AlwaysOnTop=" + (AlwaysOnTop ? "1" : "0"));

                var scalesStr = new StringBuilder();
                for (int i = 0; i < CustomScales.Count; i++)
                {
                    if (i > 0) scalesStr.Append(",");
                    scalesStr.Append(CustomScales[i].ToString("F2", CultureInfo.InvariantCulture));
                }
                sb.AppendLine("CustomScales=" + scalesStr.ToString());

                string path = GetConfigPath();
                File.WriteAllText(path, sb.ToString(), Encoding.UTF8);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Failed to save config: " + ex.Message);
            }
        }

        public bool AddCustomScale(double scale)
        {
            // Normalize scale to 2 decimal places
            scale = Math.Round(scale, 2);

            // Avoid default presets and duplicates
            if (scale < 0.5 || scale > 4.0) return false;
            if (scale == 1.0 || scale == 1.25 || scale == 1.5 || scale == 2.0) return false;
            if (CustomScales.Contains(scale)) return false;

            CustomScales.Add(scale);
            CustomScales.Sort();
            Save();
            return true;
        }

        public bool RemoveCustomScale(double scale)
        {
            bool removed = CustomScales.Remove(scale);
            if (removed)
            {
                if (CurrentScale == scale)
                {
                    CurrentScale = 1.0;
                }
                Save();
            }
            return removed;
        }
    }
}
