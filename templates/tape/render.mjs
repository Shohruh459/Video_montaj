// Ishlatish: node render.mjs <params.json> <frames_dir>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const P = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const dir = process.argv[3]; fs.mkdirSync(dir, { recursive: true });
const mime = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html' };
const srv = http.createServer((q, s) => { const u = decodeURIComponent(q.url.split('#')[0].split('?')[0]); const f = path.join(here, u === '/' ? 'tape.html' : u);
  try { s.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f)); } catch { s.writeHead(404); s.end(); } }).listen(0);
const port = srv.address().port;
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: P.w, height: P.h } });
pg.on('pageerror', e => console.log('PAGE ERROR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
await pg.goto(`http://localhost:${port}/#${encodeURIComponent(JSON.stringify(P))}`); await pg.waitForFunction('window.ready', null, { timeout: 60000 });
const fps = P.fps || 30, n = Math.round(P.duration * fps); const only = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
for (let i = 0; i < n; i++) { if (only && !only.includes(i)) continue; const t = i / fps; const fast = t >= P.t_snap - 0.05 && t <= P.t_snap + P.snap_dur + 0.25;
  const d = await pg.evaluate(`window.setT(${t}, ${fast ? 24 : 1}, ${1 / 45})`); fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.png`), Buffer.from(d.split(',')[1], 'base64')); }
await b.close(); srv.close(); console.log('frames', n);
