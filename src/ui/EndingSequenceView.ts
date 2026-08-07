import { endingBeats, type EndingBeat } from '../game/content/ending';
import type { AudioManager } from '../game/systems/AudioManager';

export class EndingSequenceView {
  private readonly overlay: HTMLElement;
  private index = 0;
  private finished = false;
  private timeout?: number;
  private keyHandler?: (event: KeyboardEvent) => void;

  constructor(private readonly audioManager: AudioManager) {
    const overlay = document.querySelector<HTMLElement>('[data-layer="overlay"]');
    if (!overlay) {
      throw new Error('Missing ending overlay layer.');
    }
    this.overlay = overlay;
  }

  show(onComplete: () => void): void {
    this.destroy();
    this.finished = false;
    this.index = 0;

    const advance = (playSound = true) => {
      if (this.finished) {
        return;
      }
      if (playSound) {
        this.audioManager.playSfx('click');
      }
      if (this.index >= endingBeats.length - 1) {
        this.finished = true;
        this.destroy();
        onComplete();
        return;
      }
      this.index += 1;
      render();
    };

    const skipToEpilogue = () => {
      if (this.finished) {
        return;
      }
      this.audioManager.playSfx('click');
      this.index = endingBeats.length - 1;
      render();
    };

    const scheduleNext = (beat: EndingBeat) => {
      window.clearTimeout(this.timeout);
      if (beat.waitForInput || beat.durationMs <= 0) {
        return;
      }
      this.timeout = window.setTimeout(() => advance(false), beat.durationMs);
    };

    const render = () => {
      const beat = endingBeats[this.index];
      this.overlay.innerHTML = this.renderBeat(beat, this.index, endingBeats.length);
      this.overlay.classList.add('is-active');
      this.bindClick('[data-action="ending-next"]', () => advance());
      this.bindClick('[data-action="ending-skip"]', skipToEpilogue);
      scheduleNext(beat);
    };

    this.keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        advance();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        skipToEpilogue();
      }
    };
    window.addEventListener('keydown', this.keyHandler);
    render();
  }

  destroy(): void {
    window.clearTimeout(this.timeout);
    this.timeout = undefined;
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = undefined;
    }
  }

  private renderBeat(beat: EndingBeat, index: number, total: number): string {
    const isLast = index === total - 1;
    const actionLabel = isLast ? 'Main Menu' : 'Continue';
    return `
      <div class="ending-sequence ending-beat-${beat.visual}" data-ending-beat="${this.escapeHtml(beat.id)}">
        <div class="ending-stage" aria-hidden="true">
          <div class="ending-sky"></div>
          <div class="ending-core"></div>
          <div class="ending-elias"></div>
          <div class="ending-keeper"></div>
          <div class="ending-mara"></div>
          <div class="ending-rain"></div>
          <div class="ending-vignette"></div>
        </div>
        <article class="ending-card">
          ${this.renderBody(beat)}
        </article>
        <footer class="ending-controls">
          ${isLast ? '' : '<button data-action="ending-skip">Skip to Epilogue</button>'}
          <button data-action="ending-next">${actionLabel}</button>
        </footer>
      </div>
    `;
  }

  private renderBody(beat: EndingBeat): string {
    const kicker = beat.kicker ? `<span class="title-kicker">${this.escapeHtml(beat.kicker)}</span>` : '';
    const title = beat.title ? `<h2>${this.escapeHtml(beat.title)}</h2>` : '';
    const lines = beat.lines?.map((line) => `<p>${this.escapeHtml(line)}</p>`).join('') ?? '';
    const system = beat.systemLines ? this.renderSystemLines(beat.systemLines) : '';
    const dialogue = beat.dialogue ? this.renderDialogue(beat.dialogue) : '';
    return `${kicker}${title}<div class="ending-copy">${lines}${system}${dialogue}</div>`;
  }

  private renderSystemLines(lines: string[]): string {
    return `<div class="ending-system-panel">${lines.map((line) => `<span>${this.escapeHtml(line)}</span>`).join('')}</div>`;
  }

  private renderDialogue(lines: EndingBeat['dialogue']): string {
    if (!lines) {
      return '';
    }
    return `<div class="ending-dialogue">${lines
      .map(
        (entry) => `
          <div class="ending-dialogue-line">
            <span>${this.escapeHtml(entry.speaker)}</span>
            <p>${this.escapeHtml(entry.line)}</p>
          </div>
        `,
      )
      .join('')}</div>`;
  }

  private bindClick(selector: string, handler: () => void): void {
    this.overlay.querySelector<HTMLElement>(selector)?.addEventListener('click', handler);
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
