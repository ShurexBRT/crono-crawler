import { AnimationKeys, TextureKeys } from '../../assets/manifest';
import { BootScene } from './BootScene';

const assetPath = (fileName: string): string => `assets/${fileName}`;

const eliasFrameSets = {
  idle: [{ x: 168, y: 16, width: 172, height: 198 }],
  run: [
    { x: 164, y: 232, width: 184, height: 176 },
    { x: 372, y: 232, width: 184, height: 176 },
    { x: 582, y: 232, width: 196, height: 176 },
    { x: 804, y: 232, width: 184, height: 176 },
    { x: 1010, y: 232, width: 188, height: 176 },
    { x: 1222, y: 232, width: 198, height: 176 },
  ],
  jump: [
    { x: 164, y: 616, width: 190, height: 176 },
    { x: 370, y: 616, width: 190, height: 176 },
    { x: 580, y: 616, width: 196, height: 176 },
    { x: 806, y: 616, width: 188, height: 176 },
    { x: 1050, y: 616, width: 206, height: 176 },
  ],
  shift: [
    { x: 164, y: 812, width: 178, height: 250 },
    { x: 356, y: 812, width: 188, height: 250 },
    { x: 558, y: 812, width: 176, height: 250 },
    { x: 746, y: 812, width: 196, height: 250 },
    { x: 954, y: 812, width: 244, height: 250 },
    { x: 1220, y: 812, width: 198, height: 250 },
  ],
};

export class BootScenePolished extends BootScene {
  preload(): void {
    this.load.image(TextureKeys.eliasSheet, assetPath('Elias char sprite.png'));
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

    for (const [setName, frames] of Object.entries(eliasFrameSets)) {
      frames.forEach((frame, index) => {
        texture.add(`${setName}-${index}`, 0, frame.x, frame.y, frame.width, frame.height);
      });
    }

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

  private createExternalAnimation(key: string, prefix: string, start: number, end: number, frameRate: number, repeat: number): void {
    this.anims.create({
      key,
      frames: this.anims.generateFrameNames(TextureKeys.eliasSheet, { prefix, start, end }),
      frameRate,
      repeat,
    });
  }
}
