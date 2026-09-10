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
  'hourglass-hotel': [
    { x: 245, y: 1120, width: 250, height: 42, text: 'HOURGLASS HOTEL', accent: 0xf0a64d },
    { x: 850, y: 920, width: 190, height: 34, text: 'FUTURE / SERVICE', accent: 0xe0618a },
    { x: 1720, y: 475, width: 180, height: 34, text: 'DEPARTURES', accent: 0x6ee7f2 },
  ],
  'unsaid-archive': [
    { x: 430, y: 480, width: 210, height: 36, text: 'PAST / RECORDS', accent: 0xf0a64d },
    { x: 1040, y: 460, width: 210, height: 36, text: 'PRESENT / TESTIMONY', accent: 0x6ee7f2 },
    { x: 2050, y: 480, width: 210, height: 36, text: 'FUTURE / RELEASE', accent: 0xe0618a },
  ],
  'crownline-rooftops': [
    { x: 230, y: 390, width: 210, height: 36, text: 'CROWNLINE', accent: 0xf0a64d },
    { x: 1430, y: 430, width: 200, height: 36, text: 'KEEP GOING', accent: 0x6ee7f2 },
  ],
  'core-reliquary': [
    { x: 330, y: 480, width: 200, height: 36, text: 'I / REMEMBER', accent: 0xf0a64d },
    { x: 1670, y: 390, width: 200, height: 36, text: 'II / ACCEPT', accent: 0x6ee7f2 },
    { x: 2180, y: 480, width: 200, height: 36, text: 'III / RELEASE', accent: 0xe0618a },
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


proto.buildLevel = function buildLevelWithSignage(this: PatchedGameScene): void {
  originalBuildLevel.call(this);
  drawLevelSignage(this);
};

proto.onTimelineChanged = function onTimelineChangedWithAnimation(this: PatchedGameScene, timeline: unknown): void {
  originalOnTimelineChanged.call(this, timeline);
  this.player?.playTimeShift?.();
};


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
