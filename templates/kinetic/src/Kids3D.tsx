import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';

// 3D sinov: sferalardan yig'ilgan "Benny" (toon material + kontur), to'liq kod bilan animatsiya.
const Toon: React.FC<{color: string}> = ({color}) => <meshToonMaterial color={color} />;
const Ball: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; outline?: boolean}> = ({p, s, c, outline = true}) => (
  <group position={p}>
    <mesh scale={s}><sphereGeometry args={[1, 40, 32]} /><Toon color={c} /></mesh>
    {outline && <mesh scale={s.map((v) => v * 1.045) as [number, number, number]}><sphereGeometry args={[1, 40, 32]} /><meshBasicMaterial color="#3a2012" side={THREE.BackSide} /></mesh>}
  </group>
);

const Bear3D: React.FC<{t: number}> = ({t}) => {
  const bob = Math.sin(t * 3) * 0.04; const wave = Math.sin(t * 9) * 0.35;
  return (
    <group position={[0, bob, 0]} rotation={[0, Math.sin(t * 1.3) * 0.35, 0]}>
      <Ball p={[0, 0.9, 0]} s={[1.15, 1.25, 1.0]} c="#a8683a" />
      <Ball p={[0, 0.85, 0.55]} s={[0.78, 0.9, 0.5]} c="#f1d3a4" outline={false} />
      <group position={[0, 2.35, 0]} rotation={[0, 0, Math.sin(t * 2) * 0.05]}>
        <Ball p={[0, 0, 0]} s={[1.0, 0.95, 0.95]} c="#b9733f" />
        <Ball p={[-0.78, 0.78, 0]} s={[0.36, 0.36, 0.25]} c="#a8683a" /><Ball p={[0.78, 0.78, 0]} s={[0.36, 0.36, 0.25]} c="#a8683a" />
        <Ball p={[0, -0.22, 0.72]} s={[0.5, 0.4, 0.34]} c="#f5d9b2" outline={false} />
        <Ball p={[0, -0.05, 1.0]} s={[0.17, 0.12, 0.12]} c="#2d1a10" outline={false} />
        <Ball p={[-0.36, 0.14, 0.8]} s={[0.15, 0.2, 0.1]} c="#1d1209" outline={false} /><Ball p={[0.36, 0.14, 0.8]} s={[0.15, 0.2, 0.1]} c="#1d1209" outline={false} />
        <Ball p={[-0.33, 0.2, 0.9]} s={[0.05, 0.06, 0.04]} c="#ffffff" outline={false} /><Ball p={[0.39, 0.2, 0.9]} s={[0.05, 0.06, 0.04]} c="#ffffff" outline={false} />
        <Ball p={[-0.62, -0.12, 0.7]} s={[0.17, 0.11, 0.06]} c="#ff8a96" outline={false} /><Ball p={[0.62, -0.12, 0.7]} s={[0.17, 0.11, 0.06]} c="#ff8a96" outline={false} />
      </group>
      <group position={[1.1, 1.7, 0]} rotation={[0, 0, -2.4 + wave]}><Ball p={[0, -0.55, 0]} s={[0.32, 0.62, 0.32]} c="#a8683a" /></group>
      <group position={[-1.1, 1.7, 0]} rotation={[0, 0, 0.35]}><Ball p={[0, -0.55, 0]} s={[0.32, 0.62, 0.32]} c="#a8683a" /></group>
      <Ball p={[-0.5, 0.1, 0.3]} s={[0.42, 0.28, 0.5]} c="#8a4f28" /><Ball p={[0.5, 0.1, 0.3]} s={[0.42, 0.28, 0.5]} c="#8a4f28" />
    </group>
  );
};

export const Kids3D: React.FC = () => {
  const f = useCurrentFrame(); const {width, height, fps} = useVideoConfig(); const t = f / fps;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#6cc6ff,#d8f3ff)'}}>
      <ThreeCanvas width={width} height={height} camera={{position: [0, 1.2, 9.5], fov: 38}} gl={{antialias: true, alpha: true}} style={{background: 'transparent'}}>
        <ambientLight intensity={1.1} /><directionalLight position={[3, 6, 5]} intensity={2.2} />
        <group position={[0, -1.7, 0]}><mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[8, 64]} /><meshToonMaterial color="#6cc95a" /></mesh>
        <Bear3D t={t} /></group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
