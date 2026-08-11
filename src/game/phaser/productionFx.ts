import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { TimelineKey } from '../types';
import { GhostClone } from '../entities/GhostClone';
import { GameScene } from './scenes/GameScene';

const timelineColors: Record<TimelineKey, number> = {
  past: 0xf0a64d,
  present: 0x6ee7f2,
  future: 0xe0618a,
};

type FxGameScene = Phaser.Scene & {
  player: { sprite: Phaser.Physics.Arcade.Sprite };
  saveManager: { getSettings: () => { reducedMotion: boolean } };
};

type FxGhost = {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  elapsed: number;
  lastTrailAt: number;
  hasEliasAnimations: boolean;
};

patchTimelineFx();
patchEchoFx();

function patchTimelineFx(): void {
  const proto = GameScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;

  proto.emitTimelinePulse = function productionTimelinePulse(this: FxGameScene, timeline: TimelineKey): void {
    const settings = this.saveManager.getSettings();
    const color = timelineColors[timeline];
    const sprite = this.player.sprite;

    const afterimage = this.add.image(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
    afterimage
      .setDepth(20.5)
      .setFlipX(sprite.flipX)
      .setScale(sprite.scaleX, sprite.scaleY)
      .setTint(color)
      .setAlpha(settings.reducedMotion ? 0.18 : 0.34)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: afterimage,
      alpha: 0,
      scaleX: sprite.scaleX * 1.06,
      scaleY: sprite.scaleY * 1.06,
      duration: settings.reducedMotion ? 120 : 260,
      ease: 'Quad.easeOut',
      onComplete: () => afterimage.destroy(),
    });

    const ringCount = settings.reducedMotion ? 1 : 3;
    for (let index = 0; index < ringCount; index += 1) {
      const ring = this.add.circle(sprite.x, sprite.y, 21 + index * 9, color, 0);
      ring.setStrokeStyle(index === 0 ? 3 : 2, color, 0.82 - index * 0.18).setDepth(21);
      this.tweens.add({
        targets: ring,
        radius: 72 + index * 28,
        alpha: 0,
        duration: 230 + index * 70,
        delay: index * 28,
        ease: 'Quad.easeOut',
        onComplete: () => ring.destroy(),
      });
    }

    if (settings.reducedMotion) {
      return;
    }

    const tear = this.add.rectangle(sprite.x, sprite.y, 12, 3, color, 0.5).setDepth(20.8).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: tear,
      scaleX: 15,
      alpha: 0,
      duration: 180,
      ease: 'Cubic.easeOut',
      onComplete: () => tear.destroy(),
    });

    if (this.textures.exists(TextureKeys.particle)) {
      const emitter = this.add.particles(sprite.x, sprite.y, TextureKeys.particle, {
        lifespan: 320,
        speed: { min: 45, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.72, end: 0 },
        alpha: { start: 0.6, end: 0 },
        tint: color,
        quantity: 14,
        emitting: false,
      });
      emitter.setDepth(20.7);
      emitter.explode(14);
      this.time.delayedCall(360, () => emitter.destroy());
    }
  };
}

function patchEchoFx(): void {
  const proto = GhostClone.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;

  proto.emitTrail = function productionEchoTrail(this: FxGhost): void {
    const saveManager = this.scene.registry.get('saveManager') as { getSettings?: () => { reducedMotion: boolean } } | undefined;
    const reducedMotion = Boolean(saveManager?.getSettings?.().reducedMotion);
    const interval = reducedMotion ? 190 : 86;
    if (this.elapsed - this.lastTrailAt < interval) {
      return;
    }
    this.lastTrailAt = this.elapsed;

    const count = reducedMotion ? 1 : 2;
    for (let index = 0; index < count; index += 1) {
      const frame = this.hasEliasAnimations ? this.sprite.frame.name : undefined;
      const afterimage = this.scene.add.image(this.sprite.x - index * (this.sprite.flipX ? -3 : 3), this.sprite.y, this.sprite.texture.key, frame);
      afterimage
        .setDepth(16 - index * 0.1)
        .setFlipX(this.sprite.flipX)
        .setAlpha(index === 0 ? 0.24 : 0.13)
        .setScale(this.sprite.scaleX, this.sprite.scaleY)
        .setTint(index === 0 ? 0x86f7ff : 0x4ec9e4)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.scene.tweens.add({
        targets: afterimage,
        alpha: 0,
        x: afterimage.x + (this.sprite.flipX ? 7 : -7) * (index + 1),
        scaleX: this.sprite.scaleX * (1.03 + index * 0.02),
        scaleY: this.sprite.scaleY * (1.03 + index * 0.02),
        duration: reducedMotion ? 220 : 390 + index * 70,
        ease: 'Sine.easeOut',
        onComplete: () => afterimage.destroy(),
      });
    }

    if (!reducedMotion && Math.floor(this.elapsed / 170) % 2 === 0) {
      const scanline = this.scene.add
        .rectangle(this.sprite.x, this.sprite.y + Phaser.Math.Between(-15, 15), 36, 1, 0xb9fbff, 0.45)
        .setDepth(18.5)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.scene.tweens.add({
        targets: scanline,
        scaleX: 1.7,
        alpha: 0,
        duration: 150,
        onComplete: () => scanline.destroy(),
      });
    }
  };
}
