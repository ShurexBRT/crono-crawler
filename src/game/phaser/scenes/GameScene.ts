import Phaser from 'phaser';
import { TextureKeys } from '../../assets/manifest';
import { getLevel } from '../../content/levels';
import { CheckpointBeacon, LeverSwitch, PressurePlate, StaticPlatform, TimelineBlock, TimelineDoor } from '../../entities/LevelObjects';
import { Enemy } from '../../entities/Enemy';
import { GhostClone } from '../../entities/GhostClone';
import { Player } from '../../entities/Player';
import { InputController } from '../../input/InputController';
import { AudioManager } from '../../systems/AudioManager';
import { CheckpointSystem } from '../../systems/CheckpointSystem';
import { DialogueManager } from '../../systems/DialogueManager';
import { GhostRecorder } from '../../systems/GhostRecorder';
import { SaveManager } from '../../systems/SaveManager';
import { TimelineManager } from '../../systems/TimelineManager';
import type { LevelData, RectSpec, StoryZoneSpec, TimelineKey } from '../../types';
import type { UIManager } from '../../../ui/UIManager';

type NoirPalette = {
  sky: number;
  horizon: number;
  far: number;
  mid: number;
  near: number;
  accent: number;
};

interface GameSceneData {
  levelId?: string;
  checkpointId?: string;
  timeline?: TimelineKey;
}

export class GameScene extends Phaser.Scene {
  private saveManager!: SaveManager;
  private audioManager!: AudioManager;
  private uiManager!: UIManager;
  private inputController!: InputController;
  private timelineManager!: TimelineManager;
  private checkpointSystem!: CheckpointSystem;
  private dialogueManager!: DialogueManager;
  private ghostRecorder!: GhostRecorder;
  private level!: LevelData;
  private player!: Player;
  private solidGroup!: Phaser.Physics.Arcade.StaticGroup;
  private timelineBlocks: TimelineBlock[] = [];
  private doors: TimelineDoor[] = [];
  private plates: PressurePlate[] = [];
  private switches: LeverSwitch[] = [];
  private checkpoints: CheckpointBeacon[] = [];
  private enemies: Enemy[] = [];
  private ghost?: GhostClone;
  private exitZone?: Phaser.GameObjects.Rectangle;
  private timelineTint?: Phaser.GameObjects.Rectangle;
  private recordingAura?: Phaser.GameObjects.Arc;
  private latchedFlags = new Set<string>();
  private heldFlags = new Set<string>();
  private storyTriggered = new Set<string>();
  private isPaused = false;
  private isRespawning = false;
  private levelComplete = false;
  private exitBlockedToastAt = 0;

  constructor() {
    super('GameScene');
  }

  create(data: GameSceneData): void {
    this.saveManager = this.registry.get('saveManager') as SaveManager;
    this.audioManager = this.registry.get('audioManager') as AudioManager;
    this.uiManager = this.registry.get('uiManager') as UIManager;
    this.resetRuntimeState();
    this.level = getLevel(data.levelId ?? 'tutorial');
    this.timelineManager = new TimelineManager(data.timeline ?? this.level.startTimeline);
    this.checkpointSystem = new CheckpointSystem(this.level, this.timelineManager.current, data.checkpointId);
    this.dialogueManager = new DialogueManager();
    this.ghostRecorder = new GhostRecorder();
    this.inputController = new InputController(this);
    this.solidGroup = this.physics.add.staticGroup();

    this.physics.world.setBounds(0, 0, this.level.width, this.level.height + 120);
    this.physics.resume();
    this.cameras.main.setBounds(0, 0, this.level.width, this.level.height);
    this.cameras.main.setBackgroundColor('#070910');
    this.cameras.main.fadeIn(260, 5, 8, 13);

    this.drawBackground();
    this.buildLevel();
    this.player = new Player(this, this.checkpointSystem.resolveSpawn(this.timelineManager.current, data.checkpointId));
    this.configurePhysics();
    this.configureCamera();
    this.applyTimeline();

    this.uiManager.clearOverlay();
    this.uiManager.showHud({
      levelTitle: this.level.title,
      objective: this.level.objective,
      timeline: this.timelineManager.current,
      checkpoint: this.checkpointSystem.checkpointLabel(),
      ghostLabel: 'Ready',
      ghostProgress: 0,
    });

    this.saveManager.saveProgress(this.level.id, this.timelineManager.current, this.checkpointSystem.activeCheckpoint?.id);
    this.showDialogue(`start-${this.level.id}`, this.level.startLines, true);
  }

  update(_time: number, delta: number): void {
    if (!this.player || this.levelComplete) {
      return;
    }

    if (!this.dialogueManager.isActive && this.inputController.justPressed('pause')) {
      this.togglePause();
      return;
    }

    if (this.isPaused || this.dialogueManager.isActive || this.isRespawning) {
      return;
    }

    const interactPressed = this.inputController.justPressed('interact');
    const recordPressed = this.inputController.justPressed('record');
    const rewindPressed = this.inputController.justPressed('rewind');

    this.handleTimelineInput();

    const playerStep = this.player.update(this.inputController, delta, false);
    if (playerStep.jumped) {
      this.audioManager.playSfx('jump');
      this.emitFootfallDust(0x6ee7f2, 5);
    }
    if (playerStep.landed) {
      this.audioManager.playSfx('land');
      this.emitFootfallDust(0xf0a64d, 7);
    }
    this.updateRecordingAura();

    if (recordPressed) {
      this.toggleRecording();
    }
    this.updateRecording(interactPressed);

    if (rewindPressed) {
      this.rewindToCheckpoint();
    }

    this.ghost?.update(delta);
    this.enemies.forEach((enemy) => enemy.update());
    this.updateFlags(interactPressed);
    this.updateCheckpoints();
    this.updateStoryZones();
    this.updateExit();
    this.updateHud();

    if (this.player.sprite.y > this.level.height + 80) {
      this.respawn('The fall folds back to the last stable second.');
    }
  }

  private buildLevel(): void {
    this.level.platforms.forEach((platform) => new StaticPlatform(this, platform, this.solidGroup));
    this.timelineBlocks = this.level.timelineBlocks.map((block) => new TimelineBlock(this, block, this.solidGroup));
    this.doors = this.level.doors.map((door) => new TimelineDoor(this, door, this.solidGroup));
    this.plates = this.level.plates.map((plate) => new PressurePlate(this, plate));
    this.switches = this.level.switches.map((lever) => new LeverSwitch(this, lever));
    this.checkpoints = this.level.checkpoints.map((checkpoint) => new CheckpointBeacon(this, checkpoint, TextureKeys.checkpoint));
    this.enemies = this.level.enemies.map((enemy) => new Enemy(this, enemy));

    this.exitZone = this.add.rectangle(this.level.exit.x, this.level.exit.y, this.level.exit.width, this.level.exit.height, 0x6ee7f2, 0.16);
    this.exitZone.setStrokeStyle(1, 0x6ee7f2, 0.6);
    this.exitZone.setDepth(6);

    if (this.level.id === 'boss') {
      this.add.sprite(2265, 590, TextureKeys.keeper).setDepth(13).setDisplaySize(84, 150).setAlpha(0.92);
      this.add.sprite(2180, 505, TextureKeys.core).setDepth(5).setScale(1.45).setAlpha(0.64);
    }

    if (this.level.id === 'level-2') {
      this.add.sprite(530, 637, TextureKeys.girl).setDepth(10).setDisplaySize(56, 96).setAlpha(0.88);
    }
  }

  private resetRuntimeState(): void {
    this.timelineBlocks = [];
    this.doors = [];
    this.plates = [];
    this.switches = [];
    this.checkpoints = [];
    this.enemies = [];
    this.ghost = undefined;
    this.exitZone = undefined;
    this.timelineTint = undefined;
    this.recordingAura = undefined;
    this.latchedFlags.clear();
    this.heldFlags.clear();
    this.storyTriggered.clear();
    this.isPaused = false;
    this.isRespawning = false;
    this.levelComplete = false;
    this.exitBlockedToastAt = 0;
  }

  private configurePhysics(): void {
    this.physics.add.collider(this.player.sprite, this.solidGroup);
    this.enemies.forEach((enemy) => {
      this.physics.add.collider(enemy.sprite, this.solidGroup);
      this.physics.add.overlap(this.player.sprite, enemy.sprite, () => {
        this.respawn('A rustmite tears through the frozen second.');
      });
    });
  }

  private configureCamera(): void {
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(220, 120);
  }

  private drawBackground(): void {
    const palettes: Record<LevelData['background'], NoirPalette> = {
      reactor: { sky: 0x08070b, horizon: 0x51311d, far: 0x10131b, mid: 0x151b25, near: 0x080a10, accent: 0xe19a46 },
      streets: { sky: 0x07080d, horizon: 0x5b351e, far: 0x11131c, mid: 0x171d29, near: 0x08090f, accent: 0xf0a64d },
      greenhouse: { sky: 0x070c0b, horizon: 0x4a3a21, far: 0x101a18, mid: 0x192720, near: 0x090d0c, accent: 0xd5a85a },
      station: { sky: 0x07090f, horizon: 0x493021, far: 0x10141d, mid: 0x18202b, near: 0x080a10, accent: 0xe0a04f },
      core: { sky: 0x09070d, horizon: 0x432038, far: 0x12111c, mid: 0x1c1a2b, near: 0x08070d, accent: 0xd05b78 },
    };
    const palette = palettes[this.level.background];

    this.drawNoirSky(palette);
    this.drawSearchlights(palette);
    this.drawDecoSkyline(palette, -16, 0.22, 115, 250, 0.95);
    this.drawDecoSkyline(palette, -13, 0.38, 150, 330, 0.9);
    this.drawDecoSkyline(palette, -10, 0.56, 200, 420, 0.88);

    this.add.rectangle(this.level.width / 2, 704, this.level.width, 54, 0x05060a, 0.72).setDepth(-7);
    this.add.rectangle(this.level.width / 2, 675, this.level.width, 4, palette.accent, 0.2).setDepth(-6);
    this.drawRainStreaks(palette);

    this.timelineTint = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.06);
    this.timelineTint.setScrollFactor(0);
    this.timelineTint.setDepth(30);
    this.timelineTint.setBlendMode(Phaser.BlendModes.ADD);
  }

  private drawNoirSky(palette: Pick<NoirPalette, 'sky' | 'horizon' | 'accent'>): void {
    this.add.rectangle(this.level.width / 2, 360, this.level.width, 720, palette.sky).setDepth(-24);
    this.add.rectangle(this.level.width / 2, 500, this.level.width, 360, palette.horizon, 0.34).setDepth(-23);
    this.add.circle(this.level.width * 0.78, 170, 82, palette.accent, 0.16).setScrollFactor(0.18).setDepth(-22);
    this.add.circle(this.level.width * 0.78, 170, 42, palette.accent, 0.18).setScrollFactor(0.18).setDepth(-22);
  }

  private drawSearchlights(palette: Pick<NoirPalette, 'accent'>): void {
    for (let i = 0; i < Math.ceil(this.level.width / 720) + 1; i += 1) {
      const baseX = 280 + i * 720;
      const beamA = this.add.polygon(baseX, 470, [0, 0, 34, 0, -180, -430, -230, -430], palette.accent, 0.1);
      const beamB = this.add.polygon(baseX + 320, 490, [0, 0, 30, 0, 210, -430, 260, -430], 0x9ad7ff, 0.07);
      beamA.setScrollFactor(0.24).setDepth(-21);
      beamB.setScrollFactor(0.2).setDepth(-21);
    }
  }

  private drawDecoSkyline(
    palette: Pick<NoirPalette, 'far' | 'mid' | 'near' | 'accent'>,
    depth: number,
    scrollFactor: number,
    minHeight: number,
    maxHeight: number,
    alpha: number,
  ): void {
    const color = depth <= -15 ? palette.far : depth <= -12 ? palette.mid : palette.near;
    const count = Math.ceil(this.level.width / 112) + 6;

    for (let i = 0; i < count; i += 1) {
      const width = 70 + ((i * 29 + depth * 7) % 62);
      const heightRange = maxHeight - minHeight;
      const height = minHeight + ((i * 71 + Math.abs(depth) * 19) % heightRange);
      const x = i * 106 - 140;
      const y = 690 - height / 2;
      const building = this.add.rectangle(x, y, width, height, color, alpha);
      building.setOrigin(0, 0.5).setScrollFactor(scrollFactor).setDepth(depth);

      const capHeight = 18 + ((i * 11) % 26);
      const cap = this.add.triangle(x + width / 2, y - height / 2 - capHeight / 2, 0, capHeight, width * 0.5, 0, width, capHeight, color, alpha);
      cap.setScrollFactor(scrollFactor).setDepth(depth);

      const trimY = y - height / 2 + 42;
      this.add.rectangle(x + width / 2, trimY, width * 0.84, 3, palette.accent, 0.16).setScrollFactor(scrollFactor).setDepth(depth + 0.1);

      if (depth > -15) {
        const columns = Math.max(2, Math.floor(width / 24));
        const rows = Math.max(3, Math.floor(height / 44));
        for (let column = 0; column < columns; column += 1) {
          for (let row = 0; row < rows; row += 1) {
            if ((column + row + i) % 3 === 0) {
              continue;
            }
            const wx = x + 14 + column * 22;
            const wy = y - height / 2 + 58 + row * 38;
            this.add.rectangle(wx, wy, 5, 13, palette.accent, depth === -10 ? 0.42 : 0.24).setScrollFactor(scrollFactor).setDepth(depth + 0.2);
          }
        }
      }
    }
  }

  private drawRainStreaks(palette: Pick<NoirPalette, 'accent'>): void {
    for (let i = 0; i < Math.ceil(this.level.width / 72); i += 1) {
      const x = i * 72 + 26;
      const y = 70 + ((i * 47) % 360);
      const streak = this.add.rectangle(x, y, 2, 34, 0xa8c0d0, 0.11);
      streak.setAngle(-16).setScrollFactor(0.62).setDepth(-5);
    }

    for (let i = 0; i < Math.ceil(this.level.width / 190); i += 1) {
      this.add.rectangle(i * 190 + 48, 666, 78, 2, palette.accent, 0.15).setDepth(-4);
    }
  }

  private handleTimelineInput(): void {
    if (this.inputController.justPressed('timelinePast')) {
      this.setTimeline('past');
    } else if (this.inputController.justPressed('timelinePresent')) {
      this.setTimeline('present');
    } else if (this.inputController.justPressed('timelineFuture')) {
      this.setTimeline('future');
    } else if (this.inputController.justPressed('timelineCycle')) {
      const next = this.timelineManager.cycle();
      this.onTimelineChanged(next);
    }
  }

  private setTimeline(timeline: TimelineKey): void {
    if (this.timelineManager.set(timeline)) {
      this.onTimelineChanged(timeline);
    }
  }

  private onTimelineChanged(timeline: TimelineKey): void {
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    const wasSupported = body.blocked.down || body.touching.down;
    const previousBottom = body.bottom;
    this.applyTimeline();
    this.stabilizePlayerAfterTimelineShift(wasSupported, previousBottom);
    this.audioManager.playTimelineTone(timeline);
    if (!this.saveManager.getSettings().reducedFlashes) {
      this.cameras.main.flash(110, timeline === 'past' ? 180 : 80, timeline === 'present' ? 210 : 90, timeline === 'future' ? 230 : 190);
    }
    this.emitTimelinePulse(timeline);
    this.saveManager.saveProgress(this.level.id, timeline, this.checkpointSystem.activeCheckpoint?.id);
    this.uiManager.updateHud({ timeline });
  }

  private stabilizePlayerAfterTimelineShift(wasSupported: boolean, previousBottom: number): void {
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    const previousVelocityY = body.velocity.y;
    body.setVelocityY(Math.min(0, previousVelocityY));
    this.physics.world.collide(this.player.sprite, this.solidGroup);
    if (wasSupported) {
      this.snapPlayerToNearestSupport(previousBottom);
    }

    this.time.delayedCall(0, () => {
      if (!this.player || this.levelComplete) {
        return;
      }
      this.physics.world.collide(this.player.sprite, this.solidGroup);
      if (wasSupported) {
        this.snapPlayerToNearestSupport(previousBottom);
      }
    });
  }

  private snapPlayerToNearestSupport(previousBottom: number): void {
    const playerBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    const playerLeft = playerBody.left + 3;
    const playerRight = playerBody.right - 3;
    let bestTop: number | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;

    this.solidGroup.getChildren().forEach((child) => {
      const body = (child as Phaser.GameObjects.GameObject).body as Phaser.Physics.Arcade.StaticBody | undefined;
      if (!body || !body.enable || body.checkCollision.none) {
        return;
      }
      if (playerRight < body.left || playerLeft > body.right) {
        return;
      }

      const distance = Math.abs(body.top - previousBottom);
      if (body.top >= previousBottom - 80 && body.top <= previousBottom + 42 && distance < bestDistance) {
        bestTop = body.top;
        bestDistance = distance;
      }
    });

    if (bestTop === undefined) {
      return;
    }

    const correction = bestTop - playerBody.bottom;
    if (Math.abs(correction) > 0.5) {
      this.player.sprite.y += correction;
      playerBody.updateFromGameObject();
    }
    playerBody.setVelocityY(0);
  }

  private applyTimeline(): void {
    this.timelineBlocks.forEach((block) => block.applyTimeline(this.timelineManager.current));
    this.applyDoors();

    if (this.timelineTint) {
      const colors: Record<TimelineKey, number> = {
        past: 0x846135,
        present: 0x2b7c8f,
        future: 0x7d2434,
      };
      this.timelineTint.setFillStyle(colors[this.timelineManager.current], 0.08);
    }
  }

  private applyDoors(): void {
    const flags = this.combinedFlags();
    this.doors.forEach((door) => {
      if (door.apply(this.timelineManager.current, flags)) {
        this.audioManager.playSfx('door');
        this.uiManager.showToast('A locked second gives way.');
      }
    });
  }

  private updateFlags(interactPressed: boolean): void {
    this.heldFlags.clear();
    const actors = [{ sprite: this.player.sprite, timeline: this.timelineManager.current }];
    if (this.ghost) {
      actors.push({ sprite: this.ghost.sprite, timeline: this.ghost.timeline });
    }
    const ghostHeldPlateFlags = new Set(this.ghost?.heldPlateFlags ?? []);
    this.plates.forEach((plate) => {
      if (plate.update(this.timelineManager.current, actors, ghostHeldPlateFlags.has(plate.flag))) {
        this.heldFlags.add(plate.flag);
      }
    });

    this.switches.forEach((lever) => {
      if (
        lever.update(
          this.timelineManager.current,
          this.player.sprite,
          interactPressed,
          this.ghost?.sprite,
          Boolean(this.ghost?.isInteracting),
          this.ghost?.timeline,
        )
      ) {
        this.latchedFlags.add(lever.flag);
        this.audioManager.playSfx('switch');
        this.uiManager.showToast('A circuit remembers the choice.');
      }

      if (lever.isToggled) {
        this.latchedFlags.add(lever.flag);
      }
    });

    this.applyDoors();
  }

  private updateCheckpoints(): void {
    const checkpoint = this.checkpointSystem.update(this.checkpoints, this.player.sprite, this.timelineManager.current);
    if (!checkpoint) {
      return;
    }
    this.audioManager.playSfx('checkpoint');
    this.uiManager.showToast('Checkpoint stabilized.');
    this.saveManager.saveProgress(this.level.id, this.timelineManager.current, checkpoint.id);
  }

  private updateStoryZones(): void {
    for (const zone of this.level.storyZones) {
      if (this.storyTriggered.has(zone.id)) {
        continue;
      }
      if (this.overlaps(this.player.sprite, zone)) {
        this.storyTriggered.add(zone.id);
        this.showDialogue(zone.id, zone.lines, zone.once ?? true);
        break;
      }
    }
  }

  private updateExit(): void {
    if (!this.exitZone || !this.overlaps(this.player.sprite, this.level.exit)) {
      return;
    }

    const missing = (this.level.requiredExitFlags ?? []).filter((flag) => !this.combinedFlags().has(flag));
    if (missing.length > 0) {
      if (performance.now() - this.exitBlockedToastAt > 2200) {
        this.exitBlockedToastAt = performance.now();
        this.uiManager.showToast('The Keeper still has anchors in this hour.');
      }
      return;
    }

    this.levelComplete = true;
    this.saveManager.saveProgress(this.level.nextLevelId ?? this.level.id, 'present');
    this.audioManager.playSfx('checkpoint');
    this.cameras.main.fadeOut(650, 5, 8, 13);
    this.time.delayedCall(700, () => {
      if (this.level.nextLevelId) {
        this.scene.start('GameScene', { levelId: this.level.nextLevelId });
      } else {
        this.scene.start('EndingScene');
      }
    });
  }

  private updateHud(): void {
    let ghostLabel = 'Ready';
    let ghostProgress = 0;
    if (this.ghostRecorder.isRecording) {
      ghostLabel = 'Recording';
      ghostProgress = this.ghostRecorder.progress;
    } else if (this.ghost) {
      ghostLabel = this.ghost.finished ? 'Holding' : 'Replaying';
      ghostProgress = this.ghost.finished ? 1 : 0.5;
    }

    this.uiManager.updateHud({
      timeline: this.timelineManager.current,
      checkpoint: this.checkpointSystem.checkpointLabel(),
      ghostLabel,
      ghostProgress,
    });
  }

  private toggleRecording(): void {
    if (this.ghostRecorder.isRecording) {
      this.spawnGhost(this.ghostRecorder.stop());
      return;
    }

    this.ghost?.destroy();
    this.ghost = undefined;
    this.ghostRecorder.start();
    this.audioManager.playSfx('echoStart');
    this.createRecordingAura();
    this.uiManager.showToast('Echo recording started.');
  }

  private updateRecording(interactPressed: boolean): void {
    if (!this.ghostRecorder.isRecording) {
      return;
    }

    const heldPlateFlags = this.plates
      .filter((plate) => plate.isHeldBy(this.timelineManager.current, this.player.sprite))
      .map((plate) => plate.flag);

    const frames = this.ghostRecorder.capture(
      this.player.sprite.x,
      this.player.sprite.y,
      this.player.sprite.flipX,
      interactPressed,
      this.timelineManager.current,
      heldPlateFlags,
    );
    if (frames) {
      this.spawnGhost(frames);
    }
  }

  private spawnGhost(frames: ReturnType<GhostRecorder['stop']>): void {
    if (frames.length < 2) {
      this.destroyRecordingAura();
      this.uiManager.showToast('The echo was too thin to hold.');
      return;
    }

    this.ghost?.destroy();
    this.ghost = new GhostClone(this, frames);
    this.destroyRecordingAura();
    this.audioManager.playSfx('echoStop');
    this.uiManager.showToast('Echo replay anchored.');
  }

  private rewindToCheckpoint(): void {
    this.audioManager.playSfx('rewind');
    if (!this.saveManager.getSettings().reducedFlashes) {
      this.cameras.main.flash(140, 110, 231, 242);
    }
    this.ghost?.destroy();
    this.ghost = undefined;
    if (this.ghostRecorder.isRecording) {
      this.ghostRecorder.stop();
    }
    this.destroyRecordingAura();

    this.player.respawn(this.checkpointSystem.rewindSpawn());
    if (this.checkpointSystem.checkpointTimeline) {
      this.setTimeline(this.checkpointSystem.checkpointTimeline);
    }
    this.uiManager.showToast('Rewound to the last stable point.');
  }

  private respawn(message: string): void {
    if (this.isRespawning) {
      return;
    }

    this.isRespawning = true;
    this.audioManager.playSfx('death');
    this.uiManager.showToast(message);
    const settings = this.saveManager.getSettings();
    if (!settings.reducedMotion) {
      this.cameras.main.shake(180, 0.006);
    }
    if (!settings.reducedFlashes) {
      this.cameras.main.flash(150, 224, 97, 97);
    }
    this.time.delayedCall(220, () => {
      this.rewindToCheckpoint();
      this.isRespawning = false;
    });
  }

  private togglePause(): void {
    if (this.isPaused) {
      this.resumeFromPause();
      return;
    }
    this.isPaused = true;
    this.physics.pause();
    this.openPauseMenu();
  }

  private openPauseMenu(): void {
    this.uiManager.showPause(
      () => this.resumeFromPause(),
      () => this.uiManager.showOptions(() => this.openPauseMenu()),
      () => {
        this.physics.resume();
        this.uiManager.clearOverlay();
        this.scene.start('MainMenuScene');
      },
    );
  }

  private resumeFromPause(): void {
    this.isPaused = false;
    this.physics.resume();
    this.uiManager.clearOverlay();
  }

  private showDialogue(id: string, lines: string[], once: boolean): void {
    this.dialogueManager.tryShow(id, lines, once, (dialogueLines, done) => {
      this.physics.pause();
      this.uiManager.showDialogue(dialogueLines, () => {
        this.physics.resume();
        done();
      });
    });
  }

  private combinedFlags(): Set<string> {
    return new Set([...this.latchedFlags, ...this.heldFlags]);
  }

  private overlaps(object: Phaser.GameObjects.GameObject & { getBounds: () => Phaser.Geom.Rectangle }, rect: RectSpec | StoryZoneSpec): boolean {
    const bounds = object.getBounds();
    const target = new Phaser.Geom.Rectangle(rect.x - rect.width / 2, rect.y - rect.height / 2, rect.width, rect.height);
    return Phaser.Geom.Intersects.RectangleToRectangle(bounds, target);
  }

  private emitFootfallDust(color: number, count: number): void {
    const emitter = this.add.particles(this.player.sprite.x, this.player.sprite.y + 18, TextureKeys.particle, {
      lifespan: 260,
      speed: { min: 20, max: 80 },
      angle: { min: 190, max: 350 },
      scale: { start: 0.65, end: 0 },
      alpha: { start: 0.42, end: 0 },
      tint: color,
      quantity: count,
      emitting: false,
    });
    emitter.setDepth(19);
    emitter.explode(count);
    this.time.delayedCall(300, () => emitter.destroy());
  }

  private emitTimelinePulse(timeline: TimelineKey): void {
    if (this.saveManager.getSettings().reducedMotion) {
      return;
    }
    const color: Record<TimelineKey, number> = {
      past: 0xf0a64d,
      present: 0x6ee7f2,
      future: 0xe0618a,
    };
    const ring = this.add.circle(this.player.sprite.x, this.player.sprite.y, 24, color[timeline], 0);
    ring.setStrokeStyle(3, color[timeline], 0.8);
    ring.setDepth(21);
    this.tweens.add({
      targets: ring,
      radius: 90,
      alpha: 0,
      duration: 360,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private createRecordingAura(): void {
    this.destroyRecordingAura();
    this.recordingAura = this.add.circle(this.player.sprite.x, this.player.sprite.y, 30, 0x6ee7f2, 0.08);
    this.recordingAura.setStrokeStyle(2, 0x6ee7f2, 0.72);
    this.recordingAura.setDepth(19);
    if (this.saveManager.getSettings().reducedMotion) {
      return;
    }
    this.tweens.add({
      targets: this.recordingAura,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.18,
      yoyo: true,
      repeat: -1,
      duration: 520,
      ease: 'Sine.easeInOut',
    });
  }

  private updateRecordingAura(): void {
    if (!this.recordingAura) {
      return;
    }
    this.recordingAura.setPosition(this.player.sprite.x, this.player.sprite.y);
  }

  private destroyRecordingAura(): void {
    if (!this.recordingAura) {
      return;
    }
    this.tweens.killTweensOf(this.recordingAura);
    this.recordingAura.destroy();
    this.recordingAura = undefined;
  }
}
