import { expect, test } from '@playwright/test';
import { dismissDialogue, seedContinueSave } from './support/playable';

// This spec validates the real Phaser keyboard path and real Arcade Physics. The traversal
// itself runs inside the browser frame loop so CI instrumentation cannot stretch 16ms gameplay
// frames into hundreds of milliseconds between Playwright round-trips and change the trajectory.
test.use({ trace: 'off' });

const route = [
  { x: 500, top: 1200, key: 'Digit2', timeline: 'present', sprint: false },
  { x: 665, top: 1120, key: 'Digit1', timeline: 'past', sprint: false },
  { x: 830, top: 1040, key: 'Digit1', timeline: 'past', sprint: false },
  { x: 1000, top: 960, key: 'Digit3', timeline: 'future', sprint: false },
  { x: 1160, top: 880, key: 'Digit3', timeline: 'future', sprint: false },
  { x: 1330, top: 800, key: 'Digit2', timeline: 'present', sprint: false },
  { x: 1490, top: 720, key: 'Digit2', timeline: 'present', sprint: false },
  // The final roof has a wider horizontal gap, so a normal run-jump is appropriate here.
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
    const player = scene.player;
    const sprite = player.sprite;

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
      const event = new KeyboardEvent(type, {
        key: meta.key,
        code,
        bubbles: true,
        cancelable: true,
        repeat: false,
      });
      Object.defineProperty(event, 'keyCode', { get: () => meta.keyCode });
      Object.defineProperty(event, 'which', { get: () => meta.keyCode });
      window.dispatchEvent(event);
    };

    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const waitFrames = async (count: number) => {
      for (let index = 0; index < count; index += 1) await nextFrame();
    };
    const grounded = () => {
      const body = sprite.body;
      return body.blocked.down || body.touching.down;
    };
    const bodyBottom = () => sprite.body.bottom as number;
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

    const moveToX = async (targetX: number) => {
      releaseMovement();
      for (let pass = 0; pass < 4; pass += 1) {
        const delta = targetX - sprite.x;
        if (Math.abs(delta) <= 8) break;
        const code = delta > 0 ? 'ArrowRight' : 'ArrowLeft';
        emitKey('keydown', code);
        const reached = await waitUntil(
          () => delta > 0 ? sprite.x >= targetX - 5 : sprite.x <= targetX + 5,
          120,
        );
        emitKey('keyup', code);
        await waitFrames(5);
        if (!reached) break;
      }
      releaseMovement();
      await waitFrames(4);
      return Math.abs(targetX - sprite.x) <= 16 && grounded();
    };

    const diagnostics: Array<Record<string, unknown>> = [];
    let previousCenter: number | null = null;

    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      releaseMovement();

      if (!(await waitUntil(grounded, 120))) {
        return { ok: false, failedAt: index, reason: 'not-grounded-before-jump', diagnostics };
      }

      // After each successful landing, walk to the middle of the support before the next jump.
      // The first jump starts from the lobby at x=320 and uses a short natural walk run-up.
      if (previousCenter !== null) {
        const centered = await moveToX(previousCenter);
        if (!centered) {
          return {
            ok: false,
            failedAt: index,
            reason: 'could-not-center-on-support',
            state: { x: sprite.x, bottom: bodyBottom(), velocityX: sprite.body.velocity.x },
            diagnostics,
          };
        }
      }

      await tap(target.key);
      const timelineReady = await waitUntil(() => scene.timelineManager.current === target.timeline, 60);
      await waitFrames(3);
      if (!timelineReady || !grounded()) {
        return {
          ok: false,
          failedAt: index,
          reason: 'timeline-not-stable',
          state: { timeline: scene.timelineManager.current, grounded: grounded(), bottom: bodyBottom() },
          diagnostics,
        };
      }

      // Five ground frames are enough to establish walking momentum without running off the
      // narrow support. The final roof gap legitimately uses Shift/run.
      emitKey('keydown', 'ArrowRight');
      if (target.sprint) emitKey('keydown', 'ShiftLeft');
      await waitFrames(5);
      emitKey('keydown', 'Space');

      const jumpStarted = await waitUntil(() => sprite.body.velocity.y < -100, 30);
      if (!jumpStarted) {
        releaseMovement();
        return {
          ok: false,
          failedAt: index,
          reason: 'jump-did-not-start',
          state: {
            x: sprite.x,
            bottom: bodyBottom(),
            velocityX: sprite.body.velocity.x,
            velocityY: sprite.body.velocity.y,
            grounded: grounded(),
            timeline: scene.timelineManager.current,
          },
          diagnostics,
        };
      }

      const landed = await waitUntil(
        () => grounded() && Math.abs(bodyBottom() - target.top) <= 1.5 && sprite.body.velocity.y >= 0,
        120,
      );
      releaseMovement();
      await waitFrames(4);

      diagnostics.push({
        targetX: target.x,
        targetTop: target.top,
        actualX: sprite.x,
        actualBottom: bodyBottom(),
        grounded: grounded(),
        timeline: scene.timelineManager.current,
      });

      if (!landed) {
        return {
          ok: false,
          failedAt: index,
          reason: 'missed-landing',
          state: diagnostics[diagnostics.length - 1],
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
