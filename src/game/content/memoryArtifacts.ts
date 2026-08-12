import type { MemoryArtifactSpec } from '../types';

const artifacts: Record<string, MemoryArtifactSpec> = {
  'reactor-daughter-sketch': {
    kind: 'note',
    image: 'assets/production/memory/folded-paper.svg',
    alt: 'A worn folded note with a childlike drawing of Veyr and the handwritten words “You said soon.”',
    location: 'Varren Observatory',
    caption: 'The paper feels older than the room around it.',
  },
};

export function memoryArtifactFor(fragmentId: string): MemoryArtifactSpec | undefined {
  return artifacts[fragmentId];
}

export function allMemoryArtifacts(): Readonly<Record<string, MemoryArtifactSpec>> {
  return artifacts;
}
