import { UIManager } from './UIManager';

type MainMenuActions = {
  onNewGame: () => void;
  onContinue: () => void;
  onOptions: () => void;
  onCredits: () => void;
};

type ContinueSummary = {
  levelTitle: string;
  checkpointLabel: string;
  timelineLabel: string;
  savedAtLabel: string;
};

type PatchedUIManager = {
  saveManager: { hasContinue: () => boolean; getContinueSummary: () => ContinueSummary | undefined };
  audioManager: { playSfx: (name: string) => void };
  clearHud: () => void;
  setOverlay: (html: string) => void;
  bindClick: (selector: string, handler: (event: MouseEvent) => void | Promise<void>) => void;
};

(UIManager.prototype as unknown as { showMainMenu: (actions: MainMenuActions) => void }).showMainMenu = function showMainMenu(
  this: PatchedUIManager,
  actions: MainMenuActions,
): void {
  const continueSummary = this.saveManager.getContinueSummary();
  const continueDetails = continueSummary
    ? `
      <div class="painted-continue-summary" data-continue-summary>
        <strong>${escapeHtml(continueSummary.levelTitle)}</strong>
        <span>${escapeHtml(continueSummary.checkpointLabel)} / ${escapeHtml(continueSummary.timelineLabel)} / ${escapeHtml(continueSummary.savedAtLabel)}</span>
      </div>
    `
    : '<div class="painted-continue-summary is-empty" data-continue-summary>No stable checkpoint yet.</div>';

  this.clearHud();
  this.setOverlay(`
    <div class="title-art-screen" aria-label="Chrono Crawler title screen">
      <img class="title-art-image" src="assets/chrono_crawler_title_screen_concept.png" alt="Chrono Crawler title screen" />
      <nav class="painted-menu-hotspots" aria-label="Main menu">
        <button class="painted-menu-hotspot painted-menu-start" data-action="new" aria-label="Start Game">
          <span>Start Game</span>
        </button>
        <button class="painted-menu-hotspot painted-menu-continue" data-action="continue" aria-label="Continue" ${this.saveManager.hasContinue() ? '' : 'disabled'}>
          <span>Continue</span>
        </button>
        ${continueDetails}
        <button class="painted-menu-hotspot painted-menu-options" data-action="options" aria-label="Options">
          <span>Options</span>
        </button>
      </nav>
      <button class="title-art-credits" data-action="credits">Credits</button>
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
