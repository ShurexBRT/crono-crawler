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
    this.add
      .arc(this.level.exit.x, this.level.exit.y + 5, 50, 202, 338, false, 0x000000, 0)
      .setStrokeStyle(3, 0x6ee7f2, 0.34)
      .setDepth(10.8);
    this.add
      .circle(this.level.exit.x, this.level.exit.y - 54, 5, 0x6ee7f2, 0.76)
      .setDepth(10.9)
      .setBlendMode(Phaser.BlendModes.ADD);
  }
};
