import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { GhostFrame } from '../systems/GhostRecorder';

export class GhostClone {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private frames: GhostFrame[];
  private elapsed = 0;
  private replayDone = false;
  private interactUntil = 0;

  constructor(scene: Phaser.Scene, frames: GhostFrame[]) {
    this.frames = frames;
    const first = frames[0];
    this.sprite = scene.physics.add.sprite(first.x, first.y, TextureKeys.ghost);
    this.sprite.setAlpha(0.58);
    this.sprite.setTint(0x86f7ff);
    this.sprite.setDepth(18);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(18, 34).setOffset(7, 5);
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
    (this.sprite.body as Phaser.Physics.Arcade.Body).reset(x, y);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
