export class DialogueManager {
  private seenIds = new Set<string>();
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  tryShow(
    id: string,
    lines: string[],
    once: boolean,
    show: (lines: string[], onDone: () => void) => void,
  ): boolean {
    if (once && this.seenIds.has(id)) {
      return false;
    }

    this.active = true;
    show(lines, () => {
      if (once) {
        this.seenIds.add(id);
      }
      this.active = false;
    });
    return true;
  }
}
