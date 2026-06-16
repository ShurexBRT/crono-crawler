import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { EnemySpec } from '../types';

export class Enemy {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private direction = -1;
  private spec: EnemySpec;

  constructor(scene: Phaser.Scene, spec: EnemySpec) {
    this.spec = spec;
    this.sprite = scene.physics.add.sprite(spec.x, spec.y, TextureKeys.enemy);
    this.sprite.setDepth(17);
    this.sprite.setBounceX(0);
    this.sprite.setMaxVelocity(spec.speed, 620);
    this.sprite.body?.setSize(24, 18).setOffset(4, 10);
  }

  update(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (this.sprite.x <= this.spec.patrolMinX) {
      this.direction = 1;
    }
    if (this.sprite.x >= this.spec.patrolMaxX) {
      this.direction = -1;
    }
    body.setVelocityX(this.direction * this.spec.speed);
    this.sprite.setFlipX(this.direction > 0);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
