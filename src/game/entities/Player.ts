import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
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

  constructor(scene: Phaser.Scene, spawn: Point) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(spawn.x, spawn.y, TextureKeys.elias);
    this.sprite.setDepth(20);
    this.sprite.setDragX(120);
    this.sprite.setMaxVelocity(280, 620);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.body?.setSize(18, 34).setOffset(7, 5);
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
    this.sprite.setTint(moving ? 0xd9fbff : 0xffffff);
    this.wasOnGround = onGround;

    return {
      jumped,
      landed,
      speedRatio: Phaser.Math.Clamp(Math.abs(body.velocity.x) / 246, 0, 1),
    };
  }

  respawn(point: Point): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.sprite.setPosition(point.x, point.y);
    this.wasOnGround = false;
    this.sprite.setScale(1);
  }

  private pulseScale(scaleX: number, scaleY: number, duration: number): void {
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(scaleX, scaleY);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1,
      scaleY: 1,
      duration,
      ease: 'Quad.easeOut',
    });
  }
}
