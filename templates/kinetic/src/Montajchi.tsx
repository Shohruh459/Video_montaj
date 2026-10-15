import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';

export type MStyle = 'kino-oltin' | 'neon' | 'jurnal';
export type MSeg = {style: MStyle; name: string; src0: number; dur: number; t0: number; punch: number};
export type MAnn = {t: number; dur: number; n: number; name: string; style: MStyle; src0: number};
export type MontajchiProps = {
  totalSec: number; audio: string; video: string; introDur: number; ctaAt: number;
  segs: MSeg[]; anns: MAnn[]; shots: {t: number; p: number}[]; brand: string; ctaLines: string[];
};

const PH = 740; // panel balandligi
const TOP_Y = 140, BOT_Y = 920;
const GOLD = '#F2B84B', NEON1 = '#19E6FF', NEON2 = '#FF2E9A', RED = '#E8353D';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const eO = (x: number) => 1 - Math.pow(1 - x, 3);
const bnc = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3) * Math.cos(x * Math.PI * 3.2));

const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all([
      new FontFace('YB', `url(${staticFile('font-bold.ttf')})`, {weight: '700'}).load(),
      new FontFace('YS', `url(${staticFile('font-serif-bold.ttf')})`, {weight: '700'}).load(),
      new FontFace('YR', `url(${staticFile('font-regular.ttf')})`, {weight: '400'}).load(),
    ]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

const posAt = (shots: {t: number; p: number}[], t: number) => {
  let p = shots[0].p;
  for (const s of shots) if (t >= s.t) p = s.p;
  return p;
};

// Video: manba 1080x1920, panel PH balandlikda ko'rinadi
const Vid: React.FC<{video: string; src0: number; shots: {t: number; p: number}[]; zoom?: number; filter?: string; extra?: React.CSSProperties}> = ({video, src0, shots, zoom = 1, filter, extra}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = src0 + f / fps; const p = posAt(shots, t);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...extra}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `50% ${20 + p * 60}%`, filter}}>
        <OffthreadVideo src={staticFile(video)} startFrom={Math.round(src0 * fps)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${p * 100}%`}} />
      </div>
    </div>
  );
};

// montaj "punch-in": har punch soniyada keskin yaqinlashish/qaytish
const punchZoom = (t: number, period: number, amp: number) => {
  const k = Math.floor(t / period); const within = (t - k * period) / period;
  const base = k % 2 === 1 ? 1 + amp : 1;
  return base + within * 0.05; // sekin siljish
};

const Chip: React.FC<{title: string; sub: string; color: string; fg?: string; dot?: boolean}> = ({title, sub, color, fg = '#000', dot}) => (
  <div style={{position: 'absolute', left: 22, top: 22, background: color, color: fg, padding: '10px 20px 12px', borderRadius: 12, fontFamily: 'YB', boxShadow: '0 6px 18px rgba(0,0,0,0.45)'}}>
    <div style={{fontSize: 38, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1.05}}>
      {dot && <span style={{width: 16, height: 16, borderRadius: 8, background: RED, display: 'inline-block'}} />}{title}
    </div>
    <div style={{fontSize: 25, opacity: 0.85, fontFamily: 'YR', marginTop: 2}}>{sub}</div>
  </div>
);

const Progress: React.FC<{color: string; dur: number}> = ({color, dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return <div style={{position: 'absolute', left: 0, bottom: 0, height: 8, width: `${c01(f / (dur * fps)) * 100}%`, background: color, boxShadow: `0 0 14px ${color}`}} />;
};

// ---- uslublar (yuqori panel) ----
const StyledPanel: React.FC<{seg: {style: MStyle; name: string; src0: number; dur: number; punch: number}; video: string; shots: {t: number; p: number}[]; n: number; frozen?: boolean}> = ({seg, video, shots, n, frozen}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = seg.src0 + f / fps;
  const zoom = punchZoom(f / fps, seg.punch, 0.14);
  const sincePunch = (f / fps) % seg.punch;
  if (seg.style === 'kino-oltin') {
    return (
      <AbsoluteFill>
        <Vid video={video} src0={seg.src0} shots={shots} zoom={1.04 + (zoom - 1) * 0.8} filter="sepia(0.28) saturate(1.15) contrast(1.12) brightness(0.96)" />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(242,184,75,0.18), rgba(120,50,10,0.22))', mixBlendMode: 'soft-light'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 62, background: '#000'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 62, background: '#000'}} />
        <div style={{position: 'absolute', left: 40, right: 40, bottom: 80, height: 3, background: GOLD, opacity: 0.8, transform: `scaleX(${eO(c01(f / 20))})`, transformOrigin: 'left'}} />
        <div style={{position: 'absolute', right: 44, bottom: 92, fontFamily: 'YS', fontSize: 34, color: GOLD, letterSpacing: 4, opacity: 0.9}}>INTERVYU</div>
        {!frozen && <Progress color={GOLD} dur={seg.dur} />}
        <AbsoluteFill style={{opacity: 0.05 + 0.05 * random(`fl${Math.floor(f / 2)}`), background: '#fff'}} />
      </AbsoluteFill>
    );
  }
  if (seg.style === 'neon') {
    const split = sincePunch < 0.2 ? (1 - sincePunch / 0.2) * 9 : 0;
    const flt = `saturate(1.45) contrast(1.15) brightness(1.02) hue-rotate(-6deg)${split > 0.3 ? ` drop-shadow(${split}px 0 0 rgba(255,30,120,0.55)) drop-shadow(${-split}px 0 0 rgba(0,240,255,0.55))` : ''}`;
    const glow = 0.7 + 0.3 * Math.sin(f / 5);
    return (
      <AbsoluteFill>
        <Vid video={video} src0={seg.src0} shots={shots} zoom={zoom} filter={flt} />
        <AbsoluteFill style={{background: `linear-gradient(135deg, rgba(25,230,255,0.22), rgba(255,46,154,0.22))`, mixBlendMode: 'screen'}} />
        <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
        <AbsoluteFill style={{boxShadow: `inset 0 0 0 5px ${NEON1}, inset 0 0 36px 4px rgba(25,230,255,${0.7 * glow}), inset 0 0 90px 10px rgba(255,46,154,${0.45 * glow})`}} />
        <div style={{position: 'absolute', right: 26, bottom: 30, fontFamily: 'YB', fontSize: 34, color: '#fff', textShadow: `0 0 14px ${NEON1}, 0 0 28px ${NEON2}`, letterSpacing: 3}}>● REC</div>
        {sincePunch < 0.12 && <AbsoluteFill style={{background: 'rgba(255,255,255,0.18)'}} />}
        {!frozen && <Progress color={NEON2} dur={seg.dur} />}
      </AbsoluteFill>
    );
  }
  // jurnal
  return (
    <AbsoluteFill style={{background: '#f2eee4'}}>
      <div style={{position: 'absolute', inset: 16, overflow: 'hidden'}}>
        <Vid video={video} src0={seg.src0} shots={shots} zoom={zoom} filter="grayscale(0.88) contrast(1.18) brightness(1.04)" />
        <AbsoluteFill style={{background: RED, mixBlendMode: 'multiply', opacity: 0.12}} />
        <div style={{position: 'absolute', left: 0, bottom: 0, right: 0, height: 110, background: 'linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0))'}} />
        <div style={{position: 'absolute', left: 26, bottom: 22, display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 12, height: 52, background: RED}} />
          <div style={{fontFamily: 'YS', fontSize: 46, color: '#fff', letterSpacing: 2}}>INTERVYU</div>
        </div>
        <div style={{position: 'absolute', right: 26, bottom: 30, fontFamily: 'YR', fontSize: 28, color: '#fff', opacity: 0.9}}>№ {String(n).padStart(2, '0')}</div>
      </div>
      {!frozen && <Progress color={RED} dur={seg.dur} />}
    </AbsoluteFill>
  );
};

const STYLE_CHIP: Record<MStyle, {bg: string; fg: string}> = {'kino-oltin': {bg: GOLD, fg: '#1a0f00'}, neon: {bg: NEON1, fg: '#00131a'}, jurnal: {bg: '#fff', fg: '#111'}};

// ---- umumiy qismlar ----
const Header: React.FC<{show: number}> = ({show}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontFamily: 'YB', opacity: show}}>
    <div style={{fontSize: 54, color: '#fff', letterSpacing: 2}}>MONTAJGA BAHO BERING <span style={{color: GOLD}}>★★★★★</span></div>
  </div>
);

const Footer: React.FC<{brand: string; show: number}> = ({brand, show}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1672, textAlign: 'center', fontFamily: 'YB', opacity: show}}>
    <div style={{fontSize: 34, color: '#9fb0c8', fontFamily: 'YR'}}>AI montajchi</div>
    <div style={{fontSize: 46, color: '#fff', letterSpacing: 3, marginTop: 4}}>{brand}</div>
  </div>
);

const Intro: React.FC<{dur: number; brand: string}> = ({dur, brand}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const words = ['MONTAJGA', 'BAHO', 'BERING'];
  const out = interpolate(f, [(dur - 0.25) * fps, dur * fps], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', fontFamily: 'YB'}}>
        {words.map((w, i) => (
          <div key={w} style={{fontSize: i === 0 ? 150 : 190, lineHeight: 1.05, color: i === 1 ? GOLD : '#fff', transform: `scale(${bnc(c01((t - 0.15 - i * 0.28) / 0.55))})`, opacity: t > 0.15 + i * 0.28 ? 1 : 0, letterSpacing: 2}}>{w}</div>
        ))}
        <div style={{marginTop: 40, fontSize: 110, color: GOLD, letterSpacing: 10}}>
          {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{display: 'inline-block', transform: `scale(${bnc(c01((t - 1.1 - i * 0.12) / 0.4))})`}}>★</span>)}
        </div>
        <div style={{marginTop: 50, fontSize: 40, color: '#9fb0c8', fontFamily: 'YR'}}>AI montajchi · {brand}</div>
      </div>
    </AbsoluteFill>
  );
};

const AnnCard: React.FC<{a: MAnn}> = ({a}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const chip = STYLE_CHIP[a.style];
  const sc = bnc(c01(t / 0.5));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)'}}>
      <div style={{textAlign: 'center', fontFamily: 'YB', transform: `scale(${sc})`}}>
        <div style={{display: 'inline-block', fontSize: 190, lineHeight: 1, color: chip.bg, textShadow: '0 6px 24px rgba(0,0,0,0.6)'}}>{a.n}</div>
        <div style={{fontSize: 70, color: '#fff', marginTop: 4}}>-uslubda shunday</div>
        <div style={{fontSize: 70, color: '#fff'}}>ko‘rinadi</div>
        <div style={{marginTop: 20, display: 'inline-block', background: chip.bg, color: chip.fg, fontSize: 44, padding: '8px 26px', borderRadius: 12, letterSpacing: 3}}>{a.name.toUpperCase()}</div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{lines: string[]; brand: string; dur: number}> = ({lines, brand, dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const bg = eO(c01(t / 0.5));
  return (
    <AbsoluteFill style={{background: `rgba(7,10,18,${0.93 * bg})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', fontFamily: 'YB', padding: '0 70px'}}>
        {lines.map((l, i) => {
          const a = eO(c01((t - 0.35 - i * 0.45) / 0.45));
          const hi = i === lines.length - 1;
          return <div key={i} style={{fontSize: hi ? 82 : 70, lineHeight: 1.18, color: hi ? GOLD : '#fff', opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>{l}</div>;
        })}
        <div style={{marginTop: 70, opacity: eO(c01((t - 0.35 - lines.length * 0.45) / 0.5))}}>
          <div style={{fontSize: 36, color: '#9fb0c8', fontFamily: 'YR'}}>AI montajchi</div>
          <div style={{fontSize: 60, color: '#fff', letterSpacing: 4, marginTop: 6}}>{brand}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Montajchi: React.FC<MontajchiProps> = (p) => {
  useFonts();
  const {fps} = useVideoConfig(); const f = useCurrentFrame(); const t = f / fps;
  const fr = (s: number) => Math.round(s * fps);
  const showUI = interpolate(t, [p.introDur - 0.1, p.introDur + 0.3], [0, 1], clamp);
  const last = p.segs[p.segs.length - 1];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1b2740 0%, #0a0e18 70%)', overflow: 'hidden'}}>
      <Header show={showUI} />
      <Footer brand={p.brand} show={showUI} />

      {/* ikkita panel */}
      <div style={{position: 'absolute', left: 0, top: TOP_Y, width: 1080, height: PH, overflow: 'hidden', opacity: showUI, boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>
        {p.segs.map((s, i) => (
          <Sequence key={`t${i}`} from={fr(s.t0)} durationInFrames={fr(s.dur)} layout="none">
            <AbsoluteFill><StyledPanel seg={s} video={p.video} shots={p.shots} n={i + 1} />
              <Chip title={`${i + 1}-USLUB · ${s.name.toUpperCase()}`} sub="montaj qilingan holati" color={STYLE_CHIP[s.style].bg} fg={STYLE_CHIP[s.style].fg} />
            </AbsoluteFill>
          </Sequence>
        ))}
        {p.anns.map((a, i) => (
          <Sequence key={`a${i}`} from={fr(a.t)} durationInFrames={fr(a.dur)} layout="none">
            <AbsoluteFill>
              <Freeze frame={0}><StyledPanel seg={{style: a.style, name: a.name, src0: a.src0, dur: 1, punch: 2.4}} video={p.video} shots={p.shots} n={i + 2} frozen /></Freeze>
              <AnnCard a={a} />
            </AbsoluteFill>
          </Sequence>
        ))}
        {/* oxirgi uslub tugagach CTA gacha qotib turadi */}
        <Sequence from={fr(last.t0 + last.dur)} durationInFrames={fr(p.totalSec - last.t0 - last.dur)} layout="none">
          <AbsoluteFill><Freeze frame={0}><StyledPanel seg={{...last, src0: last.src0 + last.dur - 0.05, dur: 1}} video={p.video} shots={p.shots} n={p.segs.length} frozen /></Freeze></AbsoluteFill>
        </Sequence>
      </div>

      <div style={{position: 'absolute', left: 0, top: BOT_Y, width: 1080, height: PH, overflow: 'hidden', opacity: showUI, boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>
        {p.segs.map((s, i) => (
          <React.Fragment key={`b${i}`}>
            <Sequence from={fr(s.t0)} durationInFrames={fr(s.dur)} layout="none">
              <Vid video={p.video} src0={s.src0} shots={p.shots} />
            </Sequence>
            {/* uslub e'loni paytida pastki video oxirgi kadrda qotadi */}
            {i < p.anns.length && (
              <Sequence from={fr(s.t0 + s.dur)} durationInFrames={fr(p.anns[i].dur)} layout="none">
                <Freeze frame={0}><Vid video={p.video} src0={s.src0 + s.dur - 0.05} shots={p.shots} /></Freeze>
              </Sequence>
            )}
          </React.Fragment>
        ))}
        <Sequence from={fr(last.t0 + last.dur)} durationInFrames={fr(p.totalSec - last.t0 - last.dur)} layout="none">
          <Freeze frame={0}><Vid video={p.video} src0={last.src0 + last.dur - 0.05} shots={p.shots} /></Freeze>
        </Sequence>
        <Chip title="HAQIQIY VIDEO" sub="montajsiz, asl holati" color="#fff" fg="#111" dot />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: TOP_Y + PH, height: BOT_Y - TOP_Y - PH, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: showUI}}>
        <div style={{fontFamily: 'YB', fontSize: 28, color: '#9fb0c8', letterSpacing: 6}}>▲ MONTAJ  ·  ASL ▼</div>
      </div>

      <Sequence from={0} durationInFrames={fr(p.introDur)}><Intro dur={p.introDur} brand={p.brand} /></Sequence>
      <Sequence from={fr(p.ctaAt)} durationInFrames={fr(p.totalSec - p.ctaAt)}><Cta lines={p.ctaLines} brand={p.brand} dur={p.totalSec - p.ctaAt} /></Sequence>
      <Audio src={staticFile(p.audio)} />
    </AbsoluteFill>
  );
};
