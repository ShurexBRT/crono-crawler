# Folded Reactor — Production Backlog

This backlog implements `folded-reactor-production-agreement.md` in dependency order.

## P0 — Foundation

### FR-ART-001 — Replace platform visual architecture

- create `PlatformVisualRenderer`
- keep collision rectangles in `levels.ts`
- compose authored left/mid/right/support modules over geometry
- support timeline family selection
- remove stretch-only Folded Reactor platform rendering once validated

Target production keys:

- `reactor-floor-past-*`
- `reactor-floor-present-*`
- `reactor-floor-future-*`
- `reactor-catwalk-*`
- `reactor-gantry-*`
- `reactor-machine-housing-*`
- `reactor-broken-span-*`

### FR-ART-002 — Folded Reactor layer system

Create level-owned view layers:

- far backdrop
- midground architecture
- gameplay environment decoration
- foreground silhouettes
- atmosphere / FX

Requirements:

- timeline-aware art state
- reduced-motion support
- camera-safe parallax
- no collision ownership inside art layer

### FR-ART-003 — Production asset manifest cleanup

- stable production keys only
- no new direct source path references in gameplay code
- create explicit migration/legacy list

---

## P1 — Canonical Characters

### FR-CHAR-001 — Elias canonical gameplay seed

Deliver:

- approved side-view idle seed
- transparent source
- bottom-center feet anchor
- gameplay-scale preview

Then produce:

- idle strip
- walk strip
- run strip
- jump strip
- fall strip
- land strip
- interact strip
- timeline-shift strip

### FR-CHAR-002 — Rustmite canonical seed + animation family

Deliver:

- approved side-view seed
- patrol strip
- alert strip
- attack/contact telegraph strip
- destroyed strip

### FR-CHAR-003 — Mara canonical seed + early apparition family

Deliver:

- idle/apparition loop
- turn/look-back
- step/walk
- gesture
- dissolve

### FR-CHAR-004 — Keeper canonical seed + early campaign family

Deliver:

- idle silhouette
- slow walk
- turn
- gauntlet pulse
- vanish

---

## P1 — Shared Interactables

### FR-OBJ-001 — Temporal Anchor Beacon

States:

- dormant
- stabilizing
- active

### FR-OBJ-002 — Door / gate family

Timeline variants:

- Past
- Present
- Future

States:

- locked
- opening/open

### FR-OBJ-003 — Pressure plate family

- raised
- depressed
- timeline material variants

### FR-OBJ-004 — Lever family

- off
- on
- readable handle-angle state

### FR-OBJ-005 — Hazard edge family

- unstable metal
- toxic / drainage / void edge language
- no color-only danger communication

---

## P1 — Memory Artifact System

### FR-NAR-001 — DOM artifact popup

Required behavior:

- open on fragment collection
- temporarily block movement
- show artifact image
- optional title/date/caption
- keyboard close
- gamepad-compatible close action
- reduced-motion safe

### FR-NAR-002 — First artifact: Folded Paper

Production art:

- physical folded child's note
- period-correct paper / handwriting feel
- story line embedded in artifact art, not duplicated as generic modal text
- recommended copy: `You said soon.`

### FR-NAR-003 — Memory Archive data model

- fragment ID
- artifact asset key
- title
- optional date/location
- collected flag
- archive ordering

### FR-NAR-004 — Save integration

- persist collected fragment IDs
- prevent duplicate first-time reveal behavior after collection unless intentionally replayed from archive

---

## P2 — Environment Production

### FR-ENV-001 — Far backdrop

- reactor shaft
- deco arches
- distant rings / turbines
- Veyr industrial depth
- timeline versions or authored timeline overlays

### FR-ENV-002 — Midground architecture kit

- pipe clusters
- service towers
- turbine bodies
- noninteractive catwalk silhouettes
- large gauges/clocks
- suspended frames

### FR-ENV-003 — Foreground silhouette kit

- chains
- pipes
- beams
- cable bundles
- partial railings
- machine frame edges

### FR-ENV-004 — Atmosphere

- steam
- haze
- controlled sparks
- practical blinking lights
- restrained temporal dust
- searchlight / light cone where appropriate

---

## P2 — FX / UI

### FR-FX-001 — Timeline shift final pass

- anticipation from gauntlet
- afterimage split
- fast structural transition
- restrained ring / tear
- settle under ~300 ms
- reduced-motion variant

### FR-FX-002 — Echo final pass

- authored temporal duplicate treatment
- afterimage trail
- replay / holding state distinction
- no simple cyan tint as final treatment

### FR-FX-003 — Checkpoint / switch / pickup feedback

- physical state change first
- glow/particles secondary

### FR-UI-001 — HUD V2 final pass

- objective upper-left
- level/checkpoint upper-right
- temporal instrument bottom-center
- echo integrated

### FR-UI-002 — Dialogue / artifact shared framing

- dark deco shell
- soot-black base
- thin brass trim
- high-contrast type

---

## P3 — Legacy Retirement

### FR-LEG-001 — Character legacy migration

After replacements pass QA:

- move retired source art to `assets/legacy/characters/` only if still useful
- remove old manifest keys
- remove runtime crop heuristics / fallback textures that are no longer needed

### FR-LEG-002 — Environment legacy migration

- remove Folded Reactor stretched-platform runtime route
- remove obsolete backdrop overrides
- remove procedural checkpoint / Memory Fragment / Rustmite placeholders once production art is proven

### FR-LEG-003 — Legacy reference guard

Add a test or source check that production runtime manifests do not reference `assets/legacy/`.

---

## P3 — QA / Sign-Off

### FR-QA-001 — Automated validation

- TypeScript
- build
- boot gate
- smoke suite
- fragment artifact interaction test
- timeline screenshot capture

### FR-QA-002 — Visual review set

Capture:

- Present start
- Past bridge state
- Future traversal state
- Memory Artifact popup
- Rustmite encounter
- checkpoint activation
- Echo puzzle state

### FR-QA-003 — Live production sign-off

Production-complete only when:

- Pages deploy is green
- no legacy/prototype art unexpectedly appears
- live Folded Reactor visually matches or exceeds the approved Visual Bible target
- gameplay remains readable at normal play speed

---

# Immediate Execution Order

1. FR-ART-001 platform renderer
2. platform production source set
3. FR-ENV-001/002/003 layer scaffolding
4. Elias canonical seed
5. Rustmite canonical seed
6. Memory Artifact popup + Folded Paper
7. shared interactables
8. Mara / Keeper early family
9. FX + HUD polish
10. legacy cleanup
11. full QA / live sign-off
