# Chrono Crawler TODO

## Priority 0 — Reliable Vertical Slice

- Keep `npm run build` green.
- Keep the Playwright smoke suite green, including pause/save, keyboard-input, save-migration, and ending-flow regression coverage.
- Use `main` as the canonical development and GitHub Pages deployment branch.
- Keep pull requests and deployment gated behind smoke tests and the production build.
- Keep README, roadmap, and architecture docs aligned with the actual playable build.

## Priority 1 — Narrative And Ending

Implemented foundation:

- **Elias Varren** is the canonical runtime/documentation name.
- **The Keeper** and **The Later Man** are treated as the same future Elias identity.
- The ending is now a data-driven multi-beat sequence instead of a static `End of Vertical Slice` screen.
- Ending copy lives in `src/game/content/ending.ts`, separate from scene/UI flow.

Next narrative pass:

- Rewrite and lock the final ending prose, dialogue, pacing, and Mara beats.
- Define the mysterious girl's identity, purpose, and relationship to Mara/Core without muddying the reveal.
- Build a clear Keeper/Later Man foreshadowing ladder across the existing levels.
- Map one required story beat and optional lore opportunities to every level.
- Keep mandatory dialogue short; use memory fragments, signage, environment, and optional spaces for secondary lore.

## Priority 2 — Progression And Save State

Implemented foundation:

- `chrono-crawler.save.v2` with automatic migration from `chrono-crawler.save.v1`.
- Persistent completed-level IDs.
- Persistent collected memory fragments.
- Persistent per-level latched puzzle flags.
- Persistent ending-completed state.
- Pressure-plate occupancy and live echo state remain intentionally runtime-only.

Next progression work:

- Add a completion/collectible summary only if it improves the player loop.
- Decide whether one-shot story zones should become persistent across reloads after the narrative map is locked.
- Add explicit save-schema migration tests whenever a v3 schema is introduced.

## Priority 3 — Gameplay Architecture

Before the next large content wave:

- Keep `levels.ts` data-driven while the current authoring model is still productive.
- Extract an `ObjectiveSystem` for required flags, objective state, exit messaging, and future multi-stage objectives.
- Extract a `HazardSystem` for enemy overlap, authored hazards, falls, and respawn reasons.
- Extract a `TimelineObjectSystem` when the next timeline-aware object type lands.
- Preserve the existing `CheckpointSystem` and `LevelFlowSystem` boundaries.
- Avoid a broad `GameScene` rewrite; extract one responsibility at a time with smoke coverage.

## Priority 4 — Puzzle-Platformer Level Design

Next design session should define the level grammar before more content is coded:

- Every level gets one clear teaching idea, one variation, and one mastery combination.
- The player should be able to see the problem before understanding the solution.
- Timeline changes must alter route/collision/silhouette, not only palette.
- Echo use should solve spatial or timing problems, not become a repetitive "record on plate" tax.
- Build alternate routes for optional memories without making the critical path unreadable.
- Use enemies as timing/route pressure before adding combat systems.

Candidate next authored levels:

- **The Hourglass Hotel** — vertical traversal and persistent spatial memory across floors.
- **Archive of Unsaid Things** — low-combat story/puzzle space with ordered timeline logic.
- **Crownline Rooftops** — movement/timeline-shift mastery under pressure.
- **The Core Reliquary** — mechanical rehearsal for the final three-anchor structure.

Before building Hourglass Hotel:

- define per-level camera metadata
- decide structured editor/tilemap authoring format
- define two or three reusable puzzle-room templates

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
