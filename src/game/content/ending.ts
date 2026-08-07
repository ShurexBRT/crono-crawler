export type EndingBeatVisual = 'reveal' | 'memory' | 'choice' | 'collapse' | 'release' | 'dawn' | 'epilogue';

export type EndingSpeaker = 'Elias' | 'The Later Man' | 'Mara' | 'System';

export interface EndingBeat {
  id: string;
  visual: EndingBeatVisual;
  kicker?: string;
  title?: string;
  lines?: string[];
  systemLines?: string[];
  dialogue?: Array<{
    speaker: EndingSpeaker;
    line: string;
  }>;
  durationMs: number;
  waitForInput?: boolean;
}

// This is the current canonical spine, not locked final prose.
// Keep the structure data-driven so the narrative pass can replace copy without scene changes.
export const endingBeats: EndingBeat[] = [
  {
    id: 'keeper-reveal',
    visual: 'reveal',
    kicker: 'The Still Hour',
    title: 'The Keeper removes his mask.',
    lines: ['Elias does not find a stranger underneath it.', 'He finds the face time has been trying to make for him.'],
    dialogue: [
      { speaker: 'Elias', line: 'You are me.' },
      { speaker: 'The Later Man', line: 'I am what remains when every correction is called mercy.' },
    ],
    durationMs: 7200,
  },
  {
    id: 'mara-truth',
    visual: 'memory',
    kicker: 'Core memory',
    title: 'The machine never brought Mara back.',
    lines: [
      'It learned the shape of Elias refusing to lose her.',
      'Every Past, every Present, every ruined tomorrow was built around that refusal.',
    ],
    systemLines: ['MEMORY ANCHOR: MARA VARREN', 'BIOLOGICAL RESTORATION: FAILED', 'CORRECTION LOOP: ACTIVE'],
    durationMs: 7600,
  },
  {
    id: 'refuse-correction',
    visual: 'choice',
    kicker: 'Correction available',
    title: 'One more loop would keep the Still Hour alive.',
    dialogue: [
      { speaker: 'The Later Man', line: 'We can hold her here. We only have to pay with tomorrow.' },
      { speaker: 'Elias', line: 'Then it was never mercy.' },
      { speaker: 'Elias', line: 'No more corrections.' },
    ],
    systemLines: ['CORRECTION REQUEST: DENIED', 'ANCHOR COHERENCE: FALLING'],
    durationMs: 7600,
  },
  {
    id: 'future-collapse',
    visual: 'collapse',
    kicker: 'Continuity failure',
    title: 'The Ruined Future goes first.',
    lines: [
      'Towers fold out of the skyline. Streets lose the years that never deserved to survive.',
      'The Later Man watches his world disappear and, for the first time, does not try to stop it.',
    ],
    durationMs: 6800,
  },
  {
    id: 'mara-release',
    visual: 'release',
    kicker: 'Memory release',
    title: 'Mara is not returned.',
    lines: [
      'The signal carrying her memory loosens from the Core.',
      'Elias lets the last perfect second become what it always was: a memory, not a place to live.',
    ],
    dialogue: [{ speaker: 'Mara', line: 'Dad.' }],
    durationMs: 6800,
  },
  {
    id: 'veyr-resumes',
    visual: 'dawn',
    kicker: 'Veyr',
    title: 'The clocks disagree again.',
    lines: [
      'Rain reaches the pavement.',
      'A tram bell rings too early. Somewhere, a watch runs three minutes fast.',
      'For the first time since the Core opened, the next second belongs to no one.',
    ],
    durationMs: 7200,
  },
  {
    id: 'epilogue-card',
    visual: 'epilogue',
    kicker: 'Epilogue',
    title: 'Tomorrow, imperfectly.',
    lines: ['The Still Hour is closed. Veyr moves forward. So does Elias.'],
    durationMs: 0,
    waitForInput: true,
  },
];
