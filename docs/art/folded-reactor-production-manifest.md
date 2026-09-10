# Folded Reactor Production Asset Manifest

This file tracks the first production-quality visual slice and the runtime keys that ship it.

## Source Modules

- `src/game/assets/productionGameplaySvg.ts` — deterministic game-ready vector sources for interactables, platforms, collectibles and Rustmite.
- `src/game/assets/productionBackgroundSvg.ts` — deterministic Reactor parallax sources.
- `src/game/phaser/productionArt.ts` — loader, Elias normalization and Folded Reactor scene integration.
- `src/game/phaser/productionInteractables.ts` — production visual state mapping on existing puzzle objects.
- `src/game/phaser/productionFx.ts` — timeline and Echo presentation.
- `src/game/phaser/productionTutorialPolish.ts` — tutorial-only final staging polish.
- `src/ui/productionHud.ts` / `.css` — HUD v2.

The SVG sources are authored as code so exact dimensions, palette and state variants stay deterministic and versioned. Phaser loads them as SVG data URIs and rasterizes them to textures at the documented target dimensions.

## Production Gameplay Textures

| Asset | Size | Texture key | Runtime state |
|---|---:|---|---|
| Temporal Anchor | 192×256 | `production.checkpoint.temporal-anchor` | checkpoint base; activation tint/pulse from existing system |
| Memory Fragment | 128×160 | `production.collectible.memory-fragment` | amber uncollected; cyan/dim after collection |
| Rustmite patrol A | 128×96 | `production.enemy.rustmite-a` | patrol animation |
| Rustmite patrol B | 128×96 | `production.enemy.rustmite-b` | patrol animation |
| Rustmite alert | 128×96 | `production.enemy.rustmite-alert` | authored source for later enemy-state expansion |
| Past platform | 512×96 | `production.platform.past` | intact / amber |
| Present platform | 512×96 | `production.platform.present` | steel / cyan |
| Future platform | 512×96 | `production.platform.future` | broken / magenta |
| Past door | 192×288 | `production.door.past` | locked visual |
| Present door | 192×288 | `production.door.present` | locked visual |
| Future door | 192×288 | `production.door.future` | locked visual |
| Past plate | 160×48 | `production.plate.past` | available / pressed feedback remains runtime |
| Present plate | 160×48 | `production.plate.present` | available / pressed feedback remains runtime |
| Future plate | 160×48 | `production.plate.future` | available / pressed feedback remains runtime |
| Switches | 96×128 | `production.switch.<timeline>.<off|on>` | six explicit timeline/state textures |

## Reactor Parallax

| Layer | Size | Keys | Scroll target |
|---|---:|---|---:|
| Far skyline | 1920×720 | `production.reactor.far.<timeline>` | `0.10 / 0.03` |
| Mid reactor architecture | 1920×720 | `production.reactor.mid.<timeline>` | `0.30 / 0.06` |
| Foreground silhouettes | 1920×720 | `production.reactor.foreground` | `1.06 / 0.12` |

Past, Present and Future far/mid pairs are cross-faded on the existing timeline change boundary. Collision does not depend on background state.

## Elias Pipeline

The legacy source sheet remains `assets/sprites/elias-sheet.png`, but the target slice replaces opaque-bound scanning with deterministic authored source rectangles.

Normalized atlas:

- cell: `320×300`
- 6 columns
- 5 rows
- feet baseline: `278`

Current animation keys remain stable, so Player and GhostClone do not need gameplay changes.

## Integration Rules

- Existing level rectangles remain authoritative for physics.
- Production art overlays do not define collision.
- Production interactable patches change texture/display state only; flag logic remains in existing entities and systems.
- New art must continue using `TextureKeys` and `AnimationKeys`.
- Folded Reactor is the reference slice before the same approach is expanded to other districts.

## QA Evidence

`tests/smoke/folded-reactor-visual.spec.ts` captures:

- `folded-reactor-present.png`
- `folded-reactor-past.png`
- `folded-reactor-future.png`

The `Chrono Crawler Production PR CI` workflow uploads them as the `folded-reactor-visual-qa` artifact on every PR update.
