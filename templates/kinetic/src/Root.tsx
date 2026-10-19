import React from 'react';
import {Composition} from 'remotion';
import {Reel, ReelProps} from './Reel';
import ssenariy1 from './data/ssenariy1.json';
import {Sample, SampleProps} from './Sample';
import sample from './data/sample.json';
import {Mushuk, MushukProps} from './Mushuk';
import mushuk from './data/mushuk.json';
import {Montajchi, MontajchiProps} from './Montajchi';
import montajchi from './data/montajchi.json';
import {Ish, IshProps} from './Ish';
import ish from './data/ish.json';
import {Adashdi, AdashdiProps} from './Adashdi';
import adashdi from './data/adashdi.json';
import {Kids, KidsProps} from './Kids';
import {Kids3D} from './Kids3D';
import {KidsEp, KidsEpProps} from './KidsEp';
import kidsep from './data/kidsep.json';

const FPS = 30;
export const Root: React.FC = () => (
  <>
  <Composition id="KidsEp" component={KidsEp as React.FC<any>} width={1920} height={1080} fps={FPS}
    durationInFrames={Math.round(kidsep.totalSec * FPS)} defaultProps={kidsep as unknown as KidsEpProps}
    calculateMetadata={({props}: {props: any}) => ({durationInFrames: Math.round(props.totalSec * FPS)})} />
  <Composition id="Kids3D" component={Kids3D} width={1920} height={1080} fps={FPS} durationInFrames={90} />
  <Composition id="Kids" component={Kids as React.FC<any>} width={1920} height={1080} fps={FPS} durationInFrames={150} defaultProps={{scene: 'bear'} as KidsProps} />
  <Composition id="Adashdi" component={Adashdi as React.FC<any>} width={1080} height={1920} fps={FPS}
    durationInFrames={Math.round(adashdi.totalSec * FPS)} defaultProps={adashdi as AdashdiProps}
    calculateMetadata={({props}: {props: any}) => ({durationInFrames: Math.round(props.totalSec * FPS)})} />
  <Composition id="Ish" component={Ish as React.FC<any>} width={1080} height={1920} fps={FPS}
    durationInFrames={Math.round(ish.totalSec * FPS)} defaultProps={ish as IshProps}
    calculateMetadata={({props}: {props: any}) => ({durationInFrames: Math.round(props.totalSec * FPS)})} />
  <Composition id="Montajchi" component={Montajchi as React.FC<any>} width={1080} height={1920} fps={FPS}
    durationInFrames={Math.round(montajchi.totalSec * FPS)} defaultProps={montajchi as MontajchiProps}
    calculateMetadata={({props}: {props: any}) => ({durationInFrames: Math.round(props.totalSec * FPS)})} />
  <Composition id="Mushuk" component={Mushuk as React.FC<any>} width={1080} height={1920} fps={FPS}
    durationInFrames={Math.round(mushuk.totalSec * FPS)} defaultProps={mushuk as MushukProps}
    calculateMetadata={({props}: {props: any}) => ({durationInFrames: Math.round(props.totalSec * FPS)})} />
  <Composition id="Sample" component={Sample as React.FC<any>} width={1080} height={1920} fps={FPS}
    durationInFrames={Math.round(sample.totalSec * FPS)} defaultProps={sample as SampleProps}
    calculateMetadata={({props}: {props: any}) => ({durationInFrames: Math.round(props.totalSec * FPS)})} />
  <Composition
    id="Reel"
    component={Reel as React.FC<any>}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={Math.round(ssenariy1.durationSec * FPS)}
    defaultProps={ssenariy1 as ReelProps}
  />
  </>
);
