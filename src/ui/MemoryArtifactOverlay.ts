import type { MemoryArtifactSpec } from '../game/types';

export interface MemoryArtifactViewModel {
  title: string;
  artifact: MemoryArtifactSpec;
}

export function showMemoryArtifactOverlay(view: MemoryArtifactViewModel, onDone: () => void): void {
  const overlay = document.querySelector<HTMLElement>('#ui-root [data-layer="overlay"]');
  if (!overlay) {
    onDone();
    return;
  }

  let closed = false;
  let gamepadFrame = 0;
  let previousGamepadPressed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    window.removeEventListener('keydown', onKeyDown);
    window.cancelAnimationFrame(gamepadFrame);
    overlay.innerHTML = '';
    onDone();
  };

  overlay.innerHTML = `
    <div class="memory-artifact-shell" data-memory-artifact>
      <div class="memory-artifact-vignette" aria-hidden="true"></div>
      <article class="memory-artifact-panel" role="dialog" aria-modal="true" aria-labelledby="memory-artifact-title">
        <header class="memory-artifact-header">
          <span class="memory-artifact-kicker">Recovered Memory</span>
          <h2 id="memory-artifact-title">${escapeHtml(view.title)}</h2>
          ${renderMetadata(view.artifact)}
        </header>
        <div class="memory-artifact-stage memory-artifact-${escapeAttribute(view.artifact.kind)}">
          <img src="${escapeAttribute(view.artifact.image)}" alt="${escapeAttribute(view.artifact.alt)}" />
        </div>
        ${view.artifact.caption ? `<p class="memory-artifact-caption">${escapeHtml(view.artifact.caption)}</p>` : ''}
        <footer class="memory-artifact-footer">
          <span>Enter / Space / Esc</span>
          <button type="button" data-action="close-memory-artifact">Return to Veyr</button>
        </footer>
      </article>
    </div>
  `;

  overlay.querySelector<HTMLButtonElement>('[data-action="close-memory-artifact"]')?.addEventListener('click', close);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape' || event.key.toLowerCase() === 'e') {
      event.preventDefault();
      close();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  const pollGamepad = () => {
    if (closed) return;
    const pad = navigator.getGamepads?.()[0];
    const pressed = Boolean(pad?.buttons?.[0]?.pressed || pad?.buttons?.[1]?.pressed || pad?.buttons?.[9]?.pressed);
    if (pressed && !previousGamepadPressed) close();
    previousGamepadPressed = pressed;
    if (!closed) gamepadFrame = window.requestAnimationFrame(pollGamepad);
  };
  gamepadFrame = window.requestAnimationFrame(pollGamepad);

  overlay.querySelector<HTMLButtonElement>('[data-action="close-memory-artifact"]')?.focus();
}

function renderMetadata(artifact: MemoryArtifactSpec): string {
  const parts = [artifact.date, artifact.location].filter(Boolean).map((part) => `<span>${escapeHtml(part ?? '')}</span>`);
  return parts.length ? `<div class="memory-artifact-meta">${parts.join('<i></i>')}</div>` : '';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
