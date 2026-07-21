# Chrono Crawler Asset Pipeline

This document defines how new visual assets should move from source art into the Phaser runtime. The goal is to keep art replacement safe while the game grows from prototype to full production.

## Folder Policy

Use these folders for new assets:

- `assets/sprites/` for game-ready character, enemy, object, platform, and FX sheets.
- `assets/backgrounds/` for future organized level backdrops.
- `assets/ui/` for DOM/canvas UI frames, panels, chips, icons, and prompt art.
- `assets/raw/` for source or exported concept art that is not loaded directly by the game.

Existing top-level backdrop files are still supported. Do not rename legacy assets casually because boot loading and deployment already reference them.

## Naming Rules

New game-ready filenames should be lowercase kebab-case:

- Good: `elias-run-sheet.png`, `rain-district-tiles.png`, `timeline-platforms.png`
- Avoid: `Elias Final Sheet.png`, `platform assets.png`, `NewSprite.png`

Runtime texture keys still belong in `src/game/assets/manifest.ts`. Scenes, entities, and systems should use manifest keys, not raw paths.

## Current Game-Ready Assets

The current imported sprite sheets are all `1448x1086` PNGs:

- `assets/sprites/elias-sheet.png`
- `assets/sprites/keeper-sheet.png`
- `assets/sprites/daughter-sheet.png`
- `assets/sprites/platforms-sheet.png`
- `assets/sprites/doors-gates-barriers-sheet.png`
- `assets/sprites/puzzle-devices-switches-sheet.png`

These sheets are normalized at runtime in `BootScene`. Future art passes should replace that runtime guessing with documented sheet layouts and predictable exported frames.

## Required Sprite Sheet Metadata

Every new sprite sheet should be documented in this file or a sibling note before integration:

```text
file: assets/sprites/example-sheet.png
texture key: character.example-sheet
source: assets/raw/example/source-file.ext
sheet size: 1024x512
frame size: 128x128
grid: 8 columns x 4 rows
transparent background: yes
origin/anchor rule: feet aligned to bottom center
animations:
  example.idle: row 0, frames 0-3, 8 fps, repeat
  example.run: row 1, frames 0-7, 12 fps, repeat
  example.jump: row 2, frames 0-2, 10 fps, no repeat
```

## Player Sprite Rules

Elias frames must keep stable feet and collision readability:

- Same frame cell size for every animation in the runtime sheet.
- Transparent background only.
- Feet aligned to a consistent bottom baseline.
- Body silhouette readable at gameplay scale.
- No oversized smear frames that extend far outside the collision body unless explicitly padded.
- Idle, walk, run, jump, fall, timeline-shift, echo-tint compatibility.

If frame sizes vary in source art, normalize them into fixed cells before Phaser loads the sheet.

## Timeline Object Rules

Timeline objects must change silhouette or physical state, not only tint:

- Past platforms: intact, warmer, older, brass/stone/deco trim.
- Present platforms: powered, steel/cyan, functional machinery.
- Future platforms: broken, rusted, harsher magenta/red accents.

Doors, switches, pressure plates, and gates should each have readable states for active, inactive, unavailable, and unlocked where relevant.

## UI Asset Rules

UI assets should support DOM overlays:

- Keep panel art flexible enough for text changes.
- Avoid baking essential text into UI frame assets.
- Keep high-contrast inner areas behind body copy.
- Verify narrow viewport behavior after changing panel sizes.
- Prefer CSS variables and reusable classes over one-off inline styles.

## Integration Checklist

1. Place source art in `assets/raw/` if it is not already game-ready.
2. Export the game-ready PNG into the correct `assets/` subfolder.
3. Confirm transparency and dimensions.
4. Document frame size, grid layout, and animation names.
5. Add texture and animation keys to `src/game/assets/manifest.ts`.
6. Load the asset in `BootScene`.
7. Register animations in one place.
8. Reference only manifest keys from gameplay code.
9. Run `npm.cmd run build`.
10. Run `npm.cmd run test:smoke`.
11. Visually verify the relevant scene in the browser when animation or alignment changed.

## Migration Target

The current runtime extraction code is acceptable for the prototype, but the production target is:

- No checkerboard cleanup needed at runtime.
- No inferred opaque bounds for final sheets.
- No mixed-case or space-containing new filenames.
- No gameplay code depending on raw source-art dimensions.
- Animation frame names documented and stable.

Keep the pipeline boring. The art can be dramatic; loading it should not be.
