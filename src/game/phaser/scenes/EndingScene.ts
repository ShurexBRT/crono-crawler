import Phaser from 'phaser';
import type { UIManager } from '../../../ui/UIManager';

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create(): void {
    const ui = this.registry.get('uiManager') as UIManager;
    this.cameras.main.setBackgroundColor('#030406');
    ui.showEnding(() => {
      ui.clearOverlay();
      this.scene.start('MainMenuScene');
    });
  }
}
