# Chrono Crawler — Agent Operating Contract

Chrono Crawler is a Phaser + TypeScript + Vite vertical slice for a dark atmospheric puzzle-platformer built around timeline shifting, echo replay, checkpoints and authored traversal puzzles.

Forge is the work-truth layer for agent tasks. GitHub is code truth.

## Before acting

1. Read the Forge ticket and acceptance criteria.
2. Read this file and `.forge/project.json`.
3. Read the Forge product-direction state for CHR before planning broad gameplay, narrative, progression, UX or visual-direction work.
4. Inspect the current scene/system implementation before editing.
5. Keep the ticket scope narrow and avoid overlapping active work.
6. Do not move a ticket forward without evidence from the required role.

## Product Direction Gate

Chrono Crawler is currently treated as `needs_alignment` in Forge.

Agents may still:

- inspect and audit the current vertical slice;
- fix clearly reproducible defects;
- improve tests/build/reliability without changing product intent;
- document technical debt and regression risks.

Agents must **not** independently decide major questions such as overall game length, progression structure, combat expansion, art direction, narrative scope, platform/input strategy or which prototype mechanics should become final-product pillars.

If a ticket depends on one of those choices, stop the dependent work and create a Forge decision request for the PM. Include the current implementation, the concrete question, viable options, trade-offs and a recommendation if evidence supports one. The PM will align the decision with the product owner and record the result before execution resumes.

## Product truth

Current implemented core includes:

- Past / Present / Ruined Future timeline states;
- echo recording and replay;
- checkpoints and rewind;
- switches, plates, gates, timeline-sensitive traversal;
- localStorage save/continue;
- authored intro, levels, Keeper puzzle and ending;
- keyboard controls and browser deployment through GitHub Pages.

Do not casually replace these systems or turn the vertical slice into a different game genre.

## Current non-goals unless ticketed and product-approved

- gamepad support;
- touch controls;
- large combat-system expansion;
- engine migration;
- save format rewrite;
- broad art/audio replacement.

## Technical baseline

- Phaser 3
- TypeScript
- Vite
- static GitHub Pages deployment

Primary code lives under `src/game` and `src/ui`.

## High-risk areas

Changes touching these require explicit regression thinking:

- timeline state transitions;
- echo recording/replay timing and interactions;
- checkpoint identity and rewind;
- save schema/localStorage compatibility;
- input bindings;
- scene transitions;
- pressure plate/switch puzzle state;
- Pages/Vite base/deploy behavior.

## Agent roles

### Planner
Maps the requested behavior to the current scenes/systems, identifies puzzle/save/input risks and proposes the smallest implementation plan. If product intent is unclear, escalates instead of guessing. Does not implement production code.

### Builder
Implements the approved scope. Must preserve existing puzzle semantics and save behavior unless the ticket explicitly changes them. Cannot approve itself.

### Reviewer
Checks for regression in timeline logic, echo state, save state, scene lifecycle, Phaser object cleanup, input duplication, scope creep and unauthorized product-direction changes.

### QA
Validates acceptance criteria plus neighboring puzzle/progression regression. Static code inspection is not a QA pass.

### Browser
Runs the real game and exercises the affected flow with actual controls. For gameplay tickets, runtime play evidence matters more than screenshots of code.

### Release
Validates typecheck/build and GitHub Pages readiness. Release may not bypass failed gameplay QA or an unresolved direction dependency.

## Validation gates

Minimum for code changes:

```bash
npm install
npm run typecheck
npm run build
```

For gameplay changes, run the game and exercise the changed mechanic plus one neighboring regression path.

## Definition of done

A Chrono Crawler ticket is done only when:

- acceptance criteria are verified in runtime when applicable;
- typecheck/build pass;
- timeline/echo/checkpoint/save regressions were considered;
- no unresolved product-direction decision is being silently assumed;
- no unrelated mechanics were added;
- Pages assumptions remain valid;
- structured handoff evidence exists.

## Required handoff

```text
Result: PASS | FAIL | BLOCKED | CHANGES REQUESTED
Ticket: CHR-<n>
Role: <role>
Changed/inspected:
- ...
Runtime/build validation:
- ...
Product-direction dependency:
- none | decision request <topic>
Findings/risks:
- ...
Next owner/action:
- ...
```
