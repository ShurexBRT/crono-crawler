# Chrono Crawler — Campaign Environment Art Roadmap

## Purpose

This document defines the visual identity, layer stack and reusable environment families for the current eight-level campaign. It is the bridge between the Visual Bible and production asset generation.

Every production level must contain:

1. far backdrop
2. large midground architecture
3. gameplay plane
4. foreground silhouettes
5. atmosphere / FX

Parallax should support depth, not distract from puzzle readability.

---

## Shared Environment Families

### Reactor / Core Family

Used by:

- The Folded Reactor
- portions of The Still Hour

Shared language:

- massive machinery
- ring / clock geometry
- vertical shafts
- dark steel, brass ribs, conduits
- steam, searchlights, heavy industrial silhouettes

### Street / Civic Family

Used by:

- Lock Street
- Rain District Crossing

Shared language:

- art-deco facades
- elevated transit structures
- fire escapes
- street lamps
- bridge / utility infrastructure
- rain, wet surfaces, distant clocktower silhouettes

### Transit / Station Family

Used by:

- Glasshouse Station
- Platform 13

Shared language:

- monumental train architecture
- glass canopies
- clocks and signage
- gantries
- signal systems
- rail tunnels / platform depth

### Canal / Utility Family

Used by:

- Bellweather Canals

Shared language:

- brick and riveted steel
- sluice gates
- drainage pipes
- lock machinery
- waterwheels
- mist / water reflections

### Market / Lived-In Veyr Family

Used by:

- The Minute Market

Shared language:

- dense rooflines
- awnings
- shop signage
- stacked windows
- chimneys
- fabric / smoke motion
- strongest feeling of ordinary life before the fracture

### Observatory / Final Family

Used by:

- The Still Hour

Shared language:

- observatory architecture fused with Chrono Core machinery
- ceremonial geometry
- giant rings
- impossible void breaks
- anchor pylons
- time shards / floating debris

---

# Level Backdrop Wireframes

## 1. The Folded Reactor

### Story role

Elias wakes inside the machine that broke Veyr. The player should feel small inside an impossible industrial cathedral.

### Far backdrop

- distant reactor shaft
- large circular / clock-like machinery
- high skylight or broken upper chamber
- distant structural ribs
- deep soot-black voids

### Midground

- turbines
- large pipes
- service towers
- suspended frames
- inactive catwalk silhouettes
- gauge / clock motifs

### Gameplay plane

- heavy reactor floors
- maintenance catwalks
- timeline bridge spans
- checkpoint
- first Memory Fragment
- doors / levers / pressure plates

### Foreground

- chains
- cables
- near-camera beams
- steam vents
- black machinery edges

### Motion

- slow far-layer drift
- restrained midground parallax
- steam / haze / occasional machine pulse

---

## 2. Lock Street

### Story role

First true street-level view of Veyr. The player discovers this is a lived-in city, not only a research complex.

### Far backdrop

- layered art-deco residential / commercial facades
- elevated rail silhouette
- distant clocktower
- wet night skyline

### Midground

- fire escapes
- balcony frames
- lamp posts
- signs
- gutters / drain pipes
- utility wiring

### Gameplay plane

- stoops
- ledges
- iron walkways
- alley gates
- echo plate puzzle
- patrol enemy lanes

### Foreground

- pipes
- signs crossing frame edges
- puddle reflection strips
- strong rain curtain

### Motion

- rain at multiple depths
- subtle sign / cable sway
- distant train-light movement optional

---

## 3. Rain District Crossing

### Story role

The player crosses open infrastructure and learns to read timeline-specific traversal as architecture, not only colored platforms.

### Far backdrop

- broad bridge / canal / road vista
- distant towers
- searchlights through rain
- open sky compared with Lock Street

### Midground

- bridge trusses
- utility poles
- signal lamps
- fences
- maintenance structures

### Gameplay plane

- Past stone / decorative bridge span
- Present industrial steel bridge
- Future fractured route / missing span
- pressure plate / echo sequence

### Foreground

- rain sheets
- near-camera girders
- cables

### Motion

- strongest horizontal parallax in early campaign
- layered rain speed

---

## 4. Glasshouse Station

### Story role

Public grandeur and memory. Mara's presence should feel closer inside a once-beautiful civic space.

### Far backdrop

- huge station hall
- cracked glass roof
- train shed
- monumental deco arches

### Midground

- clocks
- hanging lamps
- steel gantries
- station signs
- distant platforms / trains

### Gameplay plane

- peron platforms
- lifts
- switches
- rail gaps
- future catwalk

### Foreground

- hanging signs
- cables
- glass fragments
- steam

### Motion

- subtle vertical depth shift on hanging lamps / signs
- steam / dust in light shafts

---

## 5. Platform 13

### Story role

A point-of-no-return atmosphere. Transit infrastructure becomes darker, deeper and less welcoming.

### Far backdrop

- tunnel mouths
- rail lights vanishing into perspective
- deep terminal void

### Midground

- signal gantries
- pillar rows
- maintenance cranes
- cable clusters

### Gameplay plane

- dense platform chunks
- narrow catwalks
- switch pedestals
- enemy lanes

### Foreground

- partial train nose / rail poles
- tunnel haze
- heavy black framing

### Motion

- minimal architecture motion
- light pulse / occasional distant transit flicker

---

## 6. Bellweather Canals

### Story role

The hidden organs of Veyr. Water and city infrastructure become hazards and route logic.

### Far backdrop

- canal basin
- brickworks
- lock gates
- moonlit industrial waterway

### Midground

- waterwheels
- large drainage pipes
- sluice machinery
- bridge braces

### Gameplay plane

- culvert ledges
- drain grates
- gate bridges
- water / void hazards

### Foreground

- chain fences
- dripping pipes
- reeds or debris only if they fit the industrial location
- mist

### Motion

- animated water bands
- fog cards
- dripping / steam

---

## 7. The Minute Market

### Story role

The most human part of Veyr. The player should feel traces of ordinary life and understand Mara as a child, not only a mystery.

### Far backdrop

- dense stacked rooftops
- market windows
- clocktower
- chimney line

### Midground

- signs
- awnings
- rooftop ladders
- vents
- clothes / fabric lines

### Gameplay plane

- roof edges
- canopy tops
- alternate timeline routes
- ruined breaks

### Foreground

- cloth strips
- signboards
- chimney smoke
- near-rooftop silhouettes

### Motion

- cloth and smoke provide motion instead of machinery
- Past may include more warm window light / distant silhouettes

---

## 8. The Still Hour

### Story role

Truth, confrontation and acceptance. The Observatory and Chrono Core become one impossible final space.

### Far backdrop

- observatory silhouette fused with the Core
- enormous temporal rings
- void / city fracture
- cosmic darkness behind architecture

### Midground

- anchor pylons
- energy conduits
- floating debris
- shattered halo structures

### Gameplay plane

- ceremonial traversal platforms
- anchor pedestals
- Keeper barrier
- final three-anchor puzzle

### Foreground

- broken ring fragments
- time shards
- dark framing geometry
- temporal haze

### Motion

- slow ring rotation
- controlled spatial distortion
- floating fragments
- strongest timeline FX in campaign

---

# Parallax Rules

Default recommended factors:

- far backdrop: `0.05–0.15`
- midground: `0.20–0.40`
- gameplay: `1.0`
- foreground: `1.05–1.15`

Rules:

- never let parallax shift create false landing-edge information
- foreground must not cover enemies / interactables
- reduce or disable nonessential layer movement when Reduced Motion is enabled
- timeline shift can briefly offset layers differently, but must settle in under ~300 ms

---

# Environment Production Order

1. Folded Reactor full family
2. Lock Street / Rain Crossing shared street family
3. Glasshouse / Platform 13 transit family
4. Bellweather Canals utility family
5. Minute Market lived-in city family
6. Still Hour observatory/final family

Each family must ship with:

- backdrop art
- midground modular props
- gameplay platform family
- foreground silhouettes
- timeline variant rules
- atmosphere / FX notes
- performance budget

No later family should reintroduce stretched generic rectangles as final visual surfaces.