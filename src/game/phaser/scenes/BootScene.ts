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

    graphics.fillStyle(0x071017, 1);
    graphics.fillRect(11, 4, 10, 9);
    graphics.fillStyle(0x16252d, 1);
    graphics.fillRect(8, 12, 16, 18);
    graphics.fillStyle(0x9fdce3, 1);
    graphics.fillRect(9, 14, 14, 10);
    graphics.fillStyle(0x0c1218, 1);
    graphics.fillRect(6, 30, 7, 12);
    graphics.fillRect(19, 30, 7, 12);
    graphics.fillStyle(0xe0a04f, 1);
    graphics.fillRect(13, 17, 5, 5);
    graphics.fillStyle(0x6ee7f2, 1);
    graphics.fillRect(20, 17, 2, 9);
    graphics.fillRect(7, 25, 18, 2);
    graphics.generateTexture(TextureKeys.elias, 32, 44);
    graphics.clear();

    graphics.fillStyle(0x122d34, 0.55);
    graphics.fillRect(11, 4, 10, 9);
    graphics.fillStyle(0x86f7ff, 0.55);
    graphics.fillRect(8, 12, 16, 18);
    graphics.fillRect(6, 30, 7, 12);
    graphics.fillRect(19, 30, 7, 12);
    graphics.fillStyle(0xffffff, 0.85);
    graphics.fillRect(14, 17, 4, 5);
    graphics.lineStyle(1, 0x86f7ff, 0.55);
    graphics.strokeRect(6, 10, 20, 22);
    graphics.generateTexture(TextureKeys.ghost, 32, 44);
    graphics.clear();

    graphics.fillStyle(0x030406, 1);
    graphics.fillRect(20, 4, 16, 14);
    graphics.fillRect(14, 18, 28, 70);
    graphics.fillRect(9, 42, 8, 45);
    graphics.fillRect(39, 42, 8, 45);
    graphics.fillStyle(0x11131a, 1);
    graphics.fillRect(10, 18, 36, 8);
    graphics.fillStyle(0xe0618a, 0.9);
    graphics.fillRect(23, 15, 10, 2);
    graphics.fillStyle(0x6ee7f2, 0.32);
    graphics.fillRect(18, 30, 20, 2);
    graphics.fillRect(18, 52, 20, 2);
    graphics.generateTexture(TextureKeys.keeper, 56, 100);
    graphics.clear();

    graphics.fillStyle(0x0b1218, 1);
    graphics.fillRect(8, 8, 12, 8);
    graphics.fillStyle(0xc9d3c0, 1);
    graphics.fillRect(7, 16, 14, 18);
    graphics.fillStyle(0x7cb57e, 0.95);
    graphics.fillRect(9, 22, 10, 16);
    graphics.fillStyle(0xe0a04f, 0.9);
    graphics.fillRect(6, 20, 16, 2);
    graphics.generateTexture(TextureKeys.girl, 28, 42);
    graphics.clear();

    graphics.fillStyle(0x260e14, 1);
    graphics.fillRect(4, 13, 24, 10);
    graphics.fillStyle(0x581f27, 1);
    graphics.fillRect(7, 9, 18, 10);
    graphics.fillStyle(0xe0618a, 1);
    graphics.fillRect(10, 12, 4, 3);
    graphics.fillRect(19, 12, 4, 3);
    graphics.fillStyle(0x8f303c, 1);
    graphics.fillRect(4, 23, 24, 3);
    graphics.fillStyle(0x1f0d12, 1);
    graphics.fillRect(5, 24, 5, 4);
    graphics.fillRect(22, 24, 5, 4);
    graphics.generateTexture(TextureKeys.enemy, 32, 30);
    graphics.clear();

    graphics.fillStyle(0x0b1117, 1);
    graphics.fillRect(12, 6, 8, 38);
    graphics.fillStyle(0x1b3438, 1);
    graphics.fillRect(8, 10, 16, 9);
    graphics.fillRect(9, 27, 14, 8);
    graphics.fillStyle(0x6ee7f2, 0.82);
    graphics.fillRect(10, 12, 12, 3);
    graphics.fillRect(11, 29, 10, 3);
    graphics.fillStyle(0xe0a04f, 1);
    graphics.fillRect(14, 42, 4, 8);
    graphics.generateTexture(TextureKeys.checkpoint, 32, 56);
    graphics.clear();

    graphics.fillStyle(0x6ee7f2, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture(TextureKeys.particle, 8, 8);
    graphics.clear();

    graphics.fillStyle(0x071017, 1);
    graphics.fillCircle(48, 48, 42);
    graphics.lineStyle(3, 0x6ee7f2, 0.82);
    graphics.strokeCircle(48, 48, 34);
    graphics.lineStyle(2, 0xefb14d, 0.88);
    graphics.strokeCircle(48, 48, 18);
    graphics.lineStyle(1, 0xe0618a, 0.74);
    graphics.strokeCircle(48, 48, 8);
    graphics.fillStyle(0x6ee7f2, 0.8);
    graphics.fillRect(46, 12, 4, 18);
    graphics.fillRect(46, 66, 4, 18);
    graphics.fillRect(12, 46, 18, 4);
    graphics.fillRect(66, 46, 18, 4);
    graphics.generateTexture(TextureKeys.core, 96, 96);
    graphics.destroy();
  }
}
