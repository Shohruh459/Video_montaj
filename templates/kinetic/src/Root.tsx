import React from 'react';
import {Composition} from 'remotion';
import {Reel, ReelProps} from './Reel';
import ssenariy1 from './data/ssenariy1.json';
import {Sample, SampleProps} from './Sample';
import sample from './data/sample.json';

const FPS = 30;
export const Root: React.FC = () => (
  <>
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
