import { expect, test } from '@playwright/test';
import { dismissDialogue, seedContinueSave } from './support/playable';

// This test validates real-time Phaser movement. Playwright tracing snapshots the large
// game canvas around every API call and can stretch a ~30ms steering sample into hundreds
// of milliseconds on CI, changing the actual trajectory being tested. Keep screenshots on
// failure, but disable tracing for this one timing-sensitive traversal spec.
test.use({ trace: 'off' });

const route = [
  { x: 500, top: 1200, key: '2', timeline: 'present', runupMs: 100, brakeLead: 90 },
  { x: 665, top: 1120, key: '1', timeline: 'past', runupMs: 0, brakeLead: 75 },
  { x: 830, top: 1040, key: '1', timeline: 'past', runupMs: 0, brakeLead: 75 },
  { x: 1000, top: 960, key: '3', timeline: 'future', runupMs: 0, brakeLead: 75 },
  { x: 1160, top: 880, key: '3', timeline: 'future', runupMs: 0, brakeLead: 75 },
  { x: 1330, top: 800, key: '2', timeline: 'present', runupMs: 0, brakeLead: 75 },
  { x: 1490, top: 720, key: '2', timeline: 'present', runupMs: 0, brakeLead: 75 },
  { x: 1665, top: 640, key: '2', timeline: 'present', runupMs: 0, brakeLead: 75 },
] as const;

test('hotel stairs can be climbed with real jumps and timeline input', async ({ page }) => {
  test.setTimeout(90_000);
  await seedContinueSave(page, 'hourglass-hotel');
  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  // Start well inside the lobby so the first ascent exercises the same jump physics as play.
  // Keep a small margin from the reception setup while avoiding a needlessly long sprint.
  await page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('GameScene');
    scene.player.respawn({ x: 320, y: 1235 });
    scene.storyTriggered = new Set(scene.level.storyZones.map((zone: { id: string }) => zone.id));
    scene.memoryFragments = [];
  });

  for (const target of route) {
    // Normalize Playwright's key state between landings. The previous jump releases Space in
    // mid-air, but an explicit key-up here prevents a stale pressed-key state from turning the
    // next keyboard.down into a repeated keydown event (which InputController deliberately ignores).
    await page.keyboard.up('Space');

    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      const body = game.scene.getScene('GameScene').player.sprite.body;
      return body.blocked.down || body.touching.down;
    })).toBe(true);

    await page.keyboard.press(target.key, { delay: 60 });
    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      return game.scene.getScene('GameScene').timelineManager.current;
    })).toBe(target.timeline);

    // Timeline changes stabilize Elias twice: immediately and again on the next Phaser tick.
    // A Playwright command can otherwise inject Space into that tiny gap and have the queued
    // support snap zero the new upward velocity. Waiting two browser frames models a real human
    // transition between timeline and jump inputs without adding arbitrary wall-clock sleeps.
    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));

    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      const body = game.scene.getScene('GameScene').player.sprite.body;
      return body.blocked.down || body.touching.down;
    })).toBe(true);

    // The wide lobby needs a short ground run to reach the first stair. Every later stair
    // is narrow, so those jumps fire while Elias is still grounded and add horizontal air
    // control only after liftoff; otherwise the 95ms coyote window can expire at the edge.
    const hasGroundRunup = target.runupMs > 0;
    if (hasGroundRunup) {
      await page.keyboard.down('Shift');
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(target.runupMs);
    }

    let jumpStarted = false;
    let lastJumpState: Record<string, unknown> = {};
    for (let attempt = 0; attempt < 3 && !jumpStarted; attempt += 1) {
      await page.keyboard.down('Space');
      for (let sample = 0; sample < 14 && !jumpStarted; sample += 1) {
        lastJumpState = await page.evaluate(async () => {
          const entry = '/src/main.ts';
          const { game } = await import(entry);
          const scene = game.scene.getScene('GameScene') as any;
          const body = scene.player.sprite.body;
          const input = scene.inputController;
          return {
            x: scene.player.sprite.x,
            y: scene.player.sprite.y,
            bottom: body.bottom,
            velocityX: body.velocity.x,
            velocityY: body.velocity.y,
            blockedDown: body.blocked.down,
            touchingDown: body.touching.down,
            coyoteMs: scene.player.coyoteMs,
            jumpBufferMs: scene.player.jumpBufferMs,
            spaceIsDown: input.keys.jump.isDown,
            fallbackJumpPending: input.fallbackJustPressed.has('jump'),
            paused: scene.isPaused,
            dialogueActive: scene.dialogueManager.isActive,
            respawning: scene.isRespawning,
          };
        });
        if (Number(lastJumpState.velocityY) < -100) {
          jumpStarted = true;
          break;
        }
        await page.waitForTimeout(40);
      }
      if (!jumpStarted) {
        await page.keyboard.up('Space');
        await page.waitForTimeout(60);
      }
    }
    expect(
      jumpStarted,
      `jump toward hotel platform at x=${target.x}; state=${JSON.stringify(lastJumpState)}`,
    ).toBe(true);

    if (!hasGroundRunup) {
      await page.keyboard.down('Shift');
      await page.keyboard.down('ArrowRight');
    }

    // The first stair starts near x=420. Begin counter-steering just before its left edge so
    // Elias carries momentum onto the top instead of colliding with the vertical face. Later
    // landings have more horizontal room, so their original 75px lead remains appropriate.
    const brakeX = target.x - target.brakeLead;
    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      return game.scene.getScene('GameScene').player.sprite.x;
    }), { timeout: 4000, intervals: [30] }).toBeGreaterThan(brakeX);

    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('Shift');
    await page.keyboard.down('ArrowLeft');
    await page.keyboard.up('Space');

    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      return game.scene.getScene('GameScene').player.sprite.body.velocity.x;
    }), { timeout: 1200, intervals: [30] }).toBeLessThanOrEqual(40);
    await page.keyboard.up('ArrowLeft');

    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      const scene = game.scene.getScene('GameScene');
      const body = scene.player.sprite.body;
      return {
        bottom: body.bottom,
        grounded: body.blocked.down || body.touching.down,
      };
    }), { timeout: 4000, intervals: [40] }).toEqual({ bottom: target.top, grounded: true });
  }
});