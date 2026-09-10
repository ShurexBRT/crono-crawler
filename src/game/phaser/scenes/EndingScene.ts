import Phaser from 'phaser';
import type { AudioManager } from '../../systems/AudioManager';
import type { SaveManager } from '../../systems/SaveManager';
import type { UIManager } from '../../../ui/UIManager';
import { EndingSequenceView } from '../../../ui/EndingSequenceView';
import { levels } from '../../content/levels';

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create(): void {
    const ui = this.registry.get('uiManager') as UIManager;
    const audio = this.registry.get('audioManager') as AudioManager;
    const save = this.registry.get('saveManager') as SaveManager;
    const ending = new EndingSequenceView(audio, {
      recovered: save.getProgression().collectedMemoryFragmentIds.length,
      total: levels.reduce((count, level) => count + (level.memoryFragments?.length ?? 0), 0),
    });

    this.cameras.main.setBackgroundColor('#030406');
    ui.clearHud();
    ui.clearOverlay();

    ending.show(() => {
      save.completeRun();
      ui.clearOverlay();
      this.scene.start('MainMenuScene');
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => ending.destroy());
  }
}
