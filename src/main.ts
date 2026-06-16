import Phaser from 'phaser';
import { gameConfig } from './game/phaser/config';
import { SaveManager } from './game/systems/SaveManager';
import { AudioManager } from './game/systems/AudioManager';
import { UIManager } from './ui/UIManager';
import './styles.css';

const saveManager = new SaveManager();
const audioManager = new AudioManager(saveManager.getSettings());
const uiManager = new UIManager(saveManager, audioManager);

window.addEventListener('pointerdown', () => audioManager.unlock(), { once: true });
window.addEventListener('keydown', () => audioManager.unlock(), { once: true });

const game = new Phaser.Game(
  gameConfig({
    parent: 'game-root',
    saveManager,
    audioManager,
    uiManager,
  }),
);

window.addEventListener('beforeunload', () => {
  game.destroy(true);
});
