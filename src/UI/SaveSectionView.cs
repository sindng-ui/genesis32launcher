using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using G3P2Launcher.Core;

namespace G3P2Launcher.UI
{
    public class SaveSectionView : Panel
    {
        private readonly string _gameDir;
        private readonly EditorHttpServer _server;

        private Label _lblHeader;
        private ListView _lvSaves;
        private ModernButton _btnOpenEditor;
        private ModernButton _btnRefresh;
        private ModernButton _btnBackupAll;
        private ModernButton _btnOpenFolder;
        private Label _lblTip;

        public event EventHandler<string> StatusMessageChanged;

        public SaveSectionView(string gameDir, EditorHttpServer server, int totalWidth)
        {
            _gameDir = gameDir;
            _server = server;

            Width = totalWidth;
            BackColor = LauncherTheme.SidebarDark;

            InitializeUI();
            RefreshSaveList();
        }

        private void InitializeUI()
        {
            Controls.Clear();

            // 1. Header
            _lblHeader = new Label
            {
                Text = "SAVE DATA MANAGER",
                Font = LauncherTheme.SubheaderFont,
                ForeColor = LauncherTheme.AccentCyan,
                Location = new Point(0, 0),
                Size = new Size(Width, 20)
            };
            Controls.Add(_lblHeader);

            // 2. Save ListView
            _lvSaves = new ListView
            {
                Location = new Point(0, 24),
                Size = new Size(Width, 220),
                View = View.Details,
                FullRowSelect = true,
                MultiSelect = false,
                HideSelection = false,
                BorderStyle = BorderStyle.FixedSingle,
                BackColor = Color.FromArgb(16, 22, 32),
                ForeColor = LauncherTheme.TextPrimary,
                Font = LauncherTheme.SmallFont
            };

            _lvSaves.Columns.Add("File", 80);
            _lvSaves.Columns.Add("Size", 55);
            _lvSaves.Columns.Add("Modified", 125);

            _lvSaves.DoubleClick += (s, e) => OpenSelectedInEditor();
            _lvSaves.SelectedIndexChanged += (s, e) =>
            {
                _btnOpenEditor.Enabled = (_lvSaves.SelectedItems.Count > 0);
            };
            Controls.Add(_lvSaves);

            int btnY = _lvSaves.Bottom + 10;
            int halfW = (Width - 6) / 2;

            // 3. Open in Editor Button (Main Action)
            _btnOpenEditor = new ModernButton
            {
                Text = "✏️ Open in Editor",
                Location = new Point(0, btnY),
                Size = new Size(Width, 34),
                BaseColor = Color.FromArgb(24, 60, 45),
                AccentColor = LauncherTheme.AccentGreen,
                ShowAccentBorder = true,
                Enabled = false
            };
            _btnOpenEditor.Click += (s, e) => OpenSelectedInEditor();
            Controls.Add(_btnOpenEditor);
            btnY += 40;

            // 4. Refresh & Backup All Buttons
            _btnRefresh = new ModernButton
            {
                Text = "🔄 Refresh",
                Location = new Point(0, btnY),
                Size = new Size(halfW, 30),
                BaseColor = Color.FromArgb(28, 45, 65),
                AccentColor = LauncherTheme.AccentCyan,
                ShowAccentBorder = false
            };
            _btnRefresh.Click += (s, e) => RefreshSaveList();
            Controls.Add(_btnRefresh);

            _btnBackupAll = new ModernButton
            {
                Text = "📦 Backup All",
                Location = new Point(halfW + 6, btnY),
                Size = new Size(halfW, 30),
                BaseColor = Color.FromArgb(35, 40, 55),
                AccentColor = LauncherTheme.AccentGold,
                ShowAccentBorder = false
            };
            _btnBackupAll.Click += (s, e) => BackupAllSaves();
            Controls.Add(_btnBackupAll);
            btnY += 36;

            // 5. Open Save Folder Button
            _btnOpenFolder = new ModernButton
            {
                Text = "📂 Open Game Save Folder",
                Location = new Point(0, btnY),
                Size = new Size(Width, 28),
                BaseColor = Color.FromArgb(22, 30, 42),
                AccentColor = LauncherTheme.TextMuted,
                ShowAccentBorder = false,
                Font = LauncherTheme.SmallFont
            };
            _btnOpenFolder.Click += (s, e) => OpenSaveFolder();
            Controls.Add(_btnOpenFolder);
            btnY += 34;

            // 6. Tip Label
            _lblTip = new Label
            {
                Text = "▶ 세이브 더블클릭 시 웹 에디터 자동 실행\n(수정 후 즉시 게임 폴더로 직저장 지원)",
                Location = new Point(0, btnY),
                Size = new Size(Width, 36),
                Font = LauncherTheme.SmallFont,
                ForeColor = LauncherTheme.TextMuted,
                TextAlign = ContentAlignment.TopCenter
            };
            Controls.Add(_lblTip);

            Height = _lblTip.Bottom + 4;
        }

        public void RefreshSaveList()
        {
            _lvSaves.Items.Clear();

            if (!Directory.Exists(_gameDir))
            {
                SetStatus("게임 폴더를 찾을 수 없습니다.");
                return;
            }

            var files = Directory.GetFiles(_gameDir, "*.sav");
            Array.Sort(files);

            foreach (var f in files)
            {
                var fi = new FileInfo(f);
                string name = Path.GetFileName(f);

                string sizeStr;
                if (fi.Length > 1024)
                {
                    sizeStr = string.Format("{0} KB", fi.Length / 1024);
                }
                else
                {
                    sizeStr = string.Format("{0} B", fi.Length);
                }

                var item = new ListViewItem(name);
                item.SubItems.Add(sizeStr);
                item.SubItems.Add(fi.LastWriteTime.ToString("MM-dd HH:mm:ss"));
                item.Tag = name;

                _lvSaves.Items.Add(item);
            }

            if (_lvSaves.Items.Count > 0)
            {
                _lvSaves.Items[0].Selected = true;
                _btnOpenEditor.Enabled = true;
            }
            else
            {
                _btnOpenEditor.Enabled = false;
            }

            SetStatus(string.Format("세이브 파일 {0}개 로드 완료", files.Length));
        }

        private void OpenSelectedInEditor()
        {
            if (_lvSaves.SelectedItems.Count == 0) return;

            string fileName = _lvSaves.SelectedItems[0].Tag as string;
            if (string.IsNullOrEmpty(fileName)) return;

            if (_server == null || string.IsNullOrEmpty(_server.BaseUrl))
            {
                MessageBox.Show("로컬 에디터 서버가 실행 중이지 않습니다.", "알림", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            string url = string.Format("{0}index.html?file={1}", _server.BaseUrl, Uri.EscapeDataString(fileName));
            try
            {
                Process.Start(url);
                SetStatus(string.Format("에디터 실행: {0}", fileName));
            }
            catch (Exception ex)
            {
                MessageBox.Show("브라우저를 열지 못했습니다: " + ex.Message, "오류", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void BackupAllSaves()
        {
            if (!Directory.Exists(_gameDir)) return;

            var files = Directory.GetFiles(_gameDir, "*.sav");
            if (files.Length == 0)
            {
                MessageBox.Show("백업할 세이브 파일(*.sav)이 없습니다.", "알림", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string backupDir = Path.Combine(_gameDir, "save_backups", timestamp);

            try
            {
                Directory.CreateDirectory(backupDir);
                foreach (var f in files)
                {
                    string dest = Path.Combine(backupDir, Path.GetFileName(f));
                    File.Copy(f, dest, true);
                }

                SetStatus(string.Format("세이브 {0}개 백업 완료: {1}", files.Length, timestamp));
                MessageBox.Show(string.Format("세이브 파일 {0}개가 안전하게 백업되었습니다!\n\n위치:\n{1}", files.Length, backupDir),
                    "백업 성공", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show("백업 실패: " + ex.Message, "오류", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OpenSaveFolder()
        {
            if (Directory.Exists(_gameDir))
            {
                try
                {
                    Process.Start("explorer.exe", _gameDir);
                }
                catch (Exception ex)
                {
                    MessageBox.Show("폴더 열기 실패: " + ex.Message, "오류", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private void SetStatus(string msg)
        {
            if (StatusMessageChanged != null)
            {
                StatusMessageChanged(this, msg);
            }
        }
    }
}
