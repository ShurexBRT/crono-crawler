import Phaser from 'phaser';

type InputAction =
  | 'jump'
  | 'interact'
  | 'record'
  | 'rewind'
  | 'timelineCycle'
  | 'timelinePast'
  | 'timelinePresent'
  | 'timelineFuture'
  | 'pause';

export class InputController {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private fallbackJustPressed = new Set<InputAction>();
  private gamepadPressed = new Set<InputAction>();
  private previousGamepadButtons = new Set<number>();
  private readonly keyDownHandler: (event: KeyboardEvent) => void;

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

    this.keyDownHandler = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      const action = fallbackActionForKey(event);
      if (action) {
        this.fallbackJustPressed.add(action);
      }
    };
    window.addEventListener('keydown', this.keyDownHandler);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.keyDownHandler);
      this.fallbackJustPressed.clear();
    });
  }

  get horizontal(): number {
    const gamepadHorizontal = this.gamepadHorizontal;
    if (gamepadHorizontal !== 0) {
      return gamepadHorizontal;
    }
    if (this.keys.left.isDown || this.keys.leftAlt.isDown) {
      return -1;
    }
    if (this.keys.right.isDown || this.keys.rightAlt.isDown) {
      return 1;
    }
    return 0;
  }

  get running(): boolean {
    return this.keys.run.isDown || this.gamepadButtonDown(7);
  }

  get jumpHeld(): boolean {
    return this.keys.jump.isDown || this.keys.jumpAlt.isDown || this.keys.jumpUp.isDown || this.gamepadButtonDown(0);
  }

  justPressed(action: InputAction): boolean {
    this.pollGamepad();
    const fallbackPressed = this.fallbackJustPressed.delete(action);
    const gamepadPressed = this.gamepadPressed.delete(action);
    if (action === 'jump') {
      const phaserPressed =
        Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
        Phaser.Input.Keyboard.JustDown(this.keys.jumpAlt) ||
        Phaser.Input.Keyboard.JustDown(this.keys.jumpUp);
      return fallbackPressed || gamepadPressed || phaserPressed;
    }
    if (action === 'pause') {
      const phaserPressed = Phaser.Input.Keyboard.JustDown(this.keys.pause) || Phaser.Input.Keyboard.JustDown(this.keys.pauseAlt);
      return fallbackPressed || gamepadPressed || phaserPressed;
    }
    const phaserPressed = Phaser.Input.Keyboard.JustDown(this.keys[action]);
    return fallbackPressed || gamepadPressed || phaserPressed;
  }

  private get gamepadHorizontal(): number {
    const gamepad = this.connectedGamepads[0];
    if (!gamepad) {
      return 0;
    }
    const axis = gamepad.axes[0] ?? 0;
    if (axis < -0.35 || gamepad.buttons[14]?.pressed) {
      return -1;
    }
    if (axis > 0.35 || gamepad.buttons[15]?.pressed) {
      return 1;
    }
    return 0;
  }

  private gamepadButtonDown(index: number): boolean {
    return this.connectedGamepads.some((pad) => pad.buttons[index]?.pressed);
  }

  private pollGamepad(): void {
    const buttons = new Set<number>();
    this.connectedGamepads.forEach((pad) => {
      pad.buttons.forEach((button, index) => {
        if (button.pressed) {
          buttons.add(index);
        }
      });
    });

    buttons.forEach((index) => {
      if (this.previousGamepadButtons.has(index)) {
        return;
      }
      const action = gamepadActionForButton(index);
      if (action) {
        this.gamepadPressed.add(action);
      }
    });
    this.previousGamepadButtons = buttons;
  }

  private get connectedGamepads(): Gamepad[] {
    return Array.from(navigator.getGamepads?.() ?? []).filter((pad): pad is Gamepad => Boolean(pad?.connected));
  }
}

function gamepadActionForButton(index: number): InputAction | undefined {
  switch (index) {
    case 0:
      return 'jump';
    case 1:
      return 'interact';
    case 2:
      return 'record';
    case 3:
      return 'rewind';
    case 4:
      return 'timelinePast';
    case 5:
      return 'timelineFuture';
    case 9:
      return 'pause';
    default:
      return undefined;
  }
}

function fallbackActionForKey(event: KeyboardEvent): InputAction | undefined {
  if (event.code === 'KeyQ') {
    return 'timelineCycle';
  }
  if (event.code === 'Digit1' || event.code === 'Numpad1' || event.key === '1') {
    return 'timelinePast';
  }
  if (event.code === 'Digit2' || event.code === 'Numpad2' || event.key === '2') {
    return 'timelinePresent';
  }
  if (event.code === 'Digit3' || event.code === 'Numpad3' || event.key === '3') {
    return 'timelineFuture';
  }
  return undefined;
}
