# Chrono Crawler TODO

## Priority 0 — Reliable Vertical Slice

- Keep `npm run build` green.
- Keep the Playwright smoke suite green, including pause/save and keyboard-input regression coverage.
- Use `main` as the canonical development and GitHub Pages deployment branch.
- Keep deployment gated behind smoke tests and the production build.
- Keep README, roadmap, and architecture docs aligned with the actual playable build.

## Priority 1 — Narrative And Ending

- Use **Elias Varren** consistently across runtime and documentation.
- Treat **The Keeper** and **The Later Man** as the same future Elias identity unless canon is deliberately changed.
- Replace the short `End of Vertical Slice` ending with the full canonical ending sequence from the narrative outro document.
- Give the mysterious girl a clearer recurring role before the final reveal.
- Add Keeper/Later Man foreshadowing without turning levels into dialogue dumps.
- Continue using optional memory fragments and environmental lines for secondary lore.

## Priority 2 — Progression And Save State

- Introduce a versioned save schema with a migration path from `chrono-crawler.save.v1`.
- Persist collected memory fragments if they are part of completion/progression.
- Persist selected puzzle/progression flags where resetting them on reload would feel incorrect.
- Define which door/switch states are durable progression and which are intentionally local to a level attempt.
- Do not persist live echo replay state unless a concrete design requirement appears.

## Priority 3 — Gameplay Architecture

- Keep `levels.ts` data-driven while the current authoring model is still productive.
- Extract an `ObjectiveSystem` when objective/progression rules need a second implementation site.
- Extract a `HazardSystem` when hazard/enemy/fall respawn rules grow beyond the current scene wiring.
- Extract a `TimelineObjectSystem` when additional timeline-aware object types make `GameScene` orchestration noisy.
- Preserve the existing `CheckpointSystem` and `LevelFlowSystem` boundaries.
- Avoid a broad `GameScene` rewrite.

## Priority 4 — Level Authoring

- Move from rectangle-authored prototype geometry to a structured editor or tilemap workflow once the save/ending foundation is stable.
- Add per-level camera metadata before committing to strongly vertical levels such as The Hourglass Hotel.
- Keep stable asset manifest keys when changing the authoring format.
- Continue the planned level arc with The Hourglass Hotel only after the stabilization gate is complete.

## Priority 5 — Art And Animation

- Define a production noir-deco art bible: silhouettes, city shapes, limited accent colors, and gameplay contrast.
- Replace remaining placeholder/runtime-generated visual elements with authored game-ready assets.
- Produce consistent animation sets for walk, run, jump, echo, death, and timeline shift.
- Add reusable foreground silhouettes, parallax smoke/rain layers, and city facade pieces.
- Keep sprite-sheet layouts documented in `docs/asset-pipeline.md` before replacing runtime atlases.

## Priority 6 — Enemies And Puzzle Variety

- Add timeline-sensitive enemy behavior rather than only more copies of the current patrol enemy.
- Add new puzzle objects only when a level design requires them: movable crates, frozen projectiles, rotating machinery, one-way timeline locks, or similar.
- Keep combat secondary to traversal, timing, and puzzle pressure.

## Priority 7 — Input And Accessibility

Already implemented in the current slice:

- basic gamepad input
- text scaling
- reduced motion
- reduced flashes
- fullscreen
- separate music/SFX volume

Remaining:

- remappable keyboard controls
- complete gamepad configuration/remapping UI
- high-contrast interactable option
- touch controls
- separate dialogue volume if voiced dialogue is introduced

## Priority 8 — Audio And Release

- Replace procedural tones with licensed or original ambience, music, and SFX.
- Add timeline-specific ambience layers.
- Add positional cues for switches, enemies, doors, and the Chrono Core.
- Add linting and formatting.
- Add release tags and itch.io packaging.
- Configure a custom domain only after the Pages branch/deployment flow is stable.
- Consider a manual Phaser vendor chunk only if bundle size becomes a demonstrated deployment/performance problem.
