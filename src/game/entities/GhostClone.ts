import Phaser from 'phaser';
import { AnimationKeys, TextureKeys } from '../assets/manifest';
import type { GhostFrame } from '../systems/GhostRecorder';

export class GhostClone {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private frames: GhostFrame[];
  private elapsed = 0;
  private replayDone = false;
  private interactUntil = 0;
  private lastTrailAt = 0;
  private hasEliasAnimations = false;
  private baseScale = 1;

  constructor(scene: Phaser.Scene, frames: GhostFrame[]) {
    this.scene = scene;
    this.frames = frames;
    const first = frames[0];
    this.hasEliasAnimations = scene.textures.exists(TextureKeys.eliasSheet) && scene.anims.exists(AnimationKeys.eliasIdle);
    const idleFrame = this.hasEliasAnimations ? scene.textures.getFrame(TextureKeys.eliasSheet, 'idle-0') : undefined;
    this.baseScale = idleFrame ? 58 / idleFrame.height : 1;
    this.sprite = scene.physics.add.sprite(
      first.x,
      first.y,
      this.hasEliasAnimations ? TextureKeys.eliasSheet : TextureKeys.ghost,
      this.hasEliasAnimations ? 'idle-0' : undefined,
    );
    this.sprite.setAlpha(0.7);
    this.sprite.setTint(0x86f7ff);
    this.sprite.setDepth(18);
    this.sprite.setScale(this.baseScale);
    if (this.hasEliasAnimations) {
      this.sprite.play(AnimationKeys.eliasIdle);
    }
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    if (this.hasEliasAnimations && idleFrame) {
      const bodyWidth = Math.round(24 / this.baseScale);
      const bodyHeight = Math.round(44 / this.baseScale);
      const bodyOffsetX = Math.round((idleFrame.width - bodyWidth) / 2);
      const bodyOffsetY = Math.max(0, Math.round(idleFrame.height - bodyHeight - 3 / this.baseScale));
      body.setSize(bodyWidth, bodyHeight).setOffset(bodyOffsetX, bodyOffsetY);
    } else {
      body.setSize(18, 34).setOffset(7, 5);
    }
  }

  get isInteracting(): boolean {
    return this.interactUntil > this.elapsed;
  }

  get finished(): boolean {
    return this.replayDone;
  }

  update(deltaMs: number): void {
    if (this.frames.length === 0) {
      return;
    }

    this.elapsed += deltaMs;
    const last = this.frames[this.frames.length - 1];

    if (this.elapsed >= last.t) {
      this.replayDone = true;
      this.sprite.setPosition(last.x, last.y);
      this.sprite.setFlipX(last.flipX);
      this.playMovementAnimation(0, 0);
      (this.sprite.body as Phaser.Physics.Arcade.Body).reset(last.x, last.y);
      return;
    }

    const nextIndex = this.frames.findIndex((frame) => frame.t >= this.elapsed);
    const next = this.frames[Math.max(1, nextIndex)];
    const previous = this.frames[Math.max(0, nextIndex - 1)];
    const span = Math.max(1, next.t - previous.t);
    const mix = Phaser.Math.Clamp((this.elapsed - previous.t) / span, 0, 1);
    const x = Phaser.Math.Linear(previous.x, next.x, mix);
    const y = Phaser.Math.Linear(previous.y, next.y, mix);

    if (next.interact || previous.interact) {
      this.interactUntil = this.elapsed + 160;
    }

    this.sprite.setPosition(x, y);
    this.sprite.setFlipX(next.flipX);
    this.playMovementAnimation(next.x - previous.x, next.y - previous.y);
    (this.sprite.body as Phaser.Physics.Arcade.Body).reset(x, y);
    this.emitTrail();
  }

  destroy(): void {
    this.sprite.destroy();
  }

  private playMovementAnimation(deltaX: number, deltaY: number): void {
    if (!this.hasEliasAnimations) {
      return;
    }

    if (deltaY < -0.5) {
      this.sprite.play(AnimationKeys.eliasJump, true);
      return;
    }

    if (deltaY > 0.5) {
      this.sprite.play(AnimationKeys.eliasFall, true);
      return;
    }

    if (Math.abs(deltaX) > 0.4) {
      this.sprite.play(AnimationKeys.eliasRun, true);
      return;
    }

    this.sprite.play(AnimationKeys.eliasIdle, true);
  }

  private emitTrail(): void {
    if (this.elapsed - this.lastTrailAt < 120) {
      return;
    }

    this.lastTrailAt = this.elapsed;
    const afterimage = this.scene.add.image(
      this.sprite.x,
      this.sprite.y,
      this.sprite.texture.key,
      this.hasEliasAnimations ? this.sprite.frame.name : undefined,
    );
    afterimage.setDepth(16);
    afterimage.setFlipX(this.sprite.flipX);
    afterimage.setAlpha(0.22);
    afterimage.setScale(this.sprite.scaleX, this.sprite.scaleY);
    afterimage.setTint(0x86f7ff);
    this.scene.tweens.add({
      targets: afterimage,
      alpha: 0,
      scaleX: this.sprite.scaleX * 1.08,
      scaleY: this.sprite.scaleY * 1.08,
      duration: 360,
      ease: 'Sine.easeOut',
      onComplete: () => afterimage.destroy(),
    });
  }
}
