# Chrono Crawler Asset Technical Specification

## Runtime Target

- Internal game canvas: `1280 x 720`
- Scaling: Phaser FIT / centered
- Render direction: high-resolution stylized 2D
- Texture filtering target: antialiased / smooth for production art
- New vector game assets: SVG loaded at authored pixel dimensions
- Existing legacy PNG sheets remain supported during migration

## Global Anchor Rules

- Characters: bottom-center / feet baseline
- Enemies: bottom-center
- Doors: center
- Floor devices: center-bottom visual, collision authored independently
- Collectibles: center
- Background layers: center or top-left depending on layer type

Gameplay collision dimensions are never inferred from visible art.

## Elias Gameplay Atlas

Production normalized cell:

- frame cell: `320 x 300`
- feet baseline inside frame: `y = 289` for the campaign production atlas (legacy source used 278)
- gameplay rendered height: approximately `58–72 px` depending on camera framing

Existing animation sets retained for this pass:

| Animation | Frames | FPS | Loop |
|---|---:|---:|---|
| Idle | 3 | 3 | yes |
| Walk | 6 | 7 | yes |
| Run | 6 | 11 | yes |
| Jump | 3 | 8 | no |
| Fall | 1 | 1 | no |
| Timeline shift | 6 | 12 | no |

Future authored additions:

- land: 3–4 frames
- interact: 4–6 frames

## Temporal Anchor Beacon

- source canvas: `192 x 256`
- intended gameplay display in the current campaign: `54 x 72 px`
- collision / activation overlap remains authored separately
- visual states:
  - dormant
  - stabilizing
  - active

For the first production pass, one base SVG is used with runtime pulse/ring/light state feedback.

## Memory Fragment

- source canvas: `128 x 160`
- gameplay display: `28–40 px wide`, `40–56 px tall`
- states:
  - uncollected: amber core
  - collected/resolved: cyan dim state
  - pickup burst: runtime FX

## Rustmite

- frame cell: `128 x 96`
- gameplay display: `54 x 40.5 px`
- collision body: approximately `32 x 18 px` at gameplay scale
- first-pass frames:
  - patrol A
  - patrol B
  - alert

Future combat expansion can add attack/hit/destroyed without changing the base cell.

## Timeline Platform Module

Primary stretch-safe module:

- source: `512 x 96`
- intended display height: `32–56 px`
- horizontal size can stretch for current rectangle-authored levels
- variants:
  - Past
  - Present
  - Ruined Future

Production tilemap migration should later split this into:

- left cap: `128 x 96`
- middle tile: `128 x 96`
- right cap: `128 x 96`
- support: `96 x 192`
- broken cap variants

## Door / Gate

- source: `192 x 288`
- typical display: `88–112 px wide`, `132–176 px tall`
- variants:
  - Past locked
  - Present locked
  - Future locked
- open state in current gameplay can hide the blocking visual; future authored animation can use a dedicated open frame.

## Pressure Plate

- source: `160 x 48`
- typical display: level-authored width, `20–30 px` visual height
- variants:
  - Past
  - Present
  - Future
- active state uses depressed offset + runtime pulse.

## Lever Switch

- source: `96 x 128`
- typical display: `52–70 px wide`, `60–86 px tall`
- off/on state must be readable from handle angle
- first-pass production asset can use one base per timeline with runtime handle/state light overlay.

## Reactor Parallax

### Far Layer

- authored viewport: `1920 x 720`
- target scroll factor: `0.08–0.14`
- opaque SVG or PNG
- three timeline versions

### Mid Layer

- authored viewport: `1920 x 720`
- target scroll factor: `0.24–0.38`
- transparent or mostly transparent
- contains Chrono Core chamber, towers, pipes and large machinery
- three timeline versions

### Foreground Layer

- authored viewport: `1920 x 720`
- scroll factor: `1.05–1.12`
- transparent
- soot-black chains, conduits and frame silhouettes
- one neutral version with subtle timeline tint is acceptable for this target slice

## UI V2

Reference canvas: `1280 x 720`.

- objective chip: max `300 x 92`
- level/checkpoint chip: max `250 x 84`
- timeline instrument: target `420–520 x 72–94`
- echo status: target `120 x 64`, preferably integrated
- interaction prompt: transient, max `180 x 52`

Persistent HUD should occupy less than roughly 15% of the viewport during normal movement.

## FX Texture Budget

Most first-pass FX are runtime geometry/particles rather than sprite sheets.

- particle dot/shard: `8–24 px`
- temporal ring: runtime circle/arc
- afterimages: current Elias texture frame
- fracture streaks: runtime line/polygon
- bloom: short-lived blend-mode additive shapes

## Naming

New production assets live under:

```text
assets/production/
  characters/
  enemies/
  interactables/
  platforms/
  backgrounds/reactor/
  fx/
  ui/
```

Use lowercase kebab-case. Gameplay code references manifest keys only.
