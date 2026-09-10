# Chrono Crawler Level Roadmap

This roadmap extends the current playable sequence without replacing it. The existing `levels.ts` data-driven structure remains the source of truth until a structured editor/tilemap authoring path is deliberately introduced.

## Current Playable Spine

1. **The Folded Reactor** (`tutorial`)
   - Teaches movement and timeline shifting.
   - Uses a Past bridge and a Future opening.

2. **Lock Street** (`level-1`)
   - Introduces echo recording with a pressure plate.
   - Adds the first patrolling rustmite.

3. **Rain District Crossing** (`rain-crossing`)
   - Combines a Past-only pressure plate, echo timing, and Future traversal.
   - Acts as the first real mastery check for the echo/timeline combination.

4. **Glasshouse Station** (`level-2`)
   - Introduces switch interaction and more vertical routing.
   - Expands the mystery around the girl.

5. **Platform 13** (`level-3`)
   - Uses timeline-specific platforms and a Future-only switch.
   - Increases enemy pressure before the late-game arc.

6. **Bellweather Canals** (`bellweather-canals`)
   - Introduces timeline-sensitive hazards.
   - Present water and the old drain state create the first dedicated hazard-navigation level.

7. **The Minute Market** (`minute-market`)
   - Uses alternate Past, Present, and Future routes through one district.
   - Adds a Present key/switch and optional memory fragment routing.

12. **The Still Hour** (`boss`)
   - Current finale shell.
   - Requires `anchor_past`, `anchor_present`, and `anchor_future` to open the Keeper barrier.
   - Remains a puzzle encounter, not a combat boss.

## Stabilization Gate Before More Levels

Do not add another large level until the current slice is reliable enough to build on.

Required first:

- Keep build and Playwright smoke tests green.
- Make `main` the canonical development and Pages deployment branch.
- Standardize narrative references on Elias Varren.
- Treat The Keeper and The Later Man as the same future Elias identity.
- Integrate the canonical ending instead of the current short vertical-slice ending.
- Introduce a richer, versioned save model before adding progression that players reasonably expect to survive reloads.

## Implemented Expansion Arc

### 8. The Hourglass Hotel

Role: Mid-game vertical level.

Core idea: Elias climbs a hotel whose floors do not agree about which century they belong to.

Mechanics:

- Vertical checkpoint placement.
- Falling becomes a meaningful setback without becoming a full-level reset.
- Echo holds a lower-floor interaction while Elias climbs to a Future-only balcony.

Implementation needs:

- Per-level camera metadata or a vertical camera mode if the existing deadzone becomes awkward.
- Reuse existing timeline blocks, switches, checkpoints, and echo rules before inventing a new platform entity.

### 9. Archive of Unsaid Things

Role: Story-heavy puzzle level.

Core idea: The city archive contains records of timelines the Keeper erased.

Mechanics:

- Fewer enemies and more environmental storytelling.
- Memory fragments become optional route rewards.
- Puzzle order matters: unlock a Past record, trigger a Present system, then cross a Future collapse.

Implementation needs:

- Existing story zones and memory fragments should carry the first pass.
- Add a dedicated lore-terminal interactable only if the current interaction model cannot express the scene cleanly.

### 10. Crownline Rooftops

Role: High-mobility skill check.

Core idea: Rooftops above Veyr require fast timeline decisions while moving.

Mechanics:

- Shorter platforms and wider gaps.
- Future-only spans create aggressive shortcuts.
- Echo anchors allow the player to hold one route open while navigating another.

Implementation needs:

- Keep checkpoint spacing generous during the first tuning pass.
- Timeline-shift readability matters more than raw difficulty.

### 11. The Core Reliquary

Role: Final pre-finale rehearsal.

Core idea: Three relic chambers teach the Still Hour anchor logic separately before the full confrontation.

Mechanics:

- Past chamber: echo holds memory pressure.
- Present chamber: switch-route execution.
- Future chamber: hazard/enemy pressure with broken traversal.

Implementation needs:

- Reuse `requiredExitFlags` for chamber completion.
- Prove the anchor structure here before expanding or reworking The Still Hour.

## Recommended Build Order

1. Finish the stabilization gate and canonical ending.
2. Add versioned progression/save state.
3. Add structured level authoring or per-level camera metadata before Hourglass Hotel if needed.
4. Build The Hourglass Hotel without introducing a new core verb.
5. Build Archive of Unsaid Things as a narrative pacing test.
6. Build Crownline Rooftops as a movement/timeline readability test.
7. Build The Core Reliquary as the mechanical rehearsal for the final encounter.
8. Revisit The Still Hour only after the full-game progression proves what the finale actually needs.

## Authoring Rule

A new level should justify itself with a new combination, pacing role, or narrative function. Do not add mechanics merely because a new entity type is technically easy to implement.

When possible, prove a level using existing `LevelData` primitives first. Extract or add systems only when the design repeats a real need.

## September Integration

The four expansion stages are now authored in `final-act.ts` between Minute Market and The Still Hour. Hotel includes a vertical camera, Archive enforces switch order, Crownline tests timeline traversal, and Reliquary rehearses persistent anchor binding. Save v2 persists their switches and visited story zones. Checkpoint safety and the 12-stage chain have automated coverage; geometric tests do not replace a real traversal playtest. Final visual and full-campaign validation remain release gates.
