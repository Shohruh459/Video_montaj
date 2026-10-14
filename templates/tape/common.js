// Umumiy 3D sahna: renderer, yorug'lik, fon, soya, hook kartasi, harakat xiralashishi (motion blur)
import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export { T };
export function makeStage(P) {
  const W = P.w, H = P.h; const out = document.getElementById('out'); out.width = W; out.height = H; const o2 = out.getContext('2d');
  const gl = document.createElement('canvas'); gl.width = W; gl.height = H;
  const R = new T.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true }); R.setSize(W, H, false);
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = T.SRGBColorSpace;
  const S = new T.Scene(); S.environment = new T.PMREMGenerator(R).fromScene(new RoomEnvironment(), 0.04).texture;
  const c = document.createElement('canvas'); c.width = 8; c.height = 512; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#22304a'); g.addColorStop(0.55, '#111a2e'); g.addColorStop(1, '#080d19'); x.fillStyle = g; x.fillRect(0, 0, 8, 512);
  const bg = new T.CanvasTexture(c); bg.colorSpace = T.SRGBColorSpace; S.background = bg;
  const cam = new T.PerspectiveCamera(50, W / H, 0.1, 200);
  const key = new T.DirectionalLight(0xffffff, 2.6); key.position.set(-4, 9, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 14, bottom: -14, near: 1, far: 40 }); key.shadow.bias = -0.0005; S.add(key);
  const rim = new T.DirectionalLight(0x6fb6ff, 1.4); rim.position.set(5, 3, -6); S.add(rim); S.add(new T.AmbientLight(0xffffff, 0.25));
  const ground = new T.Mesh(new T.PlaneGeometry(90, 90), new T.ShadowMaterial({ opacity: 0.45 })); ground.rotation.x = -Math.PI / 2; ground.position.y = P.ground_y ?? -2.7; ground.receiveShadow = true; S.add(ground);
  function frame(pose, t, samples = 1, shutter = 1 / 40) {
    o2.globalAlpha = 1; o2.clearRect(0, 0, W, H);
    for (let k = 0; k < samples; k++) { pose(t - shutter * (samples > 1 ? k / (samples - 1) : 0)); R.render(S, cam); o2.globalAlpha = 1 / (k + 1); o2.drawImage(gl, 0, 0); }
    return out.toDataURL('image/png');
  }
  return { T, S, R, cam, frame };
}
export function textTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; }
export function cardTexture(P, w = 1500, h = 950) {
  return textTex(w, h, (x) => { x.fillStyle = '#fff7df'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e7c76a'; x.lineWidth = 14; x.strokeRect(26, 26, w - 52, h - 52);
    x.fillStyle = '#7a869a'; x.font = 'bold 38px DejaVu Sans'; x.textAlign = 'center'; x.fillText((P.brand || '').toUpperCase(), w / 2, 112);
    const lines = P.card; const total = lines.reduce((a, l) => a + l.size * 1.12, 0); let y = 150 + (h - 150 - 60 - total) / 2;
    for (const l of lines) { x.font = `bold ${l.size}px DejaVu Sans`; x.fillStyle = l.color; y += l.size; x.fillText(l.t, w / 2, y); y += l.size * 0.12; } });
}
export const ec = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
export function link(a, b, mesh) { const d = new T.Vector3().subVectors(b, a); mesh.position.copy(a).addScaledVector(d, 0.5); mesh.scale.set(1, d.length(), 1); mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize()); }
