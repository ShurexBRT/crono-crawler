# Chrono Crawler

Chrono Crawler is a playable dark atmospheric 2D side-scroller puzzle-platformer set in the fractured city of Veyr. Elias Varren moves through broken versions of the same city — Past, Present, and Ruined Future — while uncovering what the Chrono Core was built to preserve and what it actually trapped.

The project is built with Phaser 3, TypeScript, Vite, Arcade Physics, DOM/CSS overlay UI, localStorage saves, procedural Web Audio, Playwright smoke tests, and GitHub Pages deployment.

The canonical development branch is `main`.

## What Is Implemented

- Main menu with New Game, Continue, Options, and Credits
- Data-driven intro and ending sequences
- Eight playable levels from The Folded Reactor through The Still Hour
- Versioned local save system with automatic v1 migration
- Persistent checkpoint, timeline, settings, completed levels, latched puzzle flags, and memory fragments
- Pause menu with Resume, Save Now, Options, and Main Menu actions
- Music/SFX volume, fullscreen, text scale, reduced motion, and reduced flashes
- Keyboard controls plus basic gamepad support
- Walk, run, jump, platform collision, camera follow, death, and checkpoint rewind
- Three timeline states: Past, Present, and Ruined Future
- Timeline-dependent platforms, doors, bridges, gates, hazards, and traversal routes
- Echo recording and replay for up to eight seconds
- Echoes can hold pressure plates and replay switch interactions
- Pressure plates, switches, checkpoint beacons, locked doors, exit zones, hazards, and memory fragments
- Patrolling rustmite enemies
- Final Keeper encounter built as a three-anchor puzzle rather than a combat boss
- Noir-deco layered city backdrops with rain, searchlights, industrial silhouettes, and timeline accent colors
- Runtime sprite-sheet processing through stable asset manifest keys
- Playwright smoke coverage plus pull-request CI validation

## Current Playable Sequence

1. **The Folded Reactor** (`tutorial`)
2. **Lock Street** (`level-1`)
3. **Rain District Crossing** (`rain-crossing`)
4. **Glasshouse Station** (`level-2`)
5. **Platform 13** (`level-3`)
6. **Bellweather Canals** (`bellweather-canals`)
7. **The Minute Market** (`minute-market`)
8. **The Still Hour** (`boss`)

Level behavior is authored primarily in `src/game/content/levels.ts`.

## Narrative Canon

Elias's canonical name is **Elias Varren**.

The Keeper and **The Later Man** refer to the same future identity: a later version of Elias who kept extending the Chrono Core's correction loop under the belief that preserving stillness was mercy.

The Core was created because Elias could not accept the loss of his daughter, Mara. It did not restore her to life. It built a temporal architecture around his refusal to let the loss become final.

The intended ending is not a resurrection. Elias ends the correction loop, releases Mara from the machine, and accepts a future he cannot control.

The runtime ending is now authored as a sequence of replaceable narrative beats in `src/game/content/ending.ts`. Its current copy is the canonical story spine, not locked final prose; the dedicated narrative pass can rewrite dialogue and pacing without changing scene code.

## Run Locally

Install dependencies:

```bash
npm install
```

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked by execution policy:

```powershell
npm.cmd install
npm.cmd run dev
```

Start the development server:

```bash
npm run dev
```

Build the production site:

```bash
npm run build
```

Run smoke tests:

```bash
npm run test:smoke
```

Preview the production build:

```bash
npm run preview
```

## Controls

- Move: `A/D` or arrow keys
- Run: `Shift`
- Jump: `Space`, `W`, or up arrow
- Cycle timeline: `Q`
- Direct timelines: `1` Past, `2` Present, `3` Ruined Future
- Interact: `E`
- Record or stop echo: `G`
- Rewind to checkpoint: `R`
- Pause: `Esc` or `P`

Basic gamepad input is also supported through `InputController.ts`, but remapping UI is not implemented yet.

## Mechanics

Time shifting changes which objects are solid, visible, broken, overgrown, destroyed, hazardous, or active. Timeline changes are intended to affect traversal and silhouette, not only palette.

The echo system records up to eight seconds of Elias's movement, facing direction, timeline, interactions, and held pressure-plate flags. Replayed echoes can stand on pressure plates, repeat switch interactions, and remain anchored on a plate after replay finishes.

Checkpoint rewind returns Elias to the last stabilized beacon, clears the active echo, and restores the checkpoint timeline.

## Save Model

Current save key:

```text
chrono-crawler.save.v2
```

Legacy saves under `chrono-crawler.save.v1` are automatically migrated on load. The legacy entry is left untouched as a fallback while the migrated state is written to v2.

Persisted:

- current level
- checkpoint ID
- current timeline
- last save timestamp
- music volume
- SFX volume
- fullscreen
- text scale
- reduced motion
- reduced flashes
- completed level IDs
- collected memory fragment IDs
- latched per-level puzzle flags such as activated switches
- whether the ending has been completed

Intentionally runtime-only:

- pressure-plate occupancy
- active echo replay state
- held echo pressure-plate flags
- transient hazard state
- transient dialogue state

Temporary puzzle conditions are not persisted because doing so would allow a save to freeze an echo or pressure plate into a solved state.

## Project Structure

```text
src/
  game/
    assets/          Stable texture keys and asset manifest
    content/         Level data and authored intro/ending/story beats
    entities/        Player, enemy, ghost, hazards, fragments, and level objects
    input/           Keyboard and basic gamepad action mapping
    phaser/          Phaser config, scene polish, and scenes
    systems/         Save, audio, timeline, dialogue, echo, checkpoint, and level flow systems
    types.ts         Shared game/content types
  ui/                DOM menu, HUD, dialogue, settings, pause, and ending UI
  main.ts            App bootstrap
  styles.css         Core game UI styling
```

## Design And Production Docs

- [docs/full-game-blueprint.md](docs/full-game-blueprint.md) — target game structure and architecture rules
- [docs/level-roadmap.md](docs/level-roadmap.md) — playable spine and future level progression
- [docs/asset-pipeline.md](docs/asset-pipeline.md) — asset naming, frame layouts, and integration QA
- [TODO.md](TODO.md) — current prioritized backlog

## Current Limitations

- Ending prose and exact scene pacing still need the dedicated narrative pass.
- Persisted switch logic is richer than v1, but temporary echo/plate puzzle state intentionally remains runtime-only.
- Levels are still rectangle-authored rather than tilemap/editor-authored.
- Enemy behavior is limited to a simple patrol hazard.
- Gamepad support exists, but control remapping and complete controller UX do not.
- Touch controls are not implemented.
- Art and audio are still a mix of prototype/generated/runtime-processed assets rather than a final production pass.
