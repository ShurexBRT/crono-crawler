import Phaser from 'phaser';
import type { LevelData } from '../types';
import { GameScene } from './scenes/GameScene';

type MemoryRuntime = {
  glow?: Phaser.GameObjects.Arc;
  core?: Phaser.GameObjects.Arc;
};

type TutorialScene = Phaser.Scene & {
  level: LevelData;
  memoryFragments: MemoryRuntime[];
  exitZone?: Phaser.GameObjects.Rectangle;
  saveManager: { getSettings: () => { reducedMotion: boolean } };
};

const proto = GameScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
const previousBuildLevel = proto.buildLevel;

proto.buildLevel = function productionTutorialPolish(this: TutorialScene): void {
  previousBuildLevel.call(this);
  if (this.level.id !== 'tutorial') {
    return;
  }

  this.level.objective = 'Stabilize the first fracture. Reach the reactor lift.';
  this.level.startLines = [
    'The clock above Elias has stopped. The gauntlet on his wrist has not.',
    'Q bends the hour. 1, 2, 3 force it: Past, Present, Future.',
  ];

  this.memoryFragments.forEach((fragment) => {
    fragment.glow?.setVisible(false);
    fragment.core?.setVisible(false);
  });

  if (this.exitZone) {
    this.exitZone.setAlpha(0.035).setStrokeStyle(1, 0x6ee7f2, 0.22);
    const arch = this.add
      .arc(this.level.exit.x, this.level.exit.y + 5, 50, 202, 338, false, 0x000000, 0)
      .setStrokeStyle(3, 0x6ee7f2, 0.34)
      .setDepth(10.8);
    const signal = this.add
      .circle(this.level.exit.x, this.level.exit.y - 54, 5, 0x6ee7f2, 0.76)
      .setDepth(10.9)
      .setBlendMode(Phaser.BlendModes.ADD);
    if (!this.saveManager.getSettings().reducedMotion) {
      this.tweens.add({ targets: [arch, signal], alpha: { from: 0.42, to: 0.82 }, duration: 820, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  addSteamAmbience(this);
};

function addSteamAmbience(scene: TutorialScene): void {
  const reducedMotion = scene.saveManager.getSettings().reducedMotion;
  const vents = [
    { x: 250, y: 615, width: 100, alpha: 0.08 },
    { x: 690, y: 605, width: 130, alpha: 0.07 },
    { x: 1220, y: 610, width: 115, alpha: 0.08 },
    { x: 1670, y: 600, width: 140, alpha: 0.06 },
  ];

  vents.forEach((vent, index) => {
    const mist = scene.add
      .ellipse(vent.x, vent.y, vent.width, 26, 0xa9c7cf, vent.alpha)
      .setDepth(-4)
      .setScrollFactor(0.82)
      .setBlendMode(Phaser.BlendModes.SCREEN);
    if (reducedMotion) {
      return;
    }
    scene.tweens.add({
      targets: mist,
      x: vent.x + 34 + index * 5,
      y: vent.y - 22,
      scaleX: 1.35,
      scaleY: 1.7,
      alpha: 0,
      duration: 2300 + index * 320,
      repeat: -1,
      delay: index * 410,
      ease: 'Sine.easeOut',
      onRepeat: () => mist.setPosition(vent.x, vent.y).setScale(1).setAlpha(vent.alpha),
    });
  });
}
