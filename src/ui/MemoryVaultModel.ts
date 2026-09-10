import type { MemoryArtifact } from '../game/content/memory-artifacts';

export interface VaultEntry {
  id: string;
  levelTitle: string;
  lines: string[];
  artifact?: MemoryArtifact;
}

export class MemoryVaultModel {
  readonly collected: Set<string>;
  readonly read: Set<string>;
  private page = 0;

  constructor(readonly entries: VaultEntry[], collected: string[], read: string[], lastViewedId?: string) {
    const known = new Set(entries.map((entry) => entry.id));
    this.collected = new Set(collected.filter((id) => known.has(id)));
    this.read = new Set(read.filter((id) => this.collected.has(id)));
    if (lastViewedId && this.collected.has(lastViewedId)) this.goToEntry(lastViewedId);
  }

  get index(): number { return this.page; }
  get totalPages(): number { return this.entries.length + 1; }
  get current(): VaultEntry | undefined { return this.entries[this.page - 1]; }
  get unreadCount(): number { return this.collected.size - this.read.size; }
  get canPrevious(): boolean { return this.page > 0; }
  get canNext(): boolean { return this.page < this.totalPages - 1; }

  goTo(page: number): void {
    if (!Number.isFinite(page)) return;
    this.page = Math.max(0, Math.min(this.totalPages - 1, Math.trunc(page)));
  }

  goToEntry(id: string): void {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index >= 0) this.goTo(index + 1);
  }

  readCurrent(): string | undefined {
    const id = this.current?.id;
    if (!id || !this.collected.has(id)) return;
    this.read.add(id);
    return id;
  }
}
