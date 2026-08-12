# Chrono Crawler — Folded Reactor Production Agreement

## Purpose

This document is the production contract for the first fully rebuilt level, **The Folded Reactor**. The level is not considered finished until the live build visually, narratively, and technically reaches or exceeds the approved Chrono Crawler concept / story bible target.

The target is a high-resolution stylized 2D puzzle-platformer with Dark Deco / noir staging, strong silhouettes, layered environments, authored character animation, and timeline-specific structural changes. A prototype-quality rectangle with a prettier tint is not an acceptable final asset.

---

## 1. Non-Negotiable Visual Target

The Folded Reactor must read as:

- a monumental industrial-art-deco complex under Veyr
- visually inspired by 1990s dark-noir animation staging: large shadow masses, geometric deco architecture, rain, steam, searchlights, analog machinery
- a cohesive authored world rather than a Phaser prototype with background art behind collision blocks
- three materially and structurally distinct timeline states:
  - **Past** — amber / brass / intact / ornate / stable
  - **Present** — cyan / steel / active / cold / fractured
  - **Ruined Future** — crimson-magenta / corroded / broken / exposed / dangerous

Timeline differences must be visible through silhouette, material, missing structure, lighting and animation — not only through a global tint.

---

## 2. Character Replacement Scope

The following characters require new production sprite families that match the Visual Bible. Existing runtime sheets are migration references only and must be retired after the new families are validated.

### Elias Varren

Canonical design:

- slim, tired scientist
- messy dark hair, glasses, narrow face
- light trench/lab coat over dark clothing
- Temporal Gauntlet on one wrist
- no chest-mounted Chrono Core
- silhouette must remain readable at normal gameplay scale

Required animation families for Level 1:

- idle: 4–6 frames
- walk: 8 frames
- run: 8 frames
- jump: 4–6 frames
- fall: 2–3 frames
- land: 3–4 frames
- interact: 4–6 frames
- timeline shift: 6–8 frames
- optional hurt / recovery placeholder only if needed by current gameplay

Pipeline rule: one approved side-view seed frame → generate full strip per animation → normalize to a shared bottom-center feet anchor → preview → in-engine approval.

### Mara Varren

Canonical design:

- approximately 11 years old
- human, specific, gentle silhouette — never generic horror ghost
- restrained warm amber temporal rim
- period-inspired simple coat/dress language
- visual motifs may include a pocket watch, small satchel, ribbon, folded paper, or other story artifacts

Required Level 1 states:

- idle / apparition loop
- turn / look-back
- soft walk or step-away
- fade / temporal dissolve
- optional gesture / point for hint scenes

### The Keeper / Later Man

Canonical design:

- future Elias silhouette lineage must be visible retrospectively
- longer damaged dark coat
- aged face and posture without becoming a monster
- corrupted gauntlet / temporal damage carries magenta accents
- gestures should echo Elias where possible

Required early campaign states:

- idle silhouette
- slow walk
- turn / reveal posture
- gauntlet pulse
- vanish / dissolve

The full face-reveal animation can be authored later, but base proportions must already support the final reveal.

### Rustmite / Patrol Enemy

Canonical design:

- small clockwork maintenance automaton turned scavenger/hazard
- low, wide silhouette
- one strong optical eye
- mechanical legs / jaws
- belongs to Veyr infrastructure, not fantasy biology

Required Level 1 animations:

- idle
- patrol walk
- alert
- attack / lunge or contact telegraph
- destroyed / disabled

---

## 3. Shared Gameplay Asset Replacement Scope

The following assets are shared game language and must be rebuilt once, then reused across the campaign with environment/timeline variants where appropriate.

### Required shared production assets

- Temporal Anchor Beacon checkpoint
- Memory Fragment world pickup
- timeline door / gate
- pressure plate
- lever switch
- objective / interact marker
- timeline availability / lock iconography
- hazard edge / danger trim family
- checkpoint activation FX
- Memory Fragment pickup FX
- timeline shift FX language
- Echo replay FX language

No gameplay object may rely on glow alone to communicate state.

---

## 4. Platform Family — Folded Reactor

The current rectangle/stretch approach is considered temporary and must be replaced by a modular visual renderer that sits over unchanged collision geometry.

### Platform families

1. **Heavy Reactor Floor**
   - wide primary traversal surfaces
   - deep side faces
   - large supports / ribs

2. **Maintenance Catwalk**
   - narrow metal top
   - repeating braces
   - rail / conduit detail where it does not obscure collision readability

3. **Suspended Gantry**
   - hanging platform or service bridge
   - visible support cables / frames

4. **Machine Housing**
   - large equipment body that functions as traversal surface
   - must look like architecture/machinery, not a gameplay cube

5. **Timeline Bridge Span**
   - Past: complete / ornate / stable
   - Present: functional / industrial
   - Future: broken / missing modules / exposed support

6. **Broken Future Span**
   - authored broken silhouettes
   - missing plates, bent beams, hanging cable, corrosion, temporal fracture

### Modular pieces

- left end cap
- repeating middle module
- right end cap
- short segment
- long segment
- top surface strip
- underside beam
- angled deco support
- vertical pillar
- hanging support
- broken left cap
- broken right cap
- hazard / unstable edge
- optional light / signal socket

### Rendering rule

`levels.ts` remains the collision/source-of-truth geometry. A dedicated environment/platform visual renderer composes authored modules over the collision rectangle. Art dimensions never redefine physics dimensions.

---

## 5. Folded Reactor Environment Layer Stack

The Folded Reactor must use a minimum five-part composition.

### Layer 1 — Far Backdrop

Purpose: scale, location, mood.

Contents:

- distant reactor shaft / Veyr industrial silhouette
- monumental deco arches
- distant turbine/ring shapes
- high skylight / rain / searchlight haze
- deep soot-black masses

Scroll factor target: `0.05–0.15`.

### Layer 2 — Large Midground Architecture

Purpose: make the chamber feel inhabited by real infrastructure.

Contents:

- huge Chrono machinery
- towers
- pipe clusters
- suspended service frames
- turbines / ventilation
- large clock / gauge motifs
- non-interactive catwalk silhouettes

Scroll factor target: `0.20–0.40`.

### Layer 3 — Gameplay Plane

Purpose: maximum readability.

Contents:

- production platform kit
- doors
- switches
- pressure plates
- checkpoint
- Memory Fragments
- hazards
- Elias / enemies / Echo

Scroll factor: `1.0`.

### Layer 4 — Foreground Silhouettes

Purpose: depth and Dark Deco framing.

Contents:

- hanging chains
- pipes
- near-camera beams
- cable bundles
- partial railings
- occasional black machine silhouettes

Scroll factor target: `1.05–1.15`.

Foreground may never hide landing edges, interactables, enemies, or required puzzle information.

### Layer 5 — Atmosphere / FX

- steam bursts
- haze cards
- rain streaks where architecturally sensible
- machine sparks
- controlled blinking practical lights
- subtle searchlight / volumetric cones
- temporal dust / fracture particles

Reduced-motion and reduced-flash settings must provide quieter equivalents.

---

## 6. Timeline Environment Rules

### Past

- intact architecture
- additional trim / brass / glass
- complete supports
- warm practical lighting
- machinery orderly and maintained
- must feel attractive enough to support the story's preservation theme

### Present

- cold steel
- active machinery
- rain / condensation
- broken glazing / exposed wiring
- darkest and most readable state

### Ruined Future

- missing architecture
- corroded metal
- bent supports
- open voids
- hanging structure
- temporal tears
- isolated warning light rather than broad neon wash

Every authored platform or major environment object should have a defined answer to: **what physically changed between these three states?**

---

## 7. Memory Fragment Artifact System

Memory Fragments are not plain text collectibles.

### World pickup

The in-world pickup remains a compact temporal shard / artifact marker so players can identify collectibles consistently.

### On collection

1. gameplay briefly pauses or soft-locks movement
2. ambience dips
3. gauntlet reacts
4. restrained temporal pulse / vignette
5. an artifact panel opens in the DOM UI
6. the artifact itself is shown as authored visual content
7. player closes / continues

### Artifact types

The artifact image may contain:

- folded note
- handwritten page
- photograph
- family photo booth strip
- child's drawing
- hospital paper / appointment card
- ticket / receipt
- lab notebook page
- government document
- maintenance card
- city map fragment
- watch repair slip
- newspaper clipping
- other story-specific physical evidence

### Text rule

If the story message can be shown physically on the artifact, do not duplicate it as a large generic subtitle box. Optional UI copy is limited to:

- fragment title
- date / location when narratively justified
- a short one-line archival caption

### First Folded Reactor artifact

Recommended first artifact: **Folded Paper**.

It should show a child's folded note / small sheet with a short line such as:

> You said soon.

The visual should carry the emotional beat before any exposition explains who wrote it.

### Archive / Journal

Collected artifacts must be persisted and replayable through a later **Memory Archive** screen. Save format must eventually persist collected fragment IDs.

---

## 8. Legacy Asset Cleanup Contract

Old assets are allowed only during migration. They must not coexist indefinitely with production assets under ambiguous names.

### Rules

- all new assets live under `assets/production/`
- runtime code references stable manifest keys, not ad hoc file paths
- when a production replacement is approved, the old asset is removed from the runtime manifest
- retired files are moved to `assets/legacy/` only if they are still useful as migration reference
- obsolete runtime-generated placeholder textures are deleted after the corresponding production asset is proven in CI
- no new gameplay code may reference `legacy` paths
- old art should not remain in `assets/sprites/` with names that look canonical after replacement

### Required cleanup targets after Level 1 approval

- old Elias runtime sheet / runtime crop fallback
- old Mara / Keeper source sheets once replacements are integrated
- old Rustmite procedural placeholder
- old rectangle-style checkpoint placeholder
- old Memory Fragment circle placeholder
- old stretched platform visual path for Folded Reactor
- obsolete reactor backdrop override assets no longer used by the new layer stack

Deletion happens only after visual QA and smoke validation prove the production replacement.

---

## 9. UI / HUD / Narrative Presentation

Folded Reactor must use the approved HUD V2 language:

- compact objective chip: upper-left
- level/checkpoint chip: upper-right
- temporal instrument: bottom-center
- Echo status integrated with temporal instrument
- no large web-dashboard panels covering the city

Dialogue and Memory Artifact panels share Dark Deco framing, soot-black glass/metal base and restrained brass trim.

---

## 10. Audio / Motion Expectations for Level 1

Level 1 production quality also requires basic presentation polish:

- reactor hum with layered machinery ambience
- steam / pressure releases
- checkpoint activation sound
- Memory Fragment pickup + artifact-open cue
- timeline shift cue
- Echo record / replay cue
- door / switch state feedback

Procedural prototype audio can remain temporarily only until authored / curated replacements are ready, but final Level 1 sign-off includes an explicit audio review.

---

## 11. Definition of Done — The Folded Reactor

The Folded Reactor is **not done** until all of the following are true.

### Environment

- [ ] no visible transparent/tinted prototype platform cubes remain
- [ ] production platform modules are used for all major traversal surfaces
- [ ] far backdrop is authored for the level
- [ ] midground architecture is visibly present
- [ ] foreground silhouettes are present but do not block gameplay
- [ ] parallax is active and restrained
- [ ] atmosphere / steam / haze / practical lights are present
- [ ] Past / Present / Future differ structurally and materially

### Characters / Enemies

- [ ] Elias uses the new canonical production sprite family
- [ ] Mara uses the new canonical production sprite family
- [ ] Keeper uses the new canonical production sprite family where shown
- [ ] Rustmite uses a new authored production animation family
- [ ] no production character depends on legacy placeholder art

### Gameplay Objects

- [ ] Temporal Anchor Beacon is production quality
- [ ] timeline doors / gates are production quality
- [ ] pressure plates and levers are production quality
- [ ] hazard edges / dangerous areas are visually authored
- [ ] Memory Fragment world pickup is production quality

### Memory Fragment Presentation

- [ ] pickup opens a dedicated artifact popup
- [ ] first fragment includes a physical artifact image
- [ ] artifact can be closed via keyboard and gamepad-compatible action
- [ ] reduced-motion / reduced-flash behavior is respected
- [ ] collected state is represented in runtime and save design

### UI / FX

- [ ] HUD uses production V2 layout
- [ ] timeline shift FX feels intentional and readable
- [ ] Echo FX reads as a temporal duplicate rather than a tinted sprite
- [ ] checkpoint / switch / pickup feedback is readable without relying on glow alone

### Technical / QA

- [ ] `tsc --noEmit` passes
- [ ] production build passes
- [ ] browser boot gate passes
- [ ] gameplay smoke tests pass
- [ ] Folded Reactor screenshots exist for Past / Present / Ruined Future
- [ ] visual QA confirms no legacy art unexpectedly appears
- [ ] no critical collision-to-art mismatch exists
- [ ] acceptable frame pacing on desktop target hardware / headless CI
- [ ] GitHub Pages deploy succeeds from `main`

### Sign-off Rule

The level may only be described as **production-complete** when the live deployed build looks consistent with or better than the approved Concept / Visual Bible target at normal gameplay scale. Passing CI alone is not sufficient.

---

## 12. Production Order

1. platform production kit + visual renderer
2. Folded Reactor far / mid / foreground layer stack
3. Elias canonical seed + animation family
4. Rustmite animation family
5. shared interactables cleanup / final art
6. Memory Artifact popup + first Folded Paper art
7. Mara production family
8. Keeper production family
9. timeline / Echo / checkpoint FX polish
10. HUD / dialogue / artifact UI final pass
11. legacy asset removal from runtime manifest
12. smoke + visual QA
13. live deploy + final sign-off

This order may change only when a dependency blocks implementation. The quality target does not change.