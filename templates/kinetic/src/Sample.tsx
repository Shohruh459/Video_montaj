import React from 'react';
import {AbsoluteFill, Audio, Internals, Easing, Img, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';

type W = {t: string; a?: boolean};
export type LineT = {words: W[]; start: number; dur: number; clip: string; pos?: string; tag?: string; style?: StyleName; ss?: number; vpos?: 'bottom'};
export const STYLES = ['kino-oltin', 'split-oyna', 'jurnal', 'neon', 'minimal-oq', 'afisha', 'terminal', 'shisha', 'daftar', 'harakat'] as const;
export type StyleName = typeof STYLES[number];
export type SceneT = {kind: 'days' | 'back' | 'stop' | 'task' | 'panorama' | 'fall' | 'plan' | 'zero' | 'fork' | 'bounce' | 'wave' | 'battery' | 'flip' | 'choice' | 'timer' | 'middle' | 'week' | 'vada' | 'promise' | 'know' | 'fade' | 'go' | 'ticket'; start: number; dur: number; p?: any};
export type SampleProps = {style: StyleName; totalSec: number; audio: string; lines: LineT[]; scenes?: SceneT[]};
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

const Clip: React.FC<{src: string; pos?: string; zoomFrom?: number; zoomTo?: number; filter?: string; frames: number; ss?: number}> = ({src, pos, zoomFrom = 1.05, zoomTo = 1.18, filter, frames, ss}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const z = interpolate(f, [0, frames], [zoomFrom, zoomTo], clamp);
  if (!src) return null;
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round((ss ?? 0) * fps)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos ?? '50% 50%', transform: `scale(${z})`, filter}} />
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
              <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={fr + 10} filter="brightness(0.62) contrast(1.15) saturate(0.85) sepia(0.28)" />
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
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 38, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 30, letterSpacing: 4, color: GOLD, opacity: 0.9}}>@yuksalish713</div>
      <Grain opacity={0.2} blend="overlay" />
    </AbsoluteFill>
  );
};

const FadeWrap: React.FC<{frames: number; children: React.ReactNode}> = ({frames, children}) => {
  const f = useCurrentFrame();
  // videoning eng birinchi kadri qora bo'lmasin: 0-kadrdan boshlanadigan klipda fade-in yo'q
  const seq = React.useContext(Internals.SequenceContext as any) as any;
  const first = ((seq?.cumulatedFrom ?? 0) + (seq?.relativeFrom ?? 0)) === 0;
  const o = first ? interpolate(f, [frames - 8, frames], [1, 0], clamp) : interpolate(f, [0, 8, frames - 8, frames], [0, 1, 1, 0], clamp);
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
                <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={fr + 30} zoomFrom={1.04} zoomTo={1.14} filter="contrast(1.08) saturate(0.95)" />
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
              <PhotoCard clip={l.clip} pos={l.pos} ss={l.ss} frames={fr + 8} rot={rot} />
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

const PhotoCard: React.FC<{clip: string; pos?: string; frames: number; rot: number; ss?: number}> = ({clip, pos, frames, rot, ss}) => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 14], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <div style={{position: 'absolute', left: 130, top: 230, width: 820, height: 800, transform: `rotate(${rot * pop}deg) scale(${0.92 + 0.08 * pop})`, background: '#f3ead8', padding: 16, boxShadow: '0 30px 70px rgba(0,0,0,0.7)'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}>
        <Clip src={clip} pos={pos} ss={ss} frames={frames} zoomFrom={1.05} zoomTo={1.16} filter="grayscale(1) contrast(1.25) brightness(0.9) sepia(0.12)" />
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
              <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={fr + 8} zoomFrom={1.04} zoomTo={1.2} filter="grayscale(0.7) contrast(1.35) brightness(0.55)" />
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
      <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={frames} zoomFrom={1.05} zoomTo={1.15} filter="saturate(0.9) contrast(1.05) brightness(1.02)" />
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
              <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={fr + 8} zoomFrom={1.08} zoomTo={1.22} filter="grayscale(1) contrast(1.3) brightness(0.55)" />
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
    <AbsoluteFill style={{justifyContent: l.vpos === 'bottom' ? 'flex-end' : 'center', padding: l.vpos === 'bottom' ? '0 80px 300px' : '0 80px', opacity: out}}>
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
              <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={fr + 8} zoomFrom={1.05} zoomTo={1.15} filter="grayscale(1) brightness(0.32) contrast(1.2) sepia(0.6) hue-rotate(60deg) saturate(1.8)" />
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
              <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={fr + 10} zoomFrom={1.04} zoomTo={1.2} filter="saturate(1.25) contrast(1.05) brightness(0.9)" />
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
      {lines.filter((l) => l.clip).map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={fr + 8}>
            <FadeWrap frames={fr + 8}>
              <div style={{position: 'absolute', left: 190, top: 200, width: 720, height: 700, transform: `rotate(${i % 2 ? 2.4 : -2.2}deg)`, background: '#fff', padding: 18, boxShadow: '0 22px 50px rgba(60,40,10,0.35)'}}>
                <div style={{width: '100%', height: '100%', position: 'relative', overflow: 'hidden'}}>
                  <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={fr + 8} zoomFrom={1.05} zoomTo={1.15} filter="contrast(1.05) saturate(0.95)" />
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


// ───────────────── J: Harakat — sahna kutubxonasi (o'zimiz chizgan 3D/UI sahnalar) ─────────────────
const RED2 = '#FF4D4D';
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eO = (x: number) => 1 - Math.pow(1 - x, 3);
const bnc = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3) * Math.cos(x * Math.PI * 3.2));

const Harakat: React.FC<{lines: LineT[]; fps: number}> = ({lines, fps}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#06070c'}}>
      {lines.map((l, i) => {
        if (!l.clip) return null;
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={fr + 10}>
            <FadeWrap frames={fr + 10}>
              <Clip src={l.clip} pos={l.pos} ss={l.ss} frames={fr + 10} zoomFrom={1.06} zoomTo={1.16} filter="brightness(0.36) saturate(0.8) blur(3px)" />
            </FadeWrap>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.045) 2px, transparent 2px)', backgroundSize: '90px 90px', backgroundPosition: `${(f * 0.6) % 90}px ${(f * 0.6) % 90}px`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 40% at 50% 32%, rgba(242,184,75,0.16), transparent 70%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.72) 100%)'}} />
      {lines.map((l, i) => {
        const fr = Math.round(l.dur * fps);
        return (
          <Sequence key={`t${i}`} from={Math.round(l.start * fps)} durationInFrames={fr}>
            <div style={{position: 'absolute', left: 120, right: 120, top: 1270, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: '100%'}}><Phrase l={l} frames={fr} size={78} font="YB" accent={GOLD} /></div>
            </div>
          </Sequence>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 30, letterSpacing: 4, color: GOLD, opacity: 0.9}}>@yuksalish713</div>
      <Grain opacity={0.12} blend="overlay" />
    </AbsoluteFill>
  );
};

const SceneFade: React.FC<{dur: number; first?: boolean; children: React.ReactNode}> = ({dur, first, children}) => {
  const f = useCurrentFrame();
  const o = first ? interpolate(f, [0, dur - 10, dur], [1, 1, 0], clamp) : interpolate(f, [0, 8, dur - 10, dur], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const SceneLayer: React.FC<{scenes: SceneT[]; fps: number}> = ({scenes, fps}) => (
  <>
    {scenes.map((sc, i) => {
      const dur = Math.round(sc.dur * fps);
      return (
        <Sequence key={i} from={Math.round(sc.start * fps)} durationInFrames={dur}>
          <SceneFade dur={sc.kind === 'panorama' ? dur + 20 : dur} first={sc.start === 0}>
            {sc.kind === 'days' && <DaysScene p={sc.p} />}
            {sc.kind === 'back' && <BackScene p={sc.p} />}
            {sc.kind === 'stop' && <StopScene />}
            {sc.kind === 'task' && <TaskScene p={sc.p} />}
            {sc.kind === 'panorama' && <PanoramaScene p={sc.p} />}
            {sc.kind === 'fall' && <FallScene p={sc.p} />}
            {sc.kind === 'plan' && <PlanScene p={sc.p} />}
            {sc.kind === 'zero' && <ZeroScene />}
            {sc.kind === 'fork' && <ForkScene p={sc.p} />}
            {sc.kind === 'bounce' && <BounceScene p={sc.p} />}
            {sc.kind === 'wave' && <WaveScene p={sc.p} />}
            {sc.kind === 'battery' && <BatteryScene p={sc.p} />}
            {sc.kind === 'flip' && <FlipScene p={sc.p} />}
            {sc.kind === 'choice' && <ChoiceScene p={sc.p} />}
            {sc.kind === 'timer' && <TimerScene p={sc.p} />}
            {sc.kind === 'middle' && <MiddleScene />}
            {sc.kind === 'week' && <WeekScene p={sc.p} />}
            {sc.kind === 'vada' && <VadaScene />}
            {sc.kind === 'promise' && <PromiseScene p={sc.p} />}
            {sc.kind === 'know' && <KnowScene p={sc.p} />}
            {sc.kind === 'fade' && <FadeRingScene p={sc.p} />}
            {sc.kind === 'go' && <GoScene p={sc.p} />}
            {sc.kind === 'ticket' && <TicketScene p={sc.p} />}
          </SceneFade>
        </Sequence>
      );
    })}
  </>
);

// 1) "Ertaga" yo'li: belgi har safar keyingi kunga sakraydi va uzoqlashib yo'qoladi
const DAY_ROWS = ['BUGUN', 'ERTAGA', 'KEYINROQ', 'DUSHANBA', 'KELASI OY', 'KELASI YIL', 'HECH QACHON'];
const DaysScene: React.FC<{p: {hops: number[]}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const HOP = 0.3; let pos = 0; let arc = 0;
  p.hops.forEach((h) => { const x = c01((t - h) / HOP); pos += eIO(x); if (x > 0 && x < 1) arc = Math.max(arc, Math.sin(Math.PI * x)); });
  const gap = 160; const rise = c01(t / 0.5);
  const rotX = 47 - 4 * c01(t / 5);
  return (
    <AbsoluteFill style={{perspective: 1800, perspectiveOrigin: '50% 42%'}}>
      <div style={{position: 'absolute', left: 190, top: 720, width: 700, height: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg)`}}>
        {DAY_ROWS.map((label, i) => {
          const y = (3 - i) * gap; const passed = c01(pos - i - 0.15); const active = Math.max(0, 1 - Math.abs(pos - i) * 1.7);
          const last = i === DAY_ROWS.length - 1; const col = last ? RED2 : GOLD;
          return (
            <div key={i} style={{position: 'absolute', left: 0, top: y - 45, width: 700, height: 90, borderRadius: 24, boxSizing: 'border-box', border: `3px solid ${last && active > 0.2 ? RED2 : GOLD}`, borderColor: `rgba(${last ? '255,77,77' : '242,184,75'},${0.25 + 0.65 * active})`, background: `rgba(255,255,255,${0.04 + 0.07 * active})`, boxShadow: active > 0.25 ? `0 0 ${46 * active}px rgba(${last ? '255,77,77' : '242,184,75'},${0.55 * active})` : 'none', opacity: (1 - 0.6 * passed) * rise, display: 'flex', alignItems: 'center', padding: '0 36px', fontFamily: 'YB', fontWeight: 700, fontSize: 40, letterSpacing: 4, color: active > 0.3 ? col : '#fff'}}>
              {label}
              {passed > 0 && <div style={{position: 'absolute', left: 30, top: '50%', height: 5, width: `${passed * 94}%`, background: RED2, borderRadius: 3}} />}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: -112, top: (3 - pos) * gap - 40, width: 80, height: 80, transformStyle: 'preserve-3d', transform: `translateZ(${arc * 150}px)`, opacity: rise}}>
          <div style={{width: 80, height: 80, borderRadius: 40, background: GOLD, boxShadow: `0 0 ${30 + arc * 40}px rgba(242,184,75,0.8)`, color: '#0a0a0a', fontSize: 38, fontFamily: 'YB', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>▶</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 34, letterSpacing: 8, color: 'rgba(255,255,255,0.6)', opacity: rise}}>BOSHLASH VAQTI</div>
    </AbsoluteFill>
  );
};

// 2) Orqaga ketish: to'p maqsad sari yurib, har yolg'ondan keyin orqaga suriladi
const BackScene: React.FC<{p: {backs: number[]; stamp: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  let prog = 0.4 + 0.05 * Math.min(t, 3);
  p.backs.forEach((b) => { prog -= 0.2 * eIO(c01((t - b) / 0.4)); });
  const X0 = 110, X1 = 970, Y = 640; const bx = X0 + (X1 - X0) * prog;
  const sx = c01((t - p.stamp) / 0.22); const stampOn = t >= p.stamp;
  const shake = stampOn && t - p.stamp < 0.35 ? (random(`st${f}`) - 0.5) * 18 : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: X0, top: Y - 3, width: X1 - X0, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.18)'}} />
      {Array.from({length: 21}, (_, i) => <div key={i} style={{position: 'absolute', left: X0 + ((X1 - X0) * i) / 20 - 1, top: Y + 22, width: 2, height: i % 5 === 0 ? 26 : 12, background: 'rgba(255,255,255,0.25)'}} />)}
      <div style={{position: 'absolute', left: X0, top: Y - 5, width: bx - X0, height: 10, borderRadius: 5, background: `linear-gradient(90deg, rgba(242,184,75,0.1), ${GOLD})`, boxShadow: '0 0 30px rgba(242,184,75,0.7)'}} />
      <div style={{position: 'absolute', left: X1 - 4, top: Y - 150, width: 6, height: 150, background: '#fff', opacity: 0.8}} />
      <div style={{position: 'absolute', left: X1 - 4, top: Y - 150, width: 130, height: 70, background: GOLD, clipPath: 'polygon(0 0, 100% 50%, 0 100%)'}} />
      <div style={{position: 'absolute', left: X1 - 220, top: Y - 215, fontFamily: 'YB', fontWeight: 700, fontSize: 38, letterSpacing: 6, color: GOLD}}>MAQSAD</div>
      <div style={{position: 'absolute', left: bx - 34, top: Y - 34, width: 68, height: 68, borderRadius: 34, background: '#fff', boxShadow: `0 0 50px rgba(255,255,255,0.8), 0 0 90px ${GOLD}`}} />
      <div style={{position: 'absolute', left: bx - 40, top: Y - 108, width: 80, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 34, letterSpacing: 4, color: '#fff'}}>SIZ</div>
      {p.backs.map((b, i) => {
        const a = c01((t - b) / 0.9); if (a <= 0 || a >= 1) return null;
        return <div key={i} style={{position: 'absolute', left: bx - 60, top: Y + 70 - 70 * a, width: 120, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 70, color: RED2, opacity: 1 - a, textShadow: '0 0 24px rgba(255,77,77,0.8)'}}>−1</div>;
      })}
      {stampOn && (
        <div style={{position: 'absolute', left: 140, right: 140, top: 250, textAlign: 'center', transform: `rotate(-8deg) scale(${2.4 - 1.4 * eO(sx)}) translate(${shake}px, ${shake}px)`, opacity: sx, fontFamily: 'YB', fontWeight: 700, fontSize: 130, letterSpacing: 6, color: RED2, border: `10px solid ${RED2}`, borderRadius: 18, padding: '10px 0', background: 'rgba(40,0,0,0.35)'}}>YOLGʻON</div>
      )}
    </AbsoluteFill>
  );
};

// 3) To'xtash
const StopScene: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const a = eO(c01(t / 0.35)); const w1 = c01(t / 0.9); const w2 = c01((t - 0.2) / 0.9);
  return (
    <AbsoluteFill>
      {[w1, w2].map((w, i) => <div key={i} style={{position: 'absolute', left: 540 - 280, top: 700 - 280, width: 560, height: 560, borderRadius: 280, border: `6px solid ${GOLD}`, opacity: (1 - w) * 0.7, transform: `scale(${1 + w * 1.4})`}} />)}
      <div style={{position: 'absolute', left: 540 - 260, top: 700 - 260, width: 520, height: 520, borderRadius: 260, boxSizing: 'border-box', border: `16px solid ${GOLD}`, boxShadow: '0 0 80px rgba(242,184,75,0.6), inset 0 0 60px rgba(242,184,75,0.25)', transform: `scale(${0.2 + 0.8 * a})`, opacity: a, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46}}>
        <div style={{width: 46, height: 190, background: '#fff', borderRadius: 10}} />
        <div style={{width: 46, height: 190, background: '#fff', borderRadius: 10}} />
      </div>
    </AbsoluteFill>
  );
};

// 4) "Bitta ish + soat" kartochkasi
const TaskScene: React.FC<{p: {text: string; time: string}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const pop = eO(c01(t / 0.4));
  const n = Math.floor(c01((t - 0.35) / 1.3) * p.text.length);
  const rolling = t > 1.7 && t < 2.2; const set = t >= 2.2;
  let di = 0; const digits = rolling ? p.time.replace(/\d/g, () => String(Math.floor(random(`d${f}_${di++}`) * 10))) : (t >= 1.7 ? p.time : '--:--');
  const checked = c01((t - 2.65) / 0.25);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 90, top: 380, width: 900, height: 640, borderRadius: 40, background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(242,184,75,0.55)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', backdropFilter: 'blur(14px)', transform: `scale(${0.9 + 0.1 * pop}) translateY(${(1 - pop) * 60}px)`, opacity: pop}}>
        <div style={{position: 'absolute', left: 54, top: 44, fontFamily: 'YB', fontWeight: 700, fontSize: 28, letterSpacing: 7, color: GOLD}}>BUGUNGI BITTA ISH</div>
        <div style={{position: 'absolute', left: 54, top: 120, width: 74, height: 74, borderRadius: 20, boxSizing: 'border-box', border: `5px solid ${checked > 0 ? GOLD : 'rgba(255,255,255,0.5)'}`, background: checked > 0 ? GOLD : 'transparent', transform: `scale(${1 + 0.25 * Math.sin(Math.PI * checked)})`, color: '#0a0a0a', fontSize: 52, fontFamily: 'YB', fontWeight: 700, textAlign: 'center', lineHeight: '64px'}}>{checked > 0.5 ? '✓' : ''}</div>
        <div style={{position: 'absolute', left: 160, top: 112, right: 40, fontFamily: 'YB', fontWeight: 700, fontSize: 56, color: '#fff', lineHeight: 1.2}}>
          {p.text.slice(0, n)}{n < p.text.length && Math.floor(f / 8) % 2 === 0 ? '▌' : ''}
        </div>
        <div style={{position: 'absolute', left: 54, right: 54, top: 300, height: 2, background: 'rgba(255,255,255,0.15)'}} />
        <div style={{position: 'absolute', left: 54, top: 345, fontFamily: 'YB', fontWeight: 700, fontSize: 28, letterSpacing: 7, color: 'rgba(255,255,255,0.55)'}}>SOAT</div>
        <div style={{position: 'absolute', left: 54, top: 400, padding: '8px 44px', borderRadius: 28, border: `4px solid ${set ? GOLD : 'rgba(255,255,255,0.3)'}`, boxShadow: set ? '0 0 50px rgba(242,184,75,0.5)' : 'none', fontFamily: 'YM', fontWeight: 700, fontSize: 150, color: set ? GOLD : '#fff'}}>{digits}</div>
      </div>
    </AbsoluteFill>
  );
};

// 5) 12 ta ssenariy kartochkalarining 3D panoramasi (kamera orqaga tortiladi)
const PanoramaScene: React.FC<{p: {titles: string[]; hi: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const W = 872, H = 888, CW = 200, CH = 280, G = 24;
  const k = eIO(c01((t - 0.15) / 2.2)); const s = 3.3 - 2.3 * k;
  const hx = (p.hi % 4) * (CW + G) + CW / 2, hy = Math.floor(p.hi / 4) * (CH + G) + CH / 2;
  const tx = (W / 2 - hx) * (1 - k), ty = (H / 2 - hy) * (1 - k);
  return (
    <AbsoluteFill style={{perspective: 2000, perspectiveOrigin: '50% 45%'}}>
      <div style={{position: 'absolute', left: 104, top: 215, width: W, height: H, transformStyle: 'preserve-3d', transformOrigin: `${hx}px ${hy}px`, transform: `translate(${tx}px, ${ty}px) scale(${s}) rotateY(${-17 * k}deg) rotateX(${9 * k}deg)`}}>
        {p.titles.map((title, i) => {
          const cx = (i % 4) * (CW + G), cy = Math.floor(i / 4) * (CH + G);
          const hi = i === p.hi; const dist = Math.abs(i - p.hi);
          const o = hi ? 1 : c01((t - 0.5 - dist * 0.05) / 0.4);
          return (
            <div key={i} style={{position: 'absolute', left: cx, top: cy, width: CW, height: CH, borderRadius: 26, boxSizing: 'border-box', border: `3px solid ${hi ? GOLD : 'rgba(255,255,255,0.25)'}`, background: hi ? 'rgba(242,184,75,0.16)' : 'rgba(255,255,255,0.06)', boxShadow: hi ? '0 0 60px rgba(242,184,75,0.55)' : '0 12px 30px rgba(0,0,0,0.4)', opacity: o, transform: `translateZ(${hi ? 40 * k : 0}px)`, padding: 20}}>
              <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 92, color: hi ? GOLD : 'rgba(255,255,255,0.35)', lineHeight: 1}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{position: 'absolute', left: 20, right: 16, bottom: 22, fontFamily: 'YB', fontWeight: 700, fontSize: 25, lineHeight: 1.15, letterSpacing: 1, color: hi ? '#fff' : 'rgba(255,255,255,0.75)'}}>{title}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};


// ───────────────── #03 sahnalari: yiqilish / reja / nol / ikki yo'l / sakrash / ovoz ─────────────────
const Ball: React.FC<{x: number; y: number; r?: number; gray?: number; sx?: number; sy?: number; glow?: number}> = ({x, y, r = 46, gray = 0, sx = 1, sy = 1, glow = 1}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle at 35% 30%, #fff, ${gray ? '#9a9a9a' : GOLD} 55%, ${gray ? '#555' : '#c98a1c'})`, boxShadow: gray ? '0 0 10px rgba(0,0,0,0.4)' : `0 0 ${46 * glow}px rgba(242,184,75,${0.8 * glow})`, transform: `scale(${sx}, ${sy})`, transformOrigin: '50% 100%', filter: gray ? `grayscale(${gray})` : undefined}} />
);

// 1) Yiqilish: to'p pog'onadan dumalab tushadi, yerga urilib bir necha marta sakraydi
const FallScene: React.FC<{p: {fallAt: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const R = 46, EDGE = 560, TOP = 560, FLOOR = 1060; const rise = c01(t / 0.4);
  const roll = c01((t - (p.fallAt - 0.7)) / 0.7);        // chetga dumalaydi
  let x = 300 + (EDGE - 300) * roll * roll, y = TOP - R, sx = 1, sy = 1, landed = 0;
  const tf = t - p.fallAt;
  if (tf > 0) {   // erkin tushish
    const g = 4200; const fallT = Math.sqrt(2 * (FLOOR - TOP) / g); const tt = Math.min(tf, fallT);
    y = TOP - R + 0.5 * g * tt * tt; x = EDGE + 60 * Math.min(tf, 1.6);
    if (tf > fallT) { const b = tf - fallT; landed = 1; const hop = (h: number, d: number) => (b >= d && b < d + 0.42 ? h * Math.sin(Math.PI * (b - d) / 0.42) : 0);
      y = FLOOR - R - hop(150, 0) - hop(52, 0.42); x = EDGE + 60 * Math.min(tf, 1.6) + 110 * Math.min(b, 1.2);
      if (b < 0.12) { sx = 1.35; sy = 0.65; } }
  }
  const shake = landed && tf - Math.sqrt(2 * (FLOOR - TOP) / 4200) < 0.3 ? (random(`fs${f}`) - 0.5) * 14 : 0;
  const gray = tf > 1.0 ? c01((tf - 1.0) / 0.8) * 0.7 : 0;
  return (
    <AbsoluteFill style={{opacity: rise, transform: `translateY(${shake}px)`}}>
      <div style={{position: 'absolute', left: 90, top: TOP, width: 520, height: 34, borderRadius: 14, background: 'rgba(255,255,255,0.22)', boxShadow: '0 0 30px rgba(242,184,75,0.25)'}} />
      <div style={{position: 'absolute', left: 90, top: TOP + 34, width: 30, height: FLOOR - TOP - 34, background: 'linear-gradient(rgba(255,255,255,0.18), transparent)'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: FLOOR, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.3)'}} />
      <div style={{position: 'absolute', left: 300 + 130 * 0, top: TOP - 150, fontFamily: 'YB', fontWeight: 700, fontSize: 30, letterSpacing: 6, color: 'rgba(255,255,255,0.55)', opacity: tf < 0 ? 1 : 0}}>REJA</div>
      <Ball x={x} y={y} r={R} sx={sx} sy={sy} gray={gray} glow={1 - gray} />
      {landed === 1 && [0, 1].map((i) => { const a = c01((tf - Math.sqrt(2 * (FLOOR - TOP) / 4200) - i * 0.12) / 0.6); return a > 0 && a < 1 ? <div key={i} style={{position: 'absolute', left: EDGE + 60 - 120 + 0, top: FLOOR - 24, width: 240, height: 48, marginLeft: 0, borderRadius: '50%', border: `4px solid rgba(255,255,255,${0.5 * (1 - a)})`, transform: `scale(${0.4 + a * 1.6})`}} /> : null; })}
    </AbsoluteFill>
  );
};

// 2) Reja kartochkasi: bandlar birin-ketin chizib tashlanadi
const PlanScene: React.FC<{p: {strikes: number[]; items: string[]}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const pop = eO(c01(t / 0.35));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 100, top: 400, width: 880, height: 640, borderRadius: 40, background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(242,184,75,0.5)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', transform: `scale(${0.92 + 0.08 * pop})`, opacity: pop}}>
        <div style={{position: 'absolute', left: 54, top: 44, fontFamily: 'YB', fontWeight: 700, fontSize: 30, letterSpacing: 8, color: GOLD}}>MENING REJAM</div>
        {p.items.map((it, i) => {
          const sa = c01((t - p.strikes[i]) / 0.22); const y = 140 + i * 150;
          return (
            <div key={i} style={{position: 'absolute', left: 54, right: 54, top: y, height: 110}}>
              <div style={{position: 'absolute', left: 0, top: 18, width: 74, height: 74, borderRadius: 20, boxSizing: 'border-box', border: `5px solid ${sa > 0 ? RED2 : 'rgba(255,255,255,0.5)'}`, color: RED2, fontSize: 52, fontFamily: 'YB', fontWeight: 700, textAlign: 'center', lineHeight: '64px'}}>{sa > 0.6 ? '✗' : ''}</div>
              <div style={{position: 'absolute', left: 110, top: 8, fontFamily: 'YB', fontWeight: 700, fontSize: 58, color: sa > 0 ? 'rgba(255,255,255,0.45)' : '#fff', lineHeight: '94px', whiteSpace: 'nowrap'}}>{it}</div>
              <div style={{position: 'absolute', left: 100, top: 54, height: 8, width: `${sa * 88}%`, background: RED2, borderRadius: 4, boxShadow: '0 0 18px rgba(255,77,77,0.8)'}} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 3) Natija: nol
const ZeroScene: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = eO(c01(t / 0.4));
  const flick = t > 0.6 ? 1 + 0.04 * Math.sin(t * 22) : 1;
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 40, letterSpacing: 12, color: 'rgba(255,255,255,0.6)'}}>NATIJA</div>
      <div style={{position: 'absolute', left: 540 - 270, top: 380, width: 540, height: 540, borderRadius: 270, boxSizing: 'border-box', border: '18px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${60 * (t > 0.6 ? 1 : 0)}px rgba(255,77,77,0.45)`}}>
        <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 330, color: t > 0.6 ? RED2 : '#fff', transform: `scale(${flick})`, textShadow: t > 0.6 ? '0 0 60px rgba(255,77,77,0.7)' : 'none'}}>0</div>
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 1040, height: 44, display: 'flex', alignItems: 'flex-end', gap: 22}}>
        {Array.from({length: 7}, (_, i) => <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.35)'}} />)}
      </div>
    </AbsoluteFill>
  );
};

// 4) Ikki yo'l (3D): to'p ayriliqqa keladi; chap yo'l — sinish, o'ng yo'l — o'rganish; to'p o'ngga ketadi
const bz = (P: number[][], u: number) => { const m = 1 - u; return [m * m * m * P[0][0] + 3 * m * m * u * P[1][0] + 3 * m * u * u * P[2][0] + u * u * u * P[3][0], m * m * m * P[0][1] + 3 * m * m * u * P[1][1] + 3 * m * u * u * P[2][1] + u * u * u * P[3][1]]; };
const LP = [[400, 640], [400, 520], [250, 470], [170, 290]], RP = [[400, 640], [400, 500], [560, 430], [640, 170]];
const ForkScene: React.FC<{p: {split: number; left: number[]; right: number[]; go: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const draw = eO(c01(t / 0.8));
  const inWin = (w: number[]) => (t >= w[0] && t < w[1] ? 1 : 0);
  const lh = inWin(p.left), rh = inWin(p.right) || (t >= p.go ? 1 : 0), after = t >= p.go;
  let bx = 400, by = 1050;
  const sUp = eIO(c01((t - 0.3) / Math.max(0.2, p.split - 0.3)));
  if (t < p.go) { by = 1050 - 410 * sUp; } else { const [x, y] = bz(RP, eIO(c01((t - p.go) / 1.5))); bx = x; by = y; }
  const road = (P: number[][], col: string, op: number, glow: number) => (
    <path d={`M ${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]}, ${P[2][0]} ${P[2][1]}, ${P[3][0]} ${P[3][1]}`} fill="none" stroke={col} strokeWidth={48} strokeLinecap="round" opacity={op} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{filter: glow ? `drop-shadow(0 0 ${28 * glow}px ${col})` : undefined}} />
  );
  const lOp = after ? 0.22 : (rh ? 0.3 : 0.9), rOp = lh ? 0.3 : 0.95;
  const rotX = 50 - 6 * c01(t / 4);
  return (
    <AbsoluteFill style={{perspective: 1700, perspectiveOrigin: '50% 40%'}}>
      <div style={{position: 'absolute', left: 140, top: 130, width: 800, height: 1100, transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg)`}}>
        <svg width="800" height="1100" viewBox="0 0 800 1100" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <line x1="400" y1="1100" x2="400" y2="640" stroke="rgba(255,255,255,0.25)" strokeWidth={48} strokeLinecap="round" opacity={draw} />
          {road(LP, RED2, lOp, lh)}
          {road(RP, GOLD, rOp, rh ? 1 : 0.2)}
          {after && c01((t - p.go - 1.2) / 0.4) > 0 && [0, 1, 2, 3, 4].map((i) => { const [x, y] = bz(RP, 0.25 + i * 0.18); return <circle key={i} cx={x} cy={y} r={11} fill="#fff" opacity={c01((t - p.go - 1.2) / 0.4)} />; })}
          <g opacity={draw}><path d="M 150 275 l 40 30 l -30 20 l 38 34" stroke={RED2} strokeWidth={9} fill="none" strokeLinecap="round" /></g>
        </svg>
        <div style={{position: 'absolute', left: 0, top: 205, padding: '14px 30px', borderRadius: 44, background: 'rgba(60,0,0,0.78)', border: `5px solid ${RED2}`, color: RED2, fontFamily: 'YB', fontWeight: 700, fontSize: 42, letterSpacing: 1, whiteSpace: 'nowrap', opacity: draw * (after ? 0.5 : 1), transform: 'translateZ(2px)'}}>MEN YOMONMAN</div>
        <div style={{position: 'absolute', left: 250, top: 40, padding: '14px 30px', borderRadius: 44, background: 'rgba(60,40,0,0.78)', border: `5px solid ${GOLD}`, color: GOLD, fontFamily: 'YB', fontWeight: 700, fontSize: 42, letterSpacing: 1, whiteSpace: 'nowrap', opacity: draw, transform: 'translateZ(2px)'}}>BU USUL ISHLAMADI</div>
        <div style={{position: 'absolute', left: bx - 40, top: by - 40, width: 80, height: 80, transformStyle: 'preserve-3d', transform: `translateZ(${30 + 18 * Math.sin(t * 6)}px)`}}><Ball x={40} y={40} r={36} glow={1} /></div>
      </div>
    </AbsoluteFill>
  );
};

// 5) Sakrash: 'up' — har urilishda balandroq (qayta turish); 'stay' — yerda qoladi
const BounceScene: React.FC<{p: {mode: 'up' | 'stay'}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const rise = c01(t / 0.3);
  const FLOOR = 980, R = 52; let y = FLOOR - R, sx = 1, sy = 1, gray = 0;
  if (p.mode === 'up') {
    const hs = [0, 120, 260, 440]; const dur = 0.5; const i = Math.min(Math.floor(t / dur), 3); const u = (t - i * dur) / dur;
    y = FLOOR - R - hs[Math.min(i + 1, 3)] * Math.sin(Math.PI * c01(u)); if (t > 2.0) y = FLOOR - R - 440 - 30 * Math.sin((t - 2) * 3);
    if (u < 0.1 && t < 2.0) { sx = 1.25; sy = 0.75; }
  } else { const g = 3600; const dt = Math.sqrt(2 * (FLOOR - R - 300) / g); const tt = Math.min(t, dt); y = 300 + 0.5 * g * tt * tt; if (t > dt && t < dt + 0.12) { sx = 1.3; sy = 0.7; } gray = c01((t - dt) / 0.6) * 0.85; }
  const shadow = 1 - c01((FLOOR - R - y) / 600) * 0.6;
  return (
    <AbsoluteFill style={{opacity: rise}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: FLOOR, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.3)'}} />
      <div style={{position: 'absolute', left: 540 - 70 * shadow, top: FLOOR + 14, width: 140 * shadow, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', filter: 'blur(4px)'}} />
      <Ball x={540} y={y} r={R} sx={sx} sy={sy} gray={gray} glow={1 - gray} />
      {p.mode === 'up' && t > 1.9 && <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 150, color: GOLD, opacity: c01((t - 1.9) / 0.4), textShadow: '0 0 40px rgba(242,184,75,0.7)'}}>↑</div>}
    </AbsoluteFill>
  );
};

// 6) Ovoz chiqarib aytish: mikrofon + to'lqin + iqtibos
const WaveScene: React.FC<{p: {quote: string; talkFrom: number; talkTo: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = eO(c01(t / 0.4));
  const talking = t >= p.talkFrom && t <= p.talkTo; const nChars = Math.floor(c01((t - p.talkFrom) / Math.max(0.3, p.talkTo - p.talkFrom)) * p.quote.length);
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 540 - 120, top: 300, width: 240, height: 240, borderRadius: 120, background: talking ? GOLD : 'rgba(255,255,255,0.12)', border: `6px solid ${GOLD}`, boxShadow: talking ? '0 0 80px rgba(242,184,75,0.7)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="120" height="150" viewBox="0 0 24 30"><rect x="8" y="1" width="8" height="16" rx="4" fill={talking ? '#0a0a0a' : '#fff'} /><path d="M3 13a9 9 0 0 0 18 0M12 22v6M7 28h10" stroke={talking ? '#0a0a0a' : '#fff'} strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 640, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
        {Array.from({length: 33}, (_, i) => { const env = talking ? 0.25 + 0.75 * Math.abs(Math.sin(t * 9 + i * 0.7)) * (0.5 + 0.5 * random(`w${Math.floor(f / 2)}_${i}`)) : 0.06; const mid = 1 - Math.abs(i - 16) / 18; return <div key={i} style={{width: 14, height: 210 * env * (0.35 + 0.65 * mid), borderRadius: 7, background: talking ? GOLD : 'rgba(255,255,255,0.4)'}} />; })}
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 930, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 78, color: '#fff', lineHeight: 1.15, textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>“{p.quote.slice(0, nChars)}<span style={{opacity: 0.35}}>{p.quote.slice(nChars)}</span>”</div>
    </AbsoluteFill>
  );
};


// ───────────────── #06 sahnalari: batareya / aylanuvchi kartochka / tanlov / taymer / muvozanat / hafta ─────────────────
const BatteryScene: React.FC<{p: {dur: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = eO(c01(t / 0.4));
  const pct = 100 - 92 * eIO(c01(t / (p.dur * 0.85))); const low = pct < 22; const col = pct > 45 ? GOLD : pct > 22 ? '#FF9F43' : RED2;
  const flick = low ? (Math.floor(t * 8) % 2 ? 1 : 0.55) : 1; const shake = low ? Math.sin(t * 40) * 3 : 0;
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 36, letterSpacing: 12, color: 'rgba(255,255,255,0.6)'}}>ENERGIYA</div>
      <div style={{position: 'absolute', left: 540 - 290 + shake, top: 440, width: 560, height: 280, borderRadius: 48, boxSizing: 'border-box', border: `14px solid ${low ? RED2 : '#fff'}`, boxShadow: low ? `0 0 ${60 * flick}px rgba(255,77,77,0.6)` : 'none', padding: 16}}>
        <div style={{width: `${Math.max(4, pct)}%`, height: '100%', borderRadius: 24, background: col, opacity: flick, boxShadow: `0 0 40px ${col}`}} />
      </div>
      <div style={{position: 'absolute', left: 540 + 290 + shake, top: 520, width: 44, height: 120, borderRadius: '0 22px 22px 0', background: low ? RED2 : '#fff'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 190, color: col, opacity: flick, textShadow: `0 0 50px ${col}`}}>{Math.round(pct)}%</div>
    </AbsoluteFill>
  );
};

const FlipScene: React.FC<{p: {flipAt: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = eO(c01(t / 0.4));
  const k = eIO(c01((t - p.flipAt) / 0.55)); const rot = 180 * k; const lift = Math.sin(Math.PI * k) * 110;
  const face = (bg: string, bd: string): React.CSSProperties => ({position: 'absolute', inset: 0, borderRadius: 48, background: bg, border: `8px solid ${bd}`, backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 70px ${bd}55`});
  return (
    <AbsoluteFill style={{opacity: a, perspective: 1600}}>
      <div style={{position: 'absolute', left: 170, top: 430, width: 740, height: 560, transformStyle: 'preserve-3d', transform: `translateZ(${lift}px) rotateY(${rot}deg)`}}>
        <div style={face('linear-gradient(160deg, rgba(40,55,90,0.85), rgba(20,25,45,0.9))', GOLD)}>
          <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 200, color: GOLD, lineHeight: 1}}>☾</div>
          <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 84, color: '#fff', letterSpacing: 4, marginTop: 10}}>DAM OLISH</div>
        </div>
        <div style={{...face('linear-gradient(160deg, rgba(90,25,25,0.9), rgba(40,10,10,0.92))', RED2), transform: 'rotateY(180deg)'}}>
          <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 190, color: RED2, lineHeight: 1}}>⚠</div>
          <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 96, color: '#fff', letterSpacing: 4, marginTop: 10}}>BAHONA</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ChoiceScene: React.FC<{p: {calm: number; run: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = eO(c01(t / 0.4));
  const lc = t >= p.calm && t < p.run ? 1 : 0, rc = t >= p.run ? 1 : 0;
  const card = (x: number, on: number, col: string, icon: string, label: string, dx: number) => (
    <div style={{position: 'absolute', left: x, top: 480, width: 430, height: 520, borderRadius: 44, boxSizing: 'border-box', border: `8px solid ${on ? col : 'rgba(255,255,255,0.25)'}`, background: on ? `${col}26` : 'rgba(255,255,255,0.06)', boxShadow: on ? `0 0 80px ${col}88` : 'none', transform: `scale(${on ? 1.06 : 0.97}) translateX(${dx}px)`, opacity: on ? 1 : 0.6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
      <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 190, color: col, lineHeight: 1}}>{icon}</div>
      <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 52, color: '#fff', letterSpacing: 2, textAlign: 'center'}}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 170, color: GOLD, transform: `scale(${1 + 0.06 * Math.sin(t * 5)})`, textShadow: '0 0 50px rgba(242,184,75,0.6)'}}>?</div>
      {card(70, lc, GOLD, '☾', 'DAM OLYAPMAN', 0)}
      {card(580, rc, RED2, '➜', 'QOCHYAPMAN', rc ? Math.sin(t * 30) * 4 : 0)}
    </AbsoluteFill>
  );
};

const TimerScene: React.FC<{p: {start: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = eO(c01(t / 0.4));
  const k = eIO(c01((t - p.start) / 2.2)); const R = 250, C = 2 * Math.PI * R; const secs = 600 - Math.floor(k * 60); const done = k >= 1;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
  return (
    <AbsoluteFill style={{opacity: a}}>
      <svg width="700" height="700" viewBox="0 0 700 700" style={{position: 'absolute', left: 190, top: 330}}>
        <circle cx="350" cy="350" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="26" />
        <circle cx="350" cy="350" r={R} fill="none" stroke={done ? '#4ADE80' : GOLD} strokeWidth="26" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - k)} transform="rotate(-90 350 350)" style={{filter: `drop-shadow(0 0 22px ${done ? '#4ADE80' : GOLD})`}} />
      </svg>
      <div style={{position: 'absolute', left: 190, top: 330, width: 700, height: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: 'YM', fontWeight: 700, fontSize: 150, color: done ? '#4ADE80' : '#fff', lineHeight: 1}}>{mm}:{ss}</div>
        <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 38, letterSpacing: 8, color: 'rgba(255,255,255,0.6)', marginTop: 22}}>{done ? 'BOSHLADINGIZ' : '10 DAQIQA'}</div>
      </div>
    </AbsoluteFill>
  );
};

const MiddleScene: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = eO(c01(t / 0.4)); const sway = Math.sin(t * 2.4) * 70;
  const wall = (x: number, label: string, side: number) => (
    <>
      <div style={{position: 'absolute', left: x, top: 470, width: 30, height: 460, borderRadius: 15, background: RED2, boxShadow: `0 0 ${30 + 14 * Math.sin(t * 6 + side)}px ${RED2}`}} />
      <div style={{position: 'absolute', left: x - 120 + 15, top: 390, width: 260, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 52, color: RED2, letterSpacing: 4}}>{label}</div>
    </>
  );
  return (
    <AbsoluteFill style={{opacity: a}}>
      {wall(140, 'INKOR', 0)}{wall(910, 'TASLIM', 3)}
      <div style={{position: 'absolute', left: 190, top: 698, width: 700, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.18)'}} />
      <Ball x={540 + sway} y={700} r={52} />
      <div style={{position: 'absolute', left: 540 + sway - 60, top: 800, width: 120, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 36, letterSpacing: 6, color: '#fff'}}>SIZ</div>
    </AbsoluteFill>
  );
};

const WeekScene: React.FC<{p: {start: number; cross: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps; const a = eO(c01(t / 0.4));
  const D = ['D', 'S', 'CH', 'P', 'J', 'SH', 'Y']; const cr = bnc(c01((t - p.cross) / 0.5));
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 38, letterSpacing: 10, color: 'rgba(255,255,255,0.6)'}}>BIR HAFTA</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 400, display: 'flex', justifyContent: 'space-between'}}>
        {D.map((d, i) => { const on = c01((t - (p.start + i * 0.17)) / 0.2); return <div key={i} style={{width: 124, height: 124, borderRadius: 62, boxSizing: 'border-box', border: `6px solid ${on > 0 ? RED2 : 'rgba(255,255,255,0.3)'}`, background: on > 0 ? `rgba(255,77,77,${0.25 + 0.25 * on})` : 'transparent', boxShadow: on > 0 ? '0 0 30px rgba(255,77,77,0.6)' : 'none', color: on > 0 ? '#fff' : 'rgba(255,255,255,0.6)', fontFamily: 'YB', fontWeight: 700, fontSize: d.length > 1 ? 40 : 52, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.15 * Math.sin(Math.PI * on)})`}}>{d}</div>; })}
      </div>
      <div style={{position: 'absolute', left: 540 - 150, top: 640, width: 300, height: 300, borderRadius: 150, background: 'rgba(255,255,255,0.08)', border: `8px solid ${GOLD}`, boxShadow: `0 0 ${70 * cr}px rgba(242,184,75,0.7)`, transform: `scale(${cr})`, opacity: c01(cr * 2), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 160, height: 160}}>
          <div style={{position: 'absolute', left: 56, top: 0, width: 48, height: 160, borderRadius: 14, background: GOLD}} />
          <div style={{position: 'absolute', left: 0, top: 56, width: 160, height: 48, borderRadius: 14, background: GOLD}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 970, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 44, letterSpacing: 8, color: GOLD, opacity: c01(cr * 2)}}>MUTAXASSIS</div>
    </AbsoluteFill>
  );
};


// ───────────────── #10: Vaʼdalar (daftar mavzusida) ─────────────────
const STICKY = '#ffe27a';
const VadaScene: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const word = ['V', 'A', 'ʼ', 'D', 'A'];
  const ul = eO(c01((t - 0.55) / 0.5));
  const q = bnc(c01((t - 1.0) / 0.5));
  const st = bnc(c01((t - 1.5) / 0.35)); const sh = t > 1.5 && t < 1.7 ? (random(`sh${f}`) - 0.5) * 14 : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 70, right: 70, top: 300, display: 'flex', justifyContent: 'center', fontFamily: 'YS', fontWeight: 700, fontSize: 250, color: INK, lineHeight: 1.05}}>
        {word.map((c, i) => { const a = bnc(c01((t - i * 0.05) / 0.4)); return <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - a) * -260}px) scale(${0.4 + 0.6 * a})`, opacity: a > 0 ? 1 : 0}}>{c}</span>; })}
      </div>
      <div style={{position: 'absolute', right: 70, top: 130, fontFamily: 'YS', fontWeight: 700, fontSize: 230, color: PEN, lineHeight: 1, transform: `scale(${q}) rotate(${14 + (1 - q) * 25}deg)`, opacity: q > 0 ? 1 : 0}}>?</div>
      <svg viewBox="0 0 800 60" style={{position: 'absolute', left: 190, top: 610, width: 700, height: 52, overflow: 'visible'}}>
        <path d="M 10 35 C 150 10, 300 55, 450 28 C 560 8, 680 40, 790 22" fill="none" stroke={PEN} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ul} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 730, textAlign: 'center', transform: `translate(${sh}px, 0) scale(${0.4 + 0.6 * st}) rotate(-7deg)`, opacity: st > 0 ? 1 : 0}}>
        <span style={{display: 'inline-block', fontFamily: 'YB', fontWeight: 700, fontSize: 136, letterSpacing: 6, color: PEN, border: `13px solid ${PEN}`, borderRadius: 24, padding: '4px 44px 10px', background: 'rgba(243,235,218,0.85)'}}>BUZILDI</span>
      </div>
    </AbsoluteFill>
  );
};

const Sticky: React.FC<{y: number; text: string; t: number; t0: number; rot: number; cross: number; vis: number}> = ({y, text, t, t0, rot, cross, vis}) => {
  const a = bnc(c01((t - t0) / 0.4));
  if (a <= 0) return null;
  const sway = Math.sin(t * 1.7 + y) * 0.6;
  return (
    <div style={{position: 'absolute', left: 150, top: y, width: 780, height: 210, opacity: vis, transform: `scale(${0.6 + 0.4 * a}) rotate(${rot + sway}deg)`, background: STICKY, boxShadow: '0 18px 38px rgba(60,40,10,0.35)', borderRadius: 8}}>
      <div style={{position: 'absolute', left: '38%', top: -22, width: 190, height: 44, background: 'rgba(255,255,255,0.55)', transform: 'rotate(-2deg)'}} />
      <div style={{position: 'absolute', left: 44, right: 36, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: 'YS', fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: INK}}>{text}</div>
      <svg viewBox="0 0 780 210" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d="M 30 112 C 260 86, 520 130, 750 98" fill="none" stroke={PEN} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cross} />
      </svg>
    </div>
  );
};

type PromiseP = {n1: number; n2: number; cross: number; breaks: number[]; fall: number; cta1: number; cta1End: number; tiny: number; tick: number; end: number};
const PromiseScene: React.FC<{p: PromiseP}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const [b0, b1, b2] = p.breaks;
  const xs = [0, b0, b0 + 0.45, b1, b1 + 0.45, b2, b2 + 0.45, p.fall, p.fall + 0.9, p.tick + 0.1, p.tick + 1.4, p.end];
  const ys = [100, 100, 70, 70, 45, 45, 22, 22, 6, 6, 40, 48];
  const v = interpolate(t, xs, ys, clamp);
  const col = v > 60 ? '#2fa84f' : v > 30 ? '#e0a31f' : '#d62828';
  const notesVis = 1 - c01((t - p.cta1) / 0.3);
  const c1 = eO(c01((t - p.cross) / 0.35)), c2 = eO(c01((t - p.cross - 0.2) / 0.35));
  const bub = bnc(c01((t - p.cta1) / 0.45)) * (1 - c01((t - p.cta1End - 0.1) / 0.3));
  const msg = 'Menda ham shunday boʻlgan…'; const typed = Math.floor(c01((t - p.cta1 - 0.5) / 1.3) * msg.length);
  const tinyA = bnc(c01((t - p.tiny) / 0.45)); const tick = eO(c01((t - p.tick) / 0.3));
  const barA = eO(c01((t - p.n1) / 0.4));
  return (
    <AbsoluteFill>
      <Sticky y={210} text="Bugun 20 daqiqa oʻqiyman" t={t} t0={p.n1} rot={-2.2} cross={c1} vis={notesVis} />
      <Sticky y={460} text="Ertalab soat 6 da turaman" t={t} t0={p.n2} rot={1.8} cross={c2} vis={notesVis} />

      {/* ishonch ko'rsatkichi */}
      <div style={{position: 'absolute', left: 150, top: 750, width: 780, opacity: barA}}>
        <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 30, letterSpacing: 7, color: 'rgba(27,42,74,0.7)'}}>OʻZINGIZGA ISHONCH</div>
        <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{position: 'relative', flex: 1, height: 70, borderRadius: 35, background: 'rgba(27,42,74,0.14)', border: `4px solid ${INK}`, overflow: 'hidden', boxSizing: 'border-box'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, background: col, borderRadius: 31, boxShadow: `0 0 24px ${col}88`}} />
          </div>
          <div style={{fontFamily: 'YM', fontWeight: 700, fontSize: 56, color: col, width: 150, textAlign: 'right'}}>{Math.round(v)}%</div>
        </div>
        <div style={{marginTop: 14, display: 'flex', gap: 16}}>
          {p.breaks.map((bt, i) => { const a = bnc(c01((t - bt) / 0.35)); return <div key={i} style={{width: 56, height: 56, borderRadius: 28, border: `5px solid ${PEN}`, color: PEN, fontFamily: 'YB', fontWeight: 700, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${a})`, opacity: a > 0 ? 1 : 0}}>✕</div>; })}
        </div>
      </div>

      {/* izoh pufagi */}
      {bub > 0.01 && (
        <div style={{position: 'absolute', left: 170, top: 250, width: 740, height: 360, transform: `scale(${bub})`, opacity: bub}}>
          <div style={{position: 'absolute', inset: 0, background: '#fff', borderRadius: 48, border: `6px solid ${INK}`, boxShadow: '0 20px 44px rgba(60,40,10,0.3)'}} />
          <div style={{position: 'absolute', left: 90, bottom: -44, width: 0, height: 0, borderLeft: '36px solid transparent', borderRight: '36px solid transparent', borderTop: `56px solid ${INK}`}} />
          <div style={{position: 'absolute', left: 52, right: 40, top: 54, fontFamily: 'YS', fontWeight: 700, fontSize: 56, lineHeight: 1.2, color: INK}}>{msg.slice(0, typed)}{Math.floor(f / 8) % 2 === 0 ? '▌' : ''}</div>
          <div style={{position: 'absolute', left: 52, bottom: 40, display: 'flex', gap: 14}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 24, height: 24, borderRadius: 12, background: 'rgba(27,42,74,0.5)', transform: `translateY(${-Math.abs(Math.sin(t * 6 + i * 0.7)) * 14}px)`}} />)}</div>
        </div>
      )}

      {/* kichik vaʼda */}
      {tinyA > 0.01 && (
        <div style={{position: 'absolute', left: 190, top: 330, width: 700, height: 200, transform: `scale(${0.6 + 0.4 * tinyA}) rotate(-1.6deg)`, opacity: tinyA > 0 ? 1 : 0, background: STICKY, boxShadow: `0 18px 38px rgba(60,40,10,0.35)${tick > 0.6 ? ', 0 0 60px rgba(47,168,79,0.55)' : ''}`, borderRadius: 8}}>
          <div style={{position: 'absolute', left: '38%', top: -22, width: 190, height: 44, background: 'rgba(255,255,255,0.55)', transform: 'rotate(-2deg)'}} />
          <div style={{position: 'absolute', left: 36, top: 52, width: 96, height: 96, borderRadius: 18, boxSizing: 'border-box', border: `7px solid ${INK}`, background: 'rgba(255,255,255,0.6)'}}>
            <svg viewBox="0 0 100 100" style={{position: 'absolute', inset: -6, overflow: 'visible'}}><path d="M 20 55 L 42 76 L 86 22" fill="none" stroke="#1f9a43" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} /></svg>
          </div>
          <div style={{position: 'absolute', left: 164, right: 24, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: 'YS', fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: INK}}>Bugun 2 daqiqa oʻqiyman</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ───────────────── #12: Bilish — harakat emas (neon / shisha) ─────────────────
const RingSvg: React.FC<{size: number; pct: number; color: string; track?: string; w?: number}> = ({size, pct, color, track = 'rgba(255,255,255,0.12)', w = 22}) => {
  const r = size / 2 - w; const C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow: 'visible'}}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={w} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{filter: `drop-shadow(0 0 16px ${color})`}} />
    </svg>
  );
};

const EqBars: React.FC<{t: number; a: number}> = ({t, a}) => (
  <div style={{position: 'absolute', left: 90, right: 90, bottom: 340, height: 260, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', opacity: 0.85 * a}}>
    {Array.from({length: 26}, (_, i) => {
      const h = 30 + 200 * Math.abs(Math.sin(t * 3.1 + i * 0.7)) * (0.45 + 0.55 * Math.abs(Math.sin(t * 1.3 + i * 1.7)));
      return <div key={i} style={{width: 24, height: h, borderRadius: 12, background: `linear-gradient(180deg, ${NEON_M}, ${NEON_C})`, boxShadow: `0 0 16px ${NEON_C}88`}} />;
    })}
  </div>
);

const KnowScene: React.FC<{p: {right: number; slam: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const a = bnc(c01((t - 0.1) / 0.5)); const b = bnc(c01((t - p.right) / 0.5)); const sl = bnc(c01((t - p.slam) / 0.3));
  const sh = t > p.slam && t < p.slam + 0.25 ? (random(`k${f}`) - 0.5) * 18 : 0;
  const card = (x: number, on: boolean, label: string, pct: number, col: string, k: number) => (
    <div style={{position: 'absolute', left: x, top: 230, width: 460, height: 520, borderRadius: 40, boxSizing: 'border-box', border: `4px solid ${on ? col : 'rgba(255,255,255,0.18)'}`, background: on ? 'rgba(39,233,247,0.08)' : 'rgba(255,255,255,0.03)', boxShadow: on ? `0 0 50px ${col}66, inset 0 0 40px ${col}22` : 'none', transform: `scale(${0.7 + 0.3 * k})`, opacity: k > 0 ? 1 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24}}>
      <div style={{position: 'relative', width: 290, height: 290}}>
        <RingSvg size={290} pct={pct} color={col} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'YM', fontWeight: 700, fontSize: 82, color: on ? '#fff' : 'rgba(255,255,255,0.4)'}}>{Math.round(pct * 100)}%</div>
      </div>
      <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 52, letterSpacing: 5, color: on ? col : 'rgba(255,255,255,0.4)'}}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {card(70, true, 'BILAMAN', 1, NEON_C, a)}
      {card(550, false, 'QILAMAN', 0, NEON_M, b)}
      <EqBars t={t} a={a} />
      <div style={{position: 'absolute', left: 540 - 70, top: 420, width: 140, height: 140, borderRadius: 70, background: NEON_M, boxShadow: `0 0 60px ${NEON_M}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 110, color: '#fff', transform: `translate(${sh}px, 0) scale(${sl * 1.0})`, opacity: sl > 0 ? 1 : 0}}>≠</div>
    </AbsoluteFill>
  );
};

const FadeRingScene: React.FC<{p: {tom: number; dim: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const a = bnc(c01((t - 0.05) / 0.5));
  const drain = c01((t - p.dim) / 1.4); const pct = 1 - 0.88 * eIO(drain);
  const col = pct > 0.55 ? NEON_C : pct > 0.3 ? '#ffb020' : NEON_M;
  const flick = drain > 0 && drain < 1 ? 0.75 + 0.25 * Math.sin(t * 40) : 1;
  const w = c01((t - p.tom) / 1.1); const wx = 1200 - 1500 * eO(w); const wo = w > 0 ? 1 : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - 210, top: 270, width: 420, height: 420, transform: `scale(${a})`, opacity: flick}}>
        <RingSvg size={420} pct={pct} color={col} w={30} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'YM', fontWeight: 700, fontSize: 108, color: '#fff', textShadow: `0 0 24px ${col}`}}>{Math.round(pct * 100)}%</div>
      </div>
      <EqBars t={t} a={a * (1 - 0.8 * c01((t - p.dim) / 1.0))} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 215, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 34, letterSpacing: 10, color: 'rgba(255,255,255,0.6)', opacity: a}}>ICHKI KUCH</div>
      <div style={{position: 'absolute', left: 0, top: 700, width: 1080, opacity: wo, transform: `translateX(${wx}px)`, whiteSpace: 'nowrap', fontFamily: 'YB', fontWeight: 700, fontSize: 96, letterSpacing: 8, color: 'rgba(255,255,255,0.22)', WebkitTextStroke: '2px rgba(255,255,255,0.5)'}}>ERTAGA · ERTAGA · ERTAGA</div>
    </AbsoluteFill>
  );
};

const GoScene: React.FC<{p: {start: number; go: number; strike: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const a = bnc(c01((t - 0.05) / 0.5));
  const el = Math.max(0, t - p.start) * 1.0; const left = Math.max(0, 120 - el * 10); // tezlashtirilgan hisob
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(Math.floor(left % 60)).padStart(2, '0');
  const pct = left / 120; const goA = bnc(c01((t - p.go) / 0.4)); const flash = t > p.go && t < p.go + 0.18 ? 0.3 : 0;
  const stk = eO(c01((t - p.strike) / 0.35));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(31,214,120,${flash})`}} />
      <div style={{position: 'absolute', left: 540 - 190, top: 250, width: 380, height: 380, transform: `scale(${a})`}}>
        <RingSvg size={380} pct={pct} color={t > p.go ? '#34e08a' : '#ffffff'} w={26} track="rgba(255,255,255,0.18)" />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'YM', fontWeight: 700, fontSize: 104, color: '#fff', textShadow: '0 0 24px rgba(255,255,255,0.6)'}}>{mm}:{ss}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', transform: `scale(${goA})`, opacity: goA > 0 ? 1 : 0}}>
        <span style={{display: 'inline-block', fontFamily: 'YB', fontWeight: 700, fontSize: 64, letterSpacing: 8, color: '#06150d', background: '#34e08a', borderRadius: 999, padding: '8px 54px 12px', boxShadow: '0 0 50px rgba(52,224,138,0.7)'}}>BOSHLANG</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 56, letterSpacing: 10, color: 'rgba(255,255,255,0.75)', opacity: stk > 0 ? 1 : 0, transform: `scale(${0.9 + 0.1 * stk})`}}>
        <span style={{position: 'relative', display: 'inline-block'}}>ERTAGA<span style={{position: 'absolute', left: -10, top: '50%', height: 8, width: `${stk * 110}%`, background: RED2, borderRadius: 4, boxShadow: '0 0 18px rgba(255,77,77,0.8)'}} /></span>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────── #08: Imkoniyat chiptasi (afisha) ─────────────────
const TICKET_PATH = 'M 30 0 H 810 Q 840 0 840 30 V 186 A 38 38 0 0 0 840 262 V 410 Q 840 440 810 440 H 30 Q 0 440 0 410 V 262 A 38 38 0 0 0 0 186 V 30 Q 0 0 30 0 Z';
const TicketScene: React.FC<{p: {stamp: number; fear: number; valid: number}}> = ({p}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const left = Math.max(0, 10 - Math.floor(Math.min(t, p.valid) / 1.3)); const cd = `00:${String(left).padStart(2, '0')}`;
  const st = bnc(c01((t - p.stamp) / 0.3)); const stOut = 1 - c01((t - p.valid) / 0.2);
  const ok = bnc(c01((t - p.valid) / 0.4));
  const afraid = t > p.fear && t < p.valid; const jx = afraid && t < p.fear + 0.6 ? (random(`tj${f}`) - 0.5) * 16 : 0; const jy = afraid && t < p.fear + 0.6 ? (random(`ty${f}`) - 0.5) * 10 : 0;
  const crack = eO(c01((t - p.fear) / 0.35)) * (1 - c01((t - p.valid) / 0.3));
  const glow = t > p.valid ? '0 0 80px rgba(52,224,138,0.7)' : afraid ? '0 0 60px rgba(255,60,60,0.6)' : '0 24px 60px rgba(0,0,0,0.5)';
  const bars = Array.from({length: 34}, (_, i) => 3 + Math.floor(random(`bc${i}`) * 9));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 330, width: 840, height: 440, transform: `translate(${jx}px, ${jy}px) rotate(${-3 + (afraid ? Math.sin(t * 30) * 0.6 : 0)}deg)`, filter: `drop-shadow(${glow === '0 24px 60px rgba(0,0,0,0.5)' ? '0 24px 30px rgba(0,0,0,0.5)' : '0 0 30px ' + (t > p.valid ? 'rgba(52,224,138,0.8)' : 'rgba(255,60,60,0.7)')})`}}>
        <svg width="840" height="440" viewBox="0 0 840 440" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d={TICKET_PATH} fill="#fff7e8" />
          <line x1="620" y1="22" x2="620" y2="418" stroke="#0a0a0a" strokeWidth="4" strokeDasharray="10 12" opacity="0.5" />
          <path d="M 396 0 L 420 90 L 392 150 L 430 230 L 404 300 L 440 380 L 420 440" fill="none" stroke={t > p.valid ? '#34e08a' : '#e11d1d'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} opacity={crack > 0 ? 1 : 0} />
        </svg>
        <div style={{position: 'absolute', left: 44, top: 34, fontFamily: 'YB', fontWeight: 700, fontSize: 28, letterSpacing: 8, color: '#0a0a0a'}}>YUKSALISH · BILET</div>
        <div style={{position: 'absolute', left: 40, top: 92, fontFamily: 'YB', fontWeight: 700, fontSize: 124, letterSpacing: 2, color: '#0a0a0a', lineHeight: 1}}>IMKONIYAT</div>
        <div style={{position: 'absolute', left: 46, top: 236, fontFamily: 'YB', fontWeight: 700, fontSize: 34, letterSpacing: 6, color: '#c2410c'}}>KIRISH: BUGUN</div>
        <div style={{position: 'absolute', left: 46, bottom: 38, display: 'flex', alignItems: 'flex-end', gap: 7, height: 70}}>
          {bars.map((b, i) => <div key={i} style={{width: b, height: 70, background: '#0a0a0a'}} />)}
        </div>
        <div style={{position: 'absolute', left: 640, top: 60, width: 190, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 26, letterSpacing: 6, color: '#0a0a0a'}}>QOLDI</div>
        <div style={{position: 'absolute', left: 632, top: 112, width: 206, textAlign: 'center', fontFamily: 'YM', fontWeight: 700, fontSize: 64, color: t > p.valid ? '#16a34a' : '#e11d1d'}}>{cd}</div>
        <div style={{position: 'absolute', left: 640, bottom: 54, width: 190, textAlign: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 24, letterSpacing: 6, color: '#0a0a0a', opacity: 0.6}}>№ 000713</div>
        <div style={{position: 'absolute', left: -20, right: -20, top: 150, textAlign: 'center', transform: `scale(${0.5 + 0.5 * st}) rotate(-9deg)`, opacity: (st > 0 ? 1 : 0) * stOut}}>
          <span style={{display: 'inline-block', fontFamily: 'YB', fontWeight: 700, fontSize: 70, letterSpacing: 3, color: '#e11d1d', border: '11px solid #e11d1d', borderRadius: 18, padding: '2px 30px 8px', background: 'rgba(255,247,232,0.9)'}}>HALI TAYYOR EMASMAN</span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', transform: `scale(${0.5 + 0.5 * ok}) rotate(-7deg)`, opacity: ok > 0 ? 1 : 0}}>
          <span style={{display: 'inline-block', fontFamily: 'YB', fontWeight: 700, fontSize: 86, letterSpacing: 4, color: '#06150d', border: '11px solid #06150d', borderRadius: 18, padding: '2px 34px 8px', background: '#34e08a'}}>BOSHLANDI ✓</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OVERLAP = 6; // aralash uslub: segmentlar orasidagi crossfade (kadr)

const StyleView: React.FC<{st: StyleName; lines: LineT[]; fps: number; total: number}> = ({st, lines, fps, total}) => (
  <>
    {st === 'kino-oltin' && <Gold lines={lines} fps={fps} />}
    {st === 'split-oyna' && <Split lines={lines} fps={fps} total={total} />}
    {st === 'jurnal' && <Editorial lines={lines} fps={fps} />}
    {st === 'neon' && <Neon lines={lines} fps={fps} />}
    {st === 'minimal-oq' && <Minimal lines={lines} fps={fps} />}
    {st === 'afisha' && <Afisha lines={lines} fps={fps} />}
    {st === 'terminal' && <Terminal lines={lines} fps={fps} />}
    {st === 'shisha' && <Shisha lines={lines} fps={fps} />}
    {st === 'daftar' && <Daftar lines={lines} fps={fps} />}
    {st === 'harakat' && <Harakat lines={lines} fps={fps} />}
  </>
);

export const Sample: React.FC<SampleProps> = ({style, lines, audio, totalSec, scenes}) => {
  useFonts();
  const {fps} = useVideoConfig();
  const norm = (x?: string) => (LEGACY[x as string] ?? x) as StyleName;
  const base = norm(style);
  // Ketma-ket bir xil uslubdagi iboralar bitta segment bo'ladi (har iboraning "style" maydoni bo'lmasa, hammasi `style`da)
  const segs: {st: StyleName; ls: LineT[]}[] = [];
  lines.forEach((l) => {
    const st = norm(l.style) ?? base;
    const last = segs[segs.length - 1];
    if (last && last.st === st) last.ls.push(l); else segs.push({st, ls: [l]});
  });
  const total = Math.round(totalSec * fps);
  return (
    <AbsoluteFill>
      {segs.map((sg, i) => {
        const t0 = i === 0 ? 0 : Math.round(sg.ls[0].start * fps) - OVERLAP;
        const next = segs[i + 1];
        const t1 = next ? Math.round(next.ls[0].start * fps) : total;
        const off = t0 / fps;
        const local = sg.ls.map((l) => ({...l, start: l.start - off}));
        return (
          <Sequence key={i} from={t0} durationInFrames={Math.max(1, t1 - t0)}>
            <SegFade first={i === 0}>
              <StyleView st={sg.st} lines={local} fps={fps} total={totalSec} />
            </SegFade>
          </Sequence>
        );
      })}
      {scenes && <SceneLayer scenes={scenes} fps={fps} />}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};

const SegFade: React.FC<{first: boolean; children: React.ReactNode}> = ({first, children}) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, OVERLAP], [0, 1], clamp);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
