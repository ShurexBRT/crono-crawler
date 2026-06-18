import type { AudioManager } from '../game/systems/AudioManager';
import type { SaveManager } from '../game/systems/SaveManager';
import type { SettingsState, TimelineKey } from '../game/types';

interface MainMenuActions {
  onNewGame: () => void;
  onContinue: () => void;
  onOptions: () => void;
  onCredits: () => void;
}

interface HudState {
  levelTitle: string;
  objective: string;
  timeline: TimelineKey;
  checkpoint: string;
  ghostLabel: string;
  ghostProgress: number;
}

export class UIManager {
  private root: HTMLElement;
  private hudLayer: HTMLElement;
  private overlayLayer: HTMLElement;
  private toastLayer: HTMLElement;
  private saveManager: SaveManager;
  private audioManager: AudioManager;
  private toastTimeout?: number;
  private dialogueKeyHandler?: (event: KeyboardEvent) => void;

  constructor(saveManager: SaveManager, audioManager: AudioManager) {
    const root = document.getElementById('ui-root');
    if (!root) {
      throw new Error('Missing #ui-root element.');
    }

    this.root = root;
    this.saveManager = saveManager;
    this.audioManager = audioManager;
    this.root.innerHTML = `
      <section class="hud-layer" data-layer="hud"></section>
      <section class="overlay-layer" data-layer="overlay"></section>
      <section class="toast-layer" data-layer="toast"></section>
    `;
    this.hudLayer = this.mustFind('[data-layer="hud"]');
    this.overlayLayer = this.mustFind('[data-layer="overlay"]');
    this.toastLayer = this.mustFind('[data-layer="toast"]');
  }

  showMainMenu(actions: MainMenuActions): void {
    this.clearHud();
    this.setOverlay(`
      <div class="menu-shell title-screen">
        <div class="title-mark">
          <span class="title-kicker">Vertical Slice Prototype</span>
          <h1>Chrono Crawler</h1>
          <p>Elias Voss wakes inside a city where every second has broken differently.</p>
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
  }

  showOptions(onBack: () => void): void {
    const settings = this.saveManager.getSettings();
    this.setOverlay(`
      <div class="modal-panel options-panel">
        <header>
          <span class="title-kicker">Core Calibration</span>
          <h2>Options</h2>
        </header>
        <label class="range-row">
          <span>Music</span>
          <input data-setting="music" type="range" min="0" max="1" step="0.01" value="${settings.musicVolume}" />
        </label>
        <label class="range-row">
          <span>SFX</span>
          <input data-setting="sfx" type="range" min="0" max="1" step="0.01" value="${settings.sfxVolume}" />
        </label>
        <label class="toggle-row">
          <span>Fullscreen</span>
          <input data-setting="fullscreen" type="checkbox" ${settings.fullscreen ? 'checked' : ''} />
        </label>
        <footer class="modal-actions">
          <button data-action="back">Back</button>
        </footer>
      </div>
    `);

    this.bindInput('[data-setting="music"]', (event) => {
      const value = Number((event.currentTarget as HTMLInputElement).value);
      this.updateSettings({ musicVolume: value });
    });
    this.bindInput('[data-setting="sfx"]', (event) => {
      const value = Number((event.currentTarget as HTMLInputElement).value);
      this.updateSettings({ sfxVolume: value });
      this.audioManager.playSfx('click');
    });
    this.bindClick('[data-setting="fullscreen"]', async (event) => {
      const target = event.currentTarget as HTMLInputElement;
      await this.setFullscreen(target.checked);
      this.audioManager.playSfx('click');
    });
    this.bindClick('[data-action="back"]', () => {
      this.audioManager.playSfx('click');
      onBack();
    });
  }

  showCredits(onBack: () => void): void {
    this.setOverlay(`
      <div class="modal-panel credits-panel">
        <header>
          <span class="title-kicker">Prototype Credits</span>
          <h2>Chrono Crawler</h2>
        </header>
        <p>Design, code, systems, placeholder pixel art, and procedural audio were created for this repository.</p>
        <p>Influence notes: cinematic side-scrollers, time puzzles, and quiet industrial melancholy.</p>
        <footer class="modal-actions">
          <button data-action="back">Back</button>
        </footer>
      </div>
    `);

    this.bindClick('[data-action="back"]', () => {
      this.audioManager.playSfx('click');
      onBack();
    });
  }

  showIntro(onBegin: () => void): void {
    this.setOverlay(`
      <div class="story-screen">
        <article>
          <span class="title-kicker">Incident Zero</span>
          <h2>The Core Did Not Explode</h2>
          <p>It folded. Every unfinished second in the city opened at once.</p>
          <p>Elias Voss wakes with the Chrono Core fused to his ribs and a stranger's shadow waiting at the edge of the hour.</p>
          <button data-action="begin">Wake</button>
        </article>
      </div>
    `);
    this.bindClick('[data-action="begin"]', () => {
      this.audioManager.playSfx('click');
      onBegin();
    });
  }

  showEnding(onMenu: () => void): void {
    this.clearHud();
    this.setOverlay(`
      <div class="story-screen ending-screen">
        <article>
          <span class="title-kicker">End of Vertical Slice</span>
          <h2>Time Cannot Be Owned</h2>
          <p>The Keeper removes his mask, and Elias sees the face grief would have carved from him.</p>
          <p>The Core still hurts. The city still breaks. But the next second is no longer a cage.</p>
          <button data-action="menu">Main Menu</button>
        </article>
      </div>
    `);
    this.bindClick('[data-action="menu"]', () => {
      this.audioManager.playSfx('click');
      onMenu();
    });
  }

  showHud(state: HudState): void {
    this.hudLayer.innerHTML = `
      <div class="hud-status">
        <div data-hud="timeline-card" class="timeline-card timeline-${state.timeline}">
          <span class="hud-label">Timeline</span>
          <strong data-hud="timeline">${this.timelineName(state.timeline)}</strong>
          <span class="timeline-help"><kbd>Q</kbd> cycle <kbd>1</kbd> Past <kbd>2</kbd> Present <kbd>3</kbd> Future</span>
        </div>
        <div>
          <span class="hud-label">Objective</span>
          <strong data-hud="objective">${state.objective}</strong>
        </div>
        <div>
          <span class="hud-label">Echo</span>
          <strong data-hud="ghost">${state.ghostLabel}</strong>
          <span class="echo-meter"><span data-hud="ghost-progress" style="width:${state.ghostProgress * 100}%"></span></span>
        </div>
      </div>
      <div class="level-chip">
        <span>${state.levelTitle}</span>
        <small data-hud="checkpoint">${state.checkpoint}</small>
      </div>
    `;
  }

  updateHud(state: Partial<HudState>): void {
    if (state.timeline) {
      this.setText('[data-hud="timeline"]', this.timelineName(state.timeline));
      const card = this.hudLayer.querySelector<HTMLElement>('[data-hud="timeline-card"]');
      if (card) {
        card.classList.remove('timeline-past', 'timeline-present', 'timeline-future');
        card.classList.add(`timeline-${state.timeline}`);
      }
    }
    if (state.objective) {
      this.setText('[data-hud="objective"]', state.objective);
    }
    if (state.checkpoint) {
      this.setText('[data-hud="checkpoint"]', state.checkpoint);
    }
    if (state.ghostLabel) {
      this.setText('[data-hud="ghost"]', state.ghostLabel);
    }
    if (typeof state.ghostProgress === 'number') {
      const meter = this.hudLayer.querySelector<HTMLElement>('[data-hud="ghost-progress"]');
      if (meter) {
        meter.style.width = `${Math.round(state.ghostProgress * 100)}%`;
      }
    }
  }

  showDialogue(lines: string[], onDone: () => void): void {
    let index = 0;
    let finished = false;
    this.clearDialogueKeyHandler();
    const render = () => {
      this.setOverlay(`
        <div class="dialogue-panel">
          <p>${lines[index]}</p>
          <small>${index === lines.length - 1 ? 'Close to move' : 'Continue'}</small>
          <button data-action="next">${index === lines.length - 1 ? 'Close' : 'Continue'}</button>
        </div>
      `);
      this.bindClick('[data-action="next"]', next);
    };
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        next();
      }
    };
    const next = () => {
      if (finished) {
        return;
      }
      this.audioManager.playSfx('click');
      index += 1;
      if (index >= lines.length) {
        finished = true;
        this.clearDialogueKeyHandler();
        this.clearOverlay();
        onDone();
        return;
      }
      render();
    };
    this.dialogueKeyHandler = keyHandler;
    window.addEventListener('keydown', keyHandler);
    render();
  }

  showPause(onResume: () => void, onOptions: () => void, onMenu: () => void): void {
    this.setOverlay(`
      <div class="modal-panel pause-panel">
        <header>
          <span class="title-kicker">Suspended Second</span>
          <h2>Paused</h2>
        </header>
        <div class="controls-grid">
          <span>Move</span><strong>A/D or Arrows</strong>
          <span>Jump</span><strong>Space/W</strong>
          <span>Shift Time</span><strong>Q or 1/2/3</strong>
          <span>Echo Record</span><strong>G</strong>
          <span>Interact</span><strong>E</strong>
          <span>Rewind</span><strong>R</strong>
        </div>
        <footer class="modal-actions">
          <button data-action="resume">Resume</button>
          <button data-action="options">Options</button>
          <button data-action="menu">Main Menu</button>
        </footer>
      </div>
    `);

    this.bindClick('[data-action="resume"]', () => {
      this.audioManager.playSfx('click');
      this.clearOverlay();
      onResume();
    });
    this.bindClick('[data-action="options"]', () => {
      this.audioManager.playSfx('click');
      onOptions();
    });
    this.bindClick('[data-action="menu"]', () => {
      this.audioManager.playSfx('click');
      onMenu();
    });
  }

  showToast(message: string): void {
    window.clearTimeout(this.toastTimeout);
    this.toastLayer.innerHTML = `<div class="toast">${message}</div>`;
    this.toastTimeout = window.setTimeout(() => {
      this.toastLayer.innerHTML = '';
    }, 2600);
  }

  clearOverlay(): void {
    this.clearDialogueKeyHandler();
    this.overlayLayer.innerHTML = '';
    this.overlayLayer.classList.remove('is-active');
  }

  clearHud(): void {
    this.hudLayer.innerHTML = '';
  }

  private setOverlay(html: string): void {
    this.overlayLayer.innerHTML = html;
    this.overlayLayer.classList.add('is-active');
  }

  private clearDialogueKeyHandler(): void {
    if (!this.dialogueKeyHandler) {
      return;
    }
    window.removeEventListener('keydown', this.dialogueKeyHandler);
    this.dialogueKeyHandler = undefined;
  }

  private updateSettings(settings: Partial<SettingsState>): void {
    const updated = this.saveManager.updateSettings(settings);
    this.audioManager.setSettings(updated);
  }

  private async setFullscreen(enabled: boolean): Promise<void> {
    try {
      if (enabled && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      if (!enabled && document.fullscreenElement) {
        await document.exitFullscreen();
      }
      this.updateSettings({ fullscreen: enabled });
    } catch {
      this.showToast('Fullscreen is not available in this browser.');
      this.updateSettings({ fullscreen: false });
    }
  }

  private timelineName(timeline: TimelineKey): string {
    if (timeline === 'past') {
      return 'Past';
    }
    if (timeline === 'present') {
      return 'Present';
    }
    return 'Ruined Future';
  }

  private setText(selector: string, text: string): void {
    const element = this.hudLayer.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
  }

  private bindClick(selector: string, handler: (event: MouseEvent) => void | Promise<void>): void {
    const element = this.overlayLayer.querySelector<HTMLElement>(selector);
    if (element) {
      element.addEventListener('click', handler);
    }
  }

  private bindInput(selector: string, handler: (event: Event) => void): void {
    const element = this.overlayLayer.querySelector<HTMLInputElement>(selector);
    if (element) {
      element.addEventListener('input', handler);
    }
  }

  private mustFind(selector: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (!element) {
      throw new Error(`Missing UI layer: ${selector}`);
    }
    return element;
  }
}
