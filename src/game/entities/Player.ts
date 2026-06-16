import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { InputController } from '../input/InputController';
import type { Point } from '../types';

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private coyoteMs = 0;
  private jumpBufferMs = 0;

  constructor(scene: Phaser.Scene, spawn: Point) {
    this.sprite = scene.physics.add.sprite(spawn.x, spawn.y, TextureKeys.elias);
    this.sprite.setDepth(20);
    this.sprite.setDragX(900);
    this.sprite.setMaxVelocity(260, 620);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.body?.setSize(18, 34).setOffset(7, 5);
  }

  update(input: InputController, deltaMs: number, blocked: boolean): boolean {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    const horizontal = blocked ? 0 : input.horizontal;
    const speed = input.running ? 230 : 145;
    let jumped = false;

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

    body.setVelocityX(horizontal * speed);
    if (horizontal !== 0) {
      this.sprite.setFlipX(horizontal < 0);
    }

    if (this.jumpBufferMs > 0 && this.coyoteMs > 0) {
      body.setVelocityY(-435);
      this.jumpBufferMs = 0;
      this.coyoteMs = 0;
      jumped = true;
    }

    if (!input.jumpHeld && body.velocity.y < -150) {
      body.setVelocityY(body.velocity.y * 0.72);
    }

    const moving = Math.abs(body.velocity.x) > 5;
    this.sprite.setTint(moving ? 0xd9fbff : 0xffffff);
    return jumped;
  }

  respawn(point: Point): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.sprite.setPosition(point.x, point.y);
  }
}
