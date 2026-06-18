import { UIManager } from './UIManager';

const titleScreenBackdropUrl = 'assets/chrono_crawler_title_screen_concept.png';

type MainMenuActions = {
  onNewGame: () => void;
  onContinue: () => void;
  onOptions: () => void;
  onCredits: () => void;
};

type PatchedUIManager = {
  saveManager: { hasContinue: () => boolean };
  audioManager: { playSfx: (name: string) => void };
  clearHud: () => void;
  setOverlay: (html: string) => void;
  bindClick: (selector: string, handler: (event: MouseEvent) => void | Promise<void>) => void;
};

(UIManager.prototype as unknown as { showMainMenu: (actions: MainMenuActions) => void }).showMainMenu = function showMainMenu(
  this: PatchedUIManager,
  actions: MainMenuActions,
): void {
  this.clearHud();
  this.setOverlay(`
    <div class="menu-shell title-screen" style="background-image: linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.22)), url('${titleScreenBackdropUrl}');">
      <div class="title-mark">
        <span class="title-kicker">Broken Time Side-Scroller</span>
        <h1>Chrono Crawler</h1>
        <p>The Core did not explode. It pulled every version of the city into the same dying second.</p>
      </div>
      <nav class="menu-stack" aria-label="Main menu">
        <button data-action="new">New Game</button>
        <button data-action="continue" ${this.saveManager.hasContinue() ? '' : 'disabled'}>Continue</button>
        <button data-action="options">Options</button>
        <button data-action="credits">Credits</button>
      </nav>
    </div>
  `);

  this.bindClick('[data-action="new"]', () => {
    this.audioManager.playSfx('click');
    actions.onNewGame();
  });
  this.bindClick('[data-action="continue"]', () => {
    this.audioManager.playSfx('click');
    actions.onContinue();
  });
  this.bindClick('[data-action="options"]', () => {
    this.audioManager.playSfx('click');
    actions.onOptions();
  });
  this.bindClick('[data-action="credits"]', () => {
    this.audioManager.playSfx('click');
    actions.onCredits();
  });
};
