import { expect, test } from '@playwright/test';
import { dismissDialogue, seedContinueSave } from './support/playable';

// This test validates real-time Phaser movement. Playwright tracing snapshots the large
// game canvas around every API call and can stretch a ~30ms steering sample into hundreds
// of milliseconds on CI, changing the actual trajectory being tested. Keep screenshots on
// failure, but disable tracing for this one timing-sensitive traversal spec.
test.use({ trace: 'off' });

const route = [
  { x: 500, top: 1200, key: '2', timeline: 'present', runupMs: 100 },
  { x: 665, top: 1120, key: '1', timeline: 'past', runupMs: 0 },
  { x: 830, top: 1040, key: '1', timeline: 'past', runupMs: 0 },
  { x: 1000, top: 960, key: '3', timeline: 'future', runupMs: 0 },
  { x: 1160, top: 880, key: '3', timeline: 'future', runupMs: 0 },
  { x: 1330, top: 800, key: '2', timeline: 'present', runupMs: 0 },
  { x: 1490, top: 720, key: '2', timeline: 'present', runupMs: 0 },
  { x: 1665, top: 640, key: '2', timeline: 'present', runupMs: 0 },
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
    for (let attempt = 0; attempt < 3 && !jumpStarted; attempt += 1) {
      await page.keyboard.down('Space');
      for (let sample = 0; sample < 14 && !jumpStarted; sample += 1) {
        const velocityY = await page.evaluate(async () => {
          const entry = '/src/main.ts';
          const { game } = await import(entry);
          return game.scene.getScene('GameScene').player.sprite.body.velocity.y;
        });
        if (velocityY < -100) {
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
    expect(jumpStarted, `jump toward hotel platform at x=${target.x}`).toBe(true);

    if (!hasGroundRunup) {
      await page.keyboard.down('Shift');
      await page.keyboard.down('ArrowRight');
    }

    const brakeX = target.x - 75;
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