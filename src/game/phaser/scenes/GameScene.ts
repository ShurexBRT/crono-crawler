import Phaser from 'phaser';
import { TextureKeys } from '../../assets/manifest';
import { getLevel } from '../../content/levels';
import { CheckpointBeacon, LeverSwitch, PressurePlate, StaticPlatform, TimelineBlock, TimelineDoor } from '../../entities/LevelObjects';
import { Enemy } from '../../entities/Enemy';
import { GhostClone } from '../../entities/GhostClone';
import { HazardZone } from '../../entities/HazardZone';
import { MemoryFragment } from '../../entities/MemoryFragment';
import { Player } from '../../entities/Player';
import { InputController } from '../../input/InputController';
import { AudioManager } from '../../systems/AudioManager';
import { CheckpointSystem } from '../../systems/CheckpointSystem';
import { DialogueManager } from '../../systems/DialogueManager';
import { GhostRecorder } from '../../systems/GhostRecorder';
import { watchFocusLoss } from '../../systems/FocusLossGuard';
import { LevelFlowSystem } from '../../systems/LevelFlowSystem';
import { SaveManager } from '../../systems/SaveManager';
import { TimelineManager } from '../../systems/TimelineManager';
import { ParallaxBackdrop, preloadBackdrop } from '../rendering/ParallaxBackdrop';
import type { LevelData, RectSpec, StoryZoneSpec, TimelineKey } from '../../types';
import type { UIManager } from '../../../ui/UIManager';


interface GameSceneData {
  levelId?: string;
  checkpointId?: string;
  timeline?: TimelineKey;
}

export class GameScene extends Phaser.Scene {
  private focusPauseRequested = false;
  private saveManager!: SaveManager;
  private audioManager!: AudioManager;
  private uiManager!: UIManager;
  private inputController!: InputController;
  private timelineManager!: TimelineManager;
  private checkpointSystem!: CheckpointSystem;
  private levelFlowSystem!: LevelFlowSystem;
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
  private hazards: HazardZone[] = [];
  private memoryFragments: MemoryFragment[] = [];
  private ghost?: GhostClone;
  private exitZone?: Phaser.GameObjects.Rectangle;
  private timelineTint?: Phaser.GameObjects.Rectangle;
  private recordingAura?: Phaser.GameObjects.Arc;
  private latchedFlags = new Set<string>();
  private heldFlags = new Set<string>();
  private storyTriggered = new Set<string>();
  private isPaused = false;
  private isRespawning = false;
  private backdrop?: ParallaxBackdrop;
  private mara?: Phaser.GameObjects.Sprite;

  constructor() {
    super('GameScene');
  }

  init(data: GameSceneData): void {
    this.level = getLevel(data.levelId ?? 'tutorial');
  }

  preload(): void {
    preloadBackdrop(this, this.level.id);
  }

  create(data: GameSceneData): void {
    this.saveManager = this.registry.get('saveManager') as SaveManager;
    this.audioManager = this.registry.get('audioManager') as AudioManager;
    this.uiManager = this.registry.get('uiManager') as UIManager;
    this.resetRuntimeState();
    this.level = getLevel(data.levelId ?? 'tutorial');
    this.timelineManager = new TimelineManager(data.timeline ?? this.level.startTimeline);
    const progress = this.saveManager.getProgression();
    this.latchedFlags = new Set(this.saveManager.getLevelFlags(this.level.id));
    this.storyTriggered = new Set(progress.levelStoryIds[this.level.id] ?? []);
    this.checkpointSystem = new CheckpointSystem(this.level, progress?.checkpointTimeline ?? this.timelineManager.current, data.checkpointId);
    this.levelFlowSystem = new LevelFlowSystem(this.level);
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
    this.player = new Player(this, this.checkpointSystem.rewindSpawn());
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

    this.saveCurrentProgress();
    this.uiManager.setMemoryVaultAccess(() => this.openMemoryVault());
    this.showDialogue(`start-${this.level.id}`, this.level.startLines, true);
    const stopWatchingFocus = watchFocusLoss(window, document, () => this.pauseForFocusLoss());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, stopWatchingFocus);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.uiManager.setMemoryVaultAccess());
  }

  update(_time: number, delta: number): void {
    if (!this.player || this.levelFlowSystem.isComplete) {
      return;
    }

    if (this.uiManager.isMemoryVaultOpen) return;
    if (this.inputController.justPressed('journal')) {
      this.openMemoryVault();
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
    this.backdrop?.update(delta, this.saveManager.getSettings().reducedMotion);
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
    this.updateRecording(interactPressed, delta);

    if (rewindPressed) {
      this.rewindToCheckpoint();
    }

    this.ghost?.update(delta);
    this.enemies.forEach((enemy) => enemy.update());
    this.updateFlags(interactPressed);
    this.updateHazards();
    if (this.isRespawning) {
      return;
    }
    this.updateCheckpoints();
    this.updateStoryZones();
    if (this.dialogueManager.isActive) {
      return;
    }
    this.updateMemoryFragments();
    if (this.dialogueManager.isActive) {
      return;
    }
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
    this.switches.forEach((lever) => lever.restore(this.latchedFlags.has(lever.flag)));
    this.checkpoints = this.level.checkpoints.map((checkpoint) => new CheckpointBeacon(this, checkpoint, TextureKeys.productionCheckpoint));
    this.enemies = this.level.enemies.map((enemy) => new Enemy(this, enemy));
    this.hazards = (this.level.hazards ?? []).map((hazard) => new HazardZone(this, hazard));
    const collected = new Set(this.saveManager.getProgression().collectedMemoryFragmentIds);
    this.memoryFragments = (this.level.memoryFragments ?? []).filter((fragment) => !collected.has(fragment.id)).map((fragment) => new MemoryFragment(this, fragment));

    this.exitZone = this.add.rectangle(this.level.exit.x, this.level.exit.y, this.level.exit.width, this.level.exit.height, 0x6ee7f2, 0.16);
    this.exitZone.setStrokeStyle(1, 0x6ee7f2, 0.6);
    this.exitZone.setDepth(6);

    if (this.level.id === 'boss') {
      this.add.sprite(2265, 590, TextureKeys.keeper).setDepth(13).setDisplaySize(66, 140).setTintFill(0x111b1d).setAlpha(0.92);
      this.add.sprite(2180, 505, TextureKeys.core).setDepth(5).setScale(1.45).setAlpha(0.64);
    }

    if (this.level.id === 'level-2' && !this.storyTriggered.has('girl-vanish')) {
      this.mara = this.add.sprite(530, 615, TextureKeys.girl).setDepth(10).setAlpha(0.7);
      this.mara.setScale(86 / this.mara.height);
    }
  }

  private resetRuntimeState(): void {
    this.timelineBlocks = [];
    this.doors = [];
    this.plates = [];
    this.switches = [];
    this.checkpoints = [];
    this.enemies = [];
    this.hazards = [];
    this.memoryFragments = [];
    this.ghost = undefined;
    this.exitZone = undefined;
    this.timelineTint = undefined;
    this.recordingAura = undefined;
    this.backdrop = undefined;
    this.mara = undefined;
    this.latchedFlags.clear();
    this.heldFlags.clear();
    this.storyTriggered.clear();
    this.isPaused = false;
    this.isRespawning = false;
    this.focusPauseRequested = false;
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
    const camera = this.level.camera;
    const follow = camera?.followLerp ?? { x: 0.08, y: 0.08 };
    this.cameras.main.startFollow(this.player.sprite, true, follow.x, follow.y);
    this.cameras.main.setDeadzone(camera?.deadzone?.width ?? 220, camera?.deadzone?.height ?? 120);
    if (camera?.followOffset) this.cameras.main.setFollowOffset(camera.followOffset.x, camera.followOffset.y);
    this.cameras.main.setZoom(camera?.zoom ?? 1);
  }

  private drawBackground(): void {
    this.backdrop = new ParallaxBackdrop(this, this.level, this.timelineManager.current);
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
    this.saveCurrentProgress();
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
      if (!this.player || this.levelFlowSystem.isComplete) {
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
    this.backdrop?.setTimeline(this.timelineManager.current);
    this.timelineBlocks.forEach((block) => block.applyTimeline(this.timelineManager.current));
    this.hazards.forEach((hazard) => hazard.applyTimeline(this.timelineManager.current));
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
          this.combinedFlags(),
        )
      ) {
        this.latchedFlags.add(lever.flag);
        lever.latchesFlags.forEach((flag) => this.latchedFlags.add(flag));
        this.saveCurrentProgress();
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
    this.saveCurrentProgress();
  }

  private updateHazards(): void {
    const hazard = this.hazards.find((candidate) => candidate.overlaps(this.player.sprite));
    if (hazard) {
      this.respawn(hazard.message);
    }
  }

  private updateStoryZones(): void {
    for (const zone of this.level.storyZones) {
      if (this.storyTriggered.has(zone.id)) {
        continue;
      }
      if (this.overlaps(this.player.sprite, zone)) {
        this.storyTriggered.add(zone.id);
        if (zone.id === 'girl-vanish') this.mara?.setVisible(false);
        this.saveCurrentProgress();
        this.showDialogue(zone.id, zone.lines, zone.once ?? true);
        break;
      }
    }
  }

  private updateMemoryFragments(): void {
    for (const fragment of this.memoryFragments) {
      const memory = fragment.update(this.player.sprite);
      if (!memory) {
        continue;
      }
      this.audioManager.playSfx('checkpoint');
      this.saveManager.markMemoryCollected(memory.id);
      this.uiManager.setMemoryVaultAccess(() => this.openMemoryVault());
      this.dialogueManager.tryShow(`memory-${memory.id}`, memory.lines, true, (_lines, done) => {
        this.physics.pause();
        this.uiManager.showMemory(memory, () => {
          done();
          this.finishBlockingOverlay();
        });
      });
      break;
    }
  }

  private updateExit(): void {
    if (!this.exitZone || !this.overlaps(this.player.sprite, this.level.exit)) {
      return;
    }

    const attempt = this.levelFlowSystem.attemptExit(this.combinedFlags(), performance.now());
    if (attempt.status === 'blocked') {
      if (attempt.showToast) {
        this.uiManager.showToast('The route is still locked. Complete the remaining circuits.');
      }
      return;
    }

    if (attempt.status !== 'complete') {
      return;
    }

    this.physics.pause();
    this.saveManager.markLevelCompleted(this.level.id);
    this.saveManager.saveProgress(attempt.nextLevelId ?? this.level.id, 'present');
    this.audioManager.playSfx('checkpoint');
    this.cameras.main.fadeOut(650, 5, 8, 13);
    this.time.delayedCall(700, () => {
      if (attempt.nextLevelId) {
        this.scene.start('GameScene', { levelId: attempt.nextLevelId });
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
      objective: this.level.objectives
        ? this.level.objectives.map((step) => `${this.combinedFlags().has(step.flag) ? '[+]' : '[ ]'} ${step.label}`).join('  /  ')
        : this.level.objective,
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

  private updateRecording(interactPressed: boolean, deltaMs: number): void {
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
      deltaMs,
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
    if (this.isRespawning || this.levelFlowSystem.isComplete) {
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

  private pauseForFocusLoss(): void {
    if (this.levelFlowSystem.isComplete) return;
    this.focusPauseRequested = true;
    this.inputController.reset();
    this.player.sprite.setVelocityX(0);
    this.physics.pause();
    if (this.isPaused || this.dialogueManager.isActive || this.uiManager.isMemoryVaultOpen) return;
    this.isPaused = true;
    this.openPauseMenu();
  }

  private finishBlockingOverlay(): void {
    this.inputController.reset();
    if (this.focusPauseRequested) {
      this.isPaused = true;
      this.openPauseMenu();
    } else {
      this.physics.resume();
    }
  }

  private openMemoryVault(): void {
    if (this.levelFlowSystem.isComplete || this.uiManager.isMemoryVaultOpen) return;
    const wasPaused = this.isPaused;
    this.inputController.reset();
    this.physics.pause();
    this.uiManager.showMemoryVault(() => {
      this.inputController.reset();
      if (wasPaused || this.dialogueManager.isActive) return;
      if (this.focusPauseRequested) {
        this.isPaused = true;
        this.openPauseMenu();
      } else {
        this.physics.resume();
      }
    });
  }

  private openPauseMenu(): void {
    this.uiManager.showPause(
      this.saveManager.getContinueSummary(),
      {
        onResume: () => this.resumeFromPause(),
        onOptions: () => this.uiManager.showOptions(() => this.openPauseMenu()),
        onSave: () => this.saveCurrentProgress(),
        onMenu: () => {
          this.saveCurrentProgress();
          this.physics.resume();
          this.uiManager.clearOverlay();
          this.scene.start('MainMenuScene');
        },
      },
    );
  }

  private saveCurrentProgress() {
    this.saveManager.saveProgress(this.level.id, this.timelineManager.current, this.checkpointSystem.activeCheckpoint?.id, {
      latchedFlags: [...this.latchedFlags],
      seenStoryIds: [...this.storyTriggered],
      checkpointTimeline: this.checkpointSystem.checkpointTimeline,
    });
    return this.saveManager.getContinueSummary();
  }

  private resumeFromPause(): void {
    this.focusPauseRequested = false;
    this.inputController.reset();
    this.isPaused = false;
    this.physics.resume();
    this.uiManager.clearOverlay();
  }

  private showDialogue(id: string, lines: string[], once: boolean): void {
    this.dialogueManager.tryShow(id, lines, once, (dialogueLines, done) => {
      this.physics.pause();
      this.uiManager.showDialogue(dialogueLines, () => {
        done();
        this.finishBlockingOverlay();
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
