// Ishlatish: node render.mjs <scenes.json> <out.mp4> [scale=0.5] [crf=23]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [cfg, out, scale = '0.5', crf = '23'] = process.argv.slice(2);
if (!cfg || !out) { console.error('node render.mjs <scenes.json> <out.mp4> [scale] [crf]'); process.exit(1); }
const props = JSON.parse(fs.readFileSync(cfg, 'utf8'));
const publicDir = path.resolve(path.dirname(cfg), props.publicDir || 'broll');
function findBrowser() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  // Playwright'ning headless_shell'i (yangi Chromium old-headless'ni qo'llamaydi)
  for (const root of [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers', path.join(process.env.HOME || '', '.cache/ms-playwright')].filter(Boolean)) {
    if (!fs.existsSync(root)) continue;
    for (const d of fs.readdirSync(root).filter((n) => n.startsWith('chromium_headless_shell')).sort().reverse()) {
      const f = path.join(root, d, 'chrome-linux', 'headless_shell');
      if (fs.existsSync(f)) return f;
    }
  }
  return null; // Remotion o'zi yuklab oladi (npx remotion browser ensure)
}
const browserExecutable = findBrowser();

const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.jsx'), publicDir});
const comp = await selectComposition({serveUrl, id: 'Montage', inputProps: props, browserExecutable});
let last = -1;
await renderMedia({
  composition: comp, serveUrl, inputProps: props, codec: 'h264', outputLocation: path.resolve(out),
  browserExecutable, scale: Number(scale), crf: Number(crf), pixelFormat: 'yuv420p', muted: true,
  chromiumOptions: {gl: 'swangle'}, concurrency: 4,
  onProgress: ({progress}) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`render ${p * 10}%`); } },
});
console.log('OK', out);
