import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';

export type IW = {w: string; t0: number; t1: number};
export type ILine = {t0: number; t1: number; rows: IW[][]};
export type ICard = {t: number; dur: number; kind: 'povar' | 'oylik' | 'nomer'; title: string; sub?: string};
export type IshProps = {
  totalSec: number; audio: string; video: string; speechEnd: number; lines: ILine[]; cards: ICard[];
  phone: string; role: string; place: string; badge: string; phoneAt: number;
};

const OR = '#FF8A1F', YL = '#FFD23F', DK = '#14100c', GR = '#3DDC84';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const eO = (x: number) => 1 - Math.pow(1 - x, 3);
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

const FishI: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><path d="M6 32c10-16 26-18 38-6l14-10v32L44 38C32 50 16 48 6 32z" fill="#fff" /><circle cx="20" cy="29" r="3.2" fill={DK} /></svg>
);
const PhoneI: React.FC<{s: number; c?: string}> = ({s, c = DK}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill={c} /></svg>
);

// ---- video: 1080x1920, kattalashtirilgan (manba tepasidagi yozuv/taymer yashiriladi) ----
const Vid: React.FC<{video: string; zoom: number; frozenAt?: number}> = ({video, zoom, frozenAt}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `translateY(-110px) scale(${1.2 * zoom})`, transformOrigin: '50% 62%', filter: 'contrast(1.08) saturate(1.12) brightness(1.02)'}}>
      {frozenAt !== undefined ? <Freeze frame={0}><OffthreadVideo src={staticFile(video)} startFrom={Math.round(frozenAt * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Freeze>
        : <OffthreadVideo src={staticFile(video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
    </div>
  </AbsoluteFill>
);

// ---- subtitr (so'zma-so'z karaoke) ----
const Caption: React.FC<{l: ILine}> = ({l}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = l.t0 + f / fps;
  const pop = bnc(c01(f / (0.3 * fps)));
  const out = interpolate(t, [l.t1 + 0.02, l.t1 + 0.18], [1, 0], clamp);
  const chars = Math.max(...l.rows.map((r) => r.map((w) => w.w).join(' ').length));
  const size = Math.min(104, Math.floor(930 / (chars * 0.56)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1530 - l.rows.length * size * 1.16, textAlign: 'center', fontFamily: 'YB', opacity: out, transform: `scale(${0.82 + 0.18 * pop})`}}>
      {l.rows.map((row, ri) => (
        <div key={ri} style={{fontSize: size, lineHeight: 1.16, textShadow: outline(Math.max(4, size / 14)), whiteSpace: 'nowrap', display: 'flex', justifyContent: 'center', gap: '0.3em'}}>
          {row.map((w, wi) => {
            const on = t >= w.t0 - 0.02; const cur = on && t < w.t1;
            return <span key={wi} style={{color: cur ? YL : on ? '#fff' : 'rgba(255,255,255,0.45)', display: 'inline-block', transform: cur ? 'translateY(-6px)' : 'none'}}>{w.w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

// ---- kalit so'z kartochkalari ----
const Card: React.FC<{c: ICard}> = ({c}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const inn = bnc(c01(t / 0.45)); const out = interpolate(t, [c.dur - 0.25, c.dur], [1, 0], clamp);
  const bg = c.kind === 'oylik' ? GR : OR; const fg = c.kind === 'oylik' ? '#04210f' : '#fff';
  const left = c.kind === 'oylik' ? 520 : 30;
  return (
    <div style={{position: 'absolute', left, top: 1015, opacity: out, transform: `translateX(${(1 - eO(c01(t / 0.35))) * (c.kind === 'oylik' ? 500 : -500)}px) scale(${0.85 + 0.15 * inn}) rotate(${c.kind === 'oylik' ? 3 : -3}deg)`}}>
      <div style={{background: bg, color: fg, fontFamily: 'YB', padding: '18px 30px 20px', borderRadius: 22, boxShadow: '0 12px 34px rgba(0,0,0,0.55)', border: '4px solid #fff', display: 'flex', alignItems: 'center', gap: 18}}>
        {c.kind === 'povar' && <FishI s={78} />}
        <div>
          <div style={{fontSize: c.kind === 'oylik' ? 62 : 56, lineHeight: 1.05, letterSpacing: 1}}>{c.title}</div>
          {c.sub && <div style={{fontSize: 36, fontFamily: 'YR', opacity: 0.92, marginTop: 4}}>{c.sub}</div>}
        </div>
      </div>
    </div>
  );
};

// ---- pastdagi telefon chipi ----
const PhoneChip: React.FC<{phone: string}> = ({phone}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = bnc(c01(t / 0.5));
  const bob = Math.sin(t * 7) * 10;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center', transform: `scale(${a})`}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, background: YL, color: DK, fontFamily: 'YB', fontSize: 68, padding: '14px 34px', borderRadius: 24, border: `5px solid ${DK}`, boxShadow: '0 12px 30px rgba(0,0,0,0.55)'}}>
        <PhoneI s={64} />{phone}
      </div>
      <div style={{fontFamily: 'YB', fontSize: 70, color: YL, textShadow: outline(5), transform: `translateY(${bob}px)`, marginTop: -4, display: 'none'}}>▼</div>
    </div>
  );
};

const LowerThird: React.FC<{place: string; role: string; dur: number}> = ({place, role, dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const x = (1 - eO(c01(t / 0.45))) * -700; const out = interpolate(t, [dur - 0.3, dur], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, top: 1568, transform: `translateX(${x}px)`, opacity: out}}>
      <div style={{background: OR, color: '#fff', fontFamily: 'YB', fontSize: 52, padding: '10px 36px 10px 40px', borderRadius: '0 18px 18px 0', letterSpacing: 2}}>{place}</div>
      <div style={{background: DK, color: YL, fontFamily: 'YB', fontSize: 38, padding: '6px 36px 8px 40px', display: 'inline-block', borderRadius: '0 0 18px 0', marginTop: 2}}>{role}</div>
    </div>
  );
};

const Badge: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = bnc(c01((t - 0.1) / 0.5));
  const blink = 0.55 + 0.45 * Math.sin(t * 9);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', transform: `scale(${a})`}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, background: OR, color: '#fff', fontFamily: 'YB', fontSize: 92, padding: '6px 44px 14px', borderRadius: 26, border: '6px solid #fff', boxShadow: '0 12px 34px rgba(0,0,0,0.5)', letterSpacing: 3}}>
        <span style={{width: 26, height: 26, borderRadius: 13, background: '#fff', opacity: blink, display: 'inline-block'}} />{text}
      </div>
    </div>
  );
};

const EndCard: React.FC<{p: IshProps; dur: number}> = ({p, dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const ap = (d: number) => eO(c01((t - d) / 0.45));
  return (
    <AbsoluteFill style={{background: `rgba(20,16,12,${0.88 * eO(c01(t / 0.4))})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', fontFamily: 'YB', padding: '0 50px'}}>
        <div style={{opacity: ap(0.2), transform: `scale(${bnc(c01((t - 0.2) / 0.5))})`, display: 'inline-block', background: OR, color: '#fff', fontSize: 120, padding: '6px 52px 14px', borderRadius: 30, border: '7px solid #fff', letterSpacing: 4}}>ISH BOR</div>
        <div style={{opacity: ap(0.6), marginTop: 56, fontSize: 84, color: '#fff', lineHeight: 1.1}}>{p.role}</div>
        <div style={{opacity: ap(0.9), marginTop: 12, fontSize: 56, color: YL}}>{p.place}</div>
        <div style={{opacity: ap(1.2), marginTop: 38, fontSize: 52, color: GR}}>Oylik — kelishuv asosida</div>
        <div style={{opacity: ap(1.6), marginTop: 70, fontSize: 44, color: '#cfc7bd', fontFamily: 'YR'}}>Bogʻlaning:</div>
        <div style={{opacity: ap(1.8), transform: `scale(${bnc(c01((t - 1.8) / 0.55))})`, marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 20, background: YL, color: DK, fontSize: 70, whiteSpace: 'nowrap', padding: '16px 34px', borderRadius: 28, border: `6px solid #fff`}}><PhoneI s={72} />{p.phone}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Ish: React.FC<IshProps> = (p) => {
  useFonts();
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const fr = (s: number) => Math.round(s * fps);
  // montaj "his qildiradigan" punch-zoom: har bir qator boshida keskin yaqinlashish, keyin sekin qaytish
  let zoom = 1;
  p.lines.forEach((l, i) => { if (t >= l.t0) { const k = c01((t - l.t0) / 0.28); zoom = 1 + (i % 2 === 0 ? 0.11 : 0.05) * (1 - eO(k)); } });
  zoom += 0.02 * c01(t / p.speechEnd);
  const flash = p.lines.some((l) => t >= l.t0 && t < l.t0 + 0.07) ? 0.16 : 0;
  const prog = c01(t / p.totalSec);
  return (
    <AbsoluteFill style={{background: DK}}>
      <Sequence from={0} durationInFrames={fr(p.speechEnd)}><Vid video={p.video} zoom={zoom} /></Sequence>
      <Sequence from={fr(p.speechEnd)} durationInFrames={fr(p.totalSec - p.speechEnd) + 2}><Vid video={p.video} zoom={1.03} frozenAt={p.speechEnd - 0.1} /></Sequence>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <Sequence from={0} durationInFrames={fr(p.speechEnd)}>
        <Badge text={p.badge} />
        <Sequence from={fr(0.3)} durationInFrames={fr(p.phoneAt - 0.3)}><LowerThird place={p.place} role={p.role} dur={p.phoneAt - 0.3} /></Sequence>
        {p.lines.map((l, i) => <Sequence key={i} from={fr(l.t0)} durationInFrames={fr(l.t1 - l.t0 + 0.25)}><Caption l={l} /></Sequence>)}
        {p.cards.map((c, i) => <Sequence key={`c${i}`} from={fr(c.t)} durationInFrames={fr(c.dur)}><Card c={c} /></Sequence>)}
        <Sequence from={fr(p.phoneAt)}><PhoneChip phone={p.phone} /></Sequence>
        <div style={{position: 'absolute', left: 0, bottom: 0, height: 10, width: `${prog * 100}%`, background: OR, boxShadow: `0 0 16px ${OR}`}} />
      </Sequence>
      <Sequence from={fr(p.speechEnd)} durationInFrames={fr(p.totalSec - p.speechEnd)}><EndCard p={p} dur={p.totalSec - p.speechEnd} /></Sequence>
      <Audio src={staticFile(p.audio)} />
    </AbsoluteFill>
  );
};
