# Changelog

## Unreleased

- Polished movement feel with acceleration/deceleration, jump/landing squash, and footfall dust feedback.
- Added stronger timeline identity through HUD accent states, timeline pulses, and timeline-colored object trim.
- Added echo recording/replay feedback with start/stop SFX, recording aura, and ghost afterimage trails.
- Clarified tutorial and final Keeper puzzle objectives with shorter, more actionable in-game text.
- Restyled generated placeholder sprites and rectangle objects toward a darker noir-deco pixel-art direction.
- Added LEARNINGS.md to capture accumulated design, platformer, puzzle, visual, UI, technical, and production principles.
- Added a noir-deco city backdrop pass with layered skyline silhouettes, searchlights, rain streaks, and warmer menu atmosphere.
- Fixed level transitions by resetting recycled Phaser scene runtime state before every level load.
- Moved timeline controls into the top timeline panel and removed the separate bottom control strip.
- Improved dialogue cleanup so keyboard listeners cannot survive replaced overlays.
- Added level fade-in polish after transitions.

## 0.1.0 - 2026-06-16

- Created the Chrono Crawler browser vertical slice with Phaser, TypeScript, and Vite.
- Added main menu, intro, pause, options, credits, save/continue, and ending flows.
- Implemented player movement, jumping, running, collision, checkpoints, rewind, and enemy death/reset.
- Implemented Past, Present, and Ruined Future timeline switching.
- Added timeline-aware bridges, platforms, gates, doors, pressure plates, and switches.
- Added echo recording and replay, including pressure plate holding and switch activation.
- Authored tutorial, three levels, and a final Keeper puzzle encounter.
- Added generated placeholder pixel art textures and procedural audio.
- Added README, TODO, license placeholder, and GitHub Pages deployment workflow.
