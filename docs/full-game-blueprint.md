# Chrono Crawler Full Game Blueprint

This document turns the current vertical slice into a practical target for a complete browser game. It should guide level authoring, art production, UI work, and architecture decisions without forcing a rewrite of the existing prototype.

## Core Pitch

Chrono Crawler is a compact atmospheric puzzle-platformer about reading the same city through broken time. Elias Varren does not use time as a power fantasy. He uses it to understand consequences, leave echoes behind, and eventually accept that stillness is not mercy.

The complete game should feel like a dark chrono-noir city journey: sharp silhouettes, rain, art-deco machinery, restrained color, readable platforming, and puzzle rooms where time changes the route rather than simply changing the color palette.

## Narrative Canon

- The protagonist's canonical name is **Elias Varren**.
- **The Keeper** and **The Later Man** are the same identity: a future Elias Varren shaped by repeated Chrono Core corrections.
- Elias created the Chrono Core because he could not accept the death of his daughter, Mara.
- The Core did not restore Mara. It built a temporal architecture around Elias's refusal to let the loss become final.
- The canonical ending is acceptance, not resurrection: Elias breaks the correction loop, releases Mara from the machine, and allows the future to continue without his control.

Future narrative writing should not reintroduce `Elias Voss` or treat the Keeper and The Later Man as unrelated entities unless the canon is deliberately changed first.

## Target Scope

- Playtime: 3 to 4 hours for a first clear.
- Structure: 5 chapters, 14 to 16 authored levels, one final puzzle encounter, optional memory fragments.
- Platform target: modern desktop browser first, with gamepad and touch support added after keyboard flow is solid.
- Engine: Phaser 3, TypeScript, Vite, DOM overlays for menus/HUD/dialogue/options.
- Save model: localStorage for core progress; IndexedDB only if richer replay, collectible, or profile data becomes too large.

## Player Verbs

Keep the verb set small and expressive:

- Move, run, and jump through readable side-scrolling spaces.
- Shift between Past, Present, and Ruined Future.
- Record and release an echo that repeats movement and interactions.
- Interact with switches, doors, beacons, memory fragments, and timeline machinery.
- Rewind to a stabilized checkpoint.

Avoid turning the game into combat-first action. Enemies should pressure timing, route choice, and puzzle setup.

## Chapter Plan

### 1. The Reactor Hour

Purpose: teach basic movement, checkpoint rewind, and timeline shifting.

Mood: buried reactor, dead city heart, stopped clocks, industrial amber and cyan.

New ideas:

- Past bridge exists.
- Present machinery still runs.
- Future removes or breaks barriers.
- Checkpoint rewind is framed as a stabilized second.

### 2. The Rain District

Purpose: introduce echo recording as the first real puzzle verb.

Mood: wet rooftops, alley bridges, lamps, suspended rain, distant searchlights.

New ideas:

- Echo holds pressure plates.
- Echo repeats simple switch interactions.
- First patrol enemy as a route-timing hazard.

### 3. The Glass Quarter

Purpose: combine vertical traversal with timeline-specific machinery.

Mood: observatory glass, botanical overgrowth, clockwork elevators, broken lenses.

New ideas:

- Timeline-powered lifts.
- Overgrown Past routes.
- Ruined Future catwalks.
- The mysterious girl appears as an optional in-level guide, not a long dialogue source.

### 4. Platform 13

Purpose: make the city feel larger and less stable.

Mood: station platforms assembled from incompatible years, signal lights, black rain, dead trains.

New ideas:

- One-way timeline locks.
- Switches that only exist in one timeline.
- Enemies used as timing gates rather than combat targets.
- Optional memory fragments that explain the Keeper without pausing the level too often.

### 5. The Still Hour

Purpose: final mastery test using known verbs only.

Mood: quiet core chamber, impossible skyline, frozen rain, Elias facing the Keeper.

New ideas:

- Three anchors: Past plate, Present switch, Future switch.
- Echo must hold an old decision while Elias moves forward.
- The final barrier opens only when all three timelines disagree with the Keeper.
- Ending should be playable or semi-interactive, not only a static text screen.

## Puzzle Progression

Each mechanic should follow this rhythm:

1. Safe introduction: the player cannot fail badly and sees the result immediately.
2. Risky variation: the mechanic appears with timing, height, enemy pressure, or a longer route.
3. Compact mastery test: a short room combines it with a known verb.
4. Emotional punctuation: one short line, sign, or memory fragment reframes what the mechanic means.

Puzzle rooms should make the goal visible before the solution is obvious.

## Timeline Rules

Past:

- Intact bridges, older machines, amber light, brass trim.
- Safer traversal, but some modern systems do not exist yet.

Present:

- Powered doors, switches, lifts, live circuits, cyan light.
- Most reliable state for teaching and checkpoint flow.

Ruined Future:

- Broken gates, collapsed spans, rust-red hazards, empty silhouettes.
- Often opens brutal shortcuts while removing safe structures.

Timeline changes should alter silhouette, collision, or traversal state. Color-only changes are not enough.

## Art Direction

Use noir-deco and public-domain style traits: angular towers, theatrical shadows, industrial geometry, sharp readability, and dramatic lighting. Do not copy Batman characters, logos, locations, or protected IP elements.

Art priorities:

- Game-ready Elias sprite sheet with stable feet and consistent frame cells.
- Keeper, girl, rustmite, doors, switches, pressure plates, checkpoint beacons.
- Three readable platform variants for Past, Present, Future.
- Tile-ready foreground and midground city pieces.
- Rain, smoke, clock sparks, timeline pulse, echo trail FX.

New game-ready assets should use lowercase kebab-case filenames and documented frame layouts.

## UI And Accessibility

HUD should stay sparse:

- Timeline state and controls.
- Current objective.
- Echo state.
- Checkpoint/level chip.
- Short contextual prompts only near interactables.

Current vertical-slice accessibility already includes text scaling, reduced motion, reduced flashes, fullscreen, and separate music/SFX controls. Remaining priorities are:

- Remappable keyboard controls.
- Complete gamepad configuration/remapping.
- High-contrast interactables.
- Separate dialogue volume if voiced dialogue is introduced.
- Touch controls after desktop input is stable.

## Systems To Extract Next

Do not keep growing `GameScene` indefinitely. Extract systems when the next feature touches the same concern twice:

- `LevelFlowSystem`: level start, transition, completion, ending handoff.
- `TimelineObjectSystem`: applying timeline state to blocks, doors, and future timeline objects.
- `CheckpointSystem`: active checkpoint, checkpoint timeline, rewind spawn.
- `ObjectiveSystem`: HUD objective, required flags, exit messaging.
- `HazardSystem`: enemy overlap, death, fall checks, respawn reasons.

`LevelFlowSystem` and `CheckpointSystem` already exist in the vertical slice; preserve those boundaries rather than folding them back into `GameScene`.

Scenes should remain responsible for Phaser lifecycle, camera, physics wiring, and routing.

## Production Roadmap

### Milestone 1: Reliable Vertical Slice

- Keep browser smoke tests green for boot, menu, gameplay HUD, timeline controls, pause/save, content loading, and accessibility.
- Build remains green.
- Keep `main` as the canonical development/deploy branch.
- Integrate the canonical ending before adding another large content block.

### Milestone 2: Progression Foundation

- Introduce a versioned richer save model with migration from `chrono-crawler.save.v1`.
- Persist chosen progression data such as collectibles and puzzle flags where reload continuity matters.
- Keep transient echo playback state out of saves unless a concrete design need appears.

### Milestone 3: Content Authoring Foundation

- Tilemap or structured level authoring path.
- Asset manifest remains stable.
- Level object specs support new puzzle object types without scene rewrites.

### Milestone 4: First Real Art Pass

- Replace remaining core placeholder/runtime-generated assets.
- Document sprite sheet layouts.
- Create consistent timeline platform, door, switch, and plate silhouettes.

### Milestone 5: Chapter Expansion

- Continue from the current eight-level playable spine with Hourglass Hotel and later roadmap levels.
- Add more recurring girl appearances and Keeper foreshadowing.
- Add one new enemy behavior that changes by timeline.

### Milestone 6: Final Game Pass

- Rework The Still Hour after the pre-final chapters prove the anchor structure at full scale.
- Replace procedural audio with authored ambience and SFX.
- Add release packaging and final smoke/regression checks.

## Current Rule Of Thumb

When choosing between adding a new mechanic and making an existing mechanic more readable, choose readability. Chrono Crawler's identity is strongest when the player understands the room, changes time, and feels the city answer.
