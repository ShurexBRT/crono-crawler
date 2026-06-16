import Phaser from 'phaser';
import { TextureKeys } from '../../assets/manifest';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.createGeneratedTextures();
    this.scene.start('MainMenuScene');
  }

  private createGeneratedTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(0x18262d, 1);
    graphics.fillRect(10, 4, 12, 8);
    graphics.fillStyle(0x9fdce3, 1);
    graphics.fillRect(8, 12, 16, 18);
    graphics.fillStyle(0x1b2027, 1);
    graphics.fillRect(6, 30, 7, 12);
    graphics.fillRect(19, 30, 7, 12);
    graphics.fillStyle(0x66e5f1, 1);
    graphics.fillRect(14, 17, 4, 5);
    graphics.generateTexture(TextureKeys.elias, 32, 44);
    graphics.clear();

    graphics.fillStyle(0x122d34, 0.8);
    graphics.fillRect(10, 4, 12, 8);
    graphics.fillStyle(0x86f7ff, 0.55);
    graphics.fillRect(8, 12, 16, 18);
    graphics.fillRect(6, 30, 7, 12);
    graphics.fillRect(19, 30, 7, 12);
    graphics.fillStyle(0xffffff, 0.85);
    graphics.fillRect(14, 17, 4, 5);
    graphics.generateTexture(TextureKeys.ghost, 32, 44);
    graphics.clear();

    graphics.fillStyle(0x030406, 1);
    graphics.fillRect(20, 4, 16, 14);
    graphics.fillRect(14, 18, 28, 70);
    graphics.fillRect(9, 42, 8, 45);
    graphics.fillRect(39, 42, 8, 45);
    graphics.fillStyle(0x5bd7e8, 0.9);
    graphics.fillRect(24, 15, 8, 2);
    graphics.generateTexture(TextureKeys.keeper, 56, 100);
    graphics.clear();

    graphics.fillStyle(0x1a2028, 1);
    graphics.fillRect(8, 8, 12, 8);
    graphics.fillStyle(0xd8cda6, 1);
    graphics.fillRect(7, 16, 14, 18);
    graphics.fillStyle(0x7cb57e, 1);
    graphics.fillRect(9, 22, 10, 16);
    graphics.generateTexture(TextureKeys.girl, 28, 42);
    graphics.clear();

    graphics.fillStyle(0x581f27, 1);
    graphics.fillRect(4, 12, 24, 12);
    graphics.fillStyle(0x2a1117, 1);
    graphics.fillRect(9, 5, 14, 10);
    graphics.fillStyle(0xe06161, 1);
    graphics.fillRect(10, 10, 4, 3);
    graphics.fillRect(19, 10, 4, 3);
    graphics.fillStyle(0x1f0d12, 1);
    graphics.fillRect(5, 24, 5, 4);
    graphics.fillRect(22, 24, 5, 4);
    graphics.generateTexture(TextureKeys.enemy, 32, 30);
    graphics.clear();

    graphics.fillStyle(0x1a2a2b, 1);
    graphics.fillRect(12, 6, 8, 36);
    graphics.fillStyle(0x6ee7f2, 0.75);
    graphics.fillRect(9, 10, 14, 8);
    graphics.fillRect(10, 26, 12, 8);
    graphics.fillStyle(0x8ed081, 1);
    graphics.fillRect(14, 42, 4, 8);
    graphics.generateTexture(TextureKeys.checkpoint, 32, 56);
    graphics.clear();

    graphics.fillStyle(0x6ee7f2, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture(TextureKeys.particle, 8, 8);
    graphics.clear();

    graphics.fillStyle(0x12313a, 1);
    graphics.fillCircle(48, 48, 42);
    graphics.lineStyle(3, 0x6ee7f2, 0.8);
    graphics.strokeCircle(48, 48, 34);
    graphics.lineStyle(2, 0xefb14d, 0.8);
    graphics.strokeCircle(48, 48, 18);
    graphics.generateTexture(TextureKeys.core, 96, 96);
    graphics.destroy();
  }
}
