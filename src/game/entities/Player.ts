import Phaser from 'phaser';
import { AnimationKeys, TextureKeys } from '../assets/manifest';
import type { InputController } from '../input/InputController';
import type { Point } from '../types';

export interface PlayerStepResult {
  jumped: boolean;
  landed: boolean;
  speedRatio: number;
}

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private coyoteMs = 0;
  private jumpBufferMs = 0;
  private wasOnGround = false;
  private hasEliasAnimations = false;
  private baseScale = 1;
  private animationLockMs = 0;

  constructor(scene: Phaser.Scene, spawn: Point) {
    this.scene = scene;
    this.hasEliasAnimations = scene.textures.exists(TextureKeys.eliasSheet) && scene.anims.exists(AnimationKeys.eliasIdle);
    const idleFrame = this.hasEliasAnimations ? scene.textures.getFrame(TextureKeys.eliasSheet, 'idle-0') : undefined;
    this.baseScale = idleFrame && idleFrame.height >= 240 ? 0.29 : idleFrame ? 58 / idleFrame.height : 1;
    this.sprite = scene.physics.add.sprite(
      spawn.x,
      spawn.y,
      this.hasEliasAnimations ? TextureKeys.eliasSheet : TextureKeys.elias,
      this.hasEliasAnimations ? 'idle-0' : undefined,
    );
    this.sprite.setDepth(20);
    this.sprite.setDragX(120);
    this.sprite.setMaxVelocity(280, 620);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setScale(this.baseScale);

    if (this.hasEliasAnimations && idleFrame) {
      const bodyWidth = Math.round(24 / this.baseScale);
      const bodyHeight = Math.round(44 / this.baseScale);
      const bodyOffsetX = Math.round((idleFrame.width - bodyWidth) / 2);
      const bodyOffsetY = Math.max(0, Math.round(idleFrame.height - bodyHeight - 3 / this.baseScale));
      this.sprite.body?.setSize(bodyWidth, bodyHeight).setOffset(bodyOffsetX, bodyOffsetY);
      this.playAnimation(AnimationKeys.eliasIdle);
    } else {
      this.sprite.body?.setSize(18, 34).setOffset(7, 5);
    }
  }

  update(input: InputController, deltaMs: number, blocked: boolean): PlayerStepResult {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    const horizontal = blocked ? 0 : input.horizontal;
    const speed = input.running ? 246 : 152;
    let jumped = false;
    const landed = onGround && !this.wasOnGround && body.velocity.y >= 0;

    if (onGround) {
      this.coyoteMs = 95;
    } else {
      this.coyoteMs = Math.max(0, this.coyoteMs - deltaMs);
    }

    if (!blocked && input.justPressed('jump')) {
      this.jumpBufferMs = 110;
    } else {
      this.jumpBufferMs = Math.max(0, this.jumpBufferMs - deltaMs);
    }

    const targetVelocityX = horizontal * speed;
    const accel = onGround ? 1850 : 1050;
    const decel = onGround ? 2400 : 720;
    const maxDelta = ((horizontal === 0 ? decel : accel) * deltaMs) / 1000;
    body.setVelocityX(Phaser.Math.Clamp(targetVelocityX, body.velocity.x - maxDelta, body.velocity.x + maxDelta));

    if (horizontal !== 0) {
      this.sprite.setFlipX(horizontal < 0);
    }

    if (this.jumpBufferMs > 0 && this.coyoteMs > 0) {
      body.setVelocityY(-435);
      this.jumpBufferMs = 0;
      this.coyoteMs = 0;
      jumped = true;
      this.pulseScale(0.92, 1.08, 120);
    }

    if (!input.jumpHeld && body.velocity.y < -150) {
      body.setVelocityY(body.velocity.y * 0.72);
    }

    if (landed) {
      this.pulseScale(1.08, 0.92, 150);
    }

    const moving = Math.abs(body.velocity.x) > 5;
    this.updateAnimation(onGround, moving, input.running, body.velocity.y, deltaMs);
    this.sprite.setTint(moving ? 0xd9fbff : 0xffffff);
    this.wasOnGround = onGround;

    return {
      jumped,
      landed,
      speedRatio: Phaser.Math.Clamp(Math.abs(body.velocity.x) / 246, 0, 1),
    };
  }

  playTimeShift(): void {
    if (!this.hasEliasAnimations) {
      return;
    }

    this.animationLockMs = 420;
    this.playAnimation(AnimationKeys.eliasTimeShift, false);
  }

  respawn(point: Point): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.sprite.setPosition(point.x, point.y);
    this.wasOnGround = false;
    this.animationLockMs = 0;
    this.sprite.setScale(this.baseScale);
    this.playAnimation(AnimationKeys.eliasIdle);
  }

  private updateAnimation(onGround: boolean, moving: boolean, running: boolean, velocityY: number, deltaMs: number): void {
    if (!this.hasEliasAnimations) {
      return;
    }

    if (this.animationLockMs > 0) {
      this.animationLockMs = Math.max(0, this.animationLockMs - deltaMs);
      return;
    }

    if (!onGround) {
      this.playAnimation(velocityY < 0 ? AnimationKeys.eliasJump : AnimationKeys.eliasFall);
      return;
    }

    if (moving) {
      this.playAnimation(running ? AnimationKeys.eliasRun : AnimationKeys.eliasWalk);
      return;
    }

    this.playAnimation(AnimationKeys.eliasIdle);
  }

  private playAnimation(key: string, ignoreIfPlaying = true): void {
    if (!this.scene.anims.exists(key)) {
      return;
    }
    this.sprite.play(key, ignoreIfPlaying);
  }

  private pulseScale(scaleX: number, scaleY: number, duration: number): void {
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(this.baseScale * scaleX, this.baseScale * scaleY);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: this.baseScale,
      scaleY: this.baseScale,
      duration,
      ease: 'Quad.easeOut',
    });
  }
}
