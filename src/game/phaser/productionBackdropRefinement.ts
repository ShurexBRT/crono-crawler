import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { LevelData, TimelineKey } from '../types';
import { GameScene } from './scenes/GameScene';

type RefinedScene = Phaser.Scene & {
  level: LevelData;
  timelineManager: { current: TimelineKey };
};

type BackdropRefinement = {
  matte: Phaser.GameObjects.Image;
  wash: Phaser.GameObjects.Rectangle;
};

const refinements = new WeakMap<Phaser.Scene, BackdropRefinement>();
const tintByTimeline: Record<TimelineKey, number> = {
  past: 0xf0c27d,
  present: 0xffffff,
  future: 0xc06786,
};
const washByTimeline: Record<TimelineKey, number> = {
  past: 0x7c431a,
  present: 0x103d50,
  future: 0x5a1531,
};

const proto = GameScene.prototype as any;
const previousDrawBackground = proto.drawBackground;
const previousTimelineChanged = proto.onTimelineChanged;

proto.drawBackground = function refinedProductionBackground(this: RefinedScene): void {
  previousDrawBackground.call(this);
  if (this.level.id !== 'tutorial' || !this.textures.exists(TextureKeys.backdropReactor)) {
    return;
  }

  const matte = this.add
    .image(this.level.width / 2, 360, TextureKeys.backdropReactor)
    .setDepth(-29)
    .setScrollFactor(0.16, 0.035)
    .setDisplaySize(Math.max(this.level.width + 900, 2200), 780)
    .setAlpha(0.88);

  const wash = this.add
    .rectangle(this.level.width / 2, 360, this.level.width + 900, 780, washByTimeline[this.timelineManager.current], 0.13)
    .setDepth(-28)
    .setScrollFactor(0.16, 0.035)
    .setBlendMode(Phaser.BlendModes.MULTIPLY);

  refinements.set(this, { matte, wash });
  applyBackdropTimeline(this, this.timelineManager.current, false);
};

proto.onTimelineChanged = function refinedProductionTimeline(this: RefinedScene, timeline: TimelineKey): void {
  previousTimelineChanged.call(this, timeline);
  if (this.level.id === 'tutorial') {
    applyBackdropTimeline(this, timeline, true);
  }
};

function applyBackdropTimeline(scene: RefinedScene, timeline: TimelineKey, animate: boolean): void {
  const refinement = refinements.get(scene);
  if (!refinement) {
    return;
  }

  refinement.matte.setTint(tintByTimeline[timeline]);
  refinement.wash.setFillStyle(washByTimeline[timeline], timeline === 'present' ? 0.1 : 0.16);

  if (!animate) {
    return;
  }

  refinement.matte.setAlpha(0.7);
  scene.tweens.add({
    targets: refinement.matte,
    alpha: 0.88,
    duration: 210,
    ease: 'Quad.easeOut',
  });
}
