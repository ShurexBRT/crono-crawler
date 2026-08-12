import { TextureKeys } from '../assets/manifest';
import { reactorPlatformModuleSvg } from '../assets/reactorPlatformModulesSvg';
import type { PlatformVisualFamily, TimelineKey } from '../types';
import { BootScene } from './scenes/BootScene';

const timelines: TimelineKey[] = ['past', 'present', 'future'];
const families: PlatformVisualFamily[] = ['reactor-heavy', 'reactor-catwalk', 'reactor-gantry', 'reactor-machine'];

const keys: Record<PlatformVisualFamily, Record<TimelineKey, string>> = {
  'reactor-heavy': {
    past: TextureKeys.reactorHeavyPast,
    present: TextureKeys.reactorHeavyPresent,
    future: TextureKeys.reactorHeavyFuture,
  },
  'reactor-catwalk': {
    past: TextureKeys.reactorCatwalkPast,
    present: TextureKeys.reactorCatwalkPresent,
    future: TextureKeys.reactorCatwalkFuture,
  },
  'reactor-gantry': {
    past: TextureKeys.reactorGantryPast,
    present: TextureKeys.reactorGantryPresent,
    future: TextureKeys.reactorGantryFuture,
  },
  'reactor-machine': {
    past: TextureKeys.reactorMachinePast,
    present: TextureKeys.reactorMachinePresent,
    future: TextureKeys.reactorMachineFuture,
  },
};

const proto = BootScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
const previousPreload = proto.preload;

proto.preload = function loadReactorPlatformModules(this: BootScene): void {
  previousPreload.call(this);
  families.forEach((family) => {
    timelines.forEach((timeline) => {
      const source = reactorPlatformModuleSvg(family, timeline);
      this.load.svg(keys[family][timeline], `data:image/svg+xml;base64,${btoa(source)}`, { width: 128, height: 96 });
    });
  });
};
