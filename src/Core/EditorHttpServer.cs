using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

namespace G3P2Launcher.Core
{
    public class EditorHttpServer : IDisposable
    {
        private readonly string _webRoot;
        private readonly string _gameDir;
        private HttpListener _listener;
        private Thread _serverThread;
        private volatile bool _isRunning;

        public int Port { get; private set; }
        public string BaseUrl { get; private set; }

        public EditorHttpServer(string webRoot, string gameDir)
        {
            _gameDir = gameDir;
            _webRoot = ResolveWebRoot(webRoot);
        }

        private static string ResolveWebRoot(string path)
        {
            if (!string.IsNullOrEmpty(path) && Directory.Exists(path) && File.Exists(Path.Combine(path, "index.html")))
            {
                return Path.GetFullPath(path);
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string[] candidates = new string[]
            {
                Path.Combine(baseDir, "editor"),
                Path.Combine(baseDir, "..", "editor"),
                Path.Combine(baseDir, "..", "..", "editor"),
                @"z:\my\창세기전\launcher\editor",
                @"z:\my\창세기전\editor222"
            };

            foreach (var c in candidates)
            {
                try
                {
                    string full = Path.GetFullPath(c);
                    if (Directory.Exists(full) && File.Exists(Path.Combine(full, "index.html")))
                    {
                        return full;
                    }
                }
                catch { }
            }

            return path;
        }

        public bool Start(int preferredPort = 18080)
        {
            if (_isRunning) return true;

            int[] portsToTry = new int[] { preferredPort, preferredPort + 1, preferredPort + 2, preferredPort + 5, 0 };
            foreach (int port in portsToTry)
            {
                try
                {
                    _listener = new HttpListener();
                    int targetPort = (port == 0) ? FindFreePort() : port;
                    string prefix = string.Format("http://127.0.0.1:{0}/", targetPort);
                    _listener.Prefixes.Add(prefix);
                    _listener.Start();

                    Port = targetPort;
                    BaseUrl = prefix;
                    _isRunning = true;
                    break;
                }
                catch
                {
                    if (_listener != null)
                    {
                        try { _listener.Close(); } catch { }
                        _listener = null;
                    }
                }
            }

            if (!_isRunning || _listener == null)
            {
                return false;
            }

            _serverThread = new Thread(ListenLoop)
            {
                IsBackground = true,
                Name = "EditorHttpServerThread"
            };
            _serverThread.Start();
            return true;
        }

        private int FindFreePort()
        {
            var l = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return port;
        }

        private void ListenLoop()
        {
            while (_isRunning && _listener != null && _listener.IsListening)
            {
                try
                {
                    var ctx = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem(state => ProcessRequest((HttpListenerContext)state), ctx);
                }
                catch (HttpListenerException)
                {
                    break;
                }
                catch (Exception)
                {
                    if (!_isRunning) break;
                }
            }
        }

        private void ProcessRequest(HttpListenerContext ctx)
        {
            try
            {
                var req = ctx.Request;
                var res = ctx.Response;

                res.Headers.Add("Access-Control-Allow-Origin", "*");
                res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

                if (req.HttpMethod == "OPTIONS")
                {
                    res.StatusCode = (int)HttpStatusCode.OK;
                    res.Close();
                    return;
                }

                string rawUrl = req.RawUrl;
                if (string.IsNullOrEmpty(rawUrl)) rawUrl = "/";

                string path = rawUrl.Split('?')[0];
                if (string.IsNullOrEmpty(path) || path == "/" || path == "\\")
                {
                    path = "/index.html";
                }

                if (path.StartsWith("/api/saves", StringComparison.OrdinalIgnoreCase))
                {
                    HandleGetSavesList(ctx);
                }
                else if (path.StartsWith("/api/save", StringComparison.OrdinalIgnoreCase))
                {
                    if (req.HttpMethod == "POST")
                    {
                        HandlePostSave(ctx);
                    }
                    else
                    {
                        HandleGetSave(ctx);
                    }
                }
                else if (path.StartsWith("/api/backup-all", StringComparison.OrdinalIgnoreCase))
                {
                    HandleBackupAll(ctx);
                }
                else
                {
                    ServeStaticFile(ctx, path);
                }
            }
            catch (Exception ex)
            {
                try
                {
                    ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    byte[] err = Encoding.UTF8.GetBytes(ex.Message);
                    ctx.Response.OutputStream.Write(err, 0, err.Length);
                    ctx.Response.Close();
                }
                catch { }
            }
        }

        private void ServeStaticFile(HttpListenerContext ctx, string urlPath)
        {
            string relPath = urlPath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar);
            if (string.IsNullOrEmpty(relPath))
            {
                relPath = "index.html";
            }

            string fullPath = Path.Combine(_webRoot, relPath);
            if (Directory.Exists(fullPath))
            {
                fullPath = Path.Combine(fullPath, "index.html");
            }

            if (!File.Exists(fullPath))
            {
                ctx.Response.StatusCode = (int)HttpStatusCode.NotFound;
                byte[] notFound = Encoding.UTF8.GetBytes("File Not Found");
                ctx.Response.OutputStream.Write(notFound, 0, notFound.Length);
                ctx.Response.Close();
                return;
            }

            string ext = Path.GetExtension(fullPath).ToLowerInvariant();
            ctx.Response.ContentType = GetMimeType(ext);

            byte[] bytes = File.ReadAllBytes(fullPath);
            ctx.Response.ContentLength64 = bytes.Length;
            ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
            ctx.Response.Close();
        }

        private void HandleGetSavesList(HttpListenerContext ctx)
        {
            var saves = new List<string>();
            if (Directory.Exists(_gameDir))
            {
                var files = Directory.GetFiles(_gameDir, "*.sav");
                Array.Sort(files);
                foreach (var f in files)
                {
                    var fi = new FileInfo(f);
                    string name = Path.GetFileName(f);
                    string item = string.Format("{{\"name\":\"{0}\",\"size\":{1},\"modified\":\"{2:yyyy-MM-dd HH:mm:ss}\"}}",
                        EscapeJson(name), fi.Length, fi.LastWriteTime);
                    saves.Add(item);
                }
            }

            string json = "[" + string.Join(",", saves.ToArray()) + "]";
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            ctx.Response.ContentType = "application/json; charset=utf-8";
            ctx.Response.ContentLength64 = bytes.Length;
            ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
            ctx.Response.Close();
        }

        private void HandleGetSave(HttpListenerContext ctx)
        {
            string fileName = ctx.Request.QueryString["file"];
            if (string.IsNullOrEmpty(fileName))
            {
                fileName = ctx.Request.QueryString["slot"];
                if (!string.IsNullOrEmpty(fileName))
                {
                    fileName = string.Format("G3P_II{0}.sav", fileName.PadLeft(2, '0'));
                }
            }

            if (string.IsNullOrEmpty(fileName))
            {
                ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                byte[] err = Encoding.UTF8.GetBytes("Missing file parameter");
                ctx.Response.OutputStream.Write(err, 0, err.Length);
                ctx.Response.Close();
                return;
            }

            string safeName = Path.GetFileName(fileName);
            string filePath = Path.Combine(_gameDir, safeName);

            if (!File.Exists(filePath))
            {
                ctx.Response.StatusCode = (int)HttpStatusCode.NotFound;
                byte[] err = Encoding.UTF8.GetBytes("Save file not found");
                ctx.Response.OutputStream.Write(err, 0, err.Length);
                ctx.Response.Close();
                return;
            }

            byte[] saveBytes = File.ReadAllBytes(filePath);
            ctx.Response.ContentType = "application/octet-stream";
            ctx.Response.ContentLength64 = saveBytes.Length;
            ctx.Response.OutputStream.Write(saveBytes, 0, saveBytes.Length);
            ctx.Response.Close();
        }

        private void HandlePostSave(HttpListenerContext ctx)
        {
            string fileName = ctx.Request.QueryString["file"];
            if (string.IsNullOrEmpty(fileName))
            {
                ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                byte[] err = Encoding.UTF8.GetBytes("Missing file parameter");
                ctx.Response.OutputStream.Write(err, 0, err.Length);
                ctx.Response.Close();
                return;
            }

            string safeName = Path.GetFileName(fileName);
            string filePath = Path.Combine(_gameDir, safeName);

            using (var ms = new MemoryStream())
            {
                ctx.Request.InputStream.CopyTo(ms);
                byte[] data = ms.ToArray();

                if (File.Exists(filePath))
                {
                    string bakPath = filePath + ".bak";
                    try { File.Copy(filePath, bakPath, true); } catch { }
                }

                File.WriteAllBytes(filePath, data);
            }

            string json = string.Format("{{\"success\":true,\"message\":\"{0} saved with backup\"}}", EscapeJson(safeName));
            byte[] resBytes = Encoding.UTF8.GetBytes(json);
            ctx.Response.ContentType = "application/json; charset=utf-8";
            ctx.Response.ContentLength64 = resBytes.Length;
            ctx.Response.OutputStream.Write(resBytes, 0, resBytes.Length);
            ctx.Response.Close();
        }

        private void HandleBackupAll(HttpListenerContext ctx)
        {
            int count = 0;
            string timeStamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string backupDir = Path.Combine(_gameDir, "save_backups", timeStamp);

            if (Directory.Exists(_gameDir))
            {
                Directory.CreateDirectory(backupDir);
                foreach (string f in Directory.GetFiles(_gameDir, "*.sav"))
                {
                    string dest = Path.Combine(backupDir, Path.GetFileName(f));
                    File.Copy(f, dest, true);
                    count++;
                }
            }

            string json = string.Format("{{\"success\":true,\"count\":{0},\"folder\":\"{1}\"}}", count, EscapeJson(backupDir));
            byte[] resBytes = Encoding.UTF8.GetBytes(json);
            ctx.Response.ContentType = "application/json; charset=utf-8";
            ctx.Response.ContentLength64 = resBytes.Length;
            ctx.Response.OutputStream.Write(resBytes, 0, resBytes.Length);
            ctx.Response.Close();
        }

        private string GetMimeType(string ext)
        {
            switch (ext)
            {
                case ".html": case ".htm": return "text/html; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".txt": return "text/plain; charset=utf-8";
                case ".png": return "image/png";
                case ".jpg": case ".jpeg": return "image/jpeg";
                case ".gif": return "image/gif";
                case ".svg": return "image/svg+xml";
                case ".sav": return "application/octet-stream";
                default: return "application/octet-stream";
            }
        }

        private string EscapeJson(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r");
        }

        public void Stop()
        {
            _isRunning = false;
            if (_listener != null)
            {
                try { _listener.Stop(); } catch { }
                try { _listener.Close(); } catch { }
                _listener = null;
            }
        }

        public void Dispose()
        {
            Stop();
        }
    }
}
