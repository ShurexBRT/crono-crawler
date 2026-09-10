export type BackdropMotif = 'conduit' | 'city' | 'glass' | 'rail' | 'canal' | 'arcade' | 'hotel' | 'archive' | 'aerial';

export interface BackdropSpec {
  key: string;
  path: string;
  motif: BackdropMotif;
  weather: 'rain' | 'dust';
  accent: number;
}

function backdrop(name: string, motif: BackdropMotif, weather: BackdropSpec['weather'], accent: number): BackdropSpec {
  return { key: `backdrop.production.${name}`, path: `assets/backgrounds/production/${name}-far.png`, motif, weather, accent };
}

export const campaignBackdrops: Record<string, BackdropSpec> = {
  tutorial: backdrop('folded-reactor', 'conduit', 'dust', 0xc89961),
  'level-1': backdrop('lock-street', 'city', 'rain', 0xd2a26e),
  'rain-crossing': backdrop('rain-crossing', 'city', 'rain', 0xbad4cd),
  'level-2': backdrop('glasshouse', 'glass', 'dust', 0xb6cd92),
  'level-3': backdrop('platform-thirteen', 'rail', 'dust', 0xd6b095),
  'bellweather-canals': backdrop('bellweather-canals', 'canal', 'rain', 0xb6d5c3),
  'minute-market': backdrop('minute-market', 'arcade', 'dust', 0xd4a1ab),
  'hourglass-hotel': backdrop('hourglass-hotel', 'hotel', 'dust', 0xd5b976),
  'unsaid-archive': backdrop('unsaid-archive', 'archive', 'dust', 0xb9c7b1),
  'crownline-rooftops': backdrop('crownline-rooftops', 'aerial', 'rain', 0xe6beb0),
  'core-reliquary': backdrop('core-reliquary', 'conduit', 'dust', 0xd6d4b9),
  boss: backdrop('still-hour', 'conduit', 'dust', 0xc9b7a7),
};

export function getBackdrop(levelId: string): BackdropSpec {
  return campaignBackdrops[levelId] ?? campaignBackdrops.tutorial;
}
