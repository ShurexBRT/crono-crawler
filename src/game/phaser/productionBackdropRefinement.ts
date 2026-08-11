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
const platformKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionPlatformPast,
  present: TextureKeys.productionPlatformPresent,
  future: TextureKeys.productionPlatformFuture,
};
const farKeys: Record<TimelineKey, string> = {
  past: TextureKeys.reactorFarPast,
  present: TextureKeys.reactorFarPresent,
  future: TextureKeys.reactorFarFuture,
};
const midKeys: Record<TimelineKey, string> = {
  past: TextureKeys.reactorMidPast,
  present: TextureKeys.reactorMidPresent,
  future: TextureKeys.reactorMidFuture,
};
const productionPlatformKeys = new Set(Object.values(platformKeys));
const productionFarKeys = new Set(Object.values(farKeys));
const productionMidKeys = new Set(Object.values(midKeys));

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
    .setAlpha(0.92);

  const wash = this.add
    .rectangle(this.level.width / 2, 360, this.level.width + 900, 780, washByTimeline[this.timelineManager.current], 0.12)
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
  refinement.wash.setFillStyle(washByTimeline[timeline], timeline === 'present' ? 0.08 : 0.14);

  scene.children.list.forEach((child) => {
    if (!(child instanceof Phaser.GameObjects.Image)) {
      return;
    }
    const textureKey = child.texture.key;

    if (productionFarKeys.has(textureKey)) {
      child.setAlpha(textureKey === farKeys[timeline] ? 0.12 : 0);
      return;
    }

    if (productionMidKeys.has(textureKey)) {
      child.setAlpha(textureKey === midKeys[timeline] ? 0.34 : 0);
      return;
    }

    if (Math.abs(child.depth - 8.6) < 0.05 && productionPlatformKeys.has(textureKey)) {
      child.setTexture(platformKeys[timeline]).setAlpha(0.9);
      return;
    }

    if (textureKey === TextureKeys.platformSheet && Math.abs(child.depth - 8) < 0.05) {
      child.setAlpha(0.08);
    }
  });

  if (!animate) {
    return;
  }

  refinement.matte.setAlpha(0.76);
  scene.tweens.add({
    targets: refinement.matte,
    alpha: 0.92,
    duration: 210,
    ease: 'Quad.easeOut',
  });
}
