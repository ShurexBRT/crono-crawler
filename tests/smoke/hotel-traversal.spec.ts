import { expect, test } from '@playwright/test';
import { dismissDialogue, seedContinueSave } from './support/playable';

// This spec validates the real Phaser keyboard path and real Arcade Physics. The traversal
// itself runs inside the browser frame loop so CI instrumentation cannot stretch gameplay
// through Playwright round-trips and change the trajectory being tested.
test.use({ trace: 'off' });

const route = [
  { x: 500, top: 1200, key: 'Digit2', timeline: 'present', sprint: false },
  { x: 665, top: 1120, key: 'Digit1', timeline: 'past', sprint: false },
  { x: 830, top: 1040, key: 'Digit1', timeline: 'past', sprint: false },
  { x: 1000, top: 960, key: 'Digit3', timeline: 'future', sprint: false },
  { x: 1160, top: 880, key: 'Digit3', timeline: 'future', sprint: false },
  { x: 1330, top: 800, key: 'Digit2', timeline: 'present', sprint: false },
  { x: 1490, top: 720, key: 'Digit2', timeline: 'present', sprint: false },
  { x: 1665, top: 640, key: 'Digit2', timeline: 'present', sprint: true },
] as const;

test('hotel stairs can be climbed with real jumps and timeline input', async ({ page }) => {
  test.setTimeout(90_000);
  await seedContinueSave(page, 'hourglass-hotel');
  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  const result = await page.evaluate(async (targets) => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('GameScene') as any;
    const sprite = scene.player.sprite;

    scene.player.respawn({ x: 320, y: 1235 });
    scene.storyTriggered = new Set(scene.level.storyZones.map((zone: { id: string }) => zone.id));
    scene.memoryFragments = [];

    const keyMeta: Record<string, { key: string; keyCode: number }> = {
      ArrowLeft: { key: 'ArrowLeft', keyCode: 37 },
      ArrowRight: { key: 'ArrowRight', keyCode: 39 },
      ShiftLeft: { key: 'Shift', keyCode: 16 },
      Space: { key: ' ', keyCode: 32 },
      Digit1: { key: '1', keyCode: 49 },
      Digit2: { key: '2', keyCode: 50 },
      Digit3: { key: '3', keyCode: 51 },
    };

    const emitKey = (type: 'keydown' | 'keyup', code: string) => {
      const meta = keyMeta[code];
      const event = new KeyboardEvent(type, { key: meta.key, code, bubbles: true, cancelable: true, repeat: false });
      Object.defineProperty(event, 'keyCode', { get: () => meta.keyCode });
      Object.defineProperty(event, 'which', { get: () => meta.keyCode });
      window.dispatchEvent(event);
    };

    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const waitFrames = async (count: number) => {
      for (let index = 0; index < count; index += 1) await nextFrame();
    };
    const body = () => sprite.body;
    const grounded = () => body().blocked.down || body().touching.down;
    const bodyBottom = () => body().bottom as number;
    const bodyCenterX = () => body().center.x as number;
    const releaseMovement = () => {
      emitKey('keyup', 'ArrowLeft');
      emitKey('keyup', 'ArrowRight');
      emitKey('keyup', 'ShiftLeft');
      emitKey('keyup', 'Space');
    };
    const waitUntil = async (predicate: () => boolean, maxFrames: number) => {
      for (let frame = 0; frame < maxFrames; frame += 1) {
        if (predicate()) return true;
        await nextFrame();
      }
      return predicate();
    };
    const tap = async (code: string) => {
      emitKey('keydown', code);
      await waitFrames(2);
      emitKey('keyup', code);
      await waitFrames(2);
    };
    const physicsState = () => ({
      spriteX: sprite.x,
      bodyCenterX: bodyCenterX(),
      bodyLeft: body().left,
      bodyRight: body().right,
      bottom: bodyBottom(),
      velocityX: body().velocity.x,
      velocityY: body().velocity.y,
      blockedLeft: body().blocked.left,
      blockedRight: body().blocked.right,
      blockedDown: body().blocked.down,
      touchingLeft: body().touching.left,
      touchingRight: body().touching.right,
      touchingDown: body().touching.down,
    });
    const moveToX = async (targetX: number) => {
      releaseMovement();
      for (let pass = 0; pass < 4; pass += 1) {
        const delta = targetX - bodyCenterX();
        if (Math.abs(delta) <= 8) break;
        const code = delta > 0 ? 'ArrowRight' : 'ArrowLeft';
        emitKey('keydown', code);
        const reached = await waitUntil(() => delta > 0 ? bodyCenterX() >= targetX - 5 : bodyCenterX() <= targetX + 5, 120);
        emitKey('keyup', code);
        await waitFrames(5);
        if (!reached) break;
      }
      releaseMovement();
      await waitFrames(4);
      return Math.abs(targetX - bodyCenterX()) <= 16 && grounded();
    };

    const diagnostics: Array<Record<string, unknown>> = [];
    let previousCenter: number | null = null;

    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      releaseMovement();

      if (!(await waitUntil(grounded, 120))) {
        return { ok: false, failedAt: index, reason: 'not-grounded-before-jump', state: physicsState(), diagnostics };
      }

      const takeoffX = previousCenter ?? 350;
      const positioned = await moveToX(takeoffX);
      if (!positioned) {
        const nearbySolids = scene.solidGroup.getChildren().map((child: any) => child.body).filter((candidate: any) => {
          if (!candidate?.enable || candidate.checkCollision.none) return false;
          return candidate.bottom >= body().top - 80 && candidate.top <= body().bottom + 80 && candidate.right >= body().left - 80 && candidate.left <= body().right + 80;
        }).map((candidate: any) => ({ left: candidate.left, right: candidate.right, top: candidate.top, bottom: candidate.bottom }));
        return {
          ok: false,
          failedAt: index,
          reason: 'could-not-position-for-jump',
          state: physicsState(),
          takeoffX,
          nearbySolids,
          diagnostics,
        };
      }

      await tap(target.key);
      const timelineReady = await waitUntil(() => scene.timelineManager.current === target.timeline, 60);
      await waitFrames(3);
      if (!timelineReady || !grounded()) {
        return {
          ok: false,
          failedAt: index,
          reason: 'timeline-not-stable',
          state: { timeline: scene.timelineManager.current, ...physicsState() },
          diagnostics,
        };
      }

      const timelineBlock = scene.timelineBlocks.find((block: any) => Math.abs(block.rectangle.x - target.x) < 1);
      const colliderBefore = timelineBlock ? (() => {
        const targetBody = timelineBlock.rectangle.body;
        return {
          x: timelineBlock.rectangle.x,
          top: targetBody.top,
          left: targetBody.left,
          right: targetBody.right,
          enabled: targetBody.enable,
          collisionNone: targetBody.checkCollision.none,
        };
      })() : null;

      // Start each ascent with the jump edge first, then add horizontal control in the same
      // browser turn. Position-based takeoff replaces render-frame ground run-up so load cannot
      // carry Elias underneath an overlapping stair before Space is processed.
      emitKey('keydown', 'Space');
      if (target.sprint) emitKey('keydown', 'ShiftLeft');
      emitKey('keydown', 'ArrowRight');

      const jumpStarted = await waitUntil(() => body().velocity.y < -100, 30);
      if (!jumpStarted) {
        releaseMovement();
        return {
          ok: false,
          failedAt: index,
          reason: 'jump-did-not-start',
          state: physicsState(),
          colliderBefore,
          diagnostics,
        };
      }

      const flight: Array<Record<string, number | boolean>> = [];
      let landed = false;
      for (let frame = 0; frame < 120; frame += 1) {
        if (frame % 4 === 0) {
          flight.push({
            frame,
            bodyCenterX: bodyCenterX(),
            bottom: bodyBottom(),
            velocityX: body().velocity.x,
            velocityY: body().velocity.y,
            grounded: grounded(),
          });
        }
        if (grounded() && Math.abs(bodyBottom() - target.top) <= 1.5 && body().velocity.y >= 0) {
          landed = true;
          break;
        }
        await nextFrame();
      }
      releaseMovement();
      await waitFrames(4);

      const landingState = {
        targetX: target.x,
        targetTop: target.top,
        actualBodyCenterX: bodyCenterX(),
        actualSpriteX: sprite.x,
        actualBottom: bodyBottom(),
        grounded: grounded(),
        timeline: scene.timelineManager.current,
      };
      diagnostics.push(landingState);

      if (!landed) {
        return {
          ok: false,
          failedAt: index,
          reason: 'missed-landing',
          state: landingState,
          colliderBefore,
          physics: {
            fixedStep: scene.physics.world.fixedStep,
            fps: scene.physics.world.fps,
          },
          flight,
          diagnostics,
        };
      }

      previousCenter = target.x;
    }

    releaseMovement();
    return { ok: true, diagnostics };
  }, route);

  expect(result, JSON.stringify(result, null, 2)).toMatchObject({ ok: true });
});
