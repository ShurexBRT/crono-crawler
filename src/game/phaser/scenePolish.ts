import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { LevelData } from '../types';
import { GameScene } from './scenes/GameScene';

type PatchedGameScene = Phaser.Scene & {
  level: LevelData;
  player?: { playTimeShift?: () => void };
  timelineTint?: Phaser.GameObjects.Rectangle;
};

type SignSpec = {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  accent?: number;
  alpha?: number;
};

const backdropByBackground: Record<LevelData['background'], string> = {
  reactor: TextureKeys.backdropReactor,
  streets: TextureKeys.backdropStreets,
  greenhouse: TextureKeys.backdropGreenhouse,
  station: TextureKeys.backdropStation,
  canals: TextureKeys.backdropStreets,
  core: TextureKeys.backdropCore,
};

const backdropTintByBackground: Record<LevelData['background'], number> = {
  reactor: 0x08070b,
  streets: 0x05070c,
  greenhouse: 0x06100b,
  station: 0x07090f,
  canals: 0x041019,
  core: 0x09070d,
};

const signsByLevel: Record<string, SignSpec[]> = {
  tutorial: [
    { x: 280, y: 548, width: 210, height: 34, text: 'CORE ACCESS', accent: 0x6ee7f2 },
    { x: 735, y: 562, width: 250, height: 34, text: 'TEMPORAL BREACH', accent: 0xf0a64d },
    { x: 1390, y: 542, width: 116, height: 44, text: '00:00', accent: 0xe0618a },
  ],
  'level-1': [
    { x: 610, y: 516, width: 250, height: 42, text: 'NO FUTURE / NO LOSS', accent: 0xe0618a },
    { x: 1040, y: 566, width: 190, height: 34, text: 'HOLD THE HOUR', accent: 0xf0a64d },
    { x: 1660, y: 522, width: 230, height: 38, text: 'MERCY IS STILLNESS', accent: 0x6ee7f2 },
  ],
  'level-2': [
    { x: 420, y: 482, width: 260, height: 38, text: 'BOTANICAL TRANSIT WING', accent: 0x8ed081 },
    { x: 1045, y: 638, width: 210, height: 34, text: 'ROOTS REMEMBER', accent: 0xf0a64d },
    { x: 1710, y: 552, width: 220, height: 38, text: 'CLOSED UNTIL THEN', accent: 0xe0618a },
  ],
  'level-3': [
    { x: 690, y: 474, width: 190, height: 38, text: 'PLATFORM 13', accent: 0xf0a64d },
    { x: 1320, y: 638, width: 230, height: 34, text: 'DELAYED FOREVER', accent: 0x6ee7f2 },
    { x: 1760, y: 552, width: 230, height: 44, text: 'NO CHANGE\nNO PAIN', accent: 0xe0618a },
  ],
  'bellweather-canals': [
    { x: 455, y: 616, width: 210, height: 34, text: 'BELLWEATHER DRAIN', accent: 0x6ee7f2 },
    { x: 1280, y: 566, width: 190, height: 38, text: 'FLOODGATE', accent: 0xf0a64d },
    { x: 1960, y: 548, width: 240, height: 38, text: 'ALL HANDS DOWN', accent: 0xe0618a },
  ],
  'minute-market': [
    { x: 625, y: 520, width: 210, height: 36, text: 'MINUTE MARKET', accent: 0xf0a64d },
    { x: 1015, y: 638, width: 190, height: 34, text: 'KEYS WHILE YOU WAIT', accent: 0x6ee7f2 },
    { x: 1900, y: 488, width: 230, height: 38, text: 'LOST PHOTOS', accent: 0xe0618a },
  ],
  boss: [
    { x: 410, y: 622, width: 170, height: 34, text: 'ANCHOR I', accent: 0xf0a64d },
    { x: 1285, y: 474, width: 170, height: 34, text: 'ANCHOR II', accent: 0x6ee7f2 },
    { x: 1770, y: 622, width: 170, height: 34, text: 'ANCHOR III', accent: 0xe0618a },
    { x: 2175, y: 420, width: 260, height: 52, text: 'I STOPPED\nGOODBYE', accent: 0xd05b78, alpha: 0.5 },
  ],
};

const proto = GameScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
const originalBuildLevel = proto.buildLevel;
const originalOnTimelineChanged = proto.onTimelineChanged;

proto.drawBackground = function drawBackgroundWithExternalBackdrop(this: PatchedGameScene): void {
  drawExternalBackdrop(this);
};

proto.buildLevel = function buildLevelWithSignage(this: PatchedGameScene): void {
  originalBuildLevel.call(this);
  drawLevelSignage(this);
};

proto.onTimelineChanged = function onTimelineChangedWithAnimation(this: PatchedGameScene, timeline: unknown): void {
  originalOnTimelineChanged.call(this, timeline);
  this.player?.playTimeShift?.();
};

function drawExternalBackdrop(scene: PatchedGameScene): void {
  const backdropKey = backdropByBackground[scene.level.background];
  const tint = backdropTintByBackground[scene.level.background];

  scene.add.rectangle(scene.level.width / 2, 360, scene.level.width + 640, 760, tint, 1).setDepth(-32);

  if (scene.textures.exists(backdropKey)) {
    const backdrop = scene.add.image(scene.level.width / 2, 360, backdropKey);
    backdrop.setOrigin(0.5);
    backdrop.setDepth(-31);
    backdrop.setAlpha(0.95);
    backdrop.setScrollFactor(0.12, 0.04);
    backdrop.setDisplaySize(Math.max(scene.level.width + 900, 2200), 780);
  }

  scene.add.rectangle(scene.level.width / 2, 360, scene.level.width + 900, 780, 0x05070c, 0.22).setDepth(-30).setScrollFactor(0.12, 0.04);
  scene.add.rectangle(scene.level.width / 2, 704, scene.level.width, 54, 0x05060a, 0.82).setDepth(-7);
  scene.add.rectangle(scene.level.width / 2, 675, scene.level.width, 4, 0x6ee7f2, 0.16).setDepth(-6);

  scene.timelineTint = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.06);
  scene.timelineTint.setScrollFactor(0);
  scene.timelineTint.setDepth(30);
  scene.timelineTint.setBlendMode(Phaser.BlendModes.ADD);
}

function drawLevelSignage(scene: PatchedGameScene): void {
  const signs = signsByLevel[scene.level.id] ?? [];
  signs.forEach((sign) => {
    const accent = sign.accent ?? 0xf0a64d;
    if (scene.textures.exists(TextureKeys.uiSignPanel)) {
      const panel = scene.add.image(sign.x, sign.y, TextureKeys.uiSignPanel);
      panel.setDepth(8);
      panel.setDisplaySize(sign.width, Math.max(sign.height, 26));
      panel.setAlpha(sign.alpha ?? 0.82);
      panel.setTint(0xffffff);
    } else {
      const panel = scene.add.rectangle(sign.x, sign.y, sign.width, sign.height, 0x06080d, sign.alpha ?? 0.58);
      panel.setDepth(8);
      panel.setStrokeStyle(1, accent, 0.62);
    }

    scene.add
      .text(sign.x, sign.y, sign.text, {
        align: 'center',
        color: Phaser.Display.Color.IntegerToColor(accent).rgba,
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: sign.height > 40 ? '12px' : '11px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(9)
      .setResolution(2);
  });
}
