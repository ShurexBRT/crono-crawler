import type { LevelData, TimelineVisualState } from '../types';

const gone: TimelineVisualState = { solid: false, visible: false, color: 0x000000, alpha: 0 };
const pastSolid: TimelineVisualState = { solid: true, visible: true, color: 0x8d6b42 };
const presentSolid: TimelineVisualState = { solid: true, visible: true, color: 0x263743 };
const futureSolid: TimelineVisualState = { solid: true, visible: true, color: 0x3d2a35 };
const brokenPresent: TimelineVisualState = { solid: false, visible: true, color: 0x33414a, alpha: 0.32 };
const overgrown: TimelineVisualState = { solid: true, visible: true, color: 0x426b48 };
const ruinedGhost: TimelineVisualState = { solid: false, visible: true, color: 0x522b33, alpha: 0.36 };

export const levels: LevelData[] = [
  {
    id: 'tutorial',
    title: 'The Folded Reactor',
    subtitle: 'Elias wakes beneath the Chrono Core.',
    width: 1850,
    height: 720,
    spawn: { x: 90, y: 600 },
    objective: 'Reach the broken service gate.',
    nextLevelId: 'level-1',
    startTimeline: 'present',
    background: 'reactor',
    startLines: [
      'Elias wakes under a dead clock. The Core is in his chest, ticking in three directions.',
      'The city outside is silent. Not empty. Waiting.',
    ],
    platforms: [
      { id: 'reactor-floor-left', x: 430, y: 690, width: 860, height: 60 },
      { id: 'reactor-floor-right', x: 1400, y: 690, width: 900, height: 60 },
      { id: 'reactor-step', x: 505, y: 590, width: 180, height: 24, color: 0x2d3c43 },
    ],
    timelineBlocks: [
      {
        id: 'remembered-bridge',
        x: 965,
        y: 635,
        width: 230,
        height: 24,
        states: {
          past: pastSolid,
          present: brokenPresent,
          future: gone,
        },
      },
      {
        id: 'rusted-service-gate',
        x: 1590,
        y: 610,
        width: 54,
        height: 102,
        states: {
          past: { solid: true, visible: true, color: 0x6a573d },
          present: { solid: true, visible: true, color: 0x40505a },
          future: { solid: false, visible: true, color: 0x73313a, alpha: 0.25 },
        },
      },
    ],
    doors: [],
    plates: [],
    switches: [],
    enemies: [],
    checkpoints: [{ id: 'reactor-checkpoint', x: 760, y: 620 }],
    storyZones: [
      {
        id: 'timeline-hint',
        x: 785,
        y: 600,
        width: 110,
        height: 140,
        once: true,
        lines: ['The bridge remembers being whole. Elias can almost hear its older shape.'],
      },
      {
        id: 'future-hint',
        x: 1420,
        y: 600,
        width: 120,
        height: 140,
        once: true,
        lines: ['Ahead, the gate is not opened. In one future, it is simply gone.'],
      },
    ],
    exit: { x: 1760, y: 600, width: 70, height: 130 },
  },
  {
    id: 'level-1',
    title: 'Lock Street',
    subtitle: 'A frozen avenue with a door that only pressure remembers.',
    width: 2050,
    height: 720,
    spawn: { x: 90, y: 600 },
    objective: 'Use an echo to hold the street plate.',
    nextLevelId: 'level-2',
    startTimeline: 'present',
    background: 'streets',
    startLines: [
      'Outside, rain hangs in the air like black glass.',
      'A shadow crosses the rooftops. It moves when nothing else can.',
    ],
    platforms: [
      { id: 'street-left', x: 400, y: 690, width: 800, height: 60 },
      { id: 'street-right', x: 1525, y: 690, width: 1050, height: 60 },
      { id: 'street-awning', x: 690, y: 560, width: 190, height: 22, color: 0x273844 },
    ],
    timelineBlocks: [
      {
        id: 'old-street-bridge',
        x: 910,
        y: 635,
        width: 260,
        height: 24,
        states: {
          past: pastSolid,
          present: brokenPresent,
          future: gone,
        },
      },
    ],
    doors: [
      {
        id: 'plate-door',
        x: 1160,
        y: 610,
        width: 54,
        height: 102,
        requiresFlags: ['street_plate'],
        states: {
          past: { solid: true, visible: true, color: 0x75614d },
          present: { solid: true, visible: true, color: 0x32434f },
          future: { solid: true, visible: true, color: 0x57333b },
        },
      },
    ],
    plates: [{ id: 'street-pressure-plate', flag: 'street_plate', x: 420, y: 656, width: 82, height: 12 }],
    switches: [],
    enemies: [{ id: 'first-rustmite', x: 1480, y: 620, patrolMinX: 1310, patrolMaxX: 1690, speed: 68 }],
    checkpoints: [{ id: 'street-checkpoint', x: 1320, y: 620 }],
    storyZones: [
      {
        id: 'echo-hint',
        x: 340,
        y: 600,
        width: 130,
        height: 140,
        once: true,
        lines: ['The Core leaves an echo behind. For a few seconds, Elias can ask yesterday to stand still.'],
      },
      {
        id: 'keeper-trace',
        x: 1560,
        y: 600,
        width: 120,
        height: 140,
        once: true,
        lines: ['A black figure watches from a second that never arrives.'],
      },
    ],
    exit: { x: 1950, y: 600, width: 70, height: 130 },
  },
  {
    id: 'level-2',
    title: 'Glasshouse Station',
    subtitle: 'The city grows through its own machinery.',
    width: 2240,
    height: 720,
    spawn: { x: 95, y: 600 },
    objective: 'Restore the station route.',
    nextLevelId: 'level-3',
    startTimeline: 'present',
    background: 'greenhouse',
    startLines: [
      'The station garden blooms in one timeline and burns in another.',
      'A girl stands between them. "He thinks stillness is mercy," she says.',
    ],
    platforms: [
      { id: 'greenhouse-left', x: 520, y: 690, width: 1040, height: 60 },
      { id: 'greenhouse-middle', x: 1260, y: 690, width: 250, height: 60 },
      { id: 'greenhouse-right', x: 1810, y: 690, width: 860, height: 60 },
      { id: 'greenhouse-roof', x: 520, y: 520, width: 190, height: 24, color: 0x344647 },
    ],
    timelineBlocks: [
      {
        id: 'present-service-lift',
        x: 1085,
        y: 585,
        width: 160,
        height: 22,
        states: {
          past: { solid: false, visible: true, color: 0x3b6a42, alpha: 0.35 },
          present: presentSolid,
          future: gone,
        },
      },
      {
        id: 'future-catwalk',
        x: 1345,
        y: 535,
        width: 200,
        height: 22,
        states: {
          past: gone,
          present: ruinedGhost,
          future: futureSolid,
        },
      },
    ],
    doors: [
      {
        id: 'station-door',
        x: 1515,
        y: 610,
        width: 54,
        height: 102,
        requiresFlags: ['station_switch'],
        states: {
          past: { solid: true, visible: true, color: 0x4e6a45 },
          present: { solid: true, visible: true, color: 0x394b56 },
          future: { solid: true, visible: true, color: 0x5a2d3d },
        },
      },
    ],
    plates: [],
    switches: [{ id: 'station-switch', flag: 'station_switch', x: 655, y: 644, width: 42, height: 34 }],
    enemies: [{ id: 'greenhouse-rustmite', x: 1810, y: 620, patrolMinX: 1650, patrolMaxX: 2020, speed: 75 }],
    checkpoints: [{ id: 'greenhouse-checkpoint', x: 1580, y: 620 }],
    storyZones: [
      {
        id: 'girl-vanish',
        x: 470,
        y: 600,
        width: 140,
        height: 140,
        once: true,
        lines: ['The girl is gone when Elias blinks. Her footprints point in three directions.'],
      },
      {
        id: 'switch-echo',
        x: 610,
        y: 600,
        width: 150,
        height: 140,
        once: true,
        lines: ['An echo can repeat a choice. Even a small one can open the way.'],
      },
    ],
    exit: { x: 2140, y: 600, width: 70, height: 130 },
  },
  {
    id: 'level-3',
    title: 'Platform 13',
    subtitle: 'A station built from incompatible years.',
    width: 2440,
    height: 720,
    spawn: { x: 95, y: 600 },
    objective: 'Cross the station by changing what still exists.',
    nextLevelId: 'boss',
    startTimeline: 'present',
    background: 'station',
    startLines: [
      'The Keeper leaves warnings carved into glass: no loss, no change, no future.',
      'Elias feels the words trying to become true.',
    ],
    platforms: [
      { id: 'station-left', x: 470, y: 690, width: 940, height: 60 },
      { id: 'station-center', x: 1470, y: 690, width: 820, height: 60 },
      { id: 'station-right', x: 2200, y: 690, width: 440, height: 60 },
      { id: 'station-roof', x: 720, y: 510, width: 170, height: 22, color: 0x38434a },
    ],
    timelineBlocks: [
      {
        id: 'past-ticket-bridge',
        x: 965,
        y: 605,
        width: 250,
        height: 22,
        states: {
          past: overgrown,
          present: brokenPresent,
          future: gone,
        },
      },
      {
        id: 'present-generator-lift',
        x: 1220,
        y: 520,
        width: 190,
        height: 22,
        states: {
          past: gone,
          present: presentSolid,
          future: ruinedGhost,
        },
      },
      {
        id: 'future-collapsed-span',
        x: 1445,
        y: 585,
        width: 220,
        height: 22,
        states: {
          past: gone,
          present: brokenPresent,
          future: futureSolid,
        },
      },
    ],
    doors: [
      {
        id: 'platform-lock',
        x: 1860,
        y: 610,
        width: 54,
        height: 102,
        requiresFlags: ['platform_switch'],
        states: {
          past: { solid: true, visible: true, color: 0x5f6542 },
          present: { solid: true, visible: true, color: 0x334553 },
          future: { solid: false, visible: true, color: 0x66313c, alpha: 0.28 },
        },
      },
    ],
    plates: [],
    switches: [{ id: 'platform-switch', flag: 'platform_switch', x: 1595, y: 644, width: 42, height: 34, timelines: ['future'] }],
    enemies: [
      { id: 'station-rustmite-a', x: 1420, y: 620, patrolMinX: 1290, patrolMaxX: 1580, speed: 80 },
      { id: 'station-rustmite-b', x: 2150, y: 620, patrolMinX: 1990, patrolMaxX: 2300, speed: 86 },
    ],
    checkpoints: [{ id: 'platform-checkpoint', x: 1260, y: 490 }],
    storyZones: [
      {
        id: 'keeper-message',
        x: 1780,
        y: 600,
        width: 150,
        height: 140,
        once: true,
        lines: ['The Keeper speaks through the station speakers: "If time moves, it takes everything."'],
      },
    ],
    exit: { x: 2360, y: 600, width: 70, height: 130 },
  },
  {
    id: 'boss',
    title: 'The Still Hour',
    subtitle: 'The Keeper waits at the Core.',
    width: 2520,
    height: 720,
    spawn: { x: 95, y: 600 },
    objective: 'Break the three anchors around the Keeper.',
    startTimeline: 'present',
    background: 'core',
    startLines: [
      'At the center of the city, every broken timeline points to one man.',
      'The Keeper raises Elias\'s hand with Elias\'s face and says, "I saved us from goodbye."',
    ],
    platforms: [
      { id: 'core-left', x: 470, y: 690, width: 940, height: 60 },
      { id: 'core-middle', x: 1420, y: 690, width: 760, height: 60 },
      { id: 'core-right', x: 2220, y: 690, width: 600, height: 60 },
      { id: 'core-upper', x: 1230, y: 520, width: 180, height: 22, color: 0x2f414e },
    ],
    timelineBlocks: [
      {
        id: 'past-anchor-bridge',
        x: 850,
        y: 610,
        width: 260,
        height: 22,
        states: {
          past: pastSolid,
          present: brokenPresent,
          future: gone,
        },
      },
      {
        id: 'present-anchor-lift',
        x: 1290,
        y: 560,
        width: 210,
        height: 22,
        states: {
          past: gone,
          present: presentSolid,
          future: ruinedGhost,
        },
      },
      {
        id: 'future-anchor-span',
        x: 1740,
        y: 600,
        width: 260,
        height: 22,
        states: {
          past: gone,
          present: brokenPresent,
          future: futureSolid,
        },
      },
    ],
    doors: [
      {
        id: 'keeper-barrier',
        x: 2110,
        y: 596,
        width: 68,
        height: 130,
        requiresFlags: ['anchor_past', 'anchor_present', 'anchor_future'],
        states: {
          past: { solid: true, visible: true, color: 0x584161 },
          present: { solid: true, visible: true, color: 0x274b5a },
          future: { solid: true, visible: true, color: 0x6a2836 },
        },
      },
    ],
    plates: [{ id: 'past-anchor-plate', flag: 'anchor_past', x: 410, y: 656, width: 86, height: 12, timelines: ['past'] }],
    switches: [
      { id: 'present-anchor-switch', flag: 'anchor_present', x: 1285, y: 506, width: 42, height: 34, timelines: ['present'] },
      { id: 'future-anchor-switch', flag: 'anchor_future', x: 1770, y: 644, width: 42, height: 34, timelines: ['future'] },
    ],
    enemies: [{ id: 'core-rustmite', x: 1520, y: 620, patrolMinX: 1370, patrolMaxX: 1690, speed: 90 }],
    checkpoints: [{ id: 'core-checkpoint', x: 1120, y: 620 }],
    storyZones: [
      {
        id: 'boss-plate',
        x: 340,
        y: 600,
        width: 150,
        height: 140,
        once: true,
        lines: ['One anchor belongs to the past. It will only listen to an echo.'],
      },
      {
        id: 'keeper-reveal',
        x: 2020,
        y: 600,
        width: 160,
        height: 140,
        once: true,
        lines: ['The Keeper\'s silhouette matches Elias too closely. The future has been pleading in his own voice.'],
      },
    ],
    exit: { x: 2420, y: 600, width: 70, height: 130 },
    requiredExitFlags: ['anchor_past', 'anchor_present', 'anchor_future'],
  },
];

export function getLevel(id: string): LevelData {
  const level = levels.find((candidate) => candidate.id === id);
  if (!level) {
    throw new Error(`Unknown level id: ${id}`);
  }
  return level;
}
