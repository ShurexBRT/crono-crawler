export const TextureKeys = {
  elias: 'character.elias',
  eliasSheet: 'character.elias-sheet',
  ghost: 'character.echo',
  keeper: 'character.keeper',
  girl: 'character.girl',
  enemy: 'character.rustmite',
  core: 'fx.chrono-core',
  particle: 'fx.time-particle',
  checkpoint: 'environment.checkpoint',
  switchOff: 'environment.switch-off',
  switchOn: 'environment.switch-on',
  plate: 'environment.pressure-plate',
  exit: 'environment.exit',
  titleBackdrop: 'backdrop.title',
  backdropReactor: 'backdrop.reactor',
  backdropStreets: 'backdrop.streets',
  backdropGreenhouse: 'backdrop.greenhouse',
  backdropStation: 'backdrop.station',
  backdropCore: 'backdrop.core',
} as const;

export const AnimationKeys = {
  eliasIdle: 'elias.idle',
  eliasWalk: 'elias.walk',
  eliasRun: 'elias.run',
  eliasJump: 'elias.jump',
  eliasFall: 'elias.fall',
  eliasTimeShift: 'elias.time-shift',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];
export type AnimationKey = (typeof AnimationKeys)[keyof typeof AnimationKeys];
