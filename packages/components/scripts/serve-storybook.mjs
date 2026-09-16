import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '6006', 10);
const STORYBOOK_DIR = path.resolve(__dirname, '../../../Docs/storybook');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!fs.existsSync(STORYBOOK_DIR)) {
  console.error('❌ Storybook directory does not exist at ' + STORYBOOK_DIR);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || '/');
  let pathname = decodeURIComponent(parsedUrl.pathname || '/');

  let safePath = path.normalize(path.join(STORYBOOK_DIR, pathname));
  if (!safePath.startsWith(STORYBOOK_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
    safePath = path.join(safePath, 'index.html');
  }

  if (!fs.existsSync(safePath) || !fs.statSync(safePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(safePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(safePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Storybook test server running on port ${PORT}`);
});
