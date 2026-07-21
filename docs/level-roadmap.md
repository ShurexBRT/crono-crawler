# Chrono Crawler Level Roadmap

This roadmap extends the current playable sequence without replacing it. The goal is to keep each new level buildable from the existing Phaser/content architecture, while introducing one clear idea at a time.

## Current Playable Spine

1. The Folded Reactor
   - Teaches timeline shifting.
   - Introduces unstable bridges and future-only openings.

2. Lock Street
   - Teaches echo recording with a pressure plate.
   - Adds the first patrolling rustmite.

3. Rain District Crossing
   - Combines Past-only pressure plates, echo timing, and Future traversal.
   - Acts as the first real "prove you understand it" crossing.

4. Glasshouse Station
   - Introduces switches and vertical route pressure.
   - Expands the mystery around the girl.

5. Platform 13
   - Uses timeline-specific switches and denser enemy pressure.
   - Builds toward the Keeper reveal.

6. The Still Hour
   - Current finale shell.
   - Uses three anchor flags as a boss-gate structure.

## New Level Arc

### 7. Bellweather Canals

Role: First post-station expansion level.

Core idea: Water level changes by timeline. The Past has shallow maintenance ledges, the Present is flooded in sections, and the Future exposes broken drain tunnels.

Mechanics:
- Timeline blocks become stepping stones across water gaps.
- Echo holds a Past drain switch while Elias crosses in Future.
- Rustmites patrol short platforms above hazard gaps.

Implementation needs:
- A simple hazard rect type or water hazard entity.
- Level background can reuse `streets` until a canal backdrop exists.
- One new checkpoint after the first drain puzzle.

### 8. The Minute Market

Role: First dense navigation and choice level.

Core idea: A market district exists as three different layouts. Past stalls form rooftops, Present awnings form mid-route bridges, and Future ruins open a lower path.

Mechanics:
- Multiple valid routes through the same area.
- Optional memory fragment placed on a harder Future route.
- A switch in Present opens a door that only matters in Past.

Implementation needs:
- No new entity required.
- Author with existing platforms, timeline blocks, switches, and memory fragments.
- Add one more enemy only after traversal feels readable.

### 9. The Hourglass Hotel

Role: Mid-game vertical level.

Core idea: Elias climbs a hotel whose floors do not agree about which century they belong to.

Mechanics:
- Vertical checkpoint placement.
- Falling becomes a real penalty but not a full reset.
- Echo must hold a lower-floor switch while Elias climbs to a future-only balcony.

Implementation needs:
- Tune camera deadzone for vertical readability or add per-level camera metadata.
- Add one ladder/elevator-like platform concept later if jumping routes feel too cramped.

### 10. Archive of Unsaid Things

Role: Story-heavy puzzle level.

Core idea: The city archive contains records of timelines the Keeper erased.

Mechanics:
- Fewer enemies, more story zones.
- Memory fragments become optional route rewards.
- Puzzle order matters: unlock Past record, trigger Present switch, cross Future collapse.

Implementation needs:
- Existing story zones and memory fragments are enough.
- Could add a "lore terminal" interactable later, but it is not required for the first pass.

### 11. Crownline Rooftops

Role: High-mobility skill check.

Core idea: Rooftops above the city require quick timeline shifts while moving.

Mechanics:
- Shorter platforms and wider gaps.
- Future-only spans appear briefly as safer routes around enemies.
- Echo can be used defensively to hold plates while Elias avoids patrols.

Implementation needs:
- Keep the first pass fair with generous checkpoint spacing.
- Consider a lightweight wind/rain visual pass only after gameplay is stable.

### 12. The Core Reliquary

Role: Final pre-boss lock.

Core idea: Three relic chambers teach the final boss anchors in isolation before the real confrontation.

Mechanics:
- Past chamber: echo holds memory pressure.
- Present chamber: precise switch route.
- Future chamber: enemy pressure and broken traversal.

Implementation needs:
- Reuse `requiredExitFlags` to require all three chambers.
- This should become the mechanical rehearsal for an improved Keeper encounter.

## Recommended Build Order

1. Build Bellweather Canals first because it only needs one new hazard concept and mostly reuses current systems.
2. Build The Minute Market with existing objects only, to validate that authored content can scale without new code.
3. Add per-level camera metadata before Hourglass Hotel if vertical traversal feels cramped.
4. Build Archive of Unsaid Things when dialogue and memory fragment pacing need a story pass.
5. Build Crownline Rooftops as a movement readability test.
6. Rework The Still Hour after Core Reliquary proves the three-anchor structure.

## Next Playable Slice

The next implementation should be Bellweather Canals:

- Add a serializable `hazards` array to `LevelData`.
- Add a `HazardZone` entity that respawns Elias on overlap.
- Add a new `canals` or temporary `streets` background level entry after Rain District Crossing or after Platform 13.
- Add a smoke test that seeds continue data into the new level and verifies the objective/title.
- Keep art simple: dark water rectangles with cyan edge highlights are enough for the first pass.

This gives the game a new kind of danger without adding combat complexity yet.
