import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';

export type MKind = 'title' | 'place' | 'bubble' | 'text' | 'hearts' | 'end';
export type Sticker = {kind: MKind; t: number; dur: number; text?: string; sub?: string; y?: number; x?: number};
export type MushukProps = {totalSec: number; audio: string; video: string; zooms: {t: number; to: number}[]; stickers: Sticker[]; phone: string; place: string; endAt: number};

const YEL = '#FFD84D', PINK = '#FF6FA3', BROWN = '#3A2412', CREAM = '#FFF4DC';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const eO = (x: number) => 1 - Math.pow(1 - x, 3);
// "boing" tipidagi sakrash: 0 -> ~1.18 -> 1
const bounce = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3) * Math.cos(x * Math.PI * 3.2));

const outline = (w: number, c = BROWN) => [[-w, 0], [w, 0], [0, -w], [0, w], [-w, -w], [w, w], [-w, w], [w, -w]].map(([x, y]) => `${x}px ${y}px 0 ${c}`).join(', ');

const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    new FontFace('YB', `url(${staticFile('font-bold.ttf')})`, {weight: '700'}).load().then((f) => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

const Heart: React.FC<{size: number; color?: string}> = ({size, color = PINK}) => (
  <svg width={size} height={size} viewBox="0 0 32 29" style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))'}}>
    <path d="M23.6 0c-3.4 0-5.7 2-7.6 4.2C14.1 2 11.8 0 8.4 0 3.7 0 0 3.7 0 8.4c0 9.2 9.6 14.1 16 20.6 6.4-6.5 16-11.4 16-20.6C32 3.7 28.3 0 23.6 0z" fill={color} stroke="#fff" strokeWidth="1.4" />
  </svg>
);
const Paw: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <ellipse cx="32" cy="42" rx="16" ry="13" fill={color} /><ellipse cx="13" cy="26" rx="7" ry="9" fill={color} /><ellipse cx="27" cy="14" rx="7" ry="9" fill={color} /><ellipse cx="41" cy="14" rx="7" ry="9" fill={color} /><ellipse cx="55" cy="26" rx="7" ry="9" fill={color} />
  </svg>
);
const Star: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 0l2.6 8.4L24 12l-9.4 3.6L12 24l-2.6-8.4L0 12l9.4-3.6z" fill={color} /></svg>
);

// yuqoriga ko'tariluvchi yuraklar
const HeartsBurst: React.FC<{n: number; seed: string; dur: number}> = ({n, seed, dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  return (
    <AbsoluteFill>
      {Array.from({length: n}, (_, i) => {
        const d0 = random(`${seed}d${i}`) * 0.7; const life = 1.8 + random(`${seed}l${i}`) * 0.8; const a = c01((t - d0) / life);
        if (a <= 0 || a >= 1) return null;
        const x = 120 + random(`${seed}x${i}`) * 840 + Math.sin(a * 9 + i) * 40; const y = 1500 - a * 1050; const sz = 50 + random(`${seed}s${i}`) * 70;
        return <div key={i} style={{position: 'absolute', left: x, top: y, opacity: a < 0.1 ? a * 10 : 1 - Math.max(0, a - 0.65) / 0.35, transform: `scale(${eO(c01(a * 6))}) rotate(${Math.sin(a * 6 + i) * 14}deg)`}}><Heart size={sz} color={i % 3 === 0 ? '#fff' : PINK} /></div>;
      })}
    </AbsoluteFill>
  );
};

const Sparks: React.FC<{seed: string; cx: number; cy: number; r: number}> = ({seed, cx, cy, r}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  return (
    <>{Array.from({length: 9}, (_, i) => {
      const ang = (i / 9) * Math.PI * 2 + random(`${seed}a${i}`); const a = c01((t - 0.1) / 0.9); const rr = r * (0.7 + 0.5 * random(`${seed}r${i}`)) * (0.6 + 0.6 * eO(a));
      return <div key={i} style={{position: 'absolute', left: cx + Math.cos(ang) * rr - 20, top: cy + Math.sin(ang) * rr - 20, opacity: Math.sin(Math.PI * c01(a)) * (0.5 + 0.5 * Math.sin(t * 14 + i)), transform: `scale(${0.6 + 0.6 * random(`${seed}z${i}`)}) rotate(${t * 90}deg)`}}><Star size={40} color={i % 2 ? YEL : '#fff'} /></div>;
    })}</>
  );
};

const TitleSticker: React.FC<{s: Sticker}> = ({s}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const k = bounce(c01(t / 0.55)); const out = interpolate(f, [s.dur * fps - 8, s.dur * fps], [1, 0], clamp);
  const wob = Math.sin(t * 5) * 1.6; const lines = (s.text ?? '').split('|');
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Sparks seed="title" cx={540} cy={s.y ?? 400} r={470} />
      <div style={{position: 'absolute', left: 0, right: 0, top: (s.y ?? 400) - 170, textAlign: 'center', transform: `scale(${k}) rotate(${-4 + wob}deg)`}}>
        {lines.map((ln, i) => (
          <div key={i} style={{fontFamily: 'YB', fontWeight: 700, fontSize: i === 0 ? 150 : 128, lineHeight: 1.02, color: i === 0 ? YEL : '#fff', textShadow: `${outline(8)}, 0 14px 0 ${BROWN}, 0 22px 30px rgba(0,0,0,0.5)`, letterSpacing: 2}}>{ln}</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 90, top: (s.y ?? 400) + 150, transform: `scale(${k}) rotate(-14deg)`}}><Paw size={86} /></div>
      <div style={{position: 'absolute', right: 90, top: (s.y ?? 400) - 260, transform: `scale(${k}) rotate(16deg)`}}><Paw size={72} color={YEL} /></div>
    </AbsoluteFill>
  );
};

const PlaceSticker: React.FC<{s: Sticker}> = ({s}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const x = (1 - eO(c01(t / 0.45))) * -900; const out = interpolate(f, [s.dur * fps - 8, s.dur * fps], [1, 0], clamp);
  const pulse = 1 + 0.025 * Math.sin(t * 8);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', left: 80, top: s.y ?? 420, transform: `translateX(${x}px) scale(${pulse})`, display: 'flex', alignItems: 'center', gap: 28, padding: '28px 54px 28px 36px', borderRadius: 100, background: PINK, border: '8px solid #fff', boxShadow: '0 14px 0 rgba(58,36,18,0.9), 0 24px 40px rgba(0,0,0,0.4)'}}>
        <svg width="84" height="104" viewBox="0 0 24 30"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20 12 30 12 30s12-10 12-18.3C24 5.2 18.6 0 12 0z" fill="#fff" /><circle cx="12" cy="11.5" r="4.6" fill={PINK} /></svg>
        <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 70, color: '#fff', letterSpacing: 1, textShadow: `0 4px 0 ${BROWN}`}}>{s.text}</div>
      </div>
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{s: Sticker}> = ({s}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const k = bounce(c01(t / 0.5)); const out = interpolate(f, [s.dur * fps - 8, s.dur * fps], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', left: s.x ?? 120, right: 120, top: s.y ?? 330, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 4) * 1.5}deg)`}}>
        <div style={{position: 'relative', background: '#fff', borderRadius: 70, padding: '44px 60px', border: `8px solid ${BROWN}`, boxShadow: '0 16px 0 rgba(58,36,18,0.85), 0 28px 40px rgba(0,0,0,0.35)', fontFamily: 'YB', fontWeight: 700, fontSize: Number(s.sub ?? 92), lineHeight: 1.08, textAlign: 'center', color: BROWN}}>
          {s.text}
          <div style={{position: 'absolute', left: 120, bottom: -52, width: 0, height: 0, borderLeft: '40px solid transparent', borderRight: '40px solid transparent', borderTop: `60px solid ${BROWN}`, transform: 'rotate(8deg)'}} />
          <div style={{position: 'absolute', left: 128, bottom: -38, width: 0, height: 0, borderLeft: '32px solid transparent', borderRight: '32px solid transparent', borderTop: '48px solid #fff', transform: 'rotate(8deg)'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BigText: React.FC<{s: Sticker}> = ({s}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const out = interpolate(f, [s.dur * fps - 8, s.dur * fps], [1, 0], clamp); const lines = (s.text ?? '').split('|');
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: s.y ?? 360, textAlign: 'center'}}>
        {lines.map((ln, li) => (
          <div key={li} style={{display: 'flex', justifyContent: 'center', fontFamily: 'YB', fontWeight: 700, fontSize: 104, lineHeight: 1.06, marginBottom: 6}}>
            {ln.split('').map((ch, i) => {
              const d = (li * 9 + i) * 0.035; const k = bounce(c01((t - d) / 0.4));
              return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', transform: `translateY(${(1 - k) * -90}px) scale(${0.3 + 0.7 * k}) rotate(${(1 - k) * 12}deg)`, opacity: c01((t - d) / 0.12), color: li === 0 ? '#fff' : YEL, textShadow: `${outline(7)}, 0 12px 0 ${BROWN}`}}>{ch}</span>;
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{s: Sticker; phone: string; place: string}> = ({s, phone, place}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const appear = c01(t / 0.35); const card = bounce(c01((t - 0.15) / 0.55));
  const ringing = (t > 0.3 && t < 1.95) || (t > 2.1 && t < 3.7);   // telefon SFX jiringlashiga mos titrash
  const shake = ringing ? Math.sin(t * 60) * 9 : 0;
  const pulse = 1 + 0.03 * Math.sin(t * 7);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(20,10,5,${0.6 * appear})`}} />
      <HeartsBurst n={26} seed="end" dur={s.dur} />
      {[0, 1, 2].map((i) => { const a = ((t * 0.8 + i / 3) % 1); return <div key={i} style={{position: 'absolute', left: 540 - 330, top: 760 - 330, width: 660, height: 660, borderRadius: 330, border: `8px solid ${YEL}`, opacity: (1 - a) * 0.55 * appear, transform: `scale(${0.55 + a * 0.9})`}} />; })}
      <div style={{position: 'absolute', left: 86, right: 86, top: 380, transform: `scale(${card})`, opacity: appear, textAlign: 'center'}}>
        <div style={{display: 'inline-block', transform: `rotate(${shake}deg)`}}>
          <svg width="170" height="170" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill={YEL} /><path d="M7.2 5.2c.5-.5 1.3-.5 1.8 0l1.4 1.8c.4.5.4 1.2 0 1.7l-.9.9c.9 1.8 2.3 3.2 4.1 4.1l.9-.9c.5-.4 1.2-.4 1.7 0l1.8 1.4c.5.5.5 1.3 0 1.8l-1 1c-1 1-2.6 1.2-4.3.6C10.700 16 8 13.300 6.200 9.800c-.6-1.700-.4-3.300.6-4.300z" fill={BROWN} /></svg>
        </div>
        <div style={{fontFamily: 'YB', fontWeight: 700, fontSize: 64, letterSpacing: 6, color: '#fff', textShadow: `${outline(5)}`, marginTop: 16}}>ALOQA UCHUN</div>
        <div style={{marginTop: 26, display: 'inline-block', transform: `scale(${pulse})`, background: YEL, border: `10px solid ${BROWN}`, borderRadius: 56, padding: '26px 34px', boxShadow: '0 18px 0 rgba(58,36,18,0.9), 0 30px 50px rgba(0,0,0,0.45)', fontFamily: 'YB', fontWeight: 700, fontSize: 74, color: BROWN, letterSpacing: 0, whiteSpace: 'nowrap'}}>{phone}</div>
        <div style={{marginTop: 46, fontFamily: 'YB', fontWeight: 700, fontSize: 70, color: '#fff', textShadow: outline(5)}}>{place}</div>
        <div style={{marginTop: 30, fontFamily: 'YB', fontWeight: 700, fontSize: 60, color: YEL, textShadow: outline(5), opacity: 0.7 + 0.3 * Math.sin(t * 6)}}>QOʻNGʻIROQ QILING!</div>
      </div>
    </AbsoluteFill>
  );
};

export const Mushuk: React.FC<MushukProps> = ({totalSec, audio, video, zooms, stickers, phone, place, endAt}) => {
  useFonts();
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  // zarba (punch) zoomlari: tez kattalashib, sekin qaytadi
  let z = 1.04 + 0.02 * Math.sin(t * 0.6);
  zooms.forEach((zm) => { const a = t - zm.t; if (a >= 0 && a < 1.1) z += (zm.to - 1.04) * (a < 0.12 ? eO(a / 0.12) : 1 - eO((a - 0.12) / 0.98)); });
  const endA = c01((t - endAt) / 0.5);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, filter: `brightness(${1 - 0.35 * endA}) blur(${endA * 6}px)`}}>
        <OffthreadVideo src={staticFile(video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,200,120,0.10), rgba(0,0,0,0) 55%, rgba(30,10,0,0.45) 100%)', mixBlendMode: 'normal'}} />
      {stickers.map((s, i) => {
        const dur = Math.round(s.dur * fps);
        return (
          <Sequence key={i} from={Math.round(s.t * fps)} durationInFrames={dur}>
            {s.kind === 'title' && <TitleSticker s={s} />}
            {s.kind === 'place' && <PlaceSticker s={{...s, text: s.text ?? place}} />}
            {s.kind === 'bubble' && <Bubble s={s} />}
            {s.kind === 'text' && <BigText s={s} />}
            {s.kind === 'hearts' && <HeartsBurst n={s.x ?? 14} seed={`h${i}`} dur={s.dur} />}
            {s.kind === 'end' && <EndCard s={s} phone={phone} place={place} />}
          </Sequence>
        );
      })}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
