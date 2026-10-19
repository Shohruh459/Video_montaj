import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';
import {Defs, Cheek, Penguin, Fox, Cloud, Tree, Flower, Apple} from './Kids';

export type EpLine = {t: number; dur: number; text: string; scene: string; gesture: 'wave' | 'point' | 'ear' | 'cheer' | 'none'; pause: number};
export type EpScene = {kind: 'intro' | 'red' | 'blue' | 'yellow' | 'green' | 'recap' | 'outro'; t: number; end: number};
export type KidsEpProps = {totalSec: number; audio: string; mouth: number[]; lines: EpLine[]; scenes: EpScene[]; title: string};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const eO = (x: number) => 1 - Math.pow(1 - x, 3);
const bnc = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3) * Math.cos(x * Math.PI * 3.2));
const COL: Record<string, string> = {red: '#e53b2e', blue: '#2f86ff', yellow: '#f5b800', green: '#2fb34a'};
const WORD: Record<string, string> = {red: 'RED', blue: 'BLUE', yellow: 'YELLOW', green: 'GREEN'};

const useFont = () => {
  const [h] = React.useState(() => delayRender('font'));
  React.useEffect(() => {
    new FontFace('FR', `url(${staticFile('fredoka.ttf')})`, {weight: '300 700'}).load().then((f) => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

// ---------- Benny (animatsiyali) ----------
const EyeB: React.FC<{x: number; y: number; blink: number; r?: number}> = ({x, y, blink, r = 26}) => (
  <g transform={`translate(${x} ${y}) scale(1 ${1 - 0.92 * blink})`}>
    <ellipse cx="0" cy="0" rx={r} ry={r * 1.18} fill="#2a1a12" />
    <circle cx={r * 0.32} cy={-r * 0.42} r={r * 0.4} fill="#fff" /><circle cx={-r * 0.38} cy={r * 0.4} r={r * 0.17} fill="#fff" opacity="0.85" />
  </g>
);

const MouthB: React.FC<{m: number}> = ({m}) => {
  if (m < 0.09) return (
    <g><path d="M-34 44 Q0 92 34 44" fill="#7a1f2b" stroke="#3b2316" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /><path d="M-19 64 Q0 96 19 64 Q0 74 -19 64Z" fill="#ff8795" /></g>
  );
  const rx = 24 + 16 * m, ry = 8 + 38 * m, cy = 60 + ry * 0.35;
  return (
    <g>
      <defs><clipPath id="mc"><ellipse cx="0" cy={cy} rx={rx} ry={ry} /></clipPath></defs>
      <ellipse cx="0" cy={cy} rx={rx} ry={ry} fill="#6d1626" stroke="#3b2316" strokeWidth="7" />
      <g clipPath="url(#mc)"><ellipse cx="0" cy={cy + ry * 0.7} rx={rx * 0.7} ry={ry * 0.55} fill="#ff8795" /></g>
    </g>
  );
};

type Pose = {mouth: number; blink: number; armR: number; armL: number; tilt: number; jump: number};
const BennyRig: React.FC<{x: number; y: number; s: number; p: Pose; t: number}> = ({x, y, s, p, t}) => {
  const bob = Math.sin(t * 3.2) * 5; const sq = 1 + 0.012 * Math.sin(t * 3.2);
  return (
    <g transform={`translate(${x} ${y + bob + p.jump}) scale(${s} ${s * sq})`}>
      <ellipse cx="0" cy="500" rx="230" ry="34" fill="#000" opacity="0.16" transform={`scale(${1 - Math.abs(p.jump) / 500} 1)`} />
      <g>
        <ellipse cx="-100" cy="430" rx="82" ry="52" fill="#8a4f28" /><ellipse cx="100" cy="430" rx="82" ry="52" fill="#8a4f28" />
        <ellipse cx="-100" cy="440" rx="44" ry="26" fill="#e3a877" /><ellipse cx="100" cy="440" rx="44" ry="26" fill="#e3a877" />
        <g transform={`rotate(${p.armL} -150 200)`}><ellipse cx="-172" cy="285" rx="52" ry="100" fill="#a56434" transform="rotate(10 -172 285)" /><circle cx="-190" cy="372" r="32" fill="#b97a47" /></g>
        <ellipse cx="0" cy="260" rx="175" ry="195" fill="url(#gBear)" /><ellipse cx="0" cy="285" rx="112" ry="135" fill="#f3d4a6" />
        <g transform={`rotate(${p.armR} 150 200)`}><ellipse cx="172" cy="285" rx="52" ry="100" fill="#a56434" transform="rotate(-10 172 285)" /><circle cx="190" cy="372" r="32" fill="#b97a47" /></g>
      </g>
      <g transform={`rotate(${p.tilt} 0 150)`}>
        <circle cx="-140" cy="-135" r="64" fill="#a56434" /><circle cx="140" cy="-135" r="64" fill="#a56434" />
        <circle cx="-140" cy="-135" r="36" fill="#e3a877" /><circle cx="140" cy="-135" r="36" fill="#e3a877" />
        <circle cx="0" cy="0" r="180" fill="url(#gBear)" />
        <ellipse cx="0" cy="50" rx="86" ry="66" fill="#f5d9b2" />
        <ellipse cx="0" cy="18" rx="32" ry="21" fill="#3b2316" /><ellipse cx="-10" cy="11" rx="10" ry="5" fill="#fff" opacity="0.55" />
        <MouthB m={p.mouth} />
        <EyeB x={-68} y={-30} blink={p.blink} /><EyeB x={68} y={-30} blink={p.blink} />
        <path d={`M-100 ${-78 - p.mouth * 6} Q-68 ${-98 - p.mouth * 6} -36 ${-80 - p.mouth * 6}`} stroke="#6b3d1f" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={`M100 ${-78 - p.mouth * 6} Q68 ${-98 - p.mouth * 6} 36 ${-80 - p.mouth * 6}`} stroke="#6b3d1f" strokeWidth="8" fill="none" strokeLinecap="round" />
        <Cheek x={-118} y={42} /><Cheek x={118} y={42} />
      </g>
    </g>
  );
};

const armTarget = (g: EpLine['gesture'], t: number) => {
  switch (g) {
    case 'wave': return {armR: -135 + 20 * Math.sin(t * 10), armL: 3, tilt: 0, jump: 0};
    case 'point': return {armR: -72 + 4 * Math.sin(t * 3), armL: 3 + Math.sin(t * 2), tilt: 0, jump: 0};
    case 'ear': return {armR: -150 + 4 * Math.sin(t * 6), armL: 3, tilt: 9, jump: 0};
    case 'cheer': return {armR: -165 + 12 * Math.sin(t * 14), armL: 165 - 12 * Math.sin(t * 14 + 1), tilt: 0, jump: -Math.abs(Math.sin(t * 5.5)) * 70};
    default: return {armR: 3 + Math.sin(t * 2), armL: -3 - Math.sin(t * 2), tilt: 0, jump: 0};
  }
};

// ---------- predmetlar ----------
const Ball: React.FC = () => (
  <g filter="url(#soft)"><circle r="100" fill="#2f86ff" /><path d="M-96 -26 Q0 -70 96 -26" stroke="#fff" strokeWidth="18" fill="none" opacity="0.9" /><path d="M-96 34 Q0 -10 96 34" stroke="#fff" strokeWidth="18" fill="none" opacity="0.9" /><ellipse cx="-38" cy="-52" rx="22" ry="34" fill="#fff" opacity="0.45" transform="rotate(25 -38 -52)" /></g>
);
const Banana: React.FC = () => (
  <g filter="url(#soft)"><path d="M-120 -70 Q-70 90 90 70 Q130 60 138 28 Q120 22 100 36 Q-30 62 -84 -90 Q-110 -96 -120 -70Z" fill="#ffd633" stroke="#c99a00" strokeWidth="6" strokeLinejoin="round" /><path d="M-84 -90 Q-92 -118 -76 -128" stroke="#7a5a1a" strokeWidth="14" fill="none" strokeLinecap="round" /><path d="M138 28 L150 22" stroke="#5a3a1a" strokeWidth="12" strokeLinecap="round" /><path d="M-60 -40 Q-20 40 60 46" stroke="#fff" strokeWidth="10" fill="none" opacity="0.45" strokeLinecap="round" /></g>
);
const Frog: React.FC<{open: number}> = ({open}) => (
  <g filter="url(#soft)">
    <ellipse cx="-92" cy="78" rx="64" ry="34" fill="#38a84a" /><ellipse cx="92" cy="78" rx="64" ry="34" fill="#38a84a" />
    <ellipse cx="0" cy="20" rx="125" ry="98" fill="#4cc552" /><ellipse cx="0" cy="48" rx="80" ry="62" fill="#c8f2a8" />
    <circle cx="-58" cy="-66" r="44" fill="#4cc552" /><circle cx="58" cy="-66" r="44" fill="#4cc552" />
    <circle cx="-58" cy="-66" r="30" fill="#fff" /><circle cx="58" cy="-66" r="30" fill="#fff" /><circle cx="-52" cy="-62" r="15" fill="#222" /><circle cx="52" cy="-62" r="15" fill="#222" />
    <circle cx="-46" cy="-70" r="5" fill="#fff" /><circle cx="58" cy="-70" r="5" fill="#fff" />
    <path d={`M-52 12 Q0 ${58 + open * 20} 52 12`} fill="#8a1f2b" stroke="#2a6a33" strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="-92" cy="26" rx="22" ry="14" fill="#ff7e8a" opacity="0.55" /><ellipse cx="92" cy="26" rx="22" ry="14" fill="#ff7e8a" opacity="0.55" />
  </g>
);

const ObjectFor: React.FC<{kind: 'red' | 'blue' | 'yellow' | 'green'; t: number; open?: number}> = ({kind, t, open = 0}) => {
  if (kind === 'red') return <g transform={`rotate(${Math.sin(t * 3) * 5}) scale(2.3)`}><Apple x={0} y={0} s={1} /></g>;
  if (kind === 'blue') { const b = Math.abs(Math.sin(t * 3.6)); return <g transform={`translate(0 ${-b * 150}) scale(${1 + (1 - b) * 0.08} ${1 - (1 - b) * 0.08})`}><Ball /></g>; }
  if (kind === 'yellow') return <g transform={`rotate(${Math.sin(t * 3) * 9}) scale(1.35)`}><Banana /></g>;
  const h = Math.abs(Math.sin(t * 3.2)); return <g transform={`translate(0 ${-h * 130}) scale(${1 + (1 - h) * 0.06} ${1 - (1 - h) * 0.06}) scale(1.25)`}><Frog open={open} /></g>;
};

const Confetti: React.FC<{color: string; t0: number; t: number; seed: string; n?: number}> = ({color, t0, t, seed, n = 14}) => (
  <>{Array.from({length: n}, (_, i) => {
    const a = random(`${seed}a${i}`) * Math.PI * 2; const sp = 260 + random(`${seed}s${i}`) * 360; const k = c01((t - t0) / 1.1);
    if (k <= 0 || k >= 1) return null;
    return <circle key={i} cx={Math.cos(a) * sp * eO(k)} cy={Math.sin(a) * sp * eO(k) + 260 * k * k} r={9 + random(`${seed}r${i}`) * 9} fill={i % 3 === 0 ? '#fff' : color} opacity={1 - k * k} />;
  })}</>
);

export const KidsEp: React.FC<KidsEpProps> = (p) => {
  useFont();
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const li = (() => { let k = -1; p.lines.forEach((l, i) => { if (t >= l.t - 0.05) k = i; }); return k; })();
  const line = li >= 0 ? p.lines[li] : null; const prev = li > 0 ? p.lines[li - 1] : null;
  const talking = line && t < line.t + line.dur + 0.15;
  const mouth = c01(p.mouth[Math.min(f, p.mouth.length - 1)] ?? 0);
  const gTarget = armTarget(line ? line.gesture : 'none', t); const gPrev = armTarget(prev ? prev.gesture : 'none', t);
  const k = line ? eO(c01((t - line.t) / 0.35)) : 1;
  const mix = (a: number, b: number) => a + (b - a) * k;
  const bl = (() => { const per = 96; const ph = (f + 30) % per; return ph < 6 ? 1 - Math.abs(ph - 3) / 3 : 0; })();
  const pose: Pose = {mouth, blink: bl, armR: mix(gPrev.armR, gTarget.armR), armL: mix(gPrev.armL, gTarget.armL), tilt: mix(gPrev.tilt, gTarget.tilt), jump: mix(gPrev.jump, gTarget.jump)};
  const sc = p.scenes.find((s) => t >= s.t && t < s.end);
  const inEar = line && line.gesture === 'ear' && t >= line.t + line.dur;
  const objKinds = ['red', 'blue', 'yellow', 'green'] as const;
  const sunPulse = 1 + 0.03 * Math.sin(t * 2);
  return (
    <AbsoluteFill>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080"><Defs />
        <rect width="1920" height="1080" fill="url(#gSky)" />
        <g transform={`translate(1660 170) scale(${sunPulse})`}><circle r="84" fill="#ffd84a" /><circle r="118" fill="#ffd84a" opacity="0.28" /></g>
        <Cloud x={300 + ((t * 14) % 2300) - 200} y={210} s={0.9} /><Cloud x={1250 + ((t * 9) % 2300) - 700} y={150} s={0.7} />
        <ellipse cx="500" cy="1030" rx="1000" ry="320" fill="#6cc95a" /><ellipse cx="1500" cy="1050" rx="900" ry="300" fill="#58b84a" />
        <Tree x={90} y={620} s={0.9} /><Tree x={1830} y={650} s={0.8} />
        {[260, 620, 980, 1340, 1600].map((x, i) => <g key={x} transform={`rotate(${Math.sin(t * 2 + i) * 5} ${x} ${960 + (i % 2) * 30})`}><Flower x={x} y={930 + (i % 2) * 30} c={['#ff6f91', '#fff', '#b388ff', '#ff9f43', '#ff6f91'][i]} /></g>)}

        {/* Pip va Lila — oxirida */}
        {p.scenes.filter((s) => s.kind === 'outro').map((s) => {
          const a = eO(c01((t - s.t) / 0.6));
          return a > 0 ? (<g key="cam"><g transform={`translate(${(1 - a) * 700} 0)`}><Penguin x={1250} y={560} s={0.62} /></g><g transform={`translate(${(1 - a) * 900} 0)`}><Fox x={1640} y={540} s={0.7} /></g></g>) : null;
        })}

        {/* predmet(lar) */}
        {sc && objKinds.includes(sc.kind as any) && (() => {
          const kind = sc.kind as 'red' | 'blue' | 'yellow' | 'green'; const a = bnc(c01((t - sc.t) / 0.6)); const out = c01((sc.end - t) / 0.3);
          const open = kind === 'green' && talking ? mouth : 0;
          return (
            <g transform={`translate(1400 560) scale(${a * out})`}>
              <ObjectFor kind={kind} t={t} open={open} />
              <Confetti color={COL[kind]} t0={sc.t + 0.5} t={t} seed={kind} />
            </g>
          );
        })()}
        {sc && sc.kind === 'recap' && objKinds.map((kd, i) => {
          const a = bnc(c01((t - sc.t - 0.15 - i * 0.35) / 0.5)); const x = 1010 + i * 230;
          return (<g key={kd} transform={`translate(${x} 600) scale(${a * 0.52})`}><ObjectFor kind={kd} t={t + i} /></g>);
        })}
        {sc && sc.kind === 'recap' && <g transform="translate(1400 520)"><Confetti color="#ff6f91" t0={sc.t + 0.4} t={t} seed="r1" n={24} /><Confetti color="#ffd23f" t0={sc.t + 1.2} t={t} seed="r2" n={24} /></g>}

        <BennyRig x={520} y={440} s={0.98} p={pose} t={t} />
      </svg>

      {/* so'z yorlig'i */}
      {sc && objKinds.includes(sc.kind as any) && (() => {
        const kind = sc.kind as 'red' | 'blue' | 'yellow' | 'green'; const a = bnc(c01((t - sc.t - 0.5) / 0.5)); const out = c01((sc.end - t) / 0.3);
        const pulse = inEar ? 1 + 0.09 * Math.sin(t * 9) : 1;
        return (
          <div style={{position: 'absolute', left: 1100, width: 600, top: 740, textAlign: 'center', fontFamily: 'FR', fontWeight: 700, transform: `scale(${a * out * pulse})`}}>
            <div style={{fontSize: 170, color: COL[kind], WebkitTextStroke: '14px #fff', paintOrder: 'stroke fill', textShadow: '0 9px 0 rgba(0,0,0,0.2)', lineHeight: 1}}>{WORD[kind]}</div>
          </div>
        );
      })()}
      {sc && sc.kind === 'recap' && (
        <div style={{position: 'absolute', left: 900, width: 1000, top: 780, textAlign: 'center', fontFamily: 'FR', fontWeight: 700, fontSize: 92}}>
          {(['red', 'blue', 'yellow', 'green'] as const).map((kd, i) => <span key={kd} style={{color: COL[kd], WebkitTextStroke: '9px #fff', paintOrder: 'stroke fill', margin: '0 18px', opacity: c01((t - sc.t - 0.4 - i * 0.35) / 0.3)}}>{WORD[kd]}</span>)}
        </div>
      )}
      {inEar && sc && (
        <div style={{position: 'absolute', left: 560, top: 150, width: 800, textAlign: 'center', fontFamily: 'FR', fontWeight: 700, fontSize: 84, color: '#fff', textShadow: '0 6px 0 rgba(0,0,0,0.28)', transform: `scale(${1 + 0.06 * Math.sin(t * 8)})`}}>Say it with me!</div>
      )}

      {/* sarlavha */}
      {t < 3.6 && (() => {
        const a = bnc(c01((t - 0.1) / 0.6)); const out = interpolate(t, [3.0, 3.6], [1, 0], clamp);
        return (<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: 'FR', fontWeight: 700, opacity: out, transform: `scale(${a})`}}>
          <div style={{display: 'inline-block', fontSize: 120, color: '#ff5a4d', WebkitTextStroke: '12px #fff', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.18)'}}>{p.title}</div>
          <div style={{fontSize: 56, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.25)'}}>Colors with Benny the Bear</div>
        </div>);
      })()}

      {/* subtitr */}
      {line && t < line.t + line.dur + line.pause + 0.2 && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center', fontFamily: 'FR', fontWeight: 600, fontSize: 62, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.5)', padding: '0 120px', opacity: c01((t - line.t + 0.05) / 0.2)}}>{line.text}</div>
      )}
      <Audio src={staticFile(p.audio)} />
    </AbsoluteFill>
  );
};
