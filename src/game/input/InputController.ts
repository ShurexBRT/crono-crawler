import Phaser from 'phaser';

export class InputController {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is unavailable.');
    }

    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      leftAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      rightAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      run: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      jumpAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      jumpUp: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      interact: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      record: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G),
      rewind: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      timelineCycle: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      timelinePast: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      timelinePresent: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      timelineFuture: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      pauseAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
    };
  }

  get horizontal(): number {
    if (this.keys.left.isDown || this.keys.leftAlt.isDown) {
      return -1;
    }
    if (this.keys.right.isDown || this.keys.rightAlt.isDown) {
      return 1;
    }
    return 0;
  }

  get running(): boolean {
    return this.keys.run.isDown;
  }

  get jumpHeld(): boolean {
    return this.keys.jump.isDown || this.keys.jumpAlt.isDown || this.keys.jumpUp.isDown;
  }

  justPressed(action: 'jump' | 'interact' | 'record' | 'rewind' | 'timelineCycle' | 'timelinePast' | 'timelinePresent' | 'timelineFuture' | 'pause'): boolean {
    if (action === 'jump') {
      return (
        Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
        Phaser.Input.Keyboard.JustDown(this.keys.jumpAlt) ||
        Phaser.Input.Keyboard.JustDown(this.keys.jumpUp)
      );
    }
    if (action === 'pause') {
      return Phaser.Input.Keyboard.JustDown(this.keys.pause) || Phaser.Input.Keyboard.JustDown(this.keys.pauseAlt);
    }
    return Phaser.Input.Keyboard.JustDown(this.keys[action]);
  }
}
