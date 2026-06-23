export type IntroBeatVisual =
  | 'blackout'
  | 'laboratory'
  | 'system'
  | 'wake'
  | 'shift'
  | 'girl'
  | 'later'
  | 'objective'
  | 'chapter';

export interface IntroBeat {
  id: string;
  visual: IntroBeatVisual;
  kicker?: string;
  title?: string;
  lines?: string[];
  systemLines?: string[];
  dialogue?: Array<{
    speaker: 'Elias' | 'Girl' | 'The Later Man' | 'System';
    line: string;
  }>;
  objective?: string;
  chapterLabel?: string;
  chapterTitle?: string;
  durationMs: number;
  waitForInput?: boolean;
}

export const introBeats: IntroBeat[] = [
  {
    id: 'opening-narration',
    visual: 'blackout',
    kicker: 'Incident Zero',
    title: 'The city did not fall.',
    lines: [
      'It hesitated.',
      'For one impossible second, every clock in Veyr stopped at a different time.',
      'At the center of it all, beneath the Varren Observatory, the Chrono Core kept beating.',
      'Not alive. Not dead. Just refusing to end.',
    ],
    durationMs: 7600,
  },
  {
    id: 'laboratory-fade',
    visual: 'laboratory',
    kicker: 'Varren Observatory',
    title: 'Lower laboratory',
    lines: [
      'Rain ticks against broken glass.',
      'A clock drags each second like it is wounded.',
      'Elias Varren opens his eyes on the floor beneath his own machine.',
    ],
    durationMs: 6100,
  },
  {
    id: 'system-glitch',
    visual: 'system',
    kicker: 'Chrono Core',
    title: 'Emergency status',
    systemLines: [
      'CHRONO CORE STATUS: UNSTABLE',
      'LOCAL TIME INDEX: CORRUPTED',
      'ANCHOR SIGNAL: DETECTED',
      'ANCHOR IDENTITY: DAMAGED',
      'TEMPORAL LAYERS AVAILABLE: PAST / PRESENT / RUINED FUTURE',
      'WARNING: CONTINUITY CANNOT BE TRUSTED',
    ],
    durationMs: 6600,
  },
  {
    id: 'elias-wakes',
    visual: 'wake',
    kicker: 'Elias',
    title: 'The machine is still running.',
    dialogue: [
      { speaker: 'Elias', line: 'No. No, no, no...' },
      { speaker: 'Elias', line: 'This was contained.' },
      { speaker: 'System', line: 'CONTAINMENT RECORD NOT FOUND' },
      { speaker: 'Elias', line: 'Where is the source?' },
      { speaker: 'System', line: 'SOURCE LOCATION: BELOW OBSERVATORY LEVEL' },
      { speaker: 'System', line: 'RECOMMENDATION: DO NOT PROCEED' },
      { speaker: 'Elias', line: 'That recommendation is noted.' },
    ],
    durationMs: 7200,
  },
  {
    id: 'first-shift',
    visual: 'shift',
    kicker: 'Temporal bleed',
    title: 'The room remembers another hour.',
    lines: [
      'For less than a second, the walls are clean.',
      'The lamps are warm.',
      'A child\'s drawing is taped beside the terminal.',
      'Then it is gone.',
    ],
    systemLines: ['TEMPORAL BLEED DETECTED', 'MEMORY SOURCE: UNKNOWN'],
    durationMs: 6600,
  },
  {
    id: 'girl-voice',
    visual: 'girl',
    kicker: 'Static',
    title: 'A small voice slips through.',
    dialogue: [
      { speaker: 'Girl', line: 'You came back wrong.' },
      { speaker: 'Elias', line: 'Who is there?' },
      { speaker: 'Girl', line: 'Not yet.' },
    ],
    durationMs: 5200,
  },
  {
    id: 'later-man',
    visual: 'later',
    kicker: 'Observation corridor',
    title: 'A man in a dark coat watches.',
    systemLines: ['SECONDARY CHRONO SIGNATURE DETECTED', 'MATCH QUALITY: 99.7%', 'IDENTITY: ERROR'],
    dialogue: [
      { speaker: 'Elias', line: 'That is not possible.' },
      { speaker: 'The Later Man', line: 'It gets easier after the first lie.' },
      { speaker: 'Elias', line: 'Wait!' },
    ],
    durationMs: 6800,
  },
  {
    id: 'objective',
    visual: 'objective',
    kicker: 'Objective updated',
    title: 'Reach the Observatory Lift.',
    objective: 'Follow the fracture.',
    lines: ['The corridor ahead shifts into ruin. The Core answers with another pulse.'],
    durationMs: 4300,
  },
  {
    id: 'chapter-card',
    visual: 'chapter',
    chapterLabel: 'Chapter 0',
    chapterTitle: 'The Hour That Split',
    durationMs: 0,
    waitForInput: true,
  },
];
