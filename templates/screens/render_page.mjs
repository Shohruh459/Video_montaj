// Ishlatish: node render_page.mjs '<json {page,variant,cps}>' <out.mp4> <duration> [fps]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import os from 'os'; import { spawnSync } from 'child_process'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const P = JSON.parse(process.argv[2]); const out = process.argv[3]; const dur = +process.argv[4]; const fps = +(process.argv[5] || 30);
const srv = http.createServer((q, s) => { try { s.writeHead(200, { 'Content-Type': 'text/html' }); s.end(fs.readFileSync(path.join(here, 'screens.html'))); } catch { s.writeHead(404); s.end(); } }).listen(0);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
const pg = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
await pg.goto(`http://localhost:${srv.address().port}/#${encodeURIComponent(JSON.stringify(P))}`); await pg.waitForFunction('window.ready');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scr-')); const n = Math.round(dur * fps);
for (let i = 0; i < n; i++) { await pg.evaluate(`window.setT(${i / fps})`); await pg.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 93 }); }
await b.close(); srv.close();
const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(fps), '-i', path.join(dir, 'f%04d.jpg'), '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out]); if (r.status) console.log(String(r.stderr));
console.log('OK', out);
