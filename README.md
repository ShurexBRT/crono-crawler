# Chrono Crawler

Chrono Crawler is a playable vertical-slice prototype for a dark atmospheric 2D side-scroller puzzle-platformer. Elias Voss wakes after the Chrono Core incident and moves through broken versions of the same city: past, present, ruined future, and the still hour guarded by The Keeper.

The project is built with Phaser, TypeScript, and Vite, and can be deployed as static files through GitHub Pages.

## What Is Implemented

- Main menu with New Game, Continue, Options, and Credits
- Local storage save system for continue, checkpoint, timeline, and settings
- Pause menu with resume, options, and main menu return
- Music/SFX volume settings and fullscreen toggle
- Intro screen, ending screen, tutorial, three levels, and a final Keeper puzzle level
- Walk, run, jump, platform collision, camera follow, death and checkpoint rewind
- Three timeline states: Past, Present, Ruined Future
- Timeline-changing bridges, doors, platforms, gates, and traversal routes
- Echo clone recording and replay
- Echoes can hold pressure plates and replay switch interactions
- Pressure plates, switches, checkpoint beacons, locked doors, and exit zones
- One patrolling enemy type
- Prototype boss-style final puzzle using timeline shifts, echo pressure plate, switches, and a Keeper barrier
- Generated placeholder pixel art sprites and procedural Web Audio tones
- Noir-deco city backdrop with layered skyline silhouettes, searchlights, rain, and timeline color accents

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

Build the production site:

```bash
npm run build
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

## Mechanics

Time shifting changes which objects are solid, visible, broken, overgrown, destroyed, or active. Some bridges only exist in the past, some doors are destroyed in the ruined future, and some platforms only have power in the present.

The current timeline panel at the top of the screen shows the key timeline controls during play: `Q` cycles between timelines, while `1`, `2`, and `3` jump directly to Past, Present, and Ruined Future.

The echo system records up to eight seconds of Elias's movement and interactions. When replayed, the echo can stand on pressure plates or repeat an interaction near a switch. If the recording finishes while the echo is standing on a plate, it keeps holding that plate.

Checkpoint rewind returns Elias to the last stabilized beacon, clears the current echo, and restores the saved checkpoint timeline.

## Design Notes

See [LEARNINGS.md](LEARNINGS.md) for the game design, platformer, puzzle, visual, UI, technical, and production skills learned so far.

See [docs/full-game-blueprint.md](docs/full-game-blueprint.md) for the target structure, chapter plan, mechanic progression, art direction, accessibility priorities, and production roadmap for turning the vertical slice into a complete game.

See [docs/asset-pipeline.md](docs/asset-pipeline.md) for sprite sheet naming, frame metadata, raw-vs-game-ready asset rules, and integration QA.

## Folder Structure

```text
src/
  game/
    assets/          Stable texture keys and generated asset manifest
    content/         Level data and authored story beats
    entities/        Player, enemy, echo, and level object classes
    input/           Keyboard action mapping
    phaser/          Phaser config and scenes
    systems/         Save, audio, timeline, dialogue, and echo recording systems
    types.ts         Shared game/content types
  ui/                DOM menu, HUD, dialogue, settings, pause, and ending UI
  main.ts            App bootstrap
  styles.css         Game UI styling
```

## Current Limitations

- Art and audio are generated placeholders, not production assets.
- There is no gamepad or touch control layer yet.
- The enemy is a simple patrol hazard.
- The final encounter is a boss-style puzzle prototype, not a combat boss.
- Saves store progression and checkpoint identity, but not every local puzzle flag.
