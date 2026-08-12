export type EnvironmentLevelId =
  | 'tutorial'
  | 'level-1'
  | 'rain-crossing'
  | 'level-2'
  | 'level-3'
  | 'bellweather-canals'
  | 'minute-market'
  | 'boss';

export type EnvironmentFamily =
  | 'reactor'
  | 'street'
  | 'bridge'
  | 'station'
  | 'transit'
  | 'canal'
  | 'market'
  | 'observatory';

export interface EnvironmentLayerSpec {
  far: string[];
  mid: string[];
  gameplay: string[];
  foreground: string[];
  fx: string[];
}

export interface LevelEnvironmentSpec {
  id: EnvironmentLevelId;
  title: string;
  family: EnvironmentFamily;
  narrativeBeat: string;
  mood: string[];
  assetTargets: string[];
  parallax: {
    far: number;
    mid: number;
    foreground: number;
  };
  layers: EnvironmentLayerSpec;
}

const defaultParallax = {
  far: 0.12,
  mid: 0.28,
  foreground: 1.06,
} as const;

export const levelEnvironmentSpecs: Record<EnvironmentLevelId, LevelEnvironmentSpec> = {
  tutorial: {
    id: 'tutorial',
    title: 'The Folded Reactor',
    family: 'reactor',
    narrativeBeat: 'Heart of the disaster. The Fold begins.',
    mood: ['noir', 'industrial cathedral', 'clockpunk undercity'],
    assetTargets: [
      'heavy floor modules',
      'maintenance catwalk modules',
      'suspended gantry modules',
      'machine housing blocks',
      'reactor skyline backdrop',
      'pipe and chain foreground set',
    ],
    parallax: defaultParallax,
    layers: {
      far: ['deco-industrial skyline', 'reactor towers', 'observation stacks', 'smokestacks'],
      mid: ['turbines', 'pressure vessels', 'vertical pipe forest', 'service catwalks'],
      gameplay: ['heavy floors', 'catwalks', 'timeline gates', 'pressure devices'],
      foreground: ['hanging chains', 'thick pipes', 'cable bundles', 'light-beam silhouettes'],
      fx: ['steam bursts', 'dust motes', 'core glow', 'subtle sparks'],
    },
  },
  'level-1': {
    id: 'level-1',
    title: 'Lock Street',
    family: 'street',
    narrativeBeat: 'Elias exits the core and enters the city under control.',
    mood: ['urban noir', 'cramped verticality', 'wet service district'],
    assetTargets: ['street facade backdrop', 'storefront mid kit', 'alley bridge kit', 'signboard set', 'rain FX profile A'],
    parallax: defaultParallax,
    layers: {
      far: ['dense deco blocks', 'roofline silhouettes', 'tram cables'],
      mid: ['fire escapes', 'storefront shutters', 'alley bridges', 'ventilation ducts'],
      gameplay: ['brick ledges', 'scaffold planks', 'locked passages', 'street props'],
      foreground: ['signage frames', 'gutters', 'hanging cables', 'fence silhouettes'],
      fx: ['light rain', 'street fog', 'neon flicker', 'puddle gleam'],
    },
  },
  'rain-crossing': {
    id: 'rain-crossing',
    title: 'Rain District Crossing',
    family: 'bridge',
    narrativeBeat: 'Open crossing under weather and exposure.',
    mood: ['exposure', 'pressure', 'forward momentum'],
    assetTargets: ['rain bridge backdrop', 'drainage bridge mid kit', 'bridge railing foreground set', 'rain FX profile B'],
    parallax: defaultParallax,
    layers: {
      far: ['long wet avenue perspective', 'distant district towers', 'bridge horizon'],
      mid: ['bridge spans', 'support arches', 'drainage walls', 'cable poles'],
      gameplay: ['narrow crossings', 'switch platforms', 'timeline route surfaces'],
      foreground: ['broken rails', 'lamp posts', 'rain streak framing', 'hanging cables'],
      fx: ['heavy rain', 'mist gusts', 'water drips', 'occasional lightning wash'],
    },
  },
  'level-2': {
    id: 'level-2',
    title: 'Glasshouse Station',
    family: 'station',
    narrativeBeat: 'Old elegance swallowed by machine logic. Mara becomes more present.',
    mood: ['melancholy elegance', 'botanical decay', 'hidden memory'],
    assetTargets: ['glass roof backdrop', 'station canopy mid modules', 'decorative rib foreground set', 'station clock props'],
    parallax: defaultParallax,
    layers: {
      far: ['arched glasshouse roof', 'steel ribs', 'distant station clock', 'greenhouse silhouettes'],
      mid: ['platform canopies', 'vertical trusses', 'hanging lamps', 'overgrowth pockets'],
      gameplay: ['lift surfaces', 'platform edges', 'switch stations', 'transit beams'],
      foreground: ['curved glass ribs', 'broken panes', 'hanging banners', 'clockwork fragments'],
      fx: ['dust in light shafts', 'condensation drift', 'soft reflections', 'subtle leaf movement'],
    },
  },
  'level-3': {
    id: 'level-3',
    title: 'Platform 13',
    family: 'transit',
    narrativeBeat: 'Deep transit way down; the system starts feeling haunted.',
    mood: ['transit limbo', 'industrial rhythm', 'eerie waiting'],
    assetTargets: ['terminal tunnel backdrop', 'platform column kit', 'signal/signboard set', 'transit foreground framing'],
    parallax: defaultParallax,
    layers: {
      far: ['tunnel arches', 'bay lights', 'clock silhouettes'],
      mid: ['columns', 'suspended rails', 'signal bridges', 'maintenance ladders'],
      gameplay: ['platform slabs', 'edge barriers', 'gate spaces', 'route signage'],
      foreground: ['column silhouettes', 'route boards', 'rail cables', 'tunnel occluders'],
      fx: ['tunnel haze', 'dust', 'signal pulses', 'drifting steam'],
    },
  },
  'bellweather-canals': {
    id: 'bellweather-canals',
    title: 'Bellweather Canals',
    family: 'canal',
    narrativeBeat: 'Flow below. Hidden systems and controlled flooding.',
    mood: ['cold damp machinery', 'hidden civic underbelly', 'tension through flow'],
    assetTargets: ['canal skyline backdrop', 'lockgate mid kit', 'water edge overlays', 'drainage props', 'splash and drip FX'],
    parallax: defaultParallax,
    layers: {
      far: ['canal skyline', 'bridges', 'lock towers', 'wet masonry horizon'],
      mid: ['water channels', 'sluice machinery', 'culverts', 'service stairs'],
      gameplay: ['canal walkways', 'raised grates', 'switch housings', 'drain hazards'],
      foreground: ['gate framing', 'pipe silhouettes', 'chains', 'wet beams'],
      fx: ['mist', 'ripples', 'dripping water', 'splash points', 'vapor clouds'],
    },
  },
  'minute-market': {
    id: 'minute-market',
    title: 'The Minute Market',
    family: 'market',
    narrativeBeat: 'Life persists in fragments. Human traces become stronger.',
    mood: ['bittersweet', 'lived-in', 'fragile normality'],
    assetTargets: ['market skyline backdrop', 'rooftop stall mid kit', 'awning traversal set', 'hanging sign foreground set', 'drifting paper FX'],
    parallax: defaultParallax,
    layers: {
      far: ['market roofline', 'tower clocks', 'distant awnings', 'chimney clutter'],
      mid: ['stalls', 'rooftop walkways', 'cloth canopies', 'stairs and balconies'],
      gameplay: ['market roofs', 'awning paths', 'stall passages', 'future ruin gaps'],
      foreground: ['cloth banners', 'lamps', 'ropes', 'close signboards', 'paper silhouettes'],
      fx: ['warm motes in Past', 'cooler air in Present', 'light debris in Future'],
    },
  },
  boss: {
    id: 'boss',
    title: 'The Still Hour',
    family: 'observatory',
    narrativeBeat: 'Truth revealed. Time is machinery and grief.',
    mood: ['majestic tragedy', 'revelation', 'final stillness'],
    assetTargets: ['observatory far composition', 'anchor chamber mid kit', 'ring-clock foreground silhouettes', 'final energy FX set'],
    parallax: defaultParallax,
    layers: {
      far: ['observatory dome', 'impossible city horizon', 'fractured clock faces', 'core void'],
      mid: ['anchor structures', 'machine arms', 'ring mechanisms', 'suspended architecture'],
      gameplay: ['final puzzle platforms', 'anchor stations', 'barrier apparatus'],
      foreground: ['broken rings', 'shattered glass', 'chains', 'occult-industrial framing'],
      fx: ['time fractures', 'drifting sparks', 'low fog', 'restrained energy arcs'],
    },
  },
};

export const levelEnvironmentOrder: EnvironmentLevelId[] = [
  'tutorial',
  'level-1',
  'rain-crossing',
  'level-2',
  'level-3',
  'bellweather-canals',
  'minute-market',
  'boss',
];
