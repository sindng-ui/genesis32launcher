using System;
using Microsoft.Win32;

namespace G3P2Launcher.Core
{
    public static class AudioRegistryHelper
    {
        private const string HKLM_PATH_64 = @"SOFTWARE\Wow6432Node\Softmax\TheWarofGenesis3PartII";
        private const string HKLM_PATH_32 = @"SOFTWARE\Softmax\TheWarofGenesis3PartII";
        private const string HKCU_PATH = @"SOFTWARE\Softmax\TheWarofGenesis3PartII";

        public static int GetBgmVolume()
        {
            return ReadVolume("BGMVolume", 90);
        }

        public static bool SetBgmVolume(int volume)
        {
            return WriteVolume("BGMVolume", Math.Max(0, Math.Min(100, volume)));
        }

        public static int GetSfxVolume()
        {
            return ReadVolume("EffVolume", 100);
        }

        public static bool SetSfxVolume(int volume)
        {
            return WriteVolume("EffVolume", Math.Max(0, Math.Min(100, volume)));
        }

        private static int ReadVolume(string valueName, int defaultValue)
        {
            try
            {
                // Try HKLM 64-bit hive first
                using (var baseKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry32))
                using (var subKey = baseKey.OpenSubKey(HKLM_PATH_32, false))
                {
                    if (subKey != null)
                    {
                        object val = subKey.GetValue(valueName);
                        if (val != null)
                        {
                            return Convert.ToInt32(val);
                        }
                    }
                }

                // Try Wow6432Node path
                using (var subKey = Registry.LocalMachine.OpenSubKey(HKLM_PATH_64, false))
                {
                    if (subKey != null)
                    {
                        object val = subKey.GetValue(valueName);
                        if (val != null)
                        {
                            return Convert.ToInt32(val);
                        }
                    }
                }

                // Try HKCU fallback
                using (var subKey = Registry.CurrentUser.OpenSubKey(HKCU_PATH, false))
                {
                    if (subKey != null)
                    {
                        object val = subKey.GetValue(valueName);
                        if (val != null)
                        {
                            return Convert.ToInt32(val);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("ReadVolume error: " + ex.Message);
            }

            return defaultValue;
        }

        private static bool WriteVolume(string valueName, int volume)
        {
            bool written = false;

            try
            {
                using (var baseKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry32))
                using (var subKey = baseKey.OpenSubKey(HKLM_PATH_32, true))
                {
                    if (subKey != null)
                    {
                        subKey.SetValue(valueName, volume, RegistryValueKind.DWord);
                        written = true;
                    }
                }
            }
            catch { /* Ignore HKLM write permission issues */ }

            try
            {
                using (var subKey = Registry.LocalMachine.OpenSubKey(HKLM_PATH_64, true))
                {
                    if (subKey != null)
                    {
                        subKey.SetValue(valueName, volume, RegistryValueKind.DWord);
                        written = true;
                    }
                }
            }
            catch { /* Ignore HKLM write permission issues */ }

            try
            {
                using (var subKey = Registry.CurrentUser.CreateSubKey(HKCU_PATH))
                {
                    if (subKey != null)
                    {
                        subKey.SetValue(valueName, volume, RegistryValueKind.DWord);
                        written = true;
                    }
                }
            }
            catch { /* Ignore HKCU issues */ }

            return written;
        }
    }
}
