# Chrono Crawler Learnings

This document records the design, production, and technical skills learned while shaping Chrono Crawler so future work keeps the same direction.

## Game Design Skills

- Build each platforming level around one clear idea before combining mechanics.
- Teach mechanics through level layout and player action, not long explanations.
- Make puzzle-platformer challenges come from movement, timing, space, and traversal.
- Preserve flow: a skilled player should be able to keep moving once they understand the route.
- Give every mechanic a safe introduction, then a risky variation, then a compact mastery test.
- Use short narrative beats as emotional punctuation, not lore dumps.
- Design final encounters as recombinations of learned verbs rather than unrelated boss rules.

## Platformer Feel Skills

- Use coyote time so jumps still feel fair just after leaving a ledge.
- Use jump buffering so a slightly early jump input still works when landing.
- Keep player movement readable and predictable before adding advanced abilities.
- Make failure fast and reversible with checkpoints or rewind.
- Keep controls visible enough to learn, then let the playfield breathe.
- Prefer consistent jump arcs and collision sizes over surprising realism.

## Puzzle Skills

- Timeline shifting should change the navigable space, not only object colors.
- Echo clone puzzles work best when the echo performs a simple remembered action in a new context.
- Pressure plates, switches, and doors need immediate visual and audio feedback.
- A puzzle is stronger when the player can understand the goal before they know the solution.
- Timeline objects need distinct silhouettes and states so players can read them quickly.
- The final puzzle should require all core skills: timeline shifting, echo recording, switches, pressure plates, and rewind.

## Visual Design Skills

- The chosen art direction is noir-deco animated city: high silhouettes, warm amber sky, dark blue-black architecture, rain, searchlights, and strong shape language.
- Avoid direct Batman IP elements while using compatible public-domain style traits: art-deco towers, theatrical lighting, graphic shadows, and noir city mood.
- Keep timeline colors consistent:
  - Past: warmer, older, intact, amber/sepia.
  - Present: colder, functional, cyan/steel.
  - Ruined Future: harsher, broken, red/magenta rust.
- Use background parallax to make the city feel large without blocking gameplay.
- Use bright accents sparingly so interactable objects remain readable.
- UI should feel like part of the atmosphere, but never cover the important platforming space.

## UI And UX Skills

- Keep the HUD minimal for a cinematic side-scroller.
- Put timeline controls beside the current timeline label because that is where the player's eye already goes.
- Use DOM overlays for menus, dialogue, pause, and settings because text is clearer outside the canvas.
- Dialogue must clearly tell the player when movement is blocked and when it resumes.
- Pause and options menus should never leave gameplay input active underneath.
- Settings should persist locally and give immediate audio feedback.

## Technical Skills

- Phaser scenes can be reused, so runtime state must reset on every scene `create()`.
- Save serializable game state, not Phaser objects.
- Keep level content data-driven so new levels can be authored without rewriting scene logic.
- Keep input bindings in one controller instead of spreading key checks through scenes.
- Keep systems separate: player controller, timeline manager, save manager, dialogue manager, audio manager, UI manager, and level data.
- Generated placeholder textures are useful for vertical slices, but the project should remain ready for real asset replacement.
- Vite builds work for GitHub Pages when asset paths are relative.

## Production Skills

- Always run `npm run build` before calling a browser game change done.
- Run `npm audit` to catch dependency issues; distinguish runtime issues from dev-tool issues.
- Browser smoke tests should check boot, menu flow, first playable state, key controls, HUD state, and console errors.
- GitHub Pages can deploy through GitHub Actions once Pages is configured for workflow builds.
- Keep CHANGELOG and README updated as the project direction changes.
- Commit small, named slices: vertical slice, flow polish, UI polish, visual pass.

## Current Design Direction

Chrono Crawler should feel like a melancholic noir-deco puzzle-platformer where the city itself is broken across time. The strongest identity is not combat or loot; it is reading the same space through different timelines, using echoes of Elias to solve traversal puzzles, and slowly realizing The Keeper is the emotional endpoint of refusing to let time move.
