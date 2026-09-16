import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '4000', 10);
const DOCS_DIR = path.resolve(__dirname, '../Docs');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
};

if (!fs.existsSync(DOCS_DIR)) {
  console.error('❌ Docs directory does not exist.');
  console.error('👉 Please run "pnpm run build:docs" first before previewing.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || '/');
  const pathname = decodeURIComponent(parsedUrl.pathname || '/');

  // Prevent directory traversal
  let safePath = path.normalize(path.join(DOCS_DIR, pathname));
  if (!safePath.startsWith(DOCS_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Handle directory requests
  if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
    if (!pathname.endsWith('/')) {
      res.writeHead(301, { Location: pathname + '/' + (parsedUrl.search || '') });
      res.end();
      return;
    }
    safePath = path.join(safePath, 'index.html');
  }

  // Check file existence
  if (!fs.existsSync(safePath) || !fs.statSync(safePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      '<h1>404 Not Found</h1><p>Documentation file not found.</p><a href="/">Return to Docs Hub</a>',
    );
    return;
  }

  const ext = path.extname(safePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const fileStream = fs.createReadStream(safePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    fileStream.pipe(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error: ' + message);
  }
});

server.listen(PORT, () => {
  console.log('========================================================');
  console.log(`📚 Atiesh Codex Docs Preview Running`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log('========================================================');
});
