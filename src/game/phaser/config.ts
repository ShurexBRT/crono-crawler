import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { EndingScene } from './scenes/EndingScene';
import { GameScene } from './scenes/GameScene';
import { IntroScene } from './scenes/IntroScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import type { AudioManager } from '../systems/AudioManager';
import type { SaveManager } from '../systems/SaveManager';
import type { UIManager } from '../../ui/UIManager';

export interface RegistryServices {
  saveManager: SaveManager;
  audioManager: AudioManager;
  uiManager: UIManager;
}

export function gameConfig({
  parent,
  saveManager,
  audioManager,
  uiManager,
}: RegistryServices & { parent: string }): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: '#070910',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 980, x: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MainMenuScene, IntroScene, GameScene, EndingScene],
    callbacks: {
      postBoot: (game) => {
        game.registry.set('saveManager', saveManager);
        game.registry.set('audioManager', audioManager);
        game.registry.set('uiManager', uiManager);
      },
    },
  };
}
