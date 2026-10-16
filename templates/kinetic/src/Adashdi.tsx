import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';

export type AShot = {
  file: string; t: number; dur: number; z0: number; z1: number;
  fin?: 'none' | 'whip' | 'glitch' | 'flash' | 'punch'; fout?: 'none' | 'whip';
  freeze?: number; shake?: boolean; vhs?: boolean; tint?: string; blur?: number; dim?: number;
};
export type ALabel = {t: number; dur: number; n: number; text: string; color: string};
export type ATag = {t: number; text: string};
export type AStamp = {t: number; dur: number; kind: 'adashdi' | 'togri'; text: string; sub?: string};
export type AText = {t: number; dur: number; text: string; size: number; color: string; y: number; mode: 'slam' | 'pop' | 'plain'};
export type ACta = {t: number; lines: string[]; brand: string; phone: string; sub: string; handle: string};
export type AdashdiProps = {totalSec: number; audio: string; shots: AShot[]; labels: ALabel[]; tags: ATag[]; stamps: AStamp[]; texts: AText[]; cta: ACta; hudEnd: number; sparkles: {t: number; dur: number}[]};

const YL = '#FFD23F', RED = '#FF3B3B', GRN = '#3DDC84', DK = '#0d0f14';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const eO = (x: number) => 1 - Math.pow(1 - x, 3);
const eI = (x: number) => x * x * x;
const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const bnc = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3) * Math.cos(x * Math.PI * 3.2));
const outline = (w: number, c = DK) => [[-w, 0], [w, 0], [0, -w], [0, w], [-w, -w], [w, w], [-w, w], [w, -w]].map(([x, y]) => `${x}px ${y}px 0 ${c}`).join(', ');

const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all([
      new FontFace('YB', `url(${staticFile('font-bold.ttf')})`, {weight: '700'}).load(),
      new FontFace('YR', `url(${staticFile('font-regular.ttf')})`, {weight: '400'}).load(),
    ]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

const PhoneI: React.FC<{s: number; c?: string}> = ({s, c = DK}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill={c} /></svg>
);
const CheckI: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#04210f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const RewI: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M11 6v12L2.5 12zM22 6v12l-8.5-6z" fill="#fff" /></svg>
);
const StarI: React.FC<{s: number; c?: string}> = ({s, c = '#fff'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 0l2.6 8.4L24 12l-9.4 3.6L12 24l-2.6-8.4L0 12l9.4-3.6z" fill={c} /></svg>
);

// ---------- bitta kadr (oldindan 1080x1920 ga kesilgan fayl) ----------
const ShotView: React.FC<{s: AShot}> = ({s}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  let z = s.z0 + (s.z1 - s.z0) * eIO(c01(t / s.dur));
  let x = 0, y = 0, blur = s.blur ?? 0, skew = 0, sx = 1, split = 0, flash = 0;
  if (s.fin === 'punch') z *= 1 + 0.13 * (1 - eO(c01(t / 0.22)));
  if (s.fin === 'flash') flash = 0.5 * (1 - c01(t / 0.12));
  if (s.fin === 'whip') { const k = 1 - eO(c01(t / 0.25)); x += k * 1080; blur += k * 26; sx = 1 + k * 0.35; }
  if (s.fout === 'whip') { const k = eI(c01((t - (s.dur - 0.25)) / 0.25)); x -= k * 1080; blur += k * 26; sx *= 1 + k * 0.35; }
  if (s.fin === 'glitch' && t < 0.4) {
    const k = 1 - t / 0.4; const r = random(`g${f}`);
    x += (r - 0.5) * 120 * k; skew = (random(`s${f}`) - 0.5) * 10 * k; split = 14 * k * (0.5 + random(`p${f}`)); flash = r > 0.8 ? 0.25 * k : 0;
  }
  if (s.shake) { x += (random(`x${f}`) - 0.5) * 26; y += (random(`y${f}`) - 0.5) * 26; }
  const filt = [`contrast(1.08) saturate(1.15)`, blur > 0.2 ? `blur(${blur}px)` : '', s.dim !== undefined ? `brightness(${s.dim})` : '',
    split > 0.5 ? `drop-shadow(${split}px 0 0 rgba(255,30,100,0.6)) drop-shadow(${-split}px 0 0 rgba(0,240,255,0.6))` : '',
    s.vhs ? 'saturate(0.8) contrast(1.15) sepia(0.2)' : ''].filter(Boolean).join(' ');
  const video = <OffthreadVideo src={staticFile(`adashdi/${s.file}`)} startFrom={s.freeze !== undefined ? Math.round(s.freeze * 30) : 0} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${z * sx}, ${z}) skewX(${skew}deg)`, filter: filt}}>
        {s.freeze !== undefined ? <Freeze frame={0}>{video}</Freeze> : video}
      </div>
      {s.tint && <AbsoluteFill style={{background: s.tint, mixBlendMode: 'multiply'}} />}
      {s.vhs && <Vhs />}
      {flash > 0.01 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
    </AbsoluteFill>
  );
};

const Vhs: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const band = ((t * 0.9) % 1) * 2100 - 100;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 3px, rgba(0,0,0,0) 3px 7px)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: band, height: 90, background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.22), rgba(255,255,255,0))'}} />
      <div style={{position: 'absolute', right: 50, top: 150, display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'YB', fontSize: 54, color: '#fff', textShadow: outline(4), opacity: 0.6 + 0.4 * Math.sin(t * 14)}}><RewI s={64} />REW</div>
    </AbsoluteFill>
  );
};

// ---------- HUD: "AI montajchi" paneli ----------
const Hud: React.FC<{tags: ATag[]}> = ({tags}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const tc = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t) % 60).padStart(2, '0')}:${String(f % fps).padStart(2, '0')}`;
  const cur = [...tags].reverse().find((g) => t >= g.t && t < g.t + 0.8);
  const ca = cur ? bnc(c01((t - cur.t) / 0.25)) * (1 - c01((t - cur.t - 0.55) / 0.25)) : 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 150}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(10,12,18,0.72)', padding: '12px 24px', borderRadius: 16, border: '3px solid rgba(255,255,255,0.4)', fontFamily: 'YB', color: '#fff', fontSize: 42}}>
        <span style={{width: 22, height: 22, borderRadius: 11, background: RED, opacity: 0.5 + 0.5 * Math.sin(t * 9), display: 'inline-block'}} />
        <span>AI MONTAJCHI</span><span style={{fontFamily: 'YR', fontSize: 36, opacity: 0.85}}>{tc}</span>
      </div>
      {cur && <div style={{marginTop: 10, display: 'inline-block', background: YL, color: DK, fontFamily: 'YB', fontSize: 46, padding: '6px 22px', borderRadius: 12, transform: `scale(${ca})`, transformOrigin: 'left', opacity: ca}}>{cur.text}</div>}
    </div>
  );
};

const Label: React.FC<{l: ALabel}> = ({l}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = bnc(c01(t / 0.45)); const out = interpolate(t, [l.dur - 0.2, l.dur], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 36, top: 1440, opacity: out, transform: `scale(${a}) rotate(-3deg)`, transformOrigin: 'left center'}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, background: l.color, color: '#fff', fontFamily: 'YB', fontSize: 84, padding: '4px 36px 12px 20px', borderRadius: 24, border: '6px solid #fff', boxShadow: '0 12px 30px rgba(0,0,0,0.5)', letterSpacing: 2}}>
        <span style={{background: '#fff', color: l.color, borderRadius: 18, width: 74, height: 74, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 58}}>{l.n}</span>{l.text}
      </div>
    </div>
  );
};

const Stamp: React.FC<{s: AStamp}> = ({s}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const a = bnc(c01(t / 0.35)); const out = interpolate(t, [s.dur - 0.15, s.dur], [1, 0], clamp); const ok = s.kind === 'togri';
  const jx = ok ? 0 : (random(`sx${f}`) - 0.5) * 10, jy = ok ? 0 : (random(`sy${f}`) - 0.5) * 10;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{transform: `translate(${jx}px, ${jy}px) scale(${0.4 + 0.6 * a}) rotate(${ok ? -4 : -7}deg)`, textAlign: 'center', fontFamily: 'YB'}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, background: ok ? GRN : 'rgba(255,40,40,0.92)', color: ok ? '#04210f' : '#fff', fontSize: ok ? 92 : 120, padding: '8px 44px 16px', borderRadius: 24, border: `8px solid ${ok ? '#04210f' : '#fff'}`, boxShadow: '0 16px 40px rgba(0,0,0,0.6)', letterSpacing: 3}}>
          {ok && <CheckI s={90} />}{s.text}
        </div>
        {s.sub && <div style={{marginTop: 26, fontSize: 52, color: '#fff', textShadow: outline(5), fontFamily: 'YB'}}>{s.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

const TextEl: React.FC<{x: AText}> = ({x}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const a = x.mode === 'plain' ? 1 : bnc(c01(t / (x.mode === 'slam' ? 0.3 : 0.4))); const out = interpolate(t, [x.dur - 0.1, x.dur], [1, 0], clamp);
  const sc = x.mode === 'slam' ? 1.5 - 0.5 * a : 0.7 + 0.3 * a;
  const sh = x.mode === 'slam' && t < 0.2 ? (random(`t${f}`) - 0.5) * 16 : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: x.y, textAlign: 'center', fontFamily: 'YB', fontSize: x.size, color: x.color, textShadow: outline(Math.max(5, x.size / 12)), opacity: out, transform: `translateX(${sh}px) scale(${sc})`, letterSpacing: 2, padding: '0 40px'}}>{x.text}</div>
  );
};

const Sparkles: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  return (
    <AbsoluteFill>{Array.from({length: 14}, (_, i) => {
      const d0 = random(`sp${i}`) * dur * 0.7; const life = 0.5; const a = c01((t - d0) / life);
      if (a <= 0 || a >= 1) return null;
      return <div key={i} style={{position: 'absolute', left: 120 + random(`sx${i}`) * 840, top: 500 + random(`sy${i}`) * 700, opacity: Math.sin(Math.PI * a), transform: `scale(${0.5 + random(`ss${i}`) * 1.1}) rotate(${t * 120}deg)`}}><StarI s={70} c={i % 2 ? YL : '#fff'} /></div>;
    })}</AbsoluteFill>
  );
};

const Cta: React.FC<{c: ACta}> = ({c}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const ap = (d: number) => eO(c01((t - d) / 0.45));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{background: `rgba(10,12,18,${0.55 * ap(0)})`}} />
      <div style={{position: 'relative', textAlign: 'center', fontFamily: 'YB', padding: '0 50px'}}>
        {c.lines.map((l, i) => <div key={i} style={{fontSize: i === c.lines.length - 1 ? 92 : 74, color: i === c.lines.length - 1 ? YL : '#fff', textShadow: outline(6), lineHeight: 1.15, opacity: ap(0.15 + i * 0.3), transform: `translateY(${(1 - ap(0.15 + i * 0.3)) * 30}px)`}}>{l}</div>)}
        <div style={{marginTop: 50, fontSize: 46, color: '#fff', fontFamily: 'YR', opacity: ap(1.3), textShadow: outline(4)}}>{c.sub}</div>
        <div style={{marginTop: 8, fontSize: 68, color: '#fff', letterSpacing: 3, textShadow: outline(6), opacity: ap(1.4)}}>{c.brand}</div>
        <div style={{marginTop: 14, fontSize: 56, color: YL, textShadow: outline(5), opacity: ap(1.6)}}>{c.handle}</div>
        <div style={{opacity: ap(1.7), transform: `scale(${bnc(c01((t - 1.7) / 0.55))})`, marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 18, background: YL, color: DK, fontSize: 70, whiteSpace: 'nowrap', padding: '14px 36px', borderRadius: 26, border: '6px solid #fff'}}><PhoneI s={66} />{c.phone}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Adashdi: React.FC<AdashdiProps> = (p) => {
  useFonts();
  const {fps} = useVideoConfig(); const f = useCurrentFrame(); const t = f / fps; const fr = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{background: DK}}>
      {p.shots.map((s, i) => <Sequence key={i} from={fr(s.t)} durationInFrames={fr(s.dur)}><ShotView s={s} /></Sequence>)}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.5) 100%)'}} />
      {p.sparkles.map((s, i) => <Sequence key={`sp${i}`} from={fr(s.t)} durationInFrames={fr(s.dur)}><Sparkles dur={s.dur} /></Sequence>)}
      {t < p.hudEnd && t > 1.9 && <Hud tags={p.tags} />}
      {p.labels.map((l, i) => <Sequence key={`l${i}`} from={fr(l.t)} durationInFrames={fr(l.dur)}><Label l={l} /></Sequence>)}
      {p.stamps.map((s, i) => <Sequence key={`s${i}`} from={fr(s.t)} durationInFrames={fr(s.dur)}><Stamp s={s} /></Sequence>)}
      {p.texts.map((x, i) => <Sequence key={`x${i}`} from={fr(x.t)} durationInFrames={fr(x.dur)}><TextEl x={x} /></Sequence>)}
      <Sequence from={fr(p.cta.t)}><Cta c={p.cta} /></Sequence>
      <Audio src={staticFile(p.audio)} />
    </AbsoluteFill>
  );
};
