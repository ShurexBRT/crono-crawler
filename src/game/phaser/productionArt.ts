import Phaser from 'phaser';
import { TextureKeys, AnimationKeys } from '../assets/manifest';
import {
  doorSvg,
  memoryFragmentSvg,
  plateSvg,
  platformSvg,
  rustmiteSvg,
  svgDataUri,
  switchSvg,
  temporalAnchorSvg,
} from '../assets/productionGameplaySvg';
import {
  backgroundSvgDataUri,
  reactorFarSvg,
  reactorForegroundSvg,
  reactorMidSvg,
} from '../assets/productionBackgroundSvg';
import type { LevelData, TimelineKey } from '../types';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

const timelines: TimelineKey[] = ['past', 'present', 'future'];

const platformKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionPlatformPast,
  present: TextureKeys.productionPlatformPresent,
  future: TextureKeys.productionPlatformFuture,
};
const doorKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionDoorPast,
  present: TextureKeys.productionDoorPresent,
  future: TextureKeys.productionDoorFuture,
};
const plateKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionPlatePast,
  present: TextureKeys.productionPlatePresent,
  future: TextureKeys.productionPlateFuture,
};
const switchOffKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionSwitchPastOff,
  present: TextureKeys.productionSwitchPresentOff,
  future: TextureKeys.productionSwitchFutureOff,
};
const switchOnKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionSwitchPastOn,
  present: TextureKeys.productionSwitchPresentOn,
  future: TextureKeys.productionSwitchFutureOn,
};
const farKeys: Record<TimelineKey, string> = {
  past: TextureKeys.reactorFarPast,
  present: TextureKeys.reactorFarPresent,
  future: TextureKeys.reactorFarFuture,
};
const midKeys: Record<TimelineKey, string> = {
  past: TextureKeys.reactorMidPast,
  present: TextureKeys.reactorMidPresent,
  future: TextureKeys.reactorMidFuture,
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
} as const;

const ELIAS_FRAME_WIDTH = 320;
const ELIAS_FRAME_HEIGHT = 300;
const ELIAS_FOOT_Y = 278;

type ReactorVisuals = {
  far: Record<TimelineKey, Phaser.GameObjects.Image>;
  mid: Record<TimelineKey, Phaser.GameObjects.Image>;
  foreground: Phaser.GameObjects.Image;
  timelineObjects: Map<string, Phaser.GameObjects.Image>;
  memoryObjects: Map<string, Phaser.GameObjects.Image>;
};

const reactorVisuals = new WeakMap<Phaser.Scene, ReactorVisuals>();

type PatchedGameScene = Phaser.Scene & {
  level: LevelData;
  timelineManager: { current: TimelineKey };
  timelineTint?: Phaser.GameObjects.Rectangle;
  checkpoints: Array<{ sprite: Phaser.Physics.Arcade.Sprite }>;
  enemies: Array<{ sprite: Phaser.Physics.Arcade.Sprite }>;
  saveManager: { isMemoryCollected: (id: string) => boolean };
};

patchBootScene();
patchGameScene();

function patchBootScene(): void {
  const proto = BootScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const originalPreload = proto.preload;
  const originalCreate = proto.create;

  proto.preload = function productionPreload(this: BootScene): void {
    originalPreload.call(this);
    loadProductionTextures(this);
  };

  proto.normalizeEliasAtlas = function deterministicEliasNormalization(this: BootScene): void {
    normalizeEliasFromAuthoredRects(this);
  };

  proto.create = function productionCreate(this: BootScene): void {
    registerRustmiteAnimations(this);
    originalCreate.call(this);
  };
}

function loadProductionTextures(scene: BootScene): void {
  scene.load.svg(TextureKeys.productionCheckpoint, svgDataUri(temporalAnchorSvg()), { width: 192, height: 256 });
  scene.load.svg(TextureKeys.productionMemoryFragment, svgDataUri(memoryFragmentSvg()), { width: 128, height: 160 });
  scene.load.svg(TextureKeys.productionRustmiteA, svgDataUri(rustmiteSvg(0)), { width: 128, height: 96 });
  scene.load.svg(TextureKeys.productionRustmiteB, svgDataUri(rustmiteSvg(2)), { width: 128, height: 96 });
  scene.load.svg(TextureKeys.productionRustmiteAlert, svgDataUri(rustmiteSvg(1, true)), { width: 128, height: 96 });

  timelines.forEach((timeline) => {
    scene.load.svg(platformKeys[timeline], svgDataUri(platformSvg(timeline)), { width: 512, height: 96 });
    scene.load.svg(doorKeys[timeline], svgDataUri(doorSvg(timeline)), { width: 192, height: 288 });
    scene.load.svg(plateKeys[timeline], svgDataUri(plateSvg(timeline)), { width: 160, height: 48 });
    scene.load.svg(switchOffKeys[timeline], svgDataUri(switchSvg(timeline, false)), { width: 96, height: 128 });
    scene.load.svg(switchOnKeys[timeline], svgDataUri(switchSvg(timeline, true)), { width: 96, height: 128 });
    scene.load.svg(farKeys[timeline], backgroundSvgDataUri(reactorFarSvg(timeline)), { width: 1920, height: 720 });
    scene.load.svg(midKeys[timeline], backgroundSvgDataUri(reactorMidSvg(timeline)), { width: 1920, height: 720 });
  });
  scene.load.svg(TextureKeys.reactorForeground, backgroundSvgDataUri(reactorForegroundSvg()), { width: 1920, height: 720 });
}

function registerRustmiteAnimations(scene: BootScene): void {
  if (!scene.anims.exists(AnimationKeys.rustmitePatrol)) {
    scene.anims.create({
      key: AnimationKeys.rustmitePatrol,
      frames: [
        { key: TextureKeys.productionRustmiteA },
        { key: TextureKeys.productionRustmiteB },
      ],
      frameRate: 5,
      repeat: -1,
    });
  }
  if (!scene.anims.exists(AnimationKeys.rustmiteAlert)) {
    scene.anims.create({
      key: AnimationKeys.rustmiteAlert,
      frames: [{ key: TextureKeys.productionRustmiteAlert }],
      frameRate: 1,
      repeat: -1,
    });
  }
}

function normalizeEliasFromAuthoredRects(scene: BootScene): void {
  if (!scene.textures.exists(TextureKeys.eliasSheet)) {
    return;
  }
  const texture = scene.textures.get(TextureKeys.eliasSheet);
  const source = texture.getSourceImage() as HTMLCanvasElement | HTMLImageElement;
  const canvas = document.createElement('canvas');
  canvas.width = ELIAS_FRAME_WIDTH * 6;
  canvas.height = ELIAS_FRAME_HEIGHT * 5;
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }
  context.imageSmoothingEnabled = true;
  const rowBySet = { idle: 0, run: 1, jump: 3, shift: 4 } as const;

  (Object.keys(eliasFrameSets) as Array<keyof typeof eliasFrameSets>).forEach((setName) => {
    const row = rowBySet[setName];
    eliasFrameSets[setName].forEach((frame, index) => {
      const targetX = index * ELIAS_FRAME_WIDTH + Math.round((ELIAS_FRAME_WIDTH - frame.width) / 2);
      const targetY = row * ELIAS_FRAME_HEIGHT + ELIAS_FOOT_Y - frame.height;
      context.drawImage(source, frame.x, frame.y, frame.width, frame.height, targetX, targetY, frame.width, frame.height);
    });
  });

  scene.textures.remove(TextureKeys.eliasSheet);
  scene.textures.addCanvas(TextureKeys.eliasSheet, canvas);
}

function patchGameScene(): void {
  const proto = GameScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const previousDrawBackground = proto.drawBackground;
  const previousBuildLevel = proto.buildLevel;
  const previousTimelineChanged = proto.onTimelineChanged;

  proto.drawBackground = function productionDrawBackground(this: PatchedGameScene): void {
    if (this.level.id !== 'tutorial') {
      previousDrawBackground.call(this);
      return;
    }
    drawFoldedReactorBackdrop(this);
  };

  proto.buildLevel = function productionBuildLevel(this: PatchedGameScene): void {
    previousBuildLevel.call(this);
    if (this.level.id === 'tutorial') {
      decorateFoldedReactor(this);
    }
  };

  proto.onTimelineChanged = function productionTimelineChanged(this: PatchedGameScene, timeline: TimelineKey): void {
    previousTimelineChanged.call(this, timeline);
    if (this.level.id === 'tutorial') {
      updateReactorTimeline(this, timeline, true);
    }
  };
}

function drawFoldedReactorBackdrop(scene: PatchedGameScene): void {
  const far = {} as Record<TimelineKey, Phaser.GameObjects.Image>;
  const mid = {} as Record<TimelineKey, Phaser.GameObjects.Image>;
  timelines.forEach((timeline) => {
    far[timeline] = scene.add
      .image(scene.level.width / 2, 360, farKeys[timeline])
      .setDepth(-32)
      .setScrollFactor(0.1, 0.03)
      .setDisplaySize(Math.max(scene.level.width + 900, 2200), 760);
    mid[timeline] = scene.add
      .image(scene.level.width / 2, 360, midKeys[timeline])
      .setDepth(-22)
      .setScrollFactor(0.3, 0.06)
      .setDisplaySize(Math.max(scene.level.width + 350, 2100), 760);
  });

  const foreground = scene.add
    .image(scene.level.width / 2, 360, TextureKeys.reactorForeground)
    .setDepth(16)
    .setScrollFactor(1.06, 0.12)
    .setDisplaySize(Math.max(scene.level.width + 260, 2050), 760)
    .setAlpha(0.44);

  scene.timelineTint = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.035).setScrollFactor(0).setDepth(30);
  scene.timelineTint.setBlendMode(Phaser.BlendModes.ADD);

  reactorVisuals.set(scene, {
    far,
    mid,
    foreground,
    timelineObjects: new Map(),
    memoryObjects: new Map(),
  });
  updateReactorTimeline(scene, scene.timelineManager.current, false);
}

function decorateFoldedReactor(scene: PatchedGameScene): void {
  const visuals = reactorVisuals.get(scene);
  if (!visuals) {
    return;
  }

  scene.level.platforms.forEach((platform) => {
    scene.add
      .image(platform.x, platform.y - platform.height / 2 - 7, TextureKeys.productionPlatformPresent)
      .setOrigin(0.5, 0)
      .setDepth(8.6)
      .setDisplaySize(platform.width, Math.max(48, platform.height + 26));
  });

  scene.level.timelineBlocks.forEach((block) => {
    const verticalGate = block.width <= 80 && block.height >= 80;
    const key = verticalGate ? doorKeys[scene.timelineManager.current] : platformKeys[scene.timelineManager.current];
    const visual = scene.add.image(block.x, verticalGate ? block.y : block.y - block.height / 2 - 7, key);
    visual.setDepth(9.65);
    if (verticalGate) {
      visual.setDisplaySize(Math.max(84, block.width * 1.55), Math.max(132, block.height * 1.3));
    } else {
      visual.setOrigin(0.5, 0);
      visual.setDisplaySize(block.width, Math.max(42, block.height + 24));
    }
    visuals.timelineObjects.set(block.id, visual);
  });

  scene.checkpoints.forEach((checkpoint) => {
    if (scene.textures.exists(TextureKeys.productionCheckpoint)) {
      checkpoint.sprite.setTexture(TextureKeys.productionCheckpoint).setDisplaySize(58, 98).setOrigin(0.5, 0.78);
    }
  });

  scene.enemies.forEach((enemy) => {
    if (scene.textures.exists(TextureKeys.productionRustmiteA)) {
      enemy.sprite.setTexture(TextureKeys.productionRustmiteA).setDisplaySize(72, 54);
      if (scene.anims.exists(AnimationKeys.rustmitePatrol)) {
        enemy.sprite.play(AnimationKeys.rustmitePatrol);
      }
    }
  });

  (scene.level.memoryFragments ?? []).forEach((fragment) => {
    const visual = scene.add
      .image(fragment.x, fragment.y, TextureKeys.productionMemoryFragment)
      .setDepth(11.4)
      .setDisplaySize(38, 50)
      .setAlpha(scene.saveManager.isMemoryCollected(fragment.id) ? 0.18 : 0.96);
    visuals.memoryObjects.set(fragment.id, visual);
    scene.tweens.add({
      targets: visual,
      y: fragment.y - 5,
      duration: 1150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  });

  scene.events.on('update', () => {
    visuals.memoryObjects.forEach((visual, id) => {
      if (scene.saveManager.isMemoryCollected(id)) {
        visual.setAlpha(0.12).setTint(0x6ee7f2);
      }
    });
  });

  updateReactorTimeline(scene, scene.timelineManager.current, false);
}

function updateReactorTimeline(scene: PatchedGameScene, timeline: TimelineKey, animate: boolean): void {
  const visuals = reactorVisuals.get(scene);
  if (!visuals) {
    return;
  }

  timelines.forEach((candidate) => {
    const targetAlpha = candidate === timeline ? 1 : 0;
    if (animate) {
      scene.tweens.add({ targets: [visuals.far[candidate], visuals.mid[candidate]], alpha: targetAlpha, duration: 180, ease: 'Quad.easeOut' });
    } else {
      visuals.far[candidate].setAlpha(targetAlpha);
      visuals.mid[candidate].setAlpha(targetAlpha);
    }
  });

  scene.level.timelineBlocks.forEach((block) => {
    const visual = visuals.timelineObjects.get(block.id);
    if (!visual) {
      return;
    }
    const state = block.states[timeline];
    const verticalGate = block.width <= 80 && block.height >= 80;
    visual.setTexture(verticalGate ? doorKeys[timeline] : platformKeys[timeline]);
    visual.setVisible(state.visible);
    visual.setAlpha(state.visible ? state.alpha ?? 1 : 0);
  });
}
