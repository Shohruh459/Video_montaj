import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';

type W = {t: string; a?: boolean};
export type LineT = {words: W[]; start: number; dur: number; clip: string; pos?: string; tag?: string};
export const STYLES = ['kino-oltin', 'split-oyna', 'jurnal', 'neon', 'minimal-oq', 'afisha'] as const;
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
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
