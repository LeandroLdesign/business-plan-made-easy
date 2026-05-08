import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { extname, join, resolve } from 'path';

const portIdx = process.argv.indexOf('--port');
const port = portIdx > -1 ? Number(process.argv[portIdx + 1]) : 8080;
const root = resolve('.');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p === '/') p = '/index.html';
    const fp = join(root, p);
    if (!fp.startsWith(root)) { res.writeHead(403).end(); return; }
    const s = await stat(fp).catch(() => null);
    const file = s?.isFile() ? fp : join(root, 'index.html');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, () => console.log(`Serving on ${port}`));
