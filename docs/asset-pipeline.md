# Chrono Crawler Asset Pipeline

This document defines how visual assets move from source art into the Phaser runtime. The goal is to keep art replacement safe while the game grows from prototype to full production.

## Folder Policy

Use these folders for exported assets:

- `assets/sprites/` for character, enemy, object, platform, and FX sheets.
- `assets/backgrounds/` for organized level backdrops.
- `assets/ui/` for DOM/canvas UI frames, panels, chips, icons, and prompt art.
- `assets/raw/` for source or exported concept art that is not loaded directly by the game.

The first Folded Reactor production slice also contains deterministic SVG source generators under `src/game/assets/`. These are intentionally version-controlled text sources that Phaser rasterizes at authored dimensions. They are not a return to prototype geometry: each source has a documented production dimension, silhouette and timeline state.

Existing top-level backdrop files are still supported. Do not rename legacy assets casually because boot loading and deployment already reference them.

## Naming Rules

New game-ready filenames should be lowercase kebab-case when exported:

- Good: `elias-run-sheet.png`, `rain-district-tiles.png`, `timeline-platforms.png`
- Avoid: `Elias Final Sheet.png`, `platform assets.png`, `NewSprite.png`

Runtime texture keys belong in `src/game/assets/manifest.ts`. Scenes, entities, and systems use manifest keys, not raw paths.

## Current Legacy Game-Ready Assets

The imported legacy sprite sheets are `1448x1086` PNGs:

- `assets/sprites/elias-sheet.png`
- `assets/sprites/keeper-sheet.png`
- `assets/sprites/daughter-sheet.png`
- `assets/sprites/platforms-sheet.png`
- `assets/sprites/doors-gates-barriers-sheet.png`
- `assets/sprites/puzzle-devices-switches-sheet.png`

They remain supported while production assets replace them incrementally.

## Folded Reactor Production Sources

Source modules:

- `src/game/assets/productionGameplaySvg.ts`
- `src/game/assets/productionBackgroundSvg.ts`

The production slice currently provides:

- Temporal Anchor checkpoint
- Memory Fragment collectible
- Rustmite patrol/alert source frames
- Past / Present / Future platforms
- Past / Present / Future doors
- Past / Present / Future pressure plates
- off/on lever states for all timelines
- Past / Present / Future far Reactor layers
- Past / Present / Future mid Reactor layers
- foreground industrial silhouettes

Exact dimensions are documented in `docs/art/asset-technical-spec.md` and runtime keys in `docs/art/folded-reactor-production-manifest.md`.

## Required Sprite Sheet Metadata

Every exported sprite sheet must be documented before integration:

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

## Elias Pipeline

Elias keeps the current `assets/sprites/elias-sheet.png` source for this pass, but production normalization is deterministic.

Authored source rectangles are copied into:

- normalized frame cell: `320x300`
- six columns
- five rows
- feet baseline: `y=278`

The production integration no longer scans opaque pixels to decide Elias frame bounds. Stable authored source rectangles preserve frame alignment and make future source replacement measurable.

Elias frames must keep:

- a stable feet baseline
- the same normalized cell size
- transparent background
- readable coat/gauntlet silhouette at gameplay scale
- collision authored independently from visible coat tails

Future final export should move the same normalized layout into a static atlas/PNG so runtime normalization can disappear entirely without changing animation keys.

## Timeline Object Rules

Timeline objects change silhouette or physical state, not only tint:

- Past platforms: intact, warmer, brass/stone/deco trim.
- Present platforms: powered, steel/cyan, functional machinery.
- Future platforms: broken, rusted, harsher magenta/red accents.

Doors, switches, pressure plates, and gates need readable active, inactive, unavailable, and unlocked states where relevant.

The production view layer never defines collision. Existing level geometry/specs remain authoritative.

## Background Layer Rules

Production levels use at least:

1. far background
2. mid architecture
3. gameplay layer
4. foreground silhouettes

The Folded Reactor target uses timeline-specific far/mid layers and a neutral foreground silhouette pass. Background changes are visual state changes; gameplay path changes still come from `levels.ts`.

## UI Asset Rules

UI assets should support DOM overlays:

- keep panel art flexible enough for text changes
- avoid baking essential text into UI frame assets
- keep high-contrast inner areas behind body copy
- verify narrow viewport behavior after changing panel sizes
- prefer CSS variables and reusable classes over one-off inline styles
- keep normal gameplay HUD off the central playfield

## Integration Checklist

1. Define visual purpose and gameplay readability requirement.
2. Define exact dimensions and anchor.
3. Add source art or deterministic SVG source.
4. Confirm timeline/state variants.
5. Add stable texture/animation keys to `src/game/assets/manifest.ts`.
6. Load/rasterize in `BootScene` or production boot patch.
7. Register animations in one place.
8. Keep collision authored separately.
9. Run `npm.cmd run build`.
10. Run `npm.cmd run test:smoke`.
11. Capture visual QA for changed production scenes.
12. Verify Past / Present / Future readability without relying only on color.

## Migration Target

The long-term production target remains deliberately boring:

- no checkerboard cleanup at runtime
- no inferred opaque bounds for final sheets
- no mixed-case or space-containing new filenames
- no gameplay code depending on raw source-art dimensions
- animation frame names documented and stable
- collision independent from art bounds
- visual QA captures for major asset changes

The art can be dramatic; loading it should not be.