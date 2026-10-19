import React from 'react';
import {AbsoluteFill, staticFile, continueRender, delayRender} from 'remotion';

// Bolalar multfilmi — konsept kadrlari (kod bilan chizilgan 2D qahramonlar; keyin animatsiya qilinadi).
export type KidsProps = {scene: 'bear' | 'penguin' | 'fox' | 'lineup'};

const useFont = () => {
  const [h] = React.useState(() => delayRender('font'));
  React.useEffect(() => {
    new FontFace('FR', `url(${staticFile('fredoka.ttf')})`, {weight: '300 700'}).load().then((f) => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="gBear" cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#d08a4f" /><stop offset="1" stopColor="#97592f" /></radialGradient>
    <radialGradient id="gFox" cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#ffa94a" /><stop offset="1" stopColor="#e5761a" /></radialGradient>
    <radialGradient id="gPeng" cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#3b4d75" /><stop offset="1" stopColor="#1d2842" /></radialGradient>
    <radialGradient id="gApple" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#ff6a5c" /><stop offset="1" stopColor="#d4271b" /></radialGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6cc6ff" /><stop offset="1" stopColor="#d8f3ff" /></linearGradient>
    <linearGradient id="gArctic" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd0ff" /><stop offset="1" stopColor="#eaf8ff" /></linearGradient>
    <linearGradient id="gWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe2b8" /><stop offset="1" stopColor="#ffc9c9" /></linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.25" /></filter>
  </defs>
);

export const Eye: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 26}) => (
  <g>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.18} fill="#2a1a12" />
    <circle cx={x + r * 0.32} cy={y - r * 0.42} r={r * 0.4} fill="#fff" />
    <circle cx={x - r * 0.38} cy={y + r * 0.4} r={r * 0.17} fill="#fff" opacity="0.85" />
  </g>
);
export const Cheek: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 30}) => <ellipse cx={x} cy={y} rx={r} ry={r * 0.7} fill="#ff7e8a" opacity="0.5" />;

export const Smile: React.FC<{y?: number; w?: number}> = ({y = 70, w = 32}) => (
  <g>
    <path d={`M${-w} ${y} Q0 ${y + 48} ${w} ${y}`} fill="#7a1f2b" stroke="#3b2316" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M${-w * 0.55} ${y + 20} Q0 ${y + 52} ${w * 0.55} ${y + 20} Q0 ${y + 30} ${-w * 0.55} ${y + 20}Z`} fill="#ff8795" />
  </g>
);

// ---- Benny the Bear ----
const Bear: React.FC<{x: number; y: number; s?: number; holdApple?: boolean}> = ({x, y, s = 1, holdApple}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#soft)">
    <ellipse cx="-100" cy="430" rx="82" ry="52" fill="#8a4f28" /><ellipse cx="100" cy="430" rx="82" ry="52" fill="#8a4f28" />
    <ellipse cx="-100" cy="440" rx="44" ry="26" fill="#e3a877" /><ellipse cx="100" cy="440" rx="44" ry="26" fill="#e3a877" />
    <ellipse cx="0" cy="260" rx="175" ry="195" fill="url(#gBear)" />
    <ellipse cx="0" cy="285" rx="112" ry="135" fill="#f3d4a6" />
    <ellipse cx="-185" cy="250" rx="55" ry="105" fill="#a56434" transform="rotate(18 -185 250)" />
    {holdApple ? <ellipse cx="190" cy="150" rx="55" ry="105" fill="#a56434" transform="rotate(40 190 150)" /> : <ellipse cx="185" cy="250" rx="55" ry="105" fill="#a56434" transform="rotate(-18 185 250)" />}
    <circle cx="-140" cy="-135" r="64" fill="#a56434" /><circle cx="140" cy="-135" r="64" fill="#a56434" />
    <circle cx="-140" cy="-135" r="36" fill="#e3a877" /><circle cx="140" cy="-135" r="36" fill="#e3a877" />
    <circle cx="0" cy="0" r="180" fill="url(#gBear)" />
    <ellipse cx="0" cy="50" rx="86" ry="66" fill="#f5d9b2" />
    <ellipse cx="0" cy="18" rx="32" ry="21" fill="#3b2316" /><ellipse cx="-10" cy="11" rx="10" ry="5" fill="#fff" opacity="0.55" />
    <Smile y={44} w={34} />
    <Eye x={-68} y={-30} /><Eye x={68} y={-30} />
    <path d="M-100 -78 Q-68 -98 -36 -80" stroke="#6b3d1f" strokeWidth="8" fill="none" strokeLinecap="round" /><path d="M100 -78 Q68 -98 36 -80" stroke="#6b3d1f" strokeWidth="8" fill="none" strokeLinecap="round" />
    <Cheek x={-118} y={42} /><Cheek x={118} y={42} />
    {holdApple && <Apple x={262} y={52} s={0.9} />}
  </g>
);

export const Apple: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#soft)">
    <path d="M0 -40 Q-70 -60 -62 10 Q-58 70 0 66 Q58 70 62 10 Q70 -60 0 -40Z" fill="url(#gApple)" />
    <path d="M0 -40 Q4 -70 22 -84" stroke="#5a3a1a" strokeWidth="9" fill="none" strokeLinecap="round" />
    <path d="M22 -70 Q60 -100 84 -66 Q50 -40 22 -70Z" fill="#5cc450" />
    <ellipse cx="-28" cy="-6" rx="13" ry="22" fill="#fff" opacity="0.55" transform="rotate(20 -28 -6)" />
  </g>
);

// ---- Pip the Penguin ----
export const Penguin: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#soft)">
    <ellipse cx="-75" cy="262" rx="66" ry="30" fill="#ff9a2e" /><ellipse cx="75" cy="262" rx="66" ry="30" fill="#ff9a2e" />
    <ellipse cx="0" cy="40" rx="190" ry="240" fill="url(#gPeng)" />
    <ellipse cx="0" cy="70" rx="135" ry="195" fill="#fbfdff" />
    <ellipse cx="-205" cy="30" rx="42" ry="135" fill="#2b3a5e" transform="rotate(14 -205 30)" /><ellipse cx="205" cy="30" rx="42" ry="135" fill="#2b3a5e" transform="rotate(-14 205 30)" />
    <circle cx="0" cy="-185" r="150" fill="url(#gPeng)" />
    <ellipse cx="0" cy="-160" rx="108" ry="98" fill="#fbfdff" />
    <path d="M-140 -50 Q0 10 140 -50 L130 -10 Q0 50 -130 -10Z" fill="#e84a5f" /><path d="M60 -20 L110 70 L55 62Z" fill="#c93a4e" />
    <Eye x={-48} y={-190} r={24} /><Eye x={48} y={-190} r={24} />
    <path d="M-34 -150 Q0 -118 34 -150 Q0 -192 -34 -150Z" fill="#ff9a2e" /><path d="M-24 -142 Q0 -126 24 -142" stroke="#c76d10" strokeWidth="5" fill="none" strokeLinecap="round" />
    <Cheek x={-92} y={-148} r={24} /><Cheek x={92} y={-148} r={24} />
  </g>
);

export const Fish: React.FC<{x: number; y: number; c: string; n: number}> = ({x, y, c, n}) => (
  <g transform={`translate(${x} ${y})`} filter="url(#soft)">
    <path d="M70 0 L130 -42 L130 42Z" fill={c} /><ellipse cx="0" cy="0" rx="82" ry="52" fill={c} />
    <ellipse cx="-12" cy="-20" rx="34" ry="12" fill="#fff" opacity="0.35" />
    <circle cx="-40" cy="-10" r="12" fill="#fff" /><circle cx="-38" cy="-10" r="6" fill="#222" />
    <circle cx="-4" cy="-150" r="52" fill="#fff" stroke={c} strokeWidth="10" />
    <text x="-4" y="-128" textAnchor="middle" fontFamily="FR" fontWeight="700" fontSize="74" fill={c}>{n}</text>
  </g>
);

// ---- Lila the Fox ----
export const Fox: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#soft)">
    <g transform="rotate(-32 140 330)"><ellipse cx="270" cy="330" rx="150" ry="62" fill="#e5761a" /><ellipse cx="392" cy="330" rx="54" ry="50" fill="#fff" /></g>
    <ellipse cx="-90" cy="430" rx="70" ry="46" fill="#7a3d12" /><ellipse cx="90" cy="430" rx="70" ry="46" fill="#7a3d12" />
    <ellipse cx="0" cy="260" rx="150" ry="180" fill="url(#gFox)" /><ellipse cx="0" cy="290" rx="92" ry="125" fill="#fff5e6" />
    <ellipse cx="-160" cy="250" rx="46" ry="95" fill="#e5761a" transform="rotate(16 -160 250)" /><ellipse cx="160" cy="250" rx="46" ry="95" fill="#e5761a" transform="rotate(-16 160 250)" />
    <path d="M-135 -90 L-175 -260 L-30 -150Z" fill="#e5761a" /><path d="M135 -90 L175 -260 L30 -150Z" fill="#e5761a" />
    <path d="M-132 -130 L-155 -218 L-70 -150Z" fill="#3b2316" /><path d="M132 -130 L155 -218 L70 -150Z" fill="#3b2316" />
    <path d="M-170 40 Q-205 30 -215 10 Q-150 -10 -120 -30Z" fill="#fff" /><path d="M170 40 Q205 30 215 10 Q150 -10 120 -30Z" fill="#fff" />
    <circle cx="0" cy="0" r="170" fill="url(#gFox)" />
    <path d="M-168 30 Q0 220 168 30 Q120 -10 0 20 Q-120 -10 -168 30Z" fill="#fff5e6" />
    <ellipse cx="0" cy="34" rx="30" ry="20" fill="#3b2316" /><ellipse cx="-10" cy="28" rx="9" ry="5" fill="#fff" opacity="0.5" />
    <Smile y={56} w={30} />
    <Eye x={-66} y={-22} /><Eye x={66} y={-22} />
    <Cheek x={-110} y={44} r={26} /><Cheek x={110} y={44} r={26} />
  </g>
);

// ---- fon bo'laklari ----
export const Cloud: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.95"><ellipse cx="0" cy="0" rx="120" ry="50" /><circle cx="-50" cy="-30" r="52" /><circle cx="25" cy="-48" r="64" /><circle cx="85" cy="-14" r="44" /></g>
);
export const Tree: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x="-22" y="0" width="44" height="150" rx="14" fill="#8a5a2b" /><circle cx="0" cy="-30" r="100" fill="#43b04a" /><circle cx="-60" cy="20" r="62" fill="#4cc255" /><circle cx="64" cy="14" r="66" fill="#3da345" /></g>
);
export const Flower: React.FC<{x: number; y: number; c: string}> = ({x, y, c}) => (
  <g transform={`translate(${x} ${y})`}><rect x="-3" y="0" width="6" height="40" fill="#3d9a40" />{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-16" rx="11" ry="17" fill={c} transform={`rotate(${a})`} />)}<circle r="9" fill="#ffd23f" /></g>
);

const Title: React.FC<{text: string; sub?: string; color?: string}> = ({text, sub, color = '#ff5a4d'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontFamily: 'FR', fontWeight: 700}}>
    <div style={{display: 'inline-block', fontSize: 104, color, WebkitTextStroke: '10px #fff', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.18)', letterSpacing: 2}}>{text}</div>
    {sub && <div style={{fontSize: 46, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.25)', marginTop: 4}}>{sub}</div>}
  </div>
);

const SceneBear: React.FC = () => (
  <AbsoluteFill>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080"><Defs />
      <rect width="1920" height="1080" fill="url(#gSky)" />
      <g><circle cx="1640" cy="190" r="92" fill="#ffd84a" /><circle cx="1640" cy="190" r="125" fill="#ffd84a" opacity="0.28" /></g>
      <Cloud x={420} y={250} s={1} /><Cloud x={1180} y={170} s={0.8} />
      <ellipse cx="500" cy="1010" rx="1000" ry="330" fill="#6cc95a" /><ellipse cx="1500" cy="1040" rx="900" ry="300" fill="#58b84a" />
      <Tree x={1500} y={560} s={1.25} /><Tree x={1760} y={640} s={0.9} />
      {[120, 300, 760, 1020, 1280].map((x, i) => <Flower key={x} x={x} y={900 + (i % 2) * 40} c={['#ff6f91', '#fff', '#b388ff', '#ff9f43', '#ff6f91'][i]} />)}
      <Bear x={640} y={500} s={0.98} holdApple />
    </svg>
    <Title text="Let's learn COLORS!" sub="Benny the Bear finds the color…" />
    <div style={{position: 'absolute', right: 150, top: 440, textAlign: 'center', fontFamily: 'FR', fontWeight: 700}}>
      <div style={{fontSize: 230, color: '#e53b2e', WebkitTextStroke: '14px #fff', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.2)', lineHeight: 1}}>RED</div>
      <div style={{display: 'flex', gap: 22, justifyContent: 'center', marginTop: 26}}>{['#e53b2e', '#2f86ff', '#ffd23f', '#3dbd5a'].map((c, i) => <div key={c} style={{width: 74, height: 74, borderRadius: 37, background: c, border: '7px solid #fff', boxShadow: '0 6px 0 rgba(0,0,0,0.18)', transform: i === 0 ? 'scale(1.25)' : 'none'}} />)}</div>
    </div>
  </AbsoluteFill>
);

const ScenePenguin: React.FC = () => (
  <AbsoluteFill>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080"><Defs />
      <rect width="1920" height="1080" fill="url(#gArctic)" />
      {Array.from({length: 40}, (_, i) => <circle key={i} cx={(i * 197) % 1920} cy={(i * 131) % 700} r={4 + (i % 4) * 2} fill="#fff" opacity="0.8" />)}
      <Cloud x={380} y={200} s={0.9} /><Cloud x={1500} y={240} s={0.7} />
      <path d="M0 700 Q300 560 620 690 Q900 780 1200 650 Q1560 540 1920 700 L1920 1080 L0 1080Z" fill="#fff" />
      <path d="M0 800 Q400 740 800 820 Q1300 900 1920 780 L1920 1080 L0 1080Z" fill="#d7efff" />
      <ellipse cx="620" cy="880" rx="420" ry="90" fill="#bfe6ff" /><ellipse cx="620" cy="860" rx="400" ry="78" fill="#f3fbff" />
      <Penguin x={620} y={560} s={0.95} />
      <Fish x={1190} y={720} c="#ff8a3d" n={1} /><Fish x={1450} y={640} c="#2fa4ff" n={2} /><Fish x={1710} y={730} c="#8f5cff" n={3} />
    </svg>
    <Title text="Let's COUNT!" sub="Pip the Penguin catches fish: 1 … 2 … 3!" color="#2b86ff" />
  </AbsoluteFill>
);

const SceneFox: React.FC = () => (
  <AbsoluteFill>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080"><Defs />
      <rect width="1920" height="1080" fill="url(#gWarm)" />
      {Array.from({length: 12}, (_, i) => <rect key={i} x={i * 180} y="0" width="90" height="760" fill="#fff" opacity="0.18" />)}
      <rect x="0" y="760" width="1920" height="320" fill="#d9a26b" /><rect x="0" y="760" width="1920" height="26" fill="#b9854f" />
      <rect x="1180" y="350" width="560" height="26" rx="12" fill="#b9854f" /><rect x="1220" y="376" width="14" height="60" fill="#b9854f" /><rect x="1690" y="376" width="14" height="60" fill="#b9854f" />
      <circle cx="1280" cy="310" r="42" fill="#ff6f91" /><rect x="1380" y="268" width="84" height="84" rx="10" fill="#4aa8ff" /><path d="M1580 352 L1630 266 L1680 352Z" fill="#ffd23f" />
      <Fox x={620} y={560} s={0.92} />
      <g filter="url(#soft)">
        <circle cx="1180" cy="860" r="92" fill="#ff6f91" /><rect x="1340" y="772" width="176" height="176" rx="18" fill="#4aa8ff" /><path d="M1560 948 L1670 770 L1780 948Z" fill="#ffd23f" />
      </g>
    </svg>
    <Title text="Let's find SHAPES!" sub="Lila the Fox is sorting her blocks" color="#ff7a1a" />
    <div style={{position: 'absolute', left: 0, top: 965, fontFamily: 'FR', fontWeight: 700, fontSize: 56, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>
      {[['circle', 1180], ['square', 1428], ['triangle', 1670]].map(([t, cx]) => <span key={t as string} style={{position: 'absolute', left: (cx as number) - 130, width: 260, textAlign: 'center'}}>{t}</span>)}
    </div>
  </AbsoluteFill>
);

const SceneLineup: React.FC = () => (
  <AbsoluteFill>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080"><Defs />
      <rect width="1920" height="1080" fill="url(#gSky)" />
      <g><circle cx="1660" cy="170" r="84" fill="#ffd84a" /><circle cx="1660" cy="170" r="116" fill="#ffd84a" opacity="0.28" /></g>
      <Cloud x={300} y={210} s={0.9} /><Cloud x={1250} y={150} s={0.7} />
      <ellipse cx="500" cy="1030" rx="1000" ry="320" fill="#6cc95a" /><ellipse cx="1500" cy="1050" rx="900" ry="300" fill="#58b84a" />
      <Tree x={170} y={610} s={0.95} /><Tree x={1790} y={640} s={0.85} />
      {[420, 700, 1000, 1330, 1560].map((x, i) => <Flower key={x} x={x} y={930 + (i % 2) * 30} c={['#ff6f91', '#fff', '#b388ff', '#ff9f43', '#ff6f91'][i]} />)}
      <Penguin x={420} y={570} s={0.72} /><Bear x={960} y={520} s={0.8} /><Fox x={1470} y={540} s={0.76} />
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: 'FR', fontWeight: 700}}>
      <div style={{display: 'inline-block', fontSize: 112, color: '#ff5a4d', WebkitTextStroke: '12px #fff', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.18)'}}>LITTLE EXPLORERS</div>
      <div style={{fontSize: 48, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.25)'}}>working title · Pip, Benny & Lila</div>
    </div>
  </AbsoluteFill>
);

export const Kids: React.FC<KidsProps> = ({scene}) => {
  useFont();
  return scene === 'bear' ? <SceneBear /> : scene === 'penguin' ? <ScenePenguin /> : scene === 'fox' ? <SceneFox /> : <SceneLineup />;
};
