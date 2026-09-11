import { expect, test } from '@playwright/test';
import { memoryArtifacts } from '../../src/game/content/memory-artifacts';
import { collectRuntimeErrors } from './support/playable';

for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`all nine vault spreads render at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const errors = collectRuntimeErrors(page);
    await page.setViewportSize(viewport);
    await page.addInitScript((ids) => {
      localStorage.setItem('chrono-crawler.save.v1', JSON.stringify({
        hasContinue: true, currentLevelId: 'tutorial', timeline: 'present', collectedMemoryIds: ids,
        settings: { textScale: 1.25, reducedMotion: true, musicVolume: 0, sfxVolume: 0 },
      }));
    }, memoryArtifacts.map((artifact) => artifact.id));
    await page.goto('/');
    await page.locator('[data-action="journal"]').click();
    await expect(page.locator('[data-memory-count]')).toHaveText('9 / 9');
    await expect(page.locator('[data-vault-book]')).toHaveAttribute('data-vault-entry-id', 'contents');

    for (const artifact of memoryArtifacts) {
      const opener = page.locator(`[data-vault-entry="${artifact.id}"]`);
      await expect(opener).toBeVisible();
      await opener.click();
      const dialog = page.getByRole('dialog');
      await expect(page.locator('[data-vault-book]')).toHaveAttribute('data-vault-entry-id', artifact.id);
      await expect(dialog.locator('h2').first()).toHaveText(artifact.title);
      const art = page.locator('[data-vault-art]');
      await expect.poll(() => art.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const letter = page.locator('[data-vault-letter]');
      if (artifact.letter) {
        await expect(letter).toContainText(artifact.letter.signature);
        await expect(letter).toContainText(artifact.letter.paragraphs[0]);
      }
      const geometry = await dialog.evaluate((node) => {
        const container = node.querySelector<HTMLElement>('.vault-desk')!;
        const button = node.querySelector<HTMLElement>('button')!.getBoundingClientRect();
        const all = Array.from(node.querySelectorAll<HTMLElement>('h2, p, blockquote, figcaption, .memory-byline')).map((item) => ({
          rect: item.getBoundingClientRect().toJSON(), overflow: item.scrollWidth > item.clientWidth + 1,
        }));
        return { horizontalOverflow: container.scrollWidth > container.clientWidth + 1, button: button.toJSON(), all };
      });
      expect(geometry.horizontalOverflow).toBe(false);
      expect(geometry.button.x).toBeGreaterThanOrEqual(0);
      expect(geometry.button.right).toBeLessThanOrEqual(viewport.width);
      expect(geometry.button.bottom).toBeLessThanOrEqual(viewport.height);
      for (const item of geometry.all) {
        expect(item.overflow).toBe(false);
        expect(item.rect.x).toBeGreaterThanOrEqual(0);
        expect(item.rect.right).toBeLessThanOrEqual(viewport.width + 1);
      }

      // Keep one visual artifact per memory while avoiding a second full viewport capture
      // after scrolling. The old double-screenshot loop made this correctness test exceed
      // its budget on GitHub's software-rendered browser even when the UI was healthy.
      await page.screenshot({ path: testInfo.outputPath(`${artifact.id}.png`) });
      await dialog.locator('.vault-prose p').last().scrollIntoViewIfNeeded();
      await expect(dialog.locator('.vault-prose p').last()).toBeVisible();

      await page.locator('[data-action="vault-contents"]').click();
      await expect(page.locator('[data-vault-book]')).toHaveAttribute('data-vault-entry-id', 'contents');
      await expect(page.locator(`[data-vault-entry="${artifact.id}"] .vault-unread`)).toHaveCount(0);
    }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[data-action="journal"]')).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('a missing memory illustration keeps the letter and close action usable', async ({ page }) => {
  await page.route('**/assets/memories/mara-letter.png', (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem('chrono-crawler.save.v1', JSON.stringify({ collectedMemoryIds: ['rain-lamp-letter'] }));
  });
  await page.goto('/');
  await page.locator('[data-action="journal"]').click();
  await expect(page.locator('.is-locked [data-vault-entry]:enabled')).toHaveCount(0);
  await page.locator('[data-vault-entry="rain-lamp-letter"]').click();
  await expect(page.locator('.vault-art-error')).toHaveText('Illustration unavailable');
  await expect(page.locator('.vault-art-error')).toBeVisible();
  await expect(page.locator('[data-vault-letter]')).toContainText('Love, Mara');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('[data-action="journal"]')).toBeFocused();
});