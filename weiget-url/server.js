const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8082;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {  
  console.log(`REQ: ${req.url}`);

  // Handle URL normalization
  let safeUrl = req.url.split('?')[0];
  if (safeUrl === '/') safeUrl = '/index.html';
  console.log(`Safe URL: ${safeUrl}`);
  // Clean URL support: /test -> /test.html
  if (!path.extname(safeUrl) && !safeUrl.startsWith('/frontend/')) {
      safeUrl += '.html';
  }

  // Determine file path
  let filePath;
  if (safeUrl.startsWith('/frontend/')) {
    // Map /frontend/... requests to the actual ../frontend/ folder
    filePath = path.join(__dirname, '..', safeUrl);
  } else {
    // Serve everything else from current directory (examples)
    filePath = path.join(__dirname, safeUrl);
  }

  // Prevent directory traversal attacks ensuring path is still within project root
  const projectRoot = path.resolve(__dirname, '..');
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(projectRoot)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end(`404 File Not Found: ${safeUrl}\nTrying to read: ${filePath}`);
      } else {
        res.writeHead(500);
        res.end(`500 Internal Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${__dirname}`);
  console.log(`Mapping /frontend/ -> ../frontend/`);
});
