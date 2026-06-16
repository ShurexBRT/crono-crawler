export const TextureKeys = {
  elias: 'character.elias',
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
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];
