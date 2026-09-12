import { expect, test } from '@playwright/test';
import { dismissDialogue, seedContinueSave } from './support/playable';

test('hotel stairs can be climbed with real jumps and timeline input', async ({ page }) => {
  test.setTimeout(90_000);
  await seedContinueSave(page, 'hourglass-hotel');
  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  // Start on the lobby with enough real run-up to reproduce how a player approaches
  // the first stair. The previous x=390 fixture placed Elias almost flush against the
  // stair wall and tested an artificial standing-jump edge case rather than the level.
  await page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('GameScene');
    scene.player.respawn({ x: 300, y: 1235 });
    scene.storyTriggered = new Set(scene.level.storyZones.map((zone: { id: string }) => zone.id));
    scene.memoryFragments = [];
  });

  for (const [x, top, key] of [[500, 1200, '2'], [665, 1120, '1'], [830, 1040, '1'], [1000, 960, '3'], [1160, 880, '3'], [1330, 800, '2'], [1490, 720, '2'], [1665, 640, '2']] as const) {
    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      const body = game.scene.getScene('GameScene').player.sprite.body;
      return body.blocked.down || body.touching.down;
    })).toBe(true);

    await page.keyboard.press(key);
    await page.keyboard.down('Space');
    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      return game.scene.getScene('GameScene').player.sprite.body.velocity.y;
    }), { timeout: 1500, intervals: [20] }).toBeLessThan(-100);

    await page.keyboard.down('Shift');
    await page.keyboard.down('ArrowRight');
    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      return game.scene.getScene('GameScene').player.sprite.x;
    }), { timeout: 3000, intervals: [30] }).toBeGreaterThan(x - 15);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('Shift');
    await page.keyboard.up('Space');

    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      return game.scene.getScene('GameScene').player.sprite.body.bottom;
    }), { timeout: 3000, intervals: [40] }).toBeCloseTo(top, 0);
  }
});
