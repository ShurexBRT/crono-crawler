import { expect, test } from '@playwright/test';
import { dismissDialogue, seedContinueSave } from './support/playable';

// This test validates real-time Phaser movement. Playwright tracing snapshots the large
// game canvas around every API call and can stretch a ~30ms steering sample into hundreds
// of milliseconds on CI, changing the actual trajectory being tested. Keep screenshots on
// failure, but disable tracing for this one timing-sensitive traversal spec.
test.use({ trace: 'off' });

const route = [
  { x: 500, top: 1200, key: '2', timeline: 'present', preMoveMs: 230, sprint: false, brakeLead: 60, counterSteer: false },
  { x: 665, top: 1120, key: '1', timeline: 'past', preMoveMs: 0, sprint: true, brakeLead: 75, counterSteer: true },
  { x: 830, top: 1040, key: '1', timeline: 'past', preMoveMs: 0, sprint: true, brakeLead: 75, counterSteer: true },
  { x: 1000, top: 960, key: '3', timeline: 'future', preMoveMs: 0, sprint: true, brakeLead: 75, counterSteer: true },
  { x: 1160, top: 880, key: '3', timeline: 'future', preMoveMs: 0, sprint: true, brakeLead: 75, counterSteer: true },
  { x: 1330, top: 800, key: '2', timeline: 'present', preMoveMs: 0, sprint: true, brakeLead: 75, counterSteer: true },
  { x: 1490, top: 720, key: '2', timeline: 'present', preMoveMs: 0, sprint: true, brakeLead: 75, counterSteer: true },
  { x: 1665, top: 640, key: '2', timeline: 'present', preMoveMs: 0, sprint: true, brakeLead: 75, counterSteer: true },
] as const;

test('hotel stairs can be climbed with real jumps and timeline input', async ({ page }) => {
  test.setTimeout(90_000);
  await seedContinueSave(page, 'hourglass-hotel');
  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  // Start well inside the lobby so the first ascent exercises the same jump physics as play.
  await page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('GameScene');
    scene.player.respawn({ x: 320, y: 1235 });
    scene.storyTriggered = new Set(scene.level.storyZones.map((zone: { id: string }) => zone.id));
    scene.memoryFragments = [];
  });

  for (const target of route) {
    // Normalize key state between landings so every jump begins from a real key edge.
    await page.keyboard.up('Space');
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('Shift');

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

    // Timeline changes stabilize Elias immediately and once more on the next Phaser tick.
    // Waiting two browser frames prevents automation from injecting jump inside that tiny gap.
    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));

    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      const body = game.scene.getScene('GameScene').player.sprite.body;
      return body.blocked.down || body.touching.down;
    })).toBe(true);

    // The first 80px stair is intentionally approached at walk speed. With the real jump arc
    // (435px/s impulse, 980px/s² gravity), the 230ms walk places Elias near x=350 so he reaches
    // the platform's x=420 left edge near the apex instead of colliding with its vertical face.
    // Later stairs start from narrow platforms, so they jump first and add sprint air-control.
    if (target.preMoveMs > 0) {
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(target.preMoveMs);
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

    if (target.preMoveMs === 0) {
      if (target.sprint) await page.keyboard.down('Shift');
      await page.keyboard.down('ArrowRight');
    }

    const brakeX = target.x - target.brakeLead;
    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      return game.scene.getScene('GameScene').player.sprite.x;
    }), { timeout: 4000, intervals: [30] }).toBeGreaterThan(brakeX);

    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('Shift');
    await page.keyboard.up('Space');

    if (target.counterSteer) {
      await page.keyboard.down('ArrowLeft');
      await expect.poll(() => page.evaluate(async () => {
        const entry = '/src/main.ts';
        const { game } = await import(entry);
        return game.scene.getScene('GameScene').player.sprite.body.velocity.x;
      }), { timeout: 1200, intervals: [30] }).toBeLessThanOrEqual(40);
      await page.keyboard.up('ArrowLeft');
    }

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