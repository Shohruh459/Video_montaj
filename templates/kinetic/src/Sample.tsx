import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';

type W = {t: string; a?: boolean};
export type LineT = {words: W[]; start: number; dur: number; clip: string; pos?: string; tag?: string};
export const STYLES = ['kino-oltin', 'split-oyna', 'jurnal', 'neon', 'minimal-oq', 'afisha', 'terminal', 'shisha', 'daftar'] as const;
export type StyleName = typeof STYLES[number];
export type SampleProps = {style: StyleName; totalSec: number; audio: string; lines: LineT[]};
const LEGACY: Record<string, StyleName> = {gold: 'kino-oltin', split: 'split-oyna', editorial: 'jurnal'};

const GOLD = '#F2B84B';
const RED = '#E8553D';

const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all([
      new FontFace('YB', `url(${staticFile('font-bold.ttf')})`, {weight: '700'}).load(),
      new FontFace('YS', `url(${staticFile('font-serif-bold.ttf')})`, {weight: '700'}).load(),
      new FontFace('YM', `url(${staticFile('font-mono-bold.ttf')})`, {weight: '700'}).load(),
    ]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// So'zlar ovoz bilan taxminan sinxron chiqadi: belgi uzunligiga proporsional
const wordTimes = (words: W[], dur: number) => {
  const lens = words.map((w) => w.t.length + 1);
  const tot = lens.reduce((a, b) => a + b, 0);
  let c = 0;
  return lens.map((l) => { const t = (c / tot) * dur * 0.88; c += l; return t; });
};

const Grain: React.FC<{opacity: number; blend: string}> = ({opacity, blend}) => {
  const f = useCurrentFrame();
  const dx = Math.floor(random(`gx${f}`) * 200), dy = Math.floor(random(`gy${f}`) * 280);
  return <AbsoluteFill style={{overflow: 'hidden', mixBlendMode: blend as any, opacity}}>
    <Img src={staticFile('noise.png')} style={{position: 'absolute', left: -dx, top: -dy, width: 1300, height: 2200}} />
  </AbsoluteFill>;
};

const Clip: React.FC<{src: string; pos?: string; zoomFrom?: number; zoomTo?: number; filter?: string; frames: number}> = ({src, pos, zoomFrom = 1.05, zoomTo = 1.18, filter, frames}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, frames], [zoomFrom, zoomTo], clamp);
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos ?? '50% 50%', transform: `scale(${z})`, filter}} />
  </AbsoluteFill>;
};

// Matn: bir qator = bir "ibora"
const Phrase: React.FC<{l: LineT; frames: number; size: number; font: string; align?: 'center' | 'left'; accent: string; hl?: boolean}> = ({l, frames, size, font, align = 'center', accent, hl}) => {
  const f = useCurrentFrame();
  const times = wordTimes(l.words, frames);
  const out = interpolate(f, [frames - 8, frames], [1, 0], clamp);
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.26}px`, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.22, opacity: out}}>
      {l.words.map((w, i) => {
        const p = interpolate(f - times[i], [0, 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const hlP = interpolate(f - times[i] - 4, [0, 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.93 + 0.07 * p})`, filter: `blur(${(1 - p) * 9}px)`, color: w.a && !hl ? accent : '#fff', textShadow: '0 4px 28px rgba(0,0,0,0.75)', padding: hl && w.a ? '0 10px' : 0}}>
            {hl && w.a && <span style={{position: 'absolute', left: 0, top: '14%', height: '74%', width: `${hlP * 100}%`, background: accent, opacity: 0.88, zIndex: -1, transform: 'skewX(-6deg)', borderRadius: 4}} />}
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

// ───────────────── A: Cinematic Gold ─────────────────
const Gold: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#050608'}}>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={fr + 10}>
            <FadeWrap frames={fr + 10}>
              <Clip src={l.clip} pos={l.pos} frames={fr + 10} filter="brightness(0.62) contrast(1.15) saturate(0.85) sepia(0.28)" />
            </FadeWrap>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.78) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)'}} />
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.35 + 0.15 * Math.sin(f / 18), background: `radial-gradient(ellipse 60% 40% at ${20 + 60 * ((f % 240) / 240)}% 25%, rgba(242,170,60,0.55), transparent 70%)`}} />
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr}>
            <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 140px'}}>
              <Phrase l={l} frames={fr} size={88} font="YB" accent={GOLD} />
            </AbsoluteFill>
            <Flash />
          </Sequence>
        );
      })}
      <Letterbox />
      <Grain opacity={0.2} blend="overlay" />
    </AbsoluteFill>
  );
};

const FadeWrap: React.FC<{frames: number; children: React.ReactNode}> = ({frames, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, frames - 8, frames], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 3, 10], [0.55, 0.3, 0], clamp);
  return <AbsoluteFill style={{background: GOLD, opacity: o, mixBlendMode: 'screen'}} />;
};

const Letterbox: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: '#000'}} />
  </>
);

// ───────────────── B: Split-screen ─────────────────
const Split: React.FC<{lines: LineT[]; fps: number; total: number}> = ({lines, fps, total}) => {
  const f = useCurrentFrame();
  const cur = lines.findIndex((l) => f >= l.start * fps && f < (l.start + l.dur) * fps + 6);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#0c0f16 0%,#07080c 100%)'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 30% at 50% ${28 + 4 * Math.sin(f / 30)}%, rgba(242,184,75,0.14), transparent 70%)`}} />
      {/* video oynasi */}
      <div style={{position: 'absolute', left: 72, top: 190, width: 936, height: 880, borderRadius: 40, overflow: 'hidden', border: '2px solid rgba(242,184,75,0.65)', boxShadow: '0 30px 90px rgba(0,0,0,0.65), 0 0 60px rgba(242,184,75,0.12)'}}>
        {lines.map((l, i) => {
          const fr = Math.round(l.dur * fps);
          const st = Math.round(l.start * fps);
          const wipe = interpolate(f - st, [0, 14], [100, 0], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <Sequence key={i} from={st} durationInFrames={fr + 30}>
              <AbsoluteFill style={{clipPath: i === 0 ? undefined : `inset(${wipe}% 0 0 0)`}}>
                <Clip src={l.clip} pos={l.pos} frames={fr + 30} zoomFrom={1.04} zoomTo={1.14} filter="contrast(1.08) saturate(0.95)" />
              </AbsoluteFill>
            </Sequence>
          );
        })}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)'}} />
        {cur >= 0 && (
          <div style={{position: 'absolute', left: 28, top: 28, padding: '10px 22px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(242,184,75,0.8)', color: GOLD, fontFamily: 'YB', fontWeight: 700, fontSize: 28, letterSpacing: 5}}>
            {lines[cur].tag ?? ''}
          </div>
        )}
      </div>
      {/* matn */}
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr}>
            <div style={{position: 'absolute', left: 90, right: 90, top: 1130, height: 470, display: 'flex', alignItems: 'center'}}>
              <div style={{width: 8, alignSelf: 'stretch', background: GOLD, borderRadius: 4, marginRight: 36, opacity: 0.9}} />
              <div style={{flex: 1}}><Phrase l={l} frames={fr} size={74} font="YB" accent={GOLD} align="left" /></div>
            </div>
          </Sequence>
        );
      })}
      {/* progress */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 1700, display: 'flex', gap: 14}}>
        {lines.map((l, i) => {
          const p = interpolate(f, [l.start * fps, (l.start + l.dur) * fps], [0, 1], clamp);
          return <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.16)', overflow: 'hidden'}}><div style={{width: `${p * 100}%`, height: '100%', background: GOLD}} /></div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 90, top: 1730, fontFamily: 'YB', fontWeight: 700, fontSize: 28, color: 'rgba(255,255,255,0.55)', letterSpacing: 3}}>@yuksalish713</div>
      <Grain opacity={0.1} blend="overlay" />
    </AbsoluteFill>
  );
};

// ───────────────── C: Editorial ─────────────────
const Editorial: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#15110d'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(255,235,200,0.10), transparent 70%)'}} />
      <div style={{position: 'absolute', left: 96, top: 110, fontFamily: 'YS', fontWeight: 700, fontSize: 30, color: 'rgba(255,240,215,0.7)', letterSpacing: 6}}>YUKSALISH</div>
      <div style={{position: 'absolute', right: 96, top: 110, fontFamily: 'YS', fontWeight: 700, fontSize: 30, color: 'rgba(255,240,215,0.7)', letterSpacing: 4}}>№ 01</div>
      <div style={{position: 'absolute', left: 96, right: 96, top: 168, height: 2, background: 'rgba(255,240,215,0.35)'}} />
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        const st = Math.round(l.start * fps);
        const rot = (i % 2 === 0 ? -2.2 : 1.8);
        return (
          <Sequence key={i} from={st} durationInFrames={fr + 8}>
            <FadeWrap frames={fr + 8}>
              <PhotoCard clip={l.clip} pos={l.pos} frames={fr + 8} rot={rot} />
            </FadeWrap>
          </Sequence>
        );
      })}
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr}>
            <div style={{position: 'absolute', left: 110, right: 110, top: 1120, height: 520, display: 'flex', alignItems: 'center'}}>
              <div style={{width: '100%'}}><Phrase l={l} frames={fr} size={80} font="YS" accent={RED} hl /></div>
            </div>
          </Sequence>
        );
      })}
      <div style={{position: 'absolute', left: 96, right: 96, top: 1720, height: 2, background: 'rgba(255,240,215,0.35)'}} />
      <div style={{position: 'absolute', left: 96, top: 1740, fontFamily: 'YS', fontWeight: 700, fontSize: 28, color: 'rgba(255,240,215,0.65)'}}>@yuksalish713</div>
      <div style={{position: 'absolute', right: 96, top: 1740, fontFamily: 'YS', fontWeight: 700, fontSize: 28, color: 'rgba(255,240,215,0.65)'}}>{Math.min(3, Math.max(1, lines.findIndex((l) => f < (l.start + l.dur) * fps) + 1 || 3))} / 3</div>
      <Grain opacity={0.28} blend="soft-light" />
    </AbsoluteFill>
  );
};

const PhotoCard: React.FC<{clip: string; pos?: string; frames: number; rot: number}> = ({clip, pos, frames, rot}) => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 14], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <div style={{position: 'absolute', left: 130, top: 230, width: 820, height: 800, transform: `rotate(${rot * pop}deg) scale(${0.92 + 0.08 * pop})`, background: '#f3ead8', padding: 16, boxShadow: '0 30px 70px rgba(0,0,0,0.7)'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}>
        <Clip src={clip} pos={pos} frames={frames} zoomFrom={1.05} zoomTo={1.16} filter="grayscale(1) contrast(1.25) brightness(0.9) sepia(0.12)" />
      </div>
      <div style={{position: 'absolute', left: '38%', top: -22, width: 190, height: 46, background: 'rgba(232,85,61,0.82)', transform: 'rotate(-3deg)', opacity: 0.9}} />
    </div>
  );
};


// ───────────────── D: Neon ─────────────────
const NEON_C = '#27E9F7', NEON_M = '#FF2BD6';
const Neon: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  const sec = Math.floor(f / fps);
  return (
    <AbsoluteFill style={{background: '#04050d'}}>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={fr + 8}>
            <FadeWrap frames={fr + 8}>
              <Clip src={l.clip} pos={l.pos} frames={fr + 8} zoomFrom={1.04} zoomTo={1.2} filter="grayscale(0.7) contrast(1.35) brightness(0.55)" />
            </FadeWrap>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{mixBlendMode: 'color', background: `linear-gradient(160deg, ${NEON_C} 0%, #3b0d8c 50%, ${NEON_M} 100%)`, opacity: 0.85}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 25%, rgba(2,2,10,0.85) 100%)'}} />
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr}>
            <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 120px'}}>
              <NeonPhrase l={l} frames={fr} />
            </AbsoluteFill>
            <GlitchBar />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 5px)', opacity: 0.55}} />
      {[[70, 70, 'top', 'left'], [70, 70, 'top', 'right'], [70, 70, 'bottom', 'left'], [70, 70, 'bottom', 'right']].map(([a, b, v, h], i) => (
        <div key={i} style={{position: 'absolute', [v as string]: 90, [h as string]: 70, width: 70, height: 70, borderTop: v === 'top' ? `4px solid ${NEON_C}` : undefined, borderBottom: v === 'bottom' ? `4px solid ${NEON_C}` : undefined, borderLeft: h === 'left' ? `4px solid ${NEON_C}` : undefined, borderRight: h === 'right' ? `4px solid ${NEON_C}` : undefined, filter: `drop-shadow(0 0 8px ${NEON_C})`}} />
      ))}
      <div style={{position: 'absolute', left: 150, top: 108, fontFamily: 'YB', fontWeight: 700, fontSize: 30, color: NEON_C, letterSpacing: 4, textShadow: `0 0 14px ${NEON_C}`}}>
        <span style={{color: NEON_M, opacity: Math.floor(f / 15) % 2 ? 1 : 0.2}}>● </span>REC 00:{String(sec).padStart(2, '0')}
      </div>
      <div style={{position: 'absolute', right: 150, top: 108, fontFamily: 'YB', fontWeight: 700, fontSize: 30, color: NEON_C, letterSpacing: 4, textShadow: `0 0 14px ${NEON_C}`}}>@YUKSALISH713</div>
      <Grain opacity={0.14} blend="overlay" />
    </AbsoluteFill>
  );
};

const GlitchBar: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 9) return null;
  const y = random(`gb${f}`) * 1700 + 100;
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 18 + random(`gh${f}`) * 40, background: f % 2 ? NEON_C : NEON_M, opacity: 0.35, mixBlendMode: 'screen', transform: `translateX(${(random(`gt${f}`) - 0.5) * 60}px)`}} />;
};

const NeonPhrase: React.FC<{l: LineT; frames: number}> = ({l, frames}) => {
  const f = useCurrentFrame();
  const times = wordTimes(l.words, frames);
  const out = interpolate(f, [frames - 8, frames], [1, 0], clamp);
  // eng uzun so'z xavfsiz zonaga (yon 8%+) sig'sin: bosh harflar kengroq
  const maxW = Math.max(...l.words.map((w) => w.t.length));
  const size = Math.min(84, Math.floor(820 / (maxW * 0.74)));
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.26}px`, fontFamily: 'YB', fontWeight: 700, fontSize: size, lineHeight: 1.22, opacity: out, textTransform: 'uppercase'}}>
      {l.words.map((w, i) => {
        const age = f - times[i];
        const p = interpolate(age, [0, 6], [0, 1], clamp);
        const glitch = age >= 0 && age < 9 ? (9 - age) / 9 : 0;
        const col = w.a ? NEON_M : '#fff';
        const jx = glitch * (random(`jx${f}${i}`) - 0.5) * 30;
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, color: col, transform: `translate(${jx}px, 0)`, textShadow: `${-glitch * 10}px 0 ${NEON_C}, ${glitch * 10}px 0 ${NEON_M}, 0 0 18px ${w.a ? NEON_M : NEON_C}, 0 0 46px ${w.a ? NEON_M : 'rgba(39,233,247,0.55)'}`}}>{w.t}</span>
        );
      })}
    </div>
  );
};

// ───────────────── E: Minimal oq ─────────────────
const Minimal: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  const cur = Math.max(0, lines.findIndex((l) => f < (l.start + l.dur) * fps + 4));
  return (
    <AbsoluteFill style={{background: '#F4EFE6'}}>
      <div style={{position: 'absolute', left: 90, top: 100, fontFamily: 'YB', fontWeight: 700, fontSize: 32, color: '#14110e', letterSpacing: 2}}>yuksalish<span style={{color: '#D97706'}}>713</span></div>
      <div style={{position: 'absolute', right: 90, top: 112, display: 'flex', gap: 12}}>
        {lines.map((_, i) => <div key={i} style={{width: i === cur ? 46 : 14, height: 14, borderRadius: 7, background: i === cur ? '#D97706' : 'rgba(20,17,14,0.22)'}} />)}
      </div>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        const st = Math.round(l.start * fps);
        return (
          <Sequence key={i} from={st} durationInFrames={fr + 10}>
            <MinCard l={l} frames={fr + 10} />
          </Sequence>
        );
      })}
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr}>
            <div style={{position: 'absolute', left: 100, right: 100, top: 1120, height: 520, display: 'flex', alignItems: 'center'}}>
              <div style={{width: '100%'}}><MinPhrase l={l} frames={fr} /></div>
            </div>
          </Sequence>
        );
      })}
      <Grain opacity={0.1} blend="multiply" />
    </AbsoluteFill>
  );
};

const MinCard: React.FC<{l: LineT; frames: number}> = ({l, frames}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const o = interpolate(f, [frames - 8, frames], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 70, top: 190, width: 940, height: 880, borderRadius: 52, overflow: 'hidden', opacity: o * p, transform: `translateY(${(1 - p) * 60}px) scale(${0.96 + 0.04 * p})`, boxShadow: '0 40px 80px rgba(60,40,10,0.28)'}}>
      <Clip src={l.clip} pos={l.pos} frames={frames} zoomFrom={1.05} zoomTo={1.15} filter="saturate(0.9) contrast(1.05) brightness(1.02)" />
    </div>
  );
};

const MinPhrase: React.FC<{l: LineT; frames: number}> = ({l, frames}) => {
  const f = useCurrentFrame();
  const times = wordTimes(l.words, frames);
  const out = interpolate(f, [frames - 8, frames], [1, 0], clamp);
  const size = 76;
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.26}px`, fontFamily: 'YB', fontWeight: 700, fontSize: size, lineHeight: 1.24, color: '#14110e', opacity: out}}>
      {l.words.map((w, i) => {
        const p = interpolate(f - times[i], [0, 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const u = interpolate(f - times[i] - 5, [0, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
            {w.t}
            {w.a && <span style={{position: 'absolute', left: 0, bottom: 2, height: 14, width: `${u * 100}%`, background: '#D97706', borderRadius: 7, opacity: 0.9, zIndex: -1}} />}
          </span>
        );
      })}
    </div>
  );
};

// ───────────────── F: Afisha (ulkan matn) ─────────────────
const Afisha: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0a0a0a'}}>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={fr + 8}>
            <FadeWrap frames={fr + 8}>
              <Clip src={l.clip} pos={l.pos} frames={fr + 8} zoomFrom={1.08} zoomTo={1.22} filter="grayscale(1) contrast(1.3) brightness(0.55)" />
            </FadeWrap>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{mixBlendMode: 'multiply', background: 'linear-gradient(180deg,#ff8a1f 0%,#c2410c 100%)', opacity: 0.55}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 120, height: 8, background: '#fff'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 1792, height: 8, background: '#fff'}} />
      <div style={{position: 'absolute', left: 80, top: 140, fontFamily: 'YB', fontWeight: 700, fontSize: 32, color: '#fff', letterSpacing: 6}}>YUKSALISH</div>
      <div style={{position: 'absolute', right: 80, top: 140, fontFamily: 'YB', fontWeight: 700, fontSize: 32, color: '#fff', letterSpacing: 6}}>№ 01</div>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr}>
            <AfishaRows l={l} frames={fr} />
          </Sequence>
        );
      })}
      <div style={{position: 'absolute', left: 80, bottom: 70, fontFamily: 'YB', fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: 4}}>@YUKSALISH713</div>
      <Grain opacity={0.2} blend="overlay" />
    </AbsoluteFill>
  );
};

const AfishaRows: React.FC<{l: LineT; frames: number}> = ({l, frames}) => {
  const f = useCurrentFrame();
  const times = wordTimes(l.words, frames);
  // so'zlarni qatorlarga bo'lamiz (<= 15 belgi)
  const rows: {w: W; i: number}[][] = []; let cur: {w: W; i: number}[] = []; let len = 0;
  l.words.forEach((w, i) => { if (cur.length && len + w.t.length + 1 > 15) { rows.push(cur); cur = []; len = 0; } cur.push({w, i}); len += w.t.length + 1; });
  if (cur.length) rows.push(cur);
  const out = interpolate(f, [frames - 7, frames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 80px', opacity: out}}>
      {rows.map((r, ri) => {
        const chars = r.reduce((a, x) => a + x.w.t.length + 1, 0) - 1;
        const size = Math.min(170, Math.floor(920 / (chars * 0.7)));
        return (
          <div key={ri} style={{display: 'flex', flexWrap: 'nowrap', justifyContent: ri % 2 ? 'flex-end' : 'flex-start', gap: size * 0.22, fontFamily: 'YB', fontWeight: 700, fontSize: size, lineHeight: 1.04, textTransform: 'uppercase', marginBottom: 10, whiteSpace: 'nowrap'}}>
            {r.map(({w, i}) => {
              const age = f - times[i];
              const sc = interpolate(age, [0, 7, 11], [1.7, 0.96, 1], clamp);
              const o = interpolate(age, [0, 3], [0, 1], clamp);
              const sh = age >= 0 && age < 8 ? (random(`sh${f}${i}`) - 0.5) * 14 : 0;
              return (
                <span key={i} style={{display: 'inline-block', opacity: o, transform: `scale(${sc}) translate(${sh}px, ${sh}px)`, transformOrigin: ri % 2 ? '100% 50%' : '0% 50%', color: w.a ? '#0a0a0a' : '#fff', background: w.a ? '#F2B84B' : 'transparent', padding: w.a ? '0 14px' : 0, textShadow: w.a ? 'none' : '0 6px 30px rgba(0,0,0,0.6)'}}>{w.t}</span>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};


// ───────────────── G: Terminal ─────────────────
const T_GREEN = '#4ADE80';
const Terminal: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  const cur = Math.max(0, lines.findIndex((l) => f < (l.start + l.dur) * fps + 4));
  const shown = lines.map((l, i) => ({l, i})).filter(({i}) => i <= cur && i >= cur - 2);
  return (
    <AbsoluteFill style={{background: '#050805'}}>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={fr + 8}>
            <FadeWrap frames={fr + 8}>
              <Clip src={l.clip} pos={l.pos} frames={fr + 8} zoomFrom={1.05} zoomTo={1.15} filter="grayscale(1) brightness(0.32) contrast(1.2) sepia(0.6) hue-rotate(60deg) saturate(1.8)" />
            </FadeWrap>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 4px)'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 330, height: 1050, borderRadius: 30, background: 'rgba(6,12,8,0.82)', border: '2px solid rgba(74,222,128,0.55)', boxShadow: '0 0 60px rgba(74,222,128,0.18)', overflow: 'hidden'}}>
        <div style={{height: 84, background: 'rgba(74,222,128,0.12)', borderBottom: '2px solid rgba(74,222,128,0.35)', display: 'flex', alignItems: 'center', padding: '0 30px', gap: 14}}>
          {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => <div key={c} style={{width: 22, height: 22, borderRadius: 11, background: c}} />)}
          <div style={{marginLeft: 20, fontFamily: 'YM', fontWeight: 700, fontSize: 28, color: 'rgba(200,255,215,0.75)'}}>yuksalish713 ~ haqiqat.sh</div>
        </div>
        <div style={{padding: '44px 44px'}}>
          {shown.map(({l, i}) => <TermLine key={i} l={l} idx={i} active={i === cur} fps={fps} />)}
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1440, fontFamily: 'YM', fontWeight: 700, fontSize: 30, color: T_GREEN, display: 'flex', justifyContent: 'space-between'}}>
        <span>[{String(cur + 1).padStart(2, '0')}/{String(lines.length).padStart(2, '0')}]</span>
        <span>{'█'.repeat(cur + 1)}{'░'.repeat(lines.length - cur - 1)}</span>
        <span>@yuksalish713</span>
      </div>
      <Grain opacity={0.12} blend="overlay" />
    </AbsoluteFill>
  );
};

const TermLine: React.FC<{l: LineT; idx: number; active: boolean; fps: number}> = ({l, idx, active, fps}) => {
  const f = useCurrentFrame();
  const total = l.words.reduce((a, w) => a + w.t.length + 1, 0);
  const prog = interpolate(f, [l.start * fps, (l.start + l.dur * 0.86) * fps], [0, 1], clamp);
  let left = Math.ceil(prog * total);
  const blink = Math.floor(f / 12) % 2 === 0;
  return (
    <div style={{fontFamily: 'YM', fontWeight: 700, fontSize: 56, lineHeight: 1.34, marginBottom: 38, opacity: active ? 1 : 0.42, color: '#d7ffe0', wordBreak: 'break-word'}}>
      <span style={{color: T_GREEN}}>$ </span>
      {l.words.map((w, i) => {
        const take = Math.max(0, Math.min(w.t.length + 1, left)); left -= w.t.length + 1;
        const txt = (w.t + ' ').slice(0, take);
        return <span key={i} style={{color: w.a ? '#F2B84B' : '#d7ffe0', background: w.a && take > 0 ? 'rgba(242,184,75,0.16)' : undefined}}>{txt}</span>;
      })}
      {active && <span style={{display: 'inline-block', width: 26, height: 46, background: T_GREEN, verticalAlign: 'middle', marginLeft: 4, opacity: blink ? 1 : 0}} />}
    </div>
  );
};

// ───────────────── H: Shisha (glassmorphism) ─────────────────
const Shisha: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0a0a12'}}>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={fr + 10}>
            <FadeWrap frames={fr + 10}>
              <Clip src={l.clip} pos={l.pos} frames={fr + 10} zoomFrom={1.04} zoomTo={1.2} filter="saturate(1.25) contrast(1.05) brightness(0.9)" />
            </FadeWrap>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,8,30,0.35) 0%, rgba(10,8,30,0) 35%, rgba(10,8,30,0.35) 100%)'}} />
      <div style={{position: 'absolute', left: '50%', top: 120, transform: 'translateX(-50%)', padding: '14px 40px', borderRadius: 999, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(24px) saturate(1.5)', border: '1.5px solid rgba(255,255,255,0.38)', color: '#fff', fontFamily: 'YB', fontWeight: 700, fontSize: 32, letterSpacing: 2}}>@yuksalish713</div>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr + 8}>
            <GlassCard l={l} frames={fr + 8} />
          </Sequence>
        );
      })}
      <Grain opacity={0.1} blend="overlay" />
    </AbsoluteFill>
  );
};

const GlassCard: React.FC<{l: LineT; frames: number}> = ({l, frames}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const o = interpolate(f, [frames - 8, frames], [1, 0], clamp);
  const sweep = interpolate(f, [6, 40], [-30, 130], clamp);
  const times = wordTimes(l.words, frames - 8);
  const size = Math.min(76, Math.floor(770 / (Math.max(...l.words.map((w) => w.t.length)) * 0.63)));
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1010, minHeight: 520, borderRadius: 60, padding: '70px 60px 60px', overflow: 'hidden', opacity: o * p, transform: `translateY(${(1 - p) * 90}px)`, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(34px) saturate(1.6)', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)'}}>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '22%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.28), transparent)', transform: 'skewX(-18deg)'}} />
      <div style={{position: 'absolute', left: 60, top: 24, fontFamily: 'YB', fontWeight: 700, fontSize: 24, letterSpacing: 6, color: 'rgba(255,255,255,0.85)'}}>{l.tag}</div>
      <div style={{position: 'relative', display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.26}px`, fontFamily: 'YB', fontWeight: 700, fontSize: size, lineHeight: 1.22, color: '#fff', textShadow: '0 3px 24px rgba(0,0,0,0.35)'}}>
        {l.words.map((w, i) => {
          const wp = interpolate(f - times[i], [0, 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return <span key={i} style={{display: 'inline-block', opacity: wp, transform: `translateY(${(1 - wp) * 26}px)`, filter: `blur(${(1 - wp) * 7}px)`, ...(w.a ? {background: 'linear-gradient(90deg,#FFD36B,#FF7AC8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: 'none'} : {})}}>{w.t}</span>;
        })}
      </div>
    </div>
  );
};

// ───────────────── I: Daftar (qo'lda chizilgan) ─────────────────
const INK = '#1b2a4a', PEN = '#D62828';
const Daftar: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#F3EBDA'}}>
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(180deg, transparent 0px, transparent 78px, rgba(60,110,190,0.28) 78px, rgba(60,110,190,0.28) 81px)', backgroundPosition: '0 40px'}} />
      <div style={{position: 'absolute', left: 120, top: 0, bottom: 0, width: 4, background: 'rgba(214,40,40,0.5)'}} />
      {Array.from({length: 4}, (_, i) => <div key={i} style={{position: 'absolute', left: 30, top: 260 + i * 460, width: 44, height: 44, borderRadius: 22, background: '#cfc4ad', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.35)'}} />)}
      <div style={{position: 'absolute', left: 170, top: 100, fontFamily: 'YS', fontWeight: 700, fontSize: 34, color: INK, letterSpacing: 3}}>yuksalish713</div>
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={fr + 8}>
            <FadeWrap frames={fr + 8}>
              <div style={{position: 'absolute', left: 190, top: 200, width: 720, height: 700, transform: `rotate(${i % 2 ? 2.4 : -2.2}deg)`, background: '#fff', padding: 18, boxShadow: '0 22px 50px rgba(60,40,10,0.35)'}}>
                <div style={{width: '100%', height: '100%', position: 'relative', overflow: 'hidden'}}>
                  <Clip src={l.clip} pos={l.pos} frames={fr + 8} zoomFrom={1.05} zoomTo={1.15} filter="contrast(1.05) saturate(0.95)" />
                </div>
                <div style={{position: 'absolute', left: '34%', top: -26, width: 200, height: 52, background: 'rgba(250,204,21,0.78)', transform: 'rotate(-2deg)'}} />
              </div>
            </FadeWrap>
          </Sequence>
        );
      })}
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr}>
            <DaftarText l={l} frames={fr} />
          </Sequence>
        );
      })}
      <Grain opacity={0.2} blend="multiply" />
    </AbsoluteFill>
  );
};

const DaftarText: React.FC<{l: LineT; frames: number}> = ({l, frames}) => {
  const f = useCurrentFrame();
  const times = wordTimes(l.words, frames);
  const out = interpolate(f, [frames - 8, frames], [1, 0], clamp);
  const size = 70;
  return (
    <div style={{position: 'absolute', left: 190, right: 110, top: 1010, opacity: out}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: `6px ${size * 0.28}px`, fontFamily: 'YS', fontWeight: 700, fontSize: size, lineHeight: 1.3, color: INK}}>
        {l.words.map((w, i) => {
          const p = interpolate(f - times[i], [0, 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const d = interpolate(f - times[i] - 6, [0, 16], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 18}px) rotate(${(1 - p) * -2}deg)`}}>
              {w.t}
              {w.a && (
                <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{position: 'absolute', left: '-14%', top: '-22%', width: '128%', height: '144%', overflow: 'visible', pointerEvents: 'none'}}>
                  <path d="M 30 55 C 20 15, 150 -5, 180 40 C 205 85, 60 100, 25 62 C 10 40, 60 18, 120 18" fill="none" stroke={PEN} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d} />
                </svg>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Sample: React.FC<SampleProps> = ({style, lines, audio, totalSec}) => {
  useFonts();
  const {fps} = useVideoConfig();
  const st = (LEGACY[style as string] ?? style) as StyleName;
  return (
    <AbsoluteFill>
      {st === 'kino-oltin' && <Gold lines={lines} fps={fps} />}
      {st === 'split-oyna' && <Split lines={lines} fps={fps} total={totalSec} />}
      {st === 'jurnal' && <Editorial lines={lines} fps={fps} />}
      {st === 'neon' && <Neon lines={lines} fps={fps} />}
      {st === 'minimal-oq' && <Minimal lines={lines} fps={fps} />}
      {st === 'afisha' && <Afisha lines={lines} fps={fps} />}
      {st === 'terminal' && <Terminal lines={lines} fps={fps} />}
      {st === 'shisha' && <Shisha lines={lines} fps={fps} />}
      {st === 'daftar' && <Daftar lines={lines} fps={fps} />}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
