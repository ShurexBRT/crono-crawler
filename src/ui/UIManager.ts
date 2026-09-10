import type { AudioManager } from '../game/systems/AudioManager';
import type { ContinueSummary, SaveManager } from '../game/systems/SaveManager';
import type { SettingsState, TimelineKey } from '../game/types';
import { introBeats, type IntroBeat } from '../game/content/intro';
import { EndingSequenceView } from './EndingSequenceView';
import { levels } from '../game/content/levels';
import { AssetPaths } from '../game/assets/manifest';
import { getBackdrop } from '../game/assets/backdrops';
import { getMemoryArtifact } from '../game/content/memory-artifacts';
import { MemoryArtifactView } from './MemoryArtifactView';
import type { MemoryFragmentSpec } from '../game/types';
import { MemoryVaultModel } from './MemoryVaultModel';
import { MemoryVaultView } from './MemoryVaultView';

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

interface PauseActions {
  onResume: () => void;
  onOptions: () => void;
  onSave: () => ContinueSummary | undefined;
  onMenu: () => void;
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
  private introKeyHandler?: (event: KeyboardEvent) => void;
  private introTimeout?: number;
  private endingView?: EndingSequenceView;
  private memoryView?: MemoryArtifactView;
  private vaultView?: MemoryVaultView;
  private vaultReturn?: { nodes: DocumentFragment; active: boolean; focus: Element | null };

  constructor(saveManager: SaveManager, audioManager: AudioManager) {
    const root = document.getElementById('ui-root');
    if (!root) {
      throw new Error('Missing #ui-root element.');
    }

    this.root = root;
    for (const [key, path] of Object.entries({
      '--elias-art': AssetPaths.eliasSource,
      '--story-character-art': AssetPaths.storyCharacters,
      '--reactor-art': getBackdrop('tutorial').path,
      '--ending-art': getBackdrop('boss').path,
      '--dawn-art': getBackdrop('crownline-rooftops').path,
    })) this.root.style.setProperty(key, `url('${path}')`);
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
    this.applyAccessibilitySettings(this.saveManager.getSettings());
    this.saveManager.onPersistenceChange((status) => {
      this.root.querySelectorAll<HTMLElement>('[data-save-error]').forEach((element) => { element.hidden = status !== 'error'; });
      if (status === 'error') this.showToast('Saving failed. Progress is only in this session.');
    });
  }

  showMainMenu(actions: MainMenuActions): void {
    const continueSummary = this.saveManager.getContinueSummary();
    const continueDetails = continueSummary
      ? `
        <div class="continue-summary" data-continue-summary>
          <strong>${this.escapeHtml(continueSummary.levelTitle)}</strong>
          <span>${this.escapeHtml(continueSummary.checkpointLabel)} / ${this.escapeHtml(continueSummary.timelineLabel)} / ${this.escapeHtml(continueSummary.savedAtLabel)}</span>
        </div>
      `
      : '<div class="continue-summary is-empty" data-continue-summary>No stable checkpoint yet.</div>';

    this.clearHud();
    this.setOverlay(`
      <div class="menu-shell title-screen" style="background-image: linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.16)), url('assets/backgrounds/production/lock-street-far.png');">
        <div class="title-mark">
          <span class="title-kicker">The Still Hour</span>
          <h1>Chrono Crawler</h1>
          <p>The Core did not explode. It pulled every version of the city into the same dying second.</p>
        </div>
        <nav class="menu-stack" aria-label="Main menu">
          <button data-action="new">New Game</button>
          <button data-action="continue" ${this.saveManager.hasContinue() ? '' : 'disabled'}>Continue</button>
          ${continueDetails}
          ${this.renderStorageStatus()}
          <button data-action="options">Options</button>
          <button data-action="credits">Credits</button>
          <button data-action="journal">Memory Vault</button>
        </nav>
      </div>
    `);

    this.bindClick('[data-action="new"]', () => {
      this.audioManager.playSfx('click');
      if (this.saveManager.hasContinue() || this.saveManager.getProgression().collectedMemoryFragmentIds.length > 0) {
        this.confirmNewGame(actions);
      } else {
        actions.onNewGame();
      }
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
    this.bindClick('[data-action="journal"]', () => this.showJournal(() => this.showMainMenu(actions)));
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
        <label class="range-row">
          <span>Text Size</span>
          <input data-setting="text-scale" type="range" min="1" max="1.25" step="0.05" value="${settings.textScale}" />
        </label>
        <label class="toggle-row">
          <span>Reduced Motion</span>
          <input data-setting="reduced-motion" type="checkbox" ${settings.reducedMotion ? 'checked' : ''} />
        </label>
        <label class="toggle-row">
          <span>Reduced Flashes</span>
          <input data-setting="reduced-flashes" type="checkbox" ${settings.reducedFlashes ? 'checked' : ''} />
        </label>
        <div class="settings-note">
          Gamepad: Left stick/D-pad move, South jump, East interact, West echo, North rewind, shoulders shift time, Start pause.
        </div>
        ${this.renderStorageStatus()}
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
    this.bindInput('[data-setting="text-scale"]', (event) => {
      const value = Number((event.currentTarget as HTMLInputElement).value);
      this.updateSettings({ textScale: value });
    });
    this.bindClick('[data-setting="reduced-motion"]', (event) => {
      const target = event.currentTarget as HTMLInputElement;
      this.updateSettings({ reducedMotion: target.checked });
      this.audioManager.playSfx('click');
    });
    this.bindClick('[data-setting="reduced-flashes"]', (event) => {
      const target = event.currentTarget as HTMLInputElement;
      this.updateSettings({ reducedFlashes: target.checked });
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
          <span class="title-kicker">Credits</span>
          <h2>Chrono Crawler</h2>
        </header>
        <p>Chrono Crawler: The Still Hour</p>
        <p>Original campaign artwork created with OpenAI ImageGen. Environment devices, visual effects, and sound synthesized for the game.</p>
        <p>Built with Phaser, TypeScript, and Vite.</p>
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
    this.clearHud();
    this.clearIntroPlayback();

    let index = 0;
    let isFinished = false;

    const finish = (playSound: boolean) => {
      if (isFinished) {
        return;
      }
      isFinished = true;
      if (playSound) {
        this.audioManager.playSfx('click');
      }
      this.clearIntroPlayback();
      onBegin();
    };

    const scheduleNext = (beat: IntroBeat) => {
      window.clearTimeout(this.introTimeout);
      if (beat.waitForInput || beat.durationMs <= 0) {
        return;
      }
      this.introTimeout = window.setTimeout(() => {
        advance(false);
      }, beat.durationMs);
    };

    const advance = (playSound = true) => {
      if (isFinished) {
        return;
      }
      if (playSound) {
        this.audioManager.playSfx('click');
      }
      if (index >= introBeats.length - 1) {
        finish(false);
        return;
      }
      index += 1;
      render();
    };

    const skip = () => {
      finish(true);
    };

    const render = () => {
      const beat = introBeats[index];
      this.setOverlay(this.renderIntroBeat(beat, index, introBeats.length));
      this.bindClick('[data-action="intro-next"]', () => advance());
      this.bindClick('[data-action="intro-skip"]', skip);
      scheduleNext(beat);
    };

    this.introKeyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        advance();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', this.introKeyHandler);
    render();
  }

  showEnding(onMenu: () => void): void {
    this.clearHud();
    this.endingView?.destroy();
    this.endingView = new EndingSequenceView(this.audioManager);
    this.endingView.show(onMenu);
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
        <small>Stage ${levels.findIndex((level) => level.title === state.levelTitle) + 1} / ${levels.length}</small>
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

  showPause(saveSummary: ContinueSummary | undefined, actions: PauseActions): void {
    this.setOverlay(`
      <div class="pause-overlay">
        <div class="modal-panel pause-panel">
          <header>
            <span class="title-kicker">Suspended Second</span>
            <h2>Paused</h2>
          </header>
          <div class="pause-save-summary" data-pause-save-summary>
            ${this.renderSaveSummary(saveSummary)}
          </div>
          ${this.renderStorageStatus()}
          <div class="controls-grid">
            <span>Move</span><strong>A/D or Arrows</strong>
            <span>Jump</span><strong>Space/W</strong>
            <span>Shift Time</span><strong>Q or 1/2/3</strong>
            <span>Echo Record</span><strong>G</strong>
            <span>Interact</span><strong>E</strong>
            <span>Rewind</span><strong>R</strong>
            <span>Gamepad</span><strong>Stick, face buttons, shoulders</strong>
          </div>
          <footer class="modal-actions">
            <button data-action="resume">Resume</button>
            <button data-action="save">Save Now</button>
            <button data-action="journal">Memory Vault</button>
            <button data-action="options">Options</button>
            <button data-action="menu">Main Menu</button>
          </footer>
        </div>
      </div>
    `);

    this.bindClick('[data-action="resume"]', () => {
      this.audioManager.playSfx('click');
      this.clearOverlay();
      actions.onResume();
    });
    this.bindClick('[data-action="journal"]', () => this.showJournal(() => this.showPause(saveSummary, actions)));
    this.bindClick('[data-action="save"]', () => {
      this.updatePauseSaveSummary(actions.onSave());
      const saved = this.saveManager.getPersistenceStatus() === 'ready';
      if (saved) this.audioManager.playSfx('checkpoint');
      this.showToast(saved ? 'Progress saved.' : 'Saving failed. Progress is only in this session.');
    });
    this.bindClick('[data-action="options"]', () => {
      this.audioManager.playSfx('click');
      actions.onOptions();
    });
    this.bindClick('[data-action="menu"]', () => {
      this.audioManager.playSfx('click');
      actions.onMenu();
    });
  }

  showMemory(memory: MemoryFragmentSpec, onDone: () => void, recovered = true): void {
    const artifact = getMemoryArtifact(memory.id);
    if (!artifact) {
      this.showDialogue([memory.title, ...memory.lines], onDone);
      return;
    }
    this.clearDialogueKeyHandler();
    this.clearIntroPlayback();
    this.setOverlay('');
    this.memoryView = new MemoryArtifactView(this.overlayLayer, artifact, memory.lines, recovered, () => {
      this.audioManager.playSfx('click');
      this.clearOverlay();
      onDone();
    });
  }

  get isMemoryVaultOpen(): boolean { return Boolean(this.vaultView); }

  showJournal(_onBack?: () => void, focusMemoryId?: string): void {
    this.showMemoryVault(() => {}, focusMemoryId);
  }

  setMemoryVaultAccess(onOpen?: () => void): void {
    this.hudLayer.querySelector('.hud-vault-action')?.remove();
    if (!onOpen) return;
    const parent = this.hudLayer.querySelector('.hud-v2-level') ?? this.hudLayer;
    const button = document.createElement('button');
    button.className = 'hud-vault-action';
    button.dataset.action = 'vault-open';
    button.setAttribute('aria-keyshortcuts', 'J');
    button.setAttribute('title', 'Memory Vault');
    button.innerHTML = 'Memory Vault <small data-vault-unread></small>';
    button.addEventListener('click', onOpen);
    parent.append(button);
    this.updateVaultUnread();
  }

  showMemoryVault(onClose: () => void, memoryId?: string): void {
    if (this.vaultView) return;
    const progress = this.saveManager.getProgression();
    const entries = levels.flatMap((level) => (level.memoryFragments ?? []).map((memory) => ({ ...memory, levelTitle: level.title, artifact: getMemoryArtifact(memory.id) })));
    const model = new MemoryVaultModel(entries, progress.collectedMemoryFragmentIds, progress.readMemoryFragmentIds, memoryId ?? progress.lastViewedMemoryId);
    const nodes = document.createDocumentFragment();
    const focus = document.activeElement;
    while (this.overlayLayer.firstChild) nodes.append(this.overlayLayer.firstChild);
    this.vaultReturn = { nodes, active: this.overlayLayer.classList.contains('is-active'), focus };
    this.memoryView?.suspend();
    this.overlayLayer.classList.add('is-active');
    this.vaultView = new MemoryVaultView(this.overlayLayer, model, {
      onRead: (id) => { this.saveManager.visitMemory(id); this.updateVaultUnread(); },
      onTurn: () => this.audioManager.playSfx('click'),
      onClose: () => {
        const previous = this.vaultReturn;
        this.vaultView = undefined;
        this.vaultReturn = undefined;
        this.overlayLayer.replaceChildren(...(previous ? [previous.nodes] : []));
        this.overlayLayer.classList.toggle('is-active', previous?.active ?? false);
        this.memoryView?.resume();
        this.root.querySelectorAll<HTMLElement>('[data-save-error]').forEach((element) => {
          element.hidden = this.saveManager.getPersistenceStatus() !== 'error';
        });
        onClose();
        if (previous?.focus instanceof HTMLElement && previous.focus.isConnected) previous.focus.focus({ preventScroll: true });
        else if (!this.overlayLayer.classList.contains('is-active')) this.releaseOverlayFocus();
      },
    });
  }

  private updateVaultUnread(): void {
    const progress = this.saveManager.getProgression();
    const count = progress.collectedMemoryFragmentIds.filter((id) => !progress.readMemoryFragmentIds.includes(id)).length;
    const total = levels.reduce((sum, level) => sum + (level.memoryFragments?.length ?? 0), 0);
    const badge = this.hudLayer.querySelector('[data-vault-unread]');
    if (badge) badge.textContent = count ? `${count} new` : `${progress.collectedMemoryFragmentIds.length} / ${total}`;
  }

  private confirmNewGame(actions: MainMenuActions): void {
    this.setOverlay(`<div class="modal-panel"><h2>Begin Again?</h2><p>The current journey and recovered memories will be replaced. Options will stay unchanged.</p><footer class="modal-actions"><button data-action="cancel-new">Keep Journey</button><button data-action="confirm-new">New Game</button></footer></div>`);
    this.bindClick('[data-action="cancel-new"]', () => this.showMainMenu(actions));
    this.bindClick('[data-action="confirm-new"]', actions.onNewGame);
  }

  showToast(message: string): void {
    window.clearTimeout(this.toastTimeout);
    this.toastLayer.innerHTML = `<div class="toast">${message}</div>`;
    this.toastTimeout = window.setTimeout(() => {
      this.toastLayer.innerHTML = '';
    }, 2600);
  }

  clearOverlay(): void {
    this.vaultView?.destroy();
    this.vaultView = undefined;
    this.vaultReturn = undefined;
    this.memoryView?.destroy();
    this.memoryView = undefined;
    this.endingView?.destroy();
    this.endingView = undefined;
    this.clearDialogueKeyHandler();
    this.clearIntroPlayback();
    this.overlayLayer.innerHTML = '';
    this.overlayLayer.classList.remove('is-active');
    this.releaseOverlayFocus();
  }

  clearHud(): void {
    this.hudLayer.innerHTML = '';
  }

  private setOverlay(html: string): void {
    this.vaultView?.destroy();
    this.vaultView = undefined;
    this.vaultReturn = undefined;
    this.memoryView?.destroy();
    this.memoryView = undefined;
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

  private clearIntroPlayback(): void {
    window.clearTimeout(this.introTimeout);
    this.introTimeout = undefined;
    if (!this.introKeyHandler) {
      return;
    }
    window.removeEventListener('keydown', this.introKeyHandler);
    this.introKeyHandler = undefined;
  }

  private releaseOverlayFocus(): void {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && this.root.contains(activeElement)) {
      activeElement.blur();
    }
    const gameCanvas = document.querySelector<HTMLCanvasElement>('#game-root canvas');
    if (gameCanvas) {
      gameCanvas.tabIndex = -1;
      gameCanvas.focus({ preventScroll: true });
      return;
    }
    const gameRoot = document.getElementById('game-root');
    if (gameRoot instanceof HTMLElement) {
      gameRoot.focus({ preventScroll: true });
    }
  }

  private updateSettings(settings: Partial<SettingsState>): void {
    const updated = this.saveManager.updateSettings(settings);
    this.audioManager.setSettings(updated);
    this.applyAccessibilitySettings(updated);
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

  private applyAccessibilitySettings(settings: SettingsState): void {
    document.documentElement.style.setProperty('--text-scale', String(settings.textScale));
    document.documentElement.dataset.reducedMotion = String(settings.reducedMotion);
    document.documentElement.dataset.reducedFlashes = String(settings.reducedFlashes);
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

  private renderIntroBeat(beat: IntroBeat, index: number, total: number): string {
    const body = this.renderIntroBeatBody(beat);
    const actionLabel = index === total - 1 ? 'Begin' : 'Continue';
    return `
      <div class="intro-sequence intro-beat-${beat.visual}">
        <div class="intro-lab" aria-hidden="true">
          <div class="intro-lab-backdrop"></div>
          <div class="intro-core"></div>
          <div class="intro-elias"></div>
          <div class="intro-drawing"></div>
          <div class="intro-later-shadow"></div>
          <div class="intro-scanlines"></div>
        </div>
        <div class="intro-vignette" aria-hidden="true"></div>
        <article class="intro-card">
          ${body}
        </article>
        <footer class="intro-controls">
          <button data-action="intro-skip">Skip</button>
          <button data-action="intro-next">${actionLabel}</button>
        </footer>
      </div>
    `;
  }

  private renderIntroBeatBody(beat: IntroBeat): string {
    if (beat.chapterLabel && beat.chapterTitle) {
      return `
        <span class="intro-chapter-label">${this.escapeHtml(beat.chapterLabel)}</span>
        <h2>${this.escapeHtml(beat.chapterTitle)}</h2>
      `;
    }

    const kicker = beat.kicker ? `<span class="title-kicker">${this.escapeHtml(beat.kicker)}</span>` : '';
    const title = beat.title ? `<h2>${this.escapeHtml(beat.title)}</h2>` : '';
    const lines = beat.lines?.map((line) => `<p>${this.escapeHtml(line)}</p>`).join('') ?? '';
    const system = beat.systemLines ? this.renderIntroSystemLines(beat.systemLines) : '';
    const dialogue = beat.dialogue ? this.renderIntroDialogue(beat.dialogue) : '';
    const objective = beat.objective ? `<div class="intro-objective"><span>Objective</span><strong>${this.escapeHtml(beat.objective)}</strong></div>` : '';

    return `${kicker}${title}<div class="intro-copy">${lines}${system}${dialogue}${objective}</div>`;
  }

  private renderIntroSystemLines(lines: string[]): string {
    const rows = lines.map((line) => `<span>${this.escapeHtml(line)}</span>`).join('');
    return `<div class="intro-system-panel">${rows}</div>`;
  }

  private renderIntroDialogue(lines: IntroBeat['dialogue']): string {
    if (!lines) {
      return '';
    }
    const rows = lines
      .map((entry) => `
        <div class="intro-dialogue-line">
          <span>${this.escapeHtml(entry.speaker)}</span>
          <p>${this.escapeHtml(entry.line)}</p>
        </div>
      `)
      .join('');
    return `<div class="intro-dialogue">${rows}</div>`;
  }

  private renderSaveSummary(summary: ContinueSummary | undefined): string {
    if (!summary) {
      return '<span>No active save yet.</span>';
    }

    return `
      <span>Saved Route</span>
      <strong>${this.escapeHtml(summary.levelTitle)}</strong>
      <small>${this.escapeHtml(summary.checkpointLabel)} / ${this.escapeHtml(summary.timelineLabel)} / ${this.escapeHtml(summary.savedAtLabel)}</small>
    `;
  }

  private renderStorageStatus(): string {
    return `<p class="save-error" data-save-error role="alert" ${this.saveManager.getPersistenceStatus() === 'error' ? '' : 'hidden'}>Saving failed. Current progress is only available in this session.</p>`;
  }

  private updatePauseSaveSummary(summary: ContinueSummary | undefined): void {
    const element = this.overlayLayer.querySelector<HTMLElement>('[data-pause-save-summary]');
    if (element) {
      element.innerHTML = this.renderSaveSummary(summary);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
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
