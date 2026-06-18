import type Phaser from 'phaser';
import { AnimationKeys, TextureKeys } from '../../assets/manifest';
import { BootScene } from './BootScene';

const externalAssetUrls = {
  eliasSheet: new URL('../../../../assets/Elias char sprite.png', import.meta.url).href,
  titleBackdrop: new URL('../../../../assets/chrono_crawler_title_screen_concept.png', import.meta.url).href,
  reactorBackdrop: new URL('../../../../assets/gloomy_industrial_nightscape_with_steam_and_lights.png', import.meta.url).href,
  streetsBackdrop: new URL('../../../../assets/misty_alley_in_a_futuristic_city.png', import.meta.url).href,
  greenhouseBackdrop: new URL('../../../../assets/steampunk_observatory_with_glowing_machinery.png', import.meta.url).href,
  stationBackdrop: new URL('../../../../assets/fading_clockwork_city_in_ruins.png', import.meta.url).href,
  coreBackdrop: new URL('../../../../assets/ruins_of_a_fractured_city_skyline.png', import.meta.url).href,
};

const eliasFrameSets = {
  idle: [
    { x: 168, y: 16, width: 172, height: 198 },
    { x: 380, y: 16, width: 172, height: 198 },
    { x: 592, y: 16, width: 178, height: 198 },
  ],
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
    this.load.image(TextureKeys.eliasSheet, externalAssetUrls.eliasSheet);
    this.load.image(TextureKeys.titleBackdrop, externalAssetUrls.titleBackdrop);
    this.load.image(TextureKeys.backdropReactor, externalAssetUrls.reactorBackdrop);
    this.load.image(TextureKeys.backdropStreets, externalAssetUrls.streetsBackdrop);
    this.load.image(TextureKeys.backdropGreenhouse, externalAssetUrls.greenhouseBackdrop);
    this.load.image(TextureKeys.backdropStation, externalAssetUrls.stationBackdrop);
    this.load.image(TextureKeys.backdropCore, externalAssetUrls.coreBackdrop);
  }

  create(): void {
    (this as unknown as { createGeneratedTextures: () => void }).createGeneratedTextures();
    this.registerEliasAnimationFrames();
    this.scene.start('MainMenuScene');
  }

  private registerEliasAnimationFrames(): void {
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

    this.createAnimation(AnimationKeys.eliasIdle, 'idle-', 0, 2, 3, -1);
    this.createAnimation(AnimationKeys.eliasWalk, 'run-', 0, 5, 7, -1);
    this.createAnimation(AnimationKeys.eliasRun, 'run-', 0, 5, 11, -1);
    this.createAnimation(AnimationKeys.eliasJump, 'jump-', 0, 2, 8, 0);

    this.anims.create({
      key: AnimationKeys.eliasFall,
      frames: [{ key: TextureKeys.eliasSheet, frame: 'jump-3' }],
      frameRate: 1,
      repeat: 0,
    });

    this.createAnimation(AnimationKeys.eliasTimeShift, 'shift-', 0, 5, 12, 0);
  }

  private createAnimation(key: string, prefix: string, start: number, end: number, frameRate: number, repeat: number): void {
    this.anims.create({
      key,
      frames: this.anims.generateFrameNames(TextureKeys.eliasSheet, { prefix, start, end }),
      frameRate,
      repeat,
    });
  }
}
