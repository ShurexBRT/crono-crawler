import Phaser from 'phaser';
import { TextureKeys } from '../../assets/manifest';
import { getLevel } from '../../content/levels';
import { CheckpointBeacon, LeverSwitch, PressurePlate, StaticPlatform, TimelineBlock, TimelineDoor } from '../../entities/LevelObjects';
import { Enemy } from '../../entities/Enemy';
import { GhostClone } from '../../entities/GhostClone';
import { Player } from '../../entities/Player';
import { InputController } from '../../input/InputController';
import { AudioManager } from '../../systems/AudioManager';
import { DialogueManager } from '../../systems/DialogueManager';
import { GhostRecorder } from '../../systems/GhostRecorder';
import { SaveManager } from '../../systems/SaveManager';
import { TimelineManager } from '../../systems/TimelineManager';
import type { CheckpointSpec, LevelData, Point, RectSpec, StoryZoneSpec, TimelineKey } from '../../types';
import type { UIManager } from '../../../ui/UIManager';

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
  private activeCheckpoint?: CheckpointSpec;
  private checkpointTimeline?: TimelineKey;
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
    this.level = getLevel(data.levelId ?? 'tutorial');
    this.timelineManager = new TimelineManager(data.timeline ?? this.level.startTimeline);
    this.dialogueManager = new DialogueManager();
    this.ghostRecorder = new GhostRecorder();
    this.inputController = new InputController(this);
    this.solidGroup = this.physics.add.staticGroup();

    this.physics.world.setBounds(0, 0, this.level.width, this.level.height + 120);
    this.cameras.main.setBounds(0, 0, this.level.width, this.level.height);
    this.cameras.main.setBackgroundColor('#070910');

    this.drawBackground();
    this.buildLevel();
    this.player = new Player(this, this.resolveSpawn(data.checkpointId));
    this.configurePhysics();
    this.configureCamera();
    this.applyTimeline();

    this.uiManager.clearOverlay();
    this.uiManager.showHud({
      levelTitle: this.level.title,
      objective: this.level.objective,
      timeline: this.timelineManager.current,
      checkpoint: this.activeCheckpoint ? `Checkpoint: ${this.activeCheckpoint.id}` : this.level.subtitle,
      ghostLabel: 'Ready',
      ghostProgress: 0,
    });

    this.saveManager.saveProgress(this.level.id, this.timelineManager.current, this.activeCheckpoint?.id);
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

    const jumped = this.player.update(this.inputController, delta, false);
    if (jumped) {
      this.audioManager.playSfx('jump');
    }

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
      this.add.sprite(2265, 590, TextureKeys.keeper).setDepth(13).setScale(1.45).setAlpha(0.92);
      this.add.sprite(2180, 505, TextureKeys.core).setDepth(5).setScale(1.45).setAlpha(0.64);
    }

    if (this.level.id === 'level-2') {
      this.add.sprite(530, 637, TextureKeys.girl).setDepth(10).setAlpha(0.82);
    }
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
    const palette = {
      reactor: [0x081019, 0x12202b, 0x263743],
      streets: [0x080b12, 0x111923, 0x2a333b],
      greenhouse: [0x09100e, 0x173028, 0x38533d],
      station: [0x080d13, 0x18222c, 0x34404a],
      core: [0x09070e, 0x201622, 0x2d4050],
    }[this.level.background];

    this.add.rectangle(this.level.width / 2, 360, this.level.width, 720, palette[0]).setDepth(-20);
    for (let i = 0; i < Math.ceil(this.level.width / 150) + 3; i += 1) {
      const x = i * 150 - 70;
      const height = 140 + ((i * 61) % 230);
      this.add.rectangle(x, 720 - height / 2, 110, height, palette[i % 2 === 0 ? 1 : 2], 0.55)
        .setOrigin(0, 0.5)
        .setScrollFactor(0.35)
        .setDepth(-15);
    }

    for (let i = 0; i < Math.ceil(this.level.width / 90); i += 1) {
      const y = 70 + ((i * 37) % 180);
      this.add.rectangle(i * 90 + 30, y, 3, 3, 0x6ee7f2, 0.45).setScrollFactor(0.18).setDepth(-14);
    }

    this.timelineTint = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.06);
    this.timelineTint.setScrollFactor(0);
    this.timelineTint.setDepth(30);
    this.timelineTint.setBlendMode(Phaser.BlendModes.ADD);
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
    this.applyTimeline();
    this.audioManager.playTimelineTone(timeline);
    this.cameras.main.flash(110, timeline === 'past' ? 180 : 80, timeline === 'present' ? 210 : 90, timeline === 'future' ? 230 : 190);
    this.saveManager.saveProgress(this.level.id, timeline, this.activeCheckpoint?.id);
    this.uiManager.updateHud({ timeline });
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
    const actors = [this.player.sprite, this.ghost?.sprite];
    this.plates.forEach((plate) => {
      if (plate.update(this.timelineManager.current, actors)) {
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
    this.checkpoints.forEach((checkpoint) => {
      if (checkpoint.update(this.player.sprite)) {
        this.activeCheckpoint = this.level.checkpoints.find((candidate) => candidate.id === checkpoint.id);
        this.checkpointTimeline = this.timelineManager.current;
        this.audioManager.playSfx('checkpoint');
        this.uiManager.showToast('Checkpoint stabilized.');
        this.saveManager.saveProgress(this.level.id, this.timelineManager.current, checkpoint.id);
      }
    });
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
      checkpoint: this.activeCheckpoint ? `Checkpoint: ${this.activeCheckpoint.id}` : this.level.subtitle,
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
    this.audioManager.playSfx('shift');
    this.uiManager.showToast('Echo recording started.');
  }

  private updateRecording(interactPressed: boolean): void {
    if (!this.ghostRecorder.isRecording) {
      return;
    }

    const frames = this.ghostRecorder.capture(this.player.sprite.x, this.player.sprite.y, this.player.sprite.flipX, interactPressed);
    if (frames) {
      this.spawnGhost(frames);
    }
  }

  private spawnGhost(frames: ReturnType<GhostRecorder['stop']>): void {
    if (frames.length < 2) {
      this.uiManager.showToast('The echo was too thin to hold.');
      return;
    }

    this.ghost?.destroy();
    this.ghost = new GhostClone(this, frames);
    this.audioManager.playSfx('checkpoint');
    this.uiManager.showToast('Echo replay anchored.');
  }

  private rewindToCheckpoint(): void {
    this.audioManager.playSfx('rewind');
    this.cameras.main.flash(140, 110, 231, 242);
    this.ghost?.destroy();
    this.ghost = undefined;
    if (this.ghostRecorder.isRecording) {
      this.ghostRecorder.stop();
    }

    const spawn = this.activeCheckpoint
      ? { x: this.activeCheckpoint.x, y: this.activeCheckpoint.y - 24 }
      : this.level.spawn;

    this.player.respawn(spawn);
    if (this.checkpointTimeline) {
      this.setTimeline(this.checkpointTimeline);
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
    this.cameras.main.shake(180, 0.006);
    this.cameras.main.flash(150, 224, 97, 97);
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

  private resolveSpawn(checkpointId?: string): Point {
    if (!checkpointId) {
      return this.level.spawn;
    }

    const checkpoint = this.level.checkpoints.find((candidate) => candidate.id === checkpointId);
    if (!checkpoint) {
      return this.level.spawn;
    }

    this.activeCheckpoint = checkpoint;
    this.checkpointTimeline = this.timelineManager.current;
    return { x: checkpoint.x, y: checkpoint.y - 24 };
  }

  private combinedFlags(): Set<string> {
    return new Set([...this.latchedFlags, ...this.heldFlags]);
  }

  private overlaps(object: Phaser.GameObjects.GameObject & { getBounds: () => Phaser.Geom.Rectangle }, rect: RectSpec | StoryZoneSpec): boolean {
    const bounds = object.getBounds();
    const target = new Phaser.Geom.Rectangle(rect.x - rect.width / 2, rect.y - rect.height / 2, rect.width, rect.height);
    return Phaser.Geom.Intersects.RectangleToRectangle(bounds, target);
  }
}
