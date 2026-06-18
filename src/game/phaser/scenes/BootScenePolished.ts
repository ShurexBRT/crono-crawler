import { AnimationKeys, TextureKeys } from '../../assets/manifest';
import { BootScene } from './BootScene';

const assetPath = (fileName: string): string => `assets/${fileName}`;

const ELIAS_COLUMNS = 6;
const ELIAS_ROWS = 5;
const PLATFORM_ROWS = 3;

export class BootScenePolished extends BootScene {
  preload(): void {
    this.load.image(TextureKeys.eliasSheet, assetPath('Elias char sprite transparent.png'));
    this.load.image(TextureKeys.platformSheet, assetPath('platform assets.png'));
    this.load.image(TextureKeys.titleBackdrop, assetPath('chrono_crawler_title_screen_concept.png'));
    this.load.image(TextureKeys.backdropReactor, assetPath('gloomy_industrial_nightscape_with_steam_and_lights.png'));
    this.load.image(TextureKeys.backdropStreets, assetPath('misty_alley_in_a_futuristic_city.png'));
    this.load.image(TextureKeys.backdropGreenhouse, assetPath('steampunk_observatory_with_glowing_machinery.png'));
    this.load.image(TextureKeys.backdropStation, assetPath('fading_clockwork_city_in_ruins.png'));
    this.load.image(TextureKeys.backdropCore, assetPath('ruins_of_a_fractured_city_skyline.png'));
  }

  create(): void {
    (this as unknown as { createGeneratedTextures: () => void }).createGeneratedTextures();
    this.registerExternalEliasAnimationFrames();
    this.registerTimelinePlatformFrames();
    this.scene.start('MainMenuScene');
  }

  private registerExternalEliasAnimationFrames(): void {
    if (!this.textures.exists(TextureKeys.eliasSheet)) {
      return;
    }

    const texture = this.textures.get(TextureKeys.eliasSheet);
    if (texture.has('idle-0')) {
      return;
    }

    const source = texture.getSourceImage() as HTMLImageElement;
    const frameWidth = Math.floor(source.width / ELIAS_COLUMNS);
    const frameHeight = Math.floor(source.height / ELIAS_ROWS);

    this.addGridFrames(texture, 'idle', 0, frameWidth, frameHeight, ELIAS_COLUMNS);
    this.addGridFrames(texture, 'run', 1, frameWidth, frameHeight, ELIAS_COLUMNS);
    this.addGridFrames(texture, 'run-left', 2, frameWidth, frameHeight, ELIAS_COLUMNS);
    this.addGridFrames(texture, 'jump', 3, frameWidth, frameHeight, ELIAS_COLUMNS);
    this.addGridFrames(texture, 'shift', 4, frameWidth, frameHeight, ELIAS_COLUMNS);

    this.createExternalAnimation(AnimationKeys.eliasIdle, 'idle-', 0, 0, 1, -1);
    this.createExternalAnimation(AnimationKeys.eliasWalk, 'run-', 0, 5, 7, -1);
    this.createExternalAnimation(AnimationKeys.eliasRun, 'run-', 0, 5, 11, -1);
    this.createExternalAnimation(AnimationKeys.eliasJump, 'jump-', 0, 2, 8, 0);

    this.anims.create({
      key: AnimationKeys.eliasFall,
      frames: [{ key: TextureKeys.eliasSheet, frame: 'jump-3' }],
      frameRate: 1,
      repeat: 0,
    });

    this.createExternalAnimation(AnimationKeys.eliasTimeShift, 'shift-', 0, 5, 12, 0);
  }

  private registerTimelinePlatformFrames(): void {
    if (!this.textures.exists(TextureKeys.platformSheet)) {
      return;
    }

    const texture = this.textures.get(TextureKeys.platformSheet);
    if (texture.has('past')) {
      return;
    }

    const source = texture.getSourceImage() as HTMLImageElement;
    const frameHeight = Math.floor(source.height / PLATFORM_ROWS);
    texture.add('past', 0, 0, 0, source.width, frameHeight);
    texture.add('present', 0, 0, frameHeight, source.width, frameHeight);
    texture.add('future', 0, 0, frameHeight * 2, source.width, frameHeight);
  }

  private addGridFrames(
    texture: Phaser.Textures.Texture,
    prefix: string,
    row: number,
    frameWidth: number,
    frameHeight: number,
    count: number,
  ): void {
    for (let index = 0; index < count; index += 1) {
      texture.add(`${prefix}-${index}`, 0, index * frameWidth, row * frameHeight, frameWidth, frameHeight);
    }
  }

  private createExternalAnimation(key: string, prefix: string, start: number, end: number, frameRate: number, repeat: number): void {
    if (this.anims.exists(key)) {
      return;
    }

    this.anims.create({
      key,
      frames: this.anims.generateFrameNames(TextureKeys.eliasSheet, { prefix, start, end }),
      frameRate,
      repeat,
    });
  }
}
