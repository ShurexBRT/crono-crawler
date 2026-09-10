import { expect, test } from '@playwright/test';
import { levels } from '../../src/game/content/levels';
import { collectRuntimeErrors, dismissDialogue, seedContinueSave } from './support/playable';

for (const viewport of [{ width: 1366, height: 768 }, { width: 844, height: 390 }]) {
  for (const level of levels) {
    test(`${level.id} production framing at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      const errors = collectRuntimeErrors(page);
      await seedContinueSave(page, level.id);
      await page.goto('/');
      await page.locator('[data-action="continue"]').click();
      await expect(page.locator('[data-action="next"]')).toBeVisible();
      await dismissDialogue(page);
      await expect(page.locator('[data-hud-shell]')).toBeVisible();
      const scenery = await page.evaluate(async () => {
        const entry = '/src/main.ts';
        const { game } = await import(entry);
        const scene = game.scene.getScene('GameScene');
        const far = scene.children.getByName('campaign-far-backdrop');
        const mid = scene.children.getByName('campaign-midground');
        const near = scene.children.getByName('campaign-foreground');
        return { width: far?.displayWidth, height: far?.displayHeight, factors: [far?.scrollFactorX, mid?.scrollFactorX, near?.scrollFactorX], key: far?.texture.key };
      });
      expect(scenery.width).toBeGreaterThanOrEqual(1280);
      expect(scenery.height).toBeGreaterThanOrEqual(720);
      expect(scenery.factors).toEqual([.12, .38, 1.08]);
      expect(scenery.key).toMatch(/^backdrop\.production\./);

      for (const timeline of ['past', 'present', 'future']) {
        await page.evaluate(async (next) => {
          const entry = '/src/main.ts';
          const { game } = await import(entry);
          const scene = game.scene.getScene('GameScene');
          scene.setTimeline(next);
          scene.physics.pause();
        }, timeline);
        await page.waitForTimeout(180);
        await page.screenshot({ path: testInfo.outputPath(`${level.id}-${timeline}.png`) });
      }

      const pixels = await page.evaluate(async () => {
        const entry = '/src/main.ts';
        const { game } = await import(entry);
        return new Promise<{ colors: number; lit: number }>((resolve) => {
          game.renderer.snapshot((snapshot: HTMLImageElement) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 72;
            const context = canvas.getContext('2d')!;
            context.drawImage(snapshot, 0, 0, 128, 72);
            const data = context.getImageData(0, 0, 128, 72).data;
            const colors = new Set<string>();
            let lit = 0;
            for (let i = 0; i < data.length; i += 4) {
              colors.add(`${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`);
              if (data[i] + data[i + 1] + data[i + 2] > 75) lit += 1;
            }
            resolve({ colors: colors.size, lit });
          });
        });
      });
      expect(pixels.colors).toBeGreaterThan(24);
      expect(pixels.lit).toBeGreaterThan(1200);

      const bounds = await page.locator('.hud-v2-objective, .hud-v2-level, .hud-v2-instrument').evaluateAll((elements) => elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, clipped: element.scrollWidth > element.clientWidth + 2 };
      }));
      for (const box of bounds) {
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(viewport.width + 1);
        expect(box.bottom).toBeLessThanOrEqual(viewport.height + 1);
        expect(box.clipped).toBe(false);
      }
      expect(bounds[0].right).toBeLessThanOrEqual(bounds[1].left);
      for (let first = 0; first < bounds.length; first += 1) {
        for (let second = first + 1; second < bounds.length; second += 1) {
          const a = bounds[first], b = bounds[second];
          const overlap = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          expect(overlap).toBe(false);
        }
      }

      await page.evaluate(async () => {
        const entry = '/src/main.ts';
        const { game } = await import(entry);
        const scene = game.scene.getScene('GameScene');
        scene.cameras.main.stopFollow();
        scene.cameras.main.setScroll(Math.max(0, scene.level.width - 1280), 0);
      });
      await page.screenshot({ path: testInfo.outputPath(`${level.id}-far-camera.png`) });
      expect(errors).toEqual([]);
    });
  }
}

test('memory journal preserves recovered prose and hides unrecovered memories', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('chrono-crawler.save.v1', JSON.stringify({ hasContinue: true, currentLevelId: 'tutorial', timeline: 'present', collectedMemoryIds: ['reactor-daughter-sketch'] }));
  });
  await page.goto('/');
  await page.locator('[data-action="journal"]').click();
  await expect(page.locator('[data-memory-count]')).toHaveText('1 / 9');
  await expect(page.locator('[data-memory-id="reactor-daughter-sketch"]')).toContainText('Three Suns');
  await expect(page.locator('.is-locked p')).toHaveCount(0);
  await expect(page.locator('.is-locked [data-vault-entry]:enabled')).toHaveCount(0);
  await page.locator('[data-vault-entry="reactor-daughter-sketch"]').click();
  await expect(page.locator('.vault-prose')).toContainText('three suns');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('memory-journal-portrait.png') });
  await page.locator('[data-action="vault-close"]').click();
  await page.locator('[data-action="new"]').click();
  await expect(page.locator('[data-action="cancel-new"]')).toBeVisible();
  await page.locator('[data-action="cancel-new"]').click();
  await expect(page.locator('[data-action="continue"]')).toBeEnabled();
});
