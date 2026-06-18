import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { LevelData } from '../types';
import { GameScene } from './scenes/GameScene';

type PatchedGameScene = Phaser.Scene & {
  level: LevelData;
  player?: { playTimeShift?: () => void };
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
  core: TextureKeys.backdropCore,
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
  boss: [
    { x: 410, y: 622, width: 170, height: 34, text: 'ANCHOR I', accent: 0xf0a64d },
    { x: 1285, y: 474, width: 170, height: 34, text: 'ANCHOR II', accent: 0x6ee7f2 },
    { x: 1770, y: 622, width: 170, height: 34, text: 'ANCHOR III', accent: 0xe0618a },
    { x: 2175, y: 420, width: 260, height: 52, text: 'I STOPPED\nGOODBYE', accent: 0xd05b78, alpha: 0.5 },
  ],
};

const proto = GameScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
const originalDrawBackground = proto.drawBackground;
const originalBuildLevel = proto.buildLevel;
const originalOnTimelineChanged = proto.onTimelineChanged;

proto.drawBackground = function drawBackgroundWithBackdrop(this: PatchedGameScene): void {
  originalDrawBackground.call(this);
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
  if (!scene.textures.exists(backdropKey)) {
    return;
  }

  const backdrop = scene.add.image(scene.level.width / 2, 360, backdropKey);
  backdrop.setOrigin(0.5);
  backdrop.setDepth(-22.5);
  backdrop.setAlpha(scene.level.background === 'core' ? 0.72 : 0.58);
  backdrop.setScrollFactor(0.18, 0.08);
  backdrop.setDisplaySize(Math.max(scene.level.width + 640, 1920), 760);

  scene.add
    .rectangle(scene.level.width / 2, 360, scene.level.width + 640, 760, 0x05070c, scene.level.background === 'core' ? 0.24 : 0.34)
    .setDepth(-22.4)
    .setScrollFactor(0.18, 0.08);
}

function drawLevelSignage(scene: PatchedGameScene): void {
  const signs = signsByLevel[scene.level.id] ?? [];
  signs.forEach((sign) => {
    const accent = sign.accent ?? 0xf0a64d;
    const panel = scene.add.rectangle(sign.x, sign.y, sign.width, sign.height, 0x06080d, sign.alpha ?? 0.58);
    panel.setDepth(8);
    panel.setStrokeStyle(1, accent, 0.62);

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
