import { AssetPaths } from '../game/assets/manifest';
import { MemoryVaultModel } from './MemoryVaultModel';

const escape = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

export function renderVaultPages(model: MemoryVaultModel): string {
  const current = model.current;
  if (!current) {
    return `<section class="vault-page vault-frontispiece" tabindex="0" aria-label="Book title page">
      <span class="vault-eyebrow">The Still Hour</span><h2>Memory<br>Vault</h2><div class="vault-rule"></div>
      <p class="vault-dedication">What the hour could not keep.</p><p class="vault-owner">Elias Varren</p>
      <p class="vault-tally">${model.collected.size} memories recovered<br>${model.unreadCount} unread</p>
    </section><section class="vault-page vault-contents" tabindex="0" aria-label="Table of contents"><h2>Contents</h2>
      <ol>${model.entries.map((entry, index) => {
        const unlocked = model.collected.has(entry.id);
        return `<li data-memory-id="${escape(entry.id)}" class="${unlocked ? 'is-recovered' : 'is-locked'}">
          <button data-vault-entry="${escape(entry.id)}" ${unlocked ? '' : 'disabled'}><span class="vault-entry-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${unlocked ? escape(entry.artifact?.title ?? 'Memory') : 'Unrecovered'}</strong><small>${escape(entry.levelTitle)}</small></span>${unlocked && !model.read.has(entry.id) ? '<i class="vault-unread" aria-label="Unread"></i>' : ''}</button>
        </li>`;
      }).join('')}</ol></section>`;
  }
  if (!model.collected.has(current.id)) {
    return `<section class="vault-page vault-missing" tabindex="0" aria-label="Missing memory"><span class="vault-eyebrow">${escape(current.levelTitle)}</span><h2>A Page<br>Still Missing</h2><div class="vault-rule"></div><p>The hour has not given this back.</p></section><section class="vault-page vault-missing" tabindex="0" aria-label="Unrecovered entry"><span class="vault-eyebrow">${String(model.index).padStart(2, '0')}</span><h2>Unrecovered</h2></section>`;
  }
  const art = current.artifact;
  const letter = art?.letter;
  const title = art?.title ?? 'Memory';
  const illustration = art ? `<figure><img data-vault-art src="${escape(art.image)}" alt="${escape(art.alt)}" width="1254" height="1254" decoding="async"><span class="vault-art-error" role="status" hidden>Illustration unavailable</span><figcaption>${escape(art.caption)}</figcaption></figure>` : '';
  const letterText = letter ? `<div class="vault-letter" data-vault-letter><p>${escape(letter.greeting)}</p>${letter.paragraphs.map((line) => `<p>${escape(line)}</p>`).join('')}<p class="vault-signature">${escape(letter.signature)}</p></div>` : '';
  return `<section class="vault-page vault-art-page" tabindex="0" aria-label="${letter ? 'Letter' : 'Illustration'}"><span class="vault-eyebrow">${escape(current.levelTitle)}</span>${letter ? `<h2>${escape(title)}</h2>${letterText}` : illustration}</section>
    <section class="vault-page vault-reading-page" tabindex="0" aria-label="Memory text"><span class="vault-eyebrow">${escape(art?.byline ?? current.levelTitle)}</span>${letter ? `<div class="vault-letter-memento">${illustration}</div><h2>Remembered</h2>` : `<h2>${escape(title)}</h2>`}
    ${art?.inscription ? `<blockquote>${escape(art.inscription)}</blockquote>` : ''}<div class="vault-prose">${current.lines.map((line) => `<p>${escape(line)}</p>`).join('')}</div></section>`;
}

interface VaultActions { onClose: () => void; onRead: (id: string) => void; onTurn: () => void }

export class MemoryVaultView {
  private readonly listeners = new AbortController();
  private frame = 0;
  private previousButtons = new Set<number>();
  private destroyed = false;
  private readonly book: HTMLElement;
  private readonly previous: HTMLButtonElement;
  private readonly next: HTMLButtonElement;
  private readonly contents: HTMLButtonElement;

  constructor(private readonly host: HTMLElement, readonly model: MemoryVaultModel, private readonly actions: VaultActions) {
    host.innerHTML = `<section class="memory-vault" role="dialog" aria-modal="true" aria-label="Memory Vault" data-memory-vault>
      <header class="vault-toolbar"><span class="vault-heading">Memory Vault <small data-memory-count>${model.collected.size} / ${model.entries.length}</small></span><div><button data-action="vault-contents">Contents</button><button data-action="vault-close">Close Book</button></div></header>
      <div class="vault-desk"><div class="vault-book" data-vault-book style="background-image:url('${AssetPaths.memoryVaultBook}')"></div></div>
      <footer class="vault-navigation"><button data-action="vault-prev" aria-label="Previous spread" title="Previous spread">&#8592;</button><span data-vault-position aria-live="polite"></span><button data-action="vault-next" aria-label="Next spread" title="Next spread">&#8594;</button></footer>
    </section>`;
    this.book = host.querySelector<HTMLElement>('[data-vault-book]')!;
    this.previous = host.querySelector<HTMLButtonElement>('[data-action="vault-prev"]')!;
    this.next = host.querySelector<HTMLButtonElement>('[data-action="vault-next"]')!;
    this.contents = host.querySelector<HTMLButtonElement>('[data-action="vault-contents"]')!;
    host.querySelector('[data-action="vault-close"]')!.addEventListener('click', () => this.close(), { signal: this.listeners.signal });
    this.previous.addEventListener('click', () => this.turn(model.index - 1), { signal: this.listeners.signal });
    this.next.addEventListener('click', () => this.turn(model.index + 1), { signal: this.listeners.signal });
    this.contents.addEventListener('click', () => this.turn(0), { signal: this.listeners.signal });
    window.addEventListener('keydown', (event) => this.handleKey(event), { capture: true, signal: this.listeners.signal });
    this.previousButtons = this.gamepadButtons();
    this.render();
    host.querySelector<HTMLButtonElement>('[data-action="vault-close"]')!.focus({ preventScroll: true });
    this.frame = requestAnimationFrame(() => this.pollGamepad());
  }

  private render(): void {
    const id = this.model.readCurrent();
    if (id) this.actions.onRead(id);
    this.book.innerHTML = renderVaultPages(this.model);
    this.book.dataset.vaultEntryId = this.model.current?.id ?? 'contents';
    this.previous.disabled = !this.model.canPrevious;
    this.next.disabled = !this.model.canNext;
    this.contents.disabled = this.model.index === 0;
    this.host.querySelector('[data-vault-position]')!.textContent = `${this.model.index + 1} / ${this.model.totalPages}`;
    this.book.querySelectorAll<HTMLButtonElement>('[data-vault-entry]').forEach((button) => button.addEventListener('click', () => {
      this.model.goToEntry(button.dataset.vaultEntry!);
      this.actions.onTurn();
      this.render();
      this.focusFirstPage();
    }));
    this.book.querySelectorAll<HTMLImageElement>('[data-vault-art]').forEach((img) => {
      const error = img.parentElement!.querySelector<HTMLElement>('.vault-art-error')!;
      img.addEventListener('error', () => { img.hidden = true; error.hidden = false; }, { once: true });
    });
  }

  private turn(page: number): void {
    const before = this.model.index;
    this.model.goTo(page);
    if (this.model.index === before) return;
    this.actions.onTurn();
    this.render();
    this.focusFirstPage();
  }

  private focusFirstPage(): void {
    this.book.querySelector<HTMLElement>('.vault-page')?.focus({ preventScroll: true });
  }

  private focusables(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')).filter((node) => node.getClientRects().length > 0);
  }

  private moveFocus(direction: number): void {
    const nodes = this.focusables();
    if (!nodes.length) return;
    const index = nodes.indexOf(document.activeElement as HTMLElement);
    nodes[(index + direction + nodes.length) % nodes.length].focus();
  }

  private handleKey(event: KeyboardEvent): void {
    // The book owns input while an older dialogue or pause overlay is suspended.
    event.stopImmediatePropagation();
    if (event.code === 'KeyJ' || event.key === 'Escape') {
      event.preventDefault();
      if (!event.repeat) this.close();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      this.moveFocus(event.shiftKey ? -1 : 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      if (!event.repeat) this.turn(this.model.index + (event.key === 'ArrowLeft' ? -1 : 1));
    } else if (event.key === 'Enter' || (event.key === ' ' && document.activeElement instanceof HTMLButtonElement)) {
      event.preventDefault();
      if (!event.repeat && document.activeElement instanceof HTMLButtonElement) document.activeElement.click();
    }
  }

  private gamepadButtons(): Set<number> {
    const pressed = new Set<number>();
    for (const pad of navigator.getGamepads?.() ?? []) {
      if (pad?.connected) pad.buttons.forEach((button, index) => { if (button.pressed) pressed.add(index); });
    }
    return pressed;
  }

  private pollGamepad(): void {
    if (this.destroyed) return;
    const pressed = this.gamepadButtons();
    const previous = this.previousButtons;
    const edge = (index: number) => pressed.has(index) && !previous.has(index);
    this.previousButtons = pressed;
    if (edge(1) || edge(8) || edge(9)) this.close();
    else if (edge(4) || edge(14)) this.turn(this.model.index - 1);
    else if (edge(5) || edge(15)) this.turn(this.model.index + 1);
    else if (edge(12) || edge(13)) this.moveFocus(edge(12) ? -1 : 1);
    else if (edge(0) && document.activeElement instanceof HTMLButtonElement) document.activeElement.click();
    if (!this.destroyed) this.frame = requestAnimationFrame(() => this.pollGamepad());
  }

  private close(): void {
    if (this.destroyed) return;
    this.destroy();
    this.actions.onClose();
  }

  destroy(): void {
    this.destroyed = true;
    this.listeners.abort();
    cancelAnimationFrame(this.frame);
  }
}
