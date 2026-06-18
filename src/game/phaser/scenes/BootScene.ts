import Phaser from 'phaser';
import { AnimationKeys, TextureKeys } from '../../assets/manifest';

const assetPath = (fileName: string): string => `assets/${fileName}`;
const PLATFORM_COLUMNS = 3;
const PLATFORM_ROWS = 7;
const ELIAS_FRAME_WIDTH = 260;
const ELIAS_FRAME_HEIGHT = 260;
const ELIAS_BASELINE = 238;

const eliasFrameSets = {
  idle: [
    { x: 168, y: 16, width: 172, height: 198 },
    { x: 380, y: 16, width: 172, height: 198 },
    { x: 592, y: 16, width: 178, height: 198 },
  ],
  run: [
    { x: 164, y: 232, width: 184, height: 176 },
    { x: 372, y: 232, width: 184, height: 176 },
    { x: 582, y: 232, width: 196, height: 176 },
    { x: 804, y: 232, width: 184, height: 176 },
    { x: 1010, y: 232, width: 188, height: 176 },
    { x: 1222, y: 232, width: 198, height: 176 },
  ],
  jump: [
    { x: 164, y: 616, width: 190, height: 176 },
    { x: 370, y: 616, width: 190, height: 176 },
    { x: 580, y: 616, width: 196, height: 176 },
    { x: 806, y: 616, width: 188, height: 176 },
    { x: 1050, y: 616, width: 206, height: 176 },
  ],
  shift: [
    { x: 164, y: 812, width: 178, height: 250 },
    { x: 356, y: 812, width: 188, height: 250 },
    { x: 558, y: 812, width: 176, height: 250 },
    { x: 746, y: 812, width: 196, height: 250 },
    { x: 954, y: 812, width: 244, height: 250 },
    { x: 1220, y: 812, width: 198, height: 250 },
  ],
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image(TextureKeys.eliasSheet, assetPath('Elias char sprite transparent.png'));
    this.load.image(TextureKeys.platformSheet, assetPath('platform assets.png'));
    this.load.image(TextureKeys.titleBackdrop, assetPath('chrono_crawler_title_screen_concept.png'));
    this.load.image(TextureKeys.backdropReactor, assetPath('gloomy_industrial_nightscape_with_steam_and_lights.png'));
    this.load.image(TextureKeys.backdropStreets, assetPath('misty_alley_in_a_futuristic_city.png'));
    this.load.image(TextureKeys.backdropGreenhouse, assetPath('steampunk_observatory_with_glowing_machinery.png'));
    this.load.image(TextureKeys.backdropStation, assetPath('fading_clockwork_city_in_ruins.png'));
    this.load.image(TextureKeys.backdropCore, assetPath('ruins_of_a_fractured_city_skyline.png'));
  }

  create(): void {
    this.createGeneratedTextures();
    try {
      this.replaceCheckerboardWithAlpha(TextureKeys.eliasSheet);
      this.replaceCheckerboardWithAlpha(TextureKeys.platformSheet);
      this.normalizeEliasAtlas();
      this.registerEliasAnimationFrames();
      this.registerTimelinePlatformFrames();
    } catch (error) {
      console.warn('External asset preparation failed; falling back to generated prototype art.', error);
    }
    this.scene.start('MainMenuScene');
  }

  private replaceCheckerboardWithAlpha(textureKey: string): void {
    if (!this.textures.exists(textureKey)) {
      return;
    }

    const texture = this.textures.get(textureKey);
    const source = texture.getSourceImage() as HTMLImageElement;
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return;
    }

    context.drawImage(source, 0, 0);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < image.data.length; index += 4) {
      const red = image.data[index];
      const green = image.data[index + 1];
      const blue = image.data[index + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      if (min >= 224 && max - min <= 10) {
        image.data[index + 3] = 0;
      }
    }
    context.putImageData(image, 0, 0);

    this.textures.remove(textureKey);
    this.textures.addCanvas(textureKey, canvas);
  }

  private normalizeEliasAtlas(): void {
    if (!this.textures.exists(TextureKeys.eliasSheet)) {
      return;
    }

    const texture = this.textures.get(TextureKeys.eliasSheet);
    const source = texture.getSourceImage() as HTMLCanvasElement | HTMLImageElement;
    const canvas = document.createElement('canvas');
    canvas.width = ELIAS_FRAME_WIDTH * 6;
    canvas.height = ELIAS_FRAME_HEIGHT * 5;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.imageSmoothingEnabled = false;

    const rowBySet: Record<string, number> = {
      idle: 0,
      run: 1,
      jump: 3,
      shift: 4,
    };

    for (const [setName, frames] of Object.entries(eliasFrameSets)) {
      const row = rowBySet[setName];
      frames.forEach((frame, index) => {
        const targetX = index * ELIAS_FRAME_WIDTH + Math.round((ELIAS_FRAME_WIDTH - frame.width) / 2);
        const targetY = row * ELIAS_FRAME_HEIGHT + ELIAS_BASELINE - frame.height;
        context.drawImage(source, frame.x, frame.y, frame.width, frame.height, targetX, targetY, frame.width, frame.height);
      });
    }

    this.textures.remove(TextureKeys.eliasSheet);
    this.textures.addCanvas(TextureKeys.eliasSheet, canvas);
  }

  private registerTimelinePlatformFrames(): void {
    if (!this.textures.exists(TextureKeys.platformSheet)) {
      return;
    }

    const texture = this.textures.get(TextureKeys.platformSheet);
    if (texture.has('past')) {
      return;
    }

    const source = texture.getSourceImage() as HTMLImageElement;
    const frameWidth = Math.floor(source.width / PLATFORM_COLUMNS);
    const frameHeight = Math.floor(source.height / PLATFORM_ROWS);
    texture.add('past', 0, 0, 0, frameWidth, frameHeight);
    texture.add('present', 0, frameWidth, 0, frameWidth, frameHeight);
    texture.add('future', 0, frameWidth * 2, 0, frameWidth, frameHeight);
  }

  private registerEliasAnimationFrames(): void {
    if (!this.textures.exists(TextureKeys.eliasSheet)) {
      return;
    }

    const texture = this.textures.get(TextureKeys.eliasSheet);
    if (texture.has('idle-0')) {
      return;
    }

    texture.add('idle-0', 0, 0, 0, ELIAS_FRAME_WIDTH, ELIAS_FRAME_HEIGHT);
    texture.add('idle-1', 0, ELIAS_FRAME_WIDTH, 0, ELIAS_FRAME_WIDTH, ELIAS_FRAME_HEIGHT);
    texture.add('idle-2', 0, ELIAS_FRAME_WIDTH * 2, 0, ELIAS_FRAME_WIDTH, ELIAS_FRAME_HEIGHT);
    for (let index = 0; index < 6; index += 1) {
      texture.add(`run-${index}`, 0, ELIAS_FRAME_WIDTH * index, ELIAS_FRAME_HEIGHT, ELIAS_FRAME_WIDTH, ELIAS_FRAME_HEIGHT);
      texture.add(`shift-${index}`, 0, ELIAS_FRAME_WIDTH * index, ELIAS_FRAME_HEIGHT * 4, ELIAS_FRAME_WIDTH, ELIAS_FRAME_HEIGHT);
    }
    for (let index = 0; index < 5; index += 1) {
      texture.add(`jump-${index}`, 0, ELIAS_FRAME_WIDTH * index, ELIAS_FRAME_HEIGHT * 3, ELIAS_FRAME_WIDTH, ELIAS_FRAME_HEIGHT);
    }

    this.anims.create({
      key: AnimationKeys.eliasIdle,
      frames: this.anims.generateFrameNames(TextureKeys.eliasSheet, { prefix: 'idle-', start: 0, end: 2 }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationKeys.eliasWalk,
      frames: this.anims.generateFrameNames(TextureKeys.eliasSheet, { prefix: 'run-', start: 0, end: 5 }),
      frameRate: 7,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationKeys.eliasRun,
      frames: this.anims.generateFrameNames(TextureKeys.eliasSheet, { prefix: 'run-', start: 0, end: 5 }),
      frameRate: 11,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationKeys.eliasJump,
      frames: this.anims.generateFrameNames(TextureKeys.eliasSheet, { prefix: 'jump-', start: 0, end: 2 }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: AnimationKeys.eliasFall,
      frames: [{ key: TextureKeys.eliasSheet, frame: 'jump-3' }],
      frameRate: 1,
      repeat: 0,
    });

    this.anims.create({
      key: AnimationKeys.eliasTimeShift,
      frames: this.anims.generateFrameNames(TextureKeys.eliasSheet, { prefix: 'shift-', start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0,
    });
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
