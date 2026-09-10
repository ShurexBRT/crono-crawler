# Chrono Crawler Visual Bible

## Purpose

This document is the visual source of truth for Chrono Crawler. The target is a high-resolution stylized 2D side-scroller with **Dark Deco / neo-noir** composition, inspired by the graphic clarity and monumental city staging of 1990s noir animation rather than by modern neon-heavy cyberpunk.

The game should read first as a silhouette-driven puzzle platformer and second as a detailed illustration. Gameplay readability always wins over decorative detail.

## Core Visual Pillars

### 1. Dark Deco Veyr

Veyr is an alternate retro-futurist city built from:

- monumental stepped towers
- vertical art-deco ribs and arches
- analog clocks and gauges
- riveted steel and soot-black structural metal
- aged brass, copper and warm glass
- catwalks, bridges, pipes, vents and industrial infrastructure
- hard pools of light surrounded by large dark masses
- rain, steam, searchlights and distant silhouettes

Avoid generic cyberpunk language such as floating hologram ads, dense multicolor neon or clean futuristic plastics.

### 2. Silhouette Before Detail

At gameplay scale the player must immediately distinguish:

- Elias
- an echo
- an enemy
- walkable platform edges
- interactables
- hazards
- collectibles
- exits

Fine texture is secondary. Strong shape, value separation and one meaningful accent light are primary.

### 3. The Same City Across Three Hours

Timeline changes are structural, not simple color filters.

#### Past — Amber / Intact

- warm amber and brass light
- complete architecture
- orderly machinery
- more trim, glass and decorative detail
- systems appear maintained and intentional
- attractive enough that the player understands why Elias is tempted by preservation

Primary accents: `#E0A443`, `#B57A2B`, `#6D4721`.

#### Present — Cyan / Fractured

- cold cyan and steel
- active but unstable machinery
- rain, exposed wiring, broken glazing and interrupted power
- darkest overall value structure
- default reality and clearest gameplay state

Primary accents: `#48CEE8`, `#16768B`, `#183847`.

#### Ruined Future — Magenta / Collapsed

- magenta, crimson and oxidized red
- missing architecture and open voids
- severe corrosion, hanging structure and temporal tears
- fewer practical lights, stronger isolated warning accents
- visually dangerous rather than merely colorful

Primary accents: `#E05A8A`, `#8A294F`, `#431A2B`.

## Material Language

Use a limited material family repeatedly so Veyr feels authored by the same civilization.

- **Aged brass** — clocks, trim, anchor rings, historic Past machinery
- **Dark steel** — primary structure, walkways, doors, Present machinery
- **Riveted plate** — industrial panels and platform faces
- **Clockwork gear** — mechanical joints and readable state devices
- **Crystal glass** — temporal cores, checkpoint chambers and memory fragments
- **Corroded alloy** — Ruined Future structure
- **Soot black** — depth anchor and foreground silhouettes

No gameplay object should use glow as its only readable state.

## Character Direction

### Elias Varren

- slim, tired scientist silhouette rather than superhero proportions
- light trench/lab coat over dark waistcoat and trousers
- messy dark hair, glasses, narrow face
- Temporal Gauntlet is the signature device
- no large chest-mounted Chrono Core
- coat hem and gauntlet glow carry most animation readability

### Mara Varren

- softer, smaller silhouette with restrained warm amber rim
- period-appropriate simple dress/coat language
- visually human and specific, never a generic horror ghost

### The Keeper

- recognizably derived from Elias's silhouette
- longer, damaged dark coat
- hunched only slightly; still intelligent and deliberate
- corrupted gauntlet / temporal damage carries magenta accents
- reveal should work retrospectively through shared proportions and gestures

### Rustmite

- small clockwork maintenance scavenger corrupted into a hazard
- low, wide silhouette
- one strong optical eye
- mechanical legs and jaws telegraph movement and contact danger
- must not read as an organic fantasy insect

## Gameplay Object Language

### Platforms

Platform tops must be brighter and cleaner than their faces.

- Past: intact brass/deco trim, complete supports
- Present: steel/cyan signal details, functional but fractured
- Future: broken edges, missing supports, magenta cracks

A player must identify walkable surfaces without checking collision by trial and error.

### Doors / Gates

- monumental circular/deco lock motif
- locked/open silhouette change
- state light is secondary to physical opening
- timeline versions preserve common proportions

### Pressure Plates

- broad circular or rectangular mechanical base
- raised vs depressed silhouette difference
- activation ring expands briefly

### Lever Switches

- large readable handle angle
- off/on position must remain readable with color disabled

### Checkpoints — Temporal Anchor Beacons

- vertical art-deco instrument
- lower than Elias but visually distinct
- clock alignment ring + glass temporal chamber
- dormant, stabilizing and active states
- active state uses cyan light with restrained brass framing

### Memory Fragments

- faceted shard of temporal glass
- unmistakable collectible silhouette
- amber interior before collection
- cyan/dimmed resolved state after collection
- pickup uses brief particle orbit rather than permanent giant glow

## Environment Layering

Every production level should separate at least four depth groups.

1. **Far background** — skyline / distant chamber silhouette, scroll `0.05–0.15`
2. **Mid background** — large architecture and machinery, scroll `0.20–0.40`
3. **Gameplay layer** — collision geometry and interactive objects, scroll `1.0`
4. **Foreground silhouettes** — pipes, chains, beams, framing, scroll `1.05–1.15`

Foreground must never hide an interactable, landing edge or enemy approach.

## Lighting Rules

- backgrounds can be painterly and volumetric
- gameplay silhouettes use harder separation
- practical light sources should explain most illumination
- strong cyan/amber/magenta effects are reserved for temporal state, interaction and danger
- avoid constant bloom over the whole scene
- searchlights and fog are depth tools, not decoration spam

## UI Direction

HUD should feel like a Veyr instrument, not a web dashboard.

Normal gameplay budget:

- compact objective chip: top-left
- level/checkpoint chip: top-right
- timeline instrument: bottom-center
- echo state integrated into or beside the timeline instrument

The center and lower-middle gameplay area remain clear.

UI materials:

- soot-black glass/metal base
- thin brass trim
- timeline colors only for state
- restrained motion
- high contrast text

Reduced-motion and reduced-flash settings remain first-class constraints.

## FX Language

### Timeline Shift

Sequence target: 180–300 ms.

1. anticipation ring / gauntlet pulse
2. Elias afterimage separation
3. brief temporal tear
4. world state swap
5. short settling particles

### Echo

- cyan transparent Elias
- clear spawn pulse
- afterimage trail while replaying
- stronger outline when anchored on a plate
- dissolve rather than hard disappearance

### Temporal Fracture

- subtle hairline cracks for ambient instability
- cyan active fracture for puzzle-relevant state
- magenta violent rupture for danger

## Typography

Use narrow Art Deco-inspired display faces for headings when available, but keep body copy highly readable. Do not bake essential gameplay text into raster art.

Until a final licensed font is selected, use intentional system fallbacks rather than shipping unverified font files.

## Production Rule

Concept boards are references, not shippable textures. Game-ready assets must have documented dimensions, anchors, states and timeline variants in `docs/art/asset-technical-spec.md` before they are integrated.
