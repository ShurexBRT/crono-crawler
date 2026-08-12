import Phaser from 'phaser';
import { ReactorEnvironmentRenderer } from '../rendering/ReactorEnvironmentRenderer';
import type { LevelData, TimelineKey } from '../types';
import { GameScene } from './scenes/GameScene';

type RefinedScene = Phaser.Scene & {
  level: LevelData;
  timelineManager: { current: TimelineKey };
  saveManager: { getSettings: () => { reducedMotion: boolean } };
};

const renderers = new WeakMap<Phaser.Scene, ReactorEnvironmentRenderer>();

const proto = GameScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
const previousDrawBackground = proto.drawBackground;
const previousTimelineChanged = proto.onTimelineChanged;

proto.drawBackground = function layeredProductionBackground(this: RefinedScene): void {
  previousDrawBackground.call(this);
  if (this.level.id !== 'tutorial') {
    return;
  }

  renderers.get(this)?.destroy();
  const renderer = new ReactorEnvironmentRenderer(
    this,
    this.level,
    this.timelineManager.current,
    this.saveManager.getSettings().reducedMotion,
  );
  renderers.set(this, renderer);
  this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    renderer.destroy();
    renderers.delete(this);
  });
};

proto.onTimelineChanged = function layeredProductionTimeline(this: RefinedScene, timeline: TimelineKey): void {
  previousTimelineChanged.call(this, timeline);
  if (this.level.id === 'tutorial') {
    renderers.get(this)?.setTimeline(timeline, true);
  }
};
