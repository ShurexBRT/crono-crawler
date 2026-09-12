import { expect, test } from '@playwright/test';
import { dismissDialogue, seedContinueSave } from './support/playable';

const route = [
  { x: 500, top: 1200, key: '2', timeline: 'present' },
  { x: 665, top: 1120, key: '1', timeline: 'past' },
  { x: 830, top: 1040, key: '1', timeline: 'past' },
  { x: 1000, top: 960, key: '3', timeline: 'future' },
  { x: 1160, top: 880, key: '3', timeline: 'future' },
  { x: 1330, top: 800, key: '2', timeline: 'present' },
  { x: 1490, top: 720, key: '2', timeline: 'present' },
  { x: 1665, top: 640, key: '2', timeline: 'present' },
] as const;

test('hotel stairs can be climbed with real jumps and timeline input', async ({ page }) => {
  test.setTimeout(90_000);
  await seedContinueSave(page, 'hourglass-hotel');
  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  // Begin from the lobby with the same kind of run-up a player has in normal play.
  await page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('GameScene');
    scene.player.respawn({ x: 300, y: 1235 });
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

    await page.keyboard.down('Shift');
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(100);

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

    // Enter the left side of the landing zone, then use normal air-control to cancel the
    // sprint momentum. The old test simply released Right and consistently sailed beyond
    // the narrow stair, even though the same jump is controllable by a player.
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