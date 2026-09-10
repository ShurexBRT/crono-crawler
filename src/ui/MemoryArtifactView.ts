import type { MemoryArtifact } from '../game/content/memory-artifacts';

function escape(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export function renderMemoryArtifact(artifact: MemoryArtifact, lines: string[], recovered: boolean): string {
  const letter = artifact.letter;
  return `<section class="memory-reveal memory-kind-${artifact.kind}" role="dialog" aria-modal="true" aria-labelledby="memory-title" data-artifact-id="${escape(artifact.id)}">
    <header class="memory-reveal-header"><span>${recovered ? 'Memory Recovered' : 'From the Journal'}</span><button data-action="memory-close">${recovered ? 'Keep Memory' : 'Back to Memories'}</button></header>
    <div class="memory-reveal-body" tabindex="0" role="region" aria-label="Memory contents">
      <figure class="memory-artifact ${letter ? 'is-letter' : ''}">
        <div class="memory-artwork">
          <img data-memory-art src="${escape(artifact.image)}" alt="${escape(artifact.alt)}" width="1024" height="1024" decoding="async" />
          <span class="memory-image-error" role="status" hidden>Illustration unavailable</span>
        </div>
        ${letter ? `<div class="memory-letter" data-memory-letter><p>${escape(letter.greeting)}</p>${letter.paragraphs.map((paragraph) => `<p>${escape(paragraph)}</p>`).join('')}<p class="memory-signature">${escape(letter.signature)}</p></div>` : ''}
        <figcaption>${escape(artifact.caption)}</figcaption>
      </figure>
      <article class="memory-reflection">
        <span class="memory-byline">${escape(artifact.byline)}</span><h2 id="memory-title">${escape(artifact.title)}</h2>
        ${artifact.inscription ? `<blockquote>${escape(artifact.inscription)}</blockquote>` : ''}
        <div class="memory-reflection-copy">${lines.map((line) => `<p>${escape(line)}</p>`).join('')}</div>
      </article>
    </div>
  </section>`;
}

export class MemoryArtifactView {
  private readonly listeners = new AbortController();
  private finished = false;
  private suspended = false;

  constructor(private readonly host: HTMLElement, artifact: MemoryArtifact, lines: string[], recovered: boolean, onClose: () => void) {
    host.innerHTML = renderMemoryArtifact(artifact, lines, recovered);
    const close = host.querySelector<HTMLButtonElement>('[data-action="memory-close"]')!;
    const contents = host.querySelector<HTMLElement>('.memory-reveal-body')!;
    const finish = () => {
      if (this.finished) return;
      this.destroy();
      onClose();
    };
    close.addEventListener('click', finish, { signal: this.listeners.signal });
    const img = host.querySelector<HTMLImageElement>('[data-memory-art]')!;
    const imageError = host.querySelector<HTMLElement>('.memory-image-error')!;
    img.addEventListener('error', () => {
      imageError.hidden = false;
      img.classList.add('has-error');
    }, { signal: this.listeners.signal });
    // Capture before Phaser's window listeners so closing cannot also jump or pause.
    window.addEventListener('keydown', (event) => {
      if (this.suspended) return;
      if (event.key === 'Tab') {
        event.preventDefault();
        event.stopImmediatePropagation();
        (document.activeElement === close ? contents : close).focus({ preventScroll: true });
      } else if (['Escape', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!event.repeat) finish();
      } else if (['KeyA', 'KeyD', 'KeyW', 'KeyE', 'KeyG', 'KeyR', 'KeyQ', 'KeyP', 'Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].includes(event.code) || event.key.startsWith('Arrow')) {
        event.stopImmediatePropagation();
      }
    }, { capture: true, signal: this.listeners.signal });
    close.focus({ preventScroll: true });
  }

  destroy(): void {
    this.finished = true;
    this.listeners.abort();
  }

  suspend(): void { this.suspended = true; }
  resume(): void { this.suspended = false; }
}
