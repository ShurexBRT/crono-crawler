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
    this.cameras.main.setBackgroundColor('#05060a');
    this.add.rectangle(640, 360, 1280, 720, 0x05060a).setDepth(-12);
    this.add.rectangle(640, 510, 1280, 370, 0x5b351e, 0.34).setDepth(-11);
    this.add.circle(960, 160, 90, 0xf0a64d, 0.16).setDepth(-10);

    for (let i = 0; i < 20; i += 1) {
      const x = i * 74 - 40;
      const height = 180 + ((i * 61) % 300);
      const width = 58 + ((i * 19) % 54);
      const color = i % 3 === 0 ? 0x080a10 : i % 3 === 1 ? 0x111721 : 0x171d29;
      this.add.rectangle(x, 720 - height / 2, width, height, color, 0.96).setOrigin(0, 0.5).setDepth(-7);
      this.add.triangle(x + width / 2, 720 - height - 18, 0, 28, width * 0.5, 0, width, 28, color, 0.96).setDepth(-7);

      const rows = Math.max(2, Math.floor(height / 46));
      const columns = Math.max(2, Math.floor(width / 22));
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          if ((row + column + i) % 3 === 0) {
            continue;
          }
          this.add.rectangle(x + 12 + column * 20, 720 - height + 48 + row * 38, 4, 12, 0xf0a64d, 0.32).setDepth(-6);
        }
      }
    }

    this.add.polygon(240, 475, [0, 0, 38, 0, -190, -430, -245, -430], 0xf0a64d, 0.11).setDepth(-8);
    this.add.polygon(1010, 480, [0, 0, 34, 0, 210, -440, 270, -440], 0x9ad7ff, 0.08).setDepth(-8);
    this.add.rectangle(640, 690, 1280, 64, 0x030407, 0.72).setDepth(-5);
    this.add.sprite(980, 395, 'character.keeper').setDisplaySize(170, 300).setAlpha(0.22).setDepth(-1);
    this.add.sprite(1080, 310, 'fx.chrono-core').setScale(1.6).setAlpha(0.35).setDepth(-2);
  }
}
