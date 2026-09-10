import type { DoorSpec, LevelData, TimelineBlockSpec, TimelineKey } from '../types';

function span(id: string, x: number, y: number, width: number, timeline: TimelineKey): TimelineBlockSpec {
  const state = (key: TimelineKey) => ({ solid: timeline === key, visible: true, color: { past: 0x8d6b42, present: 0x263743, future: 0x3d2a35 }[key], alpha: timeline === key ? 1 : 0.18 });
  return { id, x, y, width, height: 20, states: { past: state('past'), present: state('present'), future: state('future') } };
}

function gate(id: string, x: number, floorY: number, flags: string[]): DoorSpec {
  return {
    id, x, y: floorY - 90, width: 44, height: 180, requiresFlags: flags,
    states: {
      past: { solid: true, visible: true, color: 0x75614d },
      present: { solid: true, visible: true, color: 0x32434f },
      future: { solid: true, visible: true, color: 0x57333b },
    },
  };
}

export const finalActLevels: LevelData[] = [
  {
    id: 'hourglass-hotel', title: 'The Hourglass Hotel',
    subtitle: 'Every floor remembers a different guest.',
    width: 1920, height: 1340, spawn: { x: 95, y: 1220 },
    camera: { deadzone: { width: 180, height: 80 } },
    objective: 'Leave an echo at reception. Reconnect the upper floors in the Future.',
    nextLevelId: 'unsaid-archive', startTimeline: 'present', background: 'station',
    startLines: [
      'The guest book has one name written a hundred times. Elias Varren. Every departure left blank.',
      'Reception still has power. Upstairs, the stairs belong to different years.',
    ],
    platforms: [
      { id: 'hotel-lobby', x: 350, y: 1310, width: 700, height: 60 },
      { id: 'hotel-first-step', x: 500, y: 1210, width: 160, height: 20 },
      { id: 'hotel-service-floor', x: 830, y: 1050, width: 200, height: 20 },
      { id: 'hotel-rest-floor', x: 1160, y: 890, width: 220, height: 20 },
      { id: 'hotel-upper-floor', x: 1490, y: 730, width: 200, height: 20 },
      { id: 'hotel-roof', x: 1770, y: 650, width: 300, height: 20 },
    ],
    timelineBlocks: [
      span('hotel-old-stairs', 665, 1130, 160, 'past'),
      span('hotel-fallen-balcony', 1000, 970, 170, 'future'),
      span('hotel-powered-landing', 1330, 810, 160, 'present'),
    ],
    plates: [{ id: 'hotel-reception-plate', flag: 'hotel_echo', x: 340, y: 1276, width: 86, height: 12, timelines: ['present'] }],
    switches: [{ id: 'hotel-route-switch', flag: 'hotel_route', x: 850, y: 1024, width: 42, height: 34, timelines: ['future'], requiresFlags: ['hotel_echo'] }],
    doors: [gate('hotel-roof-gate', 1775, 640, ['hotel_route'])],
    requiredExitFlags: ['hotel_route'], enemies: [],
    checkpoints: [
      { id: 'hotel-reception', label: 'Reception', x: 200, y: 1240 },
      { id: 'hotel-mezzanine', label: 'Mezzanine', x: 1130, y: 840 },
    ],
    storyZones: [{ id: 'hotel-guest-book', x: 1480, y: 680, width: 100, height: 100, once: true, lines: ['At the top of the book, a child has crossed out "departure" and written "home".'] }],
    memoryFragments: [{ id: 'hotel-room-key', title: 'Memory Fragment: Room 00', x: 1545, y: 675, lines: ['He kept the room exactly as she left it. Even the dust was not allowed to settle.'] }],
    exit: { x: 1850, y: 590, width: 60, height: 100 },
  },
  {
    id: 'unsaid-archive', title: 'Archive of Unsaid Things',
    subtitle: 'The records the Keeper could not erase.',
    width: 2520, height: 720, spawn: { x: 95, y: 600 },
    objective: 'Recover the record, read the testimony, release the sealed hour.',
    objectives: [{ flag: 'archive_record', label: 'Past record' }, { flag: 'archive_testimony', label: 'Present testimony' }, { flag: 'archive_release', label: 'Future seal' }],
    nextLevelId: 'crownline-rooftops', startTimeline: 'present', background: 'greenhouse',
    startLines: [
      'The archive kept every word Elias could not say. The Keeper filed them as errors.',
      'A record in the Past. A testimony in the Present. A seal waiting in the Future.',
    ],
    platforms: [
      { id: 'archive-west', x: 600, y: 690, width: 1200, height: 60 },
      { id: 'archive-east', x: 2010, y: 690, width: 1020, height: 60 },
      { id: 'archive-reading-step', x: 740, y: 610, width: 150, height: 20 },
      { id: 'archive-reading-desk', x: 900, y: 530, width: 190, height: 20 },
    ],
    timelineBlocks: [span('archive-fallen-shelves', 1340, 635, 320, 'future')],
    plates: [],
    switches: [
      { id: 'archive-old-index', flag: 'archive_record', x: 430, y: 644, width: 42, height: 34, timelines: ['past'] },
      { id: 'archive-testimony-desk', flag: 'archive_testimony', x: 1040, y: 644, width: 42, height: 34, timelines: ['present'], requiresFlags: ['archive_record'] },
      { id: 'archive-seal', flag: 'archive_release', x: 2050, y: 644, width: 42, height: 34, timelines: ['future'], requiresFlags: ['archive_testimony'] },
    ],
    doors: [gate('archive-index-door', 610, 660, ['archive_record']), gate('archive-reading-door', 1140, 660, ['archive_testimony']), gate('archive-exit-door', 2260, 660, ['archive_release'])],
    requiredExitFlags: ['archive_release'], enemies: [],
    checkpoints: [{ id: 'archive-reading-room', label: 'Reading Room', x: 1090, y: 620 }, { id: 'archive-vault', label: 'Unsealed Vault', x: 1830, y: 620 }],
    storyZones: [
      { id: 'archive-truth', x: 1710, y: 600, width: 110, height: 130, once: true, lines: ['There was no failed rescue. She had already gone. The machine only stopped everyone else from saying goodbye.'] },
    ],
    memoryFragments: [{ id: 'archive-unsent-letter', title: 'Memory Fragment: Unsent Letter', x: 910, y: 480, lines: ['I was not afraid of the future, she wrote. I was afraid you would refuse to come with me.'] }],
    exit: { x: 2440, y: 600, width: 70, height: 130 },
  },
  {
    id: 'crownline-rooftops', title: 'Crownline Rooftops',
    subtitle: 'Above the last streetlight.',
    width: 2540, height: 720, spawn: { x: 95, y: 510 },
    objective: 'Carry the signal across the roofs. The Core is ahead.',
    nextLevelId: 'core-reliquary', startTimeline: 'past', background: 'streets',
    startLines: ['The city opens below Elias. For the first time, he can see where the frozen rain ends.'],
    platforms: [
      { id: 'crownline-entry', x: 230, y: 590, width: 460, height: 40 },
      { id: 'crownline-west-roof', x: 820, y: 560, width: 300, height: 30 },
      { id: 'crownline-middle-roof', x: 1430, y: 610, width: 280, height: 30 },
      { id: 'crownline-east-roof', x: 2060, y: 560, width: 320, height: 30 },
      { id: 'crownline-exit', x: 2430, y: 590, width: 220, height: 40 },
    ],
    timelineBlocks: [span('crownline-past-sign', 555, 555, 190, 'past'), span('crownline-present-aerial', 1130, 540, 250, 'present'), span('crownline-future-span', 1725, 545, 270, 'future')],
    plates: [], switches: [], doors: [],
    enemies: [{ id: 'crownline-patrol', x: 2100, y: 500, patrolMinX: 2020, patrolMaxX: 2165, speed: 60 }],
    checkpoints: [{ id: 'crownline-west-beacon', label: 'West Aerial', x: 800, y: 510 }, { id: 'crownline-mid-beacon', label: 'Signal Tower', x: 1440, y: 560 }],
    storyZones: [],
    memoryFragments: [{ id: 'crownline-paper-crown', title: 'Memory Fragment: Paper Crown', x: 1800, y: 485, lines: ['The crown is made from a train ticket. On the back: anywhere, as long as we keep going.'] }],
    exit: { x: 2470, y: 530, width: 65, height: 100 },
  },
  {
    id: 'core-reliquary', title: 'The Core Reliquary',
    subtitle: 'Three hours. One way forward.',
    width: 2580, height: 720, spawn: { x: 95, y: 600 },
    objective: 'Bind the old echo, power the present, release the future.',
    objectives: [{ flag: 'relic_past', label: 'Past relic' }, { flag: 'relic_present', label: 'Present relic' }, { flag: 'relic_future', label: 'Future relic' }],
    nextLevelId: 'boss', startTimeline: 'present', background: 'reactor',
    startLines: ['The Core was built to hold three hours together. The Keeper made it hold one hour forever.'],
    platforms: [
      { id: 'reliquary-west', x: 520, y: 690, width: 1040, height: 60 },
      { id: 'reliquary-east', x: 1920, y: 690, width: 1320, height: 60 },
      { id: 'reliquary-stair', x: 1510, y: 610, width: 140, height: 20 },
      { id: 'reliquary-dais', x: 1670, y: 530, width: 190, height: 20 },
    ],
    timelineBlocks: [span('reliquary-present-bridge', 1150, 625, 250, 'present')],
    plates: [{ id: 'reliquary-echo-plate', flag: 'relic_echo', x: 330, y: 656, width: 86, height: 12, timelines: ['past'] }],
    switches: [
      { id: 'reliquary-past-lock', flag: 'relic_past', x: 760, y: 644, width: 42, height: 34, timelines: ['present'], requiresFlags: ['relic_echo'] },
      { id: 'reliquary-present-lock', flag: 'relic_present', x: 1670, y: 504, width: 42, height: 34, timelines: ['present'], requiresFlags: ['relic_past'] },
      { id: 'reliquary-future-lock', flag: 'relic_future', x: 2180, y: 644, width: 42, height: 34, timelines: ['future'], requiresFlags: ['relic_present'] },
    ],
    doors: [gate('reliquary-first-seal', 900, 660, ['relic_past']), gate('reliquary-last-seal', 2370, 660, ['relic_past', 'relic_present', 'relic_future'])],
    requiredExitFlags: ['relic_past', 'relic_present', 'relic_future'],
    enemies: [{ id: 'reliquary-patrol', x: 1970, y: 610, patrolMinX: 1870, patrolMaxX: 2070, speed: 64 }],
    checkpoints: [{ id: 'reliquary-middle', label: 'Relic Dais', x: 1390, y: 620 }, { id: 'reliquary-last', label: 'Core Threshold', x: 2280, y: 620 }],
    storyZones: [{ id: 'reliquary-echo-binding', x: 690, y: 600, width: 95, height: 120, once: true, lines: ['The old echo holds the circuit until the Present binds it. After that, the choice will survive a rewind.'] }],
    memoryFragments: [{ id: 'reliquary-first-second', title: 'Memory Fragment: The First Second', x: 1740, y: 480, lines: ['The first sound the Core ever made was a heartbeat. Elias had mistaken it for an answer.'] }],
    exit: { x: 2500, y: 600, width: 70, height: 130 },
  },
];
