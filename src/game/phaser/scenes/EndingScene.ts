import Phaser from 'phaser';
import type { AudioManager } from '../../systems/AudioManager';
import type { SaveManager } from '../../systems/SaveManager';
import type { UIManager } from '../../../ui/UIManager';
import { EndingSequenceView } from '../../../ui/EndingSequenceView';

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create(): void {
    const ui = this.registry.get('uiManager') as UIManager;
    const audio = this.registry.get('audioManager') as AudioManager;
    const save = this.registry.get('saveManager') as SaveManager;
    const ending = new EndingSequenceView(audio);

    this.cameras.main.setBackgroundColor('#030406');
    ui.clearHud();
    ui.clearOverlay();

    ending.show(() => {
      save.markEndingSeen();
      ui.clearOverlay();
      this.scene.start('MainMenuScene');
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => ending.destroy());
  }
}
