import Phaser from 'phaser';
import { AnimationKeys, TextureKeys } from '../../assets/manifest';
import type { TimelineKey } from '../../types';

const assetPath = (fileName: string): string => `assets/${fileName}`;
const PLATFORM_COLUMNS = 3;
const PLATFORM_ROWS = 7;
const PLATFORM_FRAME_WIDTH = 512;
const PLATFORM_FRAME_HEIGHT = 128;
const ELIAS_FRAME_WIDTH = 320;
const ELIAS_FRAME_HEIGHT = 300;
const ELIAS_FOOT_Y = 278;
const ELIAS_TRIM_PADDING = 4;
const TRANSPARENT_PIXEL_ALPHA = 8;
const TIMELINE_ORDER: TimelineKey[] = ['past', 'present', 'future'];
const doorTextureKeys: Record<TimelineKey, string> = {
  past: TextureKeys.doorPast,
  present: TextureKeys.doorPresent,
  future: TextureKeys.doorFuture,
};
const plateTextureKeys: Record<TimelineKey, string> = {
  past: TextureKeys.platePast,
  present: TextureKeys.platePresent,
  future: TextureKeys.plateFuture,
};

const eliasFrameSets = {
  idle: [
    { x: 130, y: 0, width: 170, height: 232 },
    { x: 340, y: 0, width: 170, height: 232 },
    { x: 535, y: 0, width: 170, height: 232 },
  ],
  run: [
    { x: 120, y: 220, width: 190, height: 205 },
    { x: 315, y: 220, width: 200, height: 205 },
    { x: 515, y: 220, width: 220, height: 205 },
    { x: 745, y: 220, width: 210, height: 205 },
    { x: 965, y: 220, width: 210, height: 205 },
    { x: 1175, y: 220, width: 215, height: 205 },
  ],
  jump: [
    { x: 115, y: 600, width: 165, height: 205 },
    { x: 330, y: 600, width: 190, height: 205 },
    { x: 545, y: 600, width: 180, height: 205 },
    { x: 770, y: 600, width: 190, height: 205 },
    { x: 995, y: 640, width: 205, height: 160 },
  ],
  shift: [
    { x: 115, y: 785, width: 190, height: 285 },
    { x: 325, y: 785, width: 220, height: 285 },
    { x: 530, y: 785, width: 180, height: 285 },
    { x: 725, y: 785, width: 220, height: 285 },
    { x: 930, y: 785, width: 275, height: 285 },
    { x: 1160, y: 785, width: 215, height: 285 },
  ],
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image(TextureKeys.eliasSheet, assetPath('sprites/elias-sheet.png'));
    this.load.image(TextureKeys.platformSheet, assetPath('sprites/platforms-sheet.png'));
    this.load.image(TextureKeys.keeperSheet, assetPath('sprites/keeper-sheet.png'));
    this.load.image(TextureKeys.girlSheet, assetPath('sprites/daughter-sheet.png'));
    this.load.image(TextureKeys.doorSheet, assetPath('sprites/doors-gates-barriers-sheet.png'));
    this.load.image(TextureKeys.puzzleDevicesSheet, assetPath('sprites/puzzle-devices-switches-sheet.png'));
    this.load.image(TextureKeys.uiSignPanel, assetPath('ui/sign-panel.png'));
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
      this.normalizeEliasAtlas();
      this.normalizePlatformAtlas();
      this.extractSpritePackTextures();
      this.registerEliasAnimationFrames();
      this.registerTimelinePlatformFrames();
    } catch (error) {
      console.warn('External asset preparation failed; falling back to generated prototype art.', error);
    }
    this.scene.start('MainMenuScene');
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

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = source.width;
    sourceCanvas.height = source.height;

    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    const context = canvas.getContext('2d');
    if (!sourceContext || !context) {
      return;
    }
    sourceContext.drawImage(source, 0, 0);
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
        const bounds = this.findOpaqueBounds(sourceContext, frame.x, frame.y, frame.width, frame.height);
        if (!bounds) {
          return;
        }

        const padded = this.expandBounds(bounds, sourceCanvas.width, sourceCanvas.height, ELIAS_TRIM_PADDING);
        const targetX = index * ELIAS_FRAME_WIDTH + Math.round((ELIAS_FRAME_WIDTH - padded.width) / 2);
        const targetY = row * ELIAS_FRAME_HEIGHT + ELIAS_FOOT_Y - padded.height;
        context.drawImage(sourceCanvas, padded.x, padded.y, padded.width, padded.height, targetX, targetY, padded.width, padded.height);
      });
    }

    this.textures.remove(TextureKeys.eliasSheet);
    this.textures.addCanvas(TextureKeys.eliasSheet, canvas);
  }

  private normalizePlatformAtlas(): void {
    if (!this.textures.exists(TextureKeys.platformSheet)) {
      return;
    }

    const texture = this.textures.get(TextureKeys.platformSheet);
    const source = texture.getSourceImage() as HTMLCanvasElement | HTMLImageElement;
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = source.width;
    sourceCanvas.height = source.height;

    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) {
      return;
    }
    sourceContext.drawImage(source, 0, 0);

    const frameWidth = Math.floor(source.width / PLATFORM_COLUMNS);
    const frameHeight = Math.floor(source.height / PLATFORM_ROWS);
    const canvas = document.createElement('canvas');
    canvas.width = PLATFORM_FRAME_WIDTH * PLATFORM_COLUMNS;
    canvas.height = PLATFORM_FRAME_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.imageSmoothingEnabled = false;

    for (let column = 0; column < PLATFORM_COLUMNS; column += 1) {
      const sourceX = column * frameWidth;
      const bounds = this.findOpaqueBounds(sourceContext, sourceX, 0, frameWidth, frameHeight);
      if (!bounds) {
        continue;
      }

      const targetHeight = Math.min(PLATFORM_FRAME_HEIGHT, Math.max(52, Math.round((bounds.height / bounds.width) * PLATFORM_FRAME_WIDTH)));
      context.drawImage(
        sourceCanvas,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        column * PLATFORM_FRAME_WIDTH,
        0,
        PLATFORM_FRAME_WIDTH,
        targetHeight,
      );
    }

    this.textures.remove(TextureKeys.platformSheet);
    this.textures.addCanvas(TextureKeys.platformSheet, canvas);
  }

  private extractSpritePackTextures(): void {
    this.extractCharacterPose(TextureKeys.keeperSheet, TextureKeys.keeper, 0);
    this.extractCharacterPose(TextureKeys.girlSheet, TextureKeys.girl, 0);
    this.extractTimelineRow(TextureKeys.doorSheet, doorTextureKeys, 1, 4, 8);
    this.extractTimelineRow(TextureKeys.puzzleDevicesSheet, plateTextureKeys, 0, 5, 6);
    this.extractSheetTexture(TextureKeys.puzzleDevicesSheet, TextureKeys.switchOff, { column: 1, row: 1, columns: 3, rows: 5 }, 6);
    this.extractSheetTexture(TextureKeys.puzzleDevicesSheet, TextureKeys.switchOn, { column: 2, row: 2, columns: 3, rows: 5 }, 6);
  }

  private extractCharacterPose(sourceKey: string, targetKey: string, column: number): void {
    this.extractSheetTexture(sourceKey, targetKey, { column, row: 0, columns: 3, rows: 1 }, 8);
  }

  private extractTimelineRow(
    sourceKey: string,
    targetKeys: Record<TimelineKey, string>,
    row: number,
    rows: number,
    padding: number,
  ): void {
    TIMELINE_ORDER.forEach((timeline, column) => {
      this.extractSheetTexture(sourceKey, targetKeys[timeline], { column, row, columns: 3, rows }, padding);
    });
  }

  private extractSheetTexture(
    sourceKey: string,
    targetKey: string,
    cell: { column: number; row: number; columns: number; rows: number },
    padding: number,
  ): void {
    if (!this.textures.exists(sourceKey)) {
      return;
    }

    const texture = this.textures.get(sourceKey);
    const source = texture.getSourceImage() as HTMLCanvasElement | HTMLImageElement;
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = source.width;
    sourceCanvas.height = source.height;

    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) {
      return;
    }
    sourceContext.drawImage(source, 0, 0);

    const cellWidth = Math.floor(source.width / cell.columns);
    const cellHeight = Math.floor(source.height / cell.rows);
    const x = cell.column * cellWidth;
    const y = cell.row * cellHeight;
    const width = cell.column === cell.columns - 1 ? source.width - x : cellWidth;
    const height = cell.row === cell.rows - 1 ? source.height - y : cellHeight;
    const bounds = this.findOpaqueBounds(sourceContext, x, y, width, height);
    if (!bounds) {
      return;
    }

    const padded = this.expandBounds(bounds, sourceCanvas.width, sourceCanvas.height, padding);
    const canvas = document.createElement('canvas');
    canvas.width = padded.width;
    canvas.height = padded.height;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.imageSmoothingEnabled = false;
    context.drawImage(sourceCanvas, padded.x, padded.y, padded.width, padded.height, 0, 0, padded.width, padded.height);

    if (this.textures.exists(targetKey)) {
      this.textures.remove(targetKey);
    }
    this.textures.addCanvas(targetKey, canvas);
  }

  private findOpaqueBounds(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ): { x: number; y: number; width: number; height: number } | undefined {
    const image = context.getImageData(x, y, width, height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let pixelY = 0; pixelY < height; pixelY += 1) {
      for (let pixelX = 0; pixelX < width; pixelX += 1) {
        const alpha = image.data[(pixelY * width + pixelX) * 4 + 3];
        if (alpha <= TRANSPARENT_PIXEL_ALPHA) {
          continue;
        }
        minX = Math.min(minX, pixelX);
        minY = Math.min(minY, pixelY);
        maxX = Math.max(maxX, pixelX);
        maxY = Math.max(maxY, pixelY);
      }
    }

    if (maxX < minX || maxY < minY) {
      return undefined;
    }

    return {
      x: x + minX,
      y: y + minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }

  private expandBounds(
    bounds: { x: number; y: number; width: number; height: number },
    maxWidth: number,
    maxHeight: number,
    padding: number,
  ): { x: number; y: number; width: number; height: number } {
    const x = Math.max(0, bounds.x - padding);
    const y = Math.max(0, bounds.y - padding);
    const right = Math.min(maxWidth, bounds.x + bounds.width + padding);
    const bottom = Math.min(maxHeight, bounds.y + bounds.height + padding);
    return { x, y, width: right - x, height: bottom - y };
  }

  private registerTimelinePlatformFrames(): void {
    if (!this.textures.exists(TextureKeys.platformSheet)) {
      return;
    }

    const texture = this.textures.get(TextureKeys.platformSheet);
    if (texture.has('past')) {
      return;
    }

    texture.add('past', 0, 0, 0, PLATFORM_FRAME_WIDTH, PLATFORM_FRAME_HEIGHT);
    texture.add('present', 0, PLATFORM_FRAME_WIDTH, 0, PLATFORM_FRAME_WIDTH, PLATFORM_FRAME_HEIGHT);
    texture.add('future', 0, PLATFORM_FRAME_WIDTH * 2, 0, PLATFORM_FRAME_WIDTH, PLATFORM_FRAME_HEIGHT);
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

    graphics.fillStyle(0x05070c, 0.72);
    graphics.fillEllipse(26, 80, 30, 7);
    graphics.fillStyle(0x171016, 1);
    graphics.fillRect(18, 20, 16, 16);
    graphics.fillStyle(0xc2b18d, 1);
    graphics.fillRect(20, 30, 12, 12);
    graphics.fillStyle(0x111923, 1);
    graphics.fillRect(17, 42, 18, 30);
    graphics.fillStyle(0x6b4d31, 1);
    graphics.fillTriangle(17, 42, 9, 74, 22, 74);
    graphics.fillTriangle(35, 42, 43, 74, 30, 74);
    graphics.fillStyle(0x0a0d12, 1);
    graphics.fillRect(19, 70, 5, 10);
    graphics.fillRect(29, 70, 5, 10);
    graphics.fillStyle(0x8ed081, 0.92);
    graphics.fillRect(22, 45, 8, 12);
    graphics.lineStyle(2, 0x6ee7f2, 0.42);
    graphics.strokeCircle(26, 52, 11);
    graphics.lineStyle(1, 0xf0a64d, 0.55);
    graphics.strokeRect(16, 42, 20, 30);
    graphics.generateTexture(TextureKeys.girl, 52, 86);
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

    graphics.fillStyle(0x05070c, 0.92);
    graphics.fillRoundedRect(4, 7, 88, 14, 3);
    graphics.fillStyle(0x1a2426, 1);
    graphics.fillRoundedRect(9, 3, 78, 14, 3);
    graphics.lineStyle(2, 0x6ee7f2, 0.58);
    graphics.strokeRoundedRect(9, 3, 78, 14, 3);
    graphics.fillStyle(0xf0a64d, 0.72);
    graphics.fillRect(42, 0, 12, 5);
    graphics.generateTexture(TextureKeys.plate, 96, 24);
    graphics.clear();

    this.drawSwitchTexture(graphics, TextureKeys.switchOff, 0x8a5a35, 0x6ee7f2, -18);
    this.drawSwitchTexture(graphics, TextureKeys.switchOn, 0xe8c46a, 0x73f2b2, 18);

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

  private drawSwitchTexture(graphics: Phaser.GameObjects.Graphics, key: string, bodyColor: number, accentColor: number, angle: number): void {
    const handleEndX = angle < 0 ? 22 : 42;
    const handleEndY = 8;
    graphics.fillStyle(0x05070c, 0.84);
    graphics.fillEllipse(32, 48, 42, 8);
    graphics.fillStyle(0x161118, 1);
    graphics.fillRoundedRect(10, 20, 44, 26, 4);
    graphics.lineStyle(2, bodyColor, 0.82);
    graphics.strokeRoundedRect(10, 20, 44, 26, 4);
    graphics.fillStyle(0x0a0f14, 1);
    graphics.fillRect(27, 4, 8, 22);
    graphics.lineStyle(6, accentColor, 0.95);
    graphics.lineBetween(31, 28, handleEndX, handleEndY);
    graphics.fillStyle(0xe7f2f2, 0.9);
    graphics.fillCircle(handleEndX, handleEndY, 5);
    graphics.fillStyle(accentColor, 0.55);
    graphics.fillRect(18, 31, 28, 3);
    graphics.generateTexture(key, 64, 56);
    graphics.clear();
  }
}
