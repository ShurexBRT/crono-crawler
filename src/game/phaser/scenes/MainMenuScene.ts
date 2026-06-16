import Phaser from 'phaser';
import type { AudioManager } from '../../systems/AudioManager';
import type { SaveManager } from '../../systems/SaveManager';
import type { UIManager } from '../../../ui/UIManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    const ui = this.registry.get('uiManager') as UIManager;
    const save = this.registry.get('saveManager') as SaveManager;
    const audio = this.registry.get('audioManager') as AudioManager;

    this.drawMenuBackdrop();

    const showMenu = () => {
      ui.showMainMenu({
        onNewGame: () => {
          save.startNew();
          this.scene.start('IntroScene');
        },
        onContinue: () => {
          const state = save.getState();
          this.scene.start('GameScene', {
            levelId: state.currentLevelId,
            checkpointId: state.checkpointId,
            timeline: state.timeline,
          });
        },
        onOptions: () => ui.showOptions(showMenu),
        onCredits: () => ui.showCredits(showMenu),
      });
    };

    audio.setSettings(save.getSettings());
    showMenu();
  }

  private drawMenuBackdrop(): void {
    this.cameras.main.setBackgroundColor('#070910');
    for (let i = 0; i < 18; i += 1) {
      const x = i * 86;
      const height = 180 + ((i * 53) % 210);
      const color = i % 3 === 0 ? 0x111923 : i % 3 === 1 ? 0x18212b : 0x0d121b;
      this.add.rectangle(x, 720 - height / 2, 74, height, color).setOrigin(0, 0.5).setDepth(-3);
    }
    this.add.sprite(980, 395, 'character.keeper').setScale(2.7).setAlpha(0.22).setDepth(-1);
    this.add.sprite(1080, 310, 'fx.chrono-core').setScale(1.6).setAlpha(0.35).setDepth(-2);
  }
}
