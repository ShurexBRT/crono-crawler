import Phaser from 'phaser';
import type { UIManager } from '../../../ui/UIManager';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create(): void {
    const ui = this.registry.get('uiManager') as UIManager;
    this.cameras.main.setBackgroundColor('#05070c');
    ui.showIntro(() => {
      ui.clearOverlay();
      this.scene.start('GameScene', { levelId: 'tutorial' });
    });
  }
}
