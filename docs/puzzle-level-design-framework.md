# Chrono Crawler Puzzle-Level Design Framework

This document is the design contract for future Chrono Crawler levels. It does not lock story beats or final level layouts. Its purpose is to keep the game a readable puzzle-platformer instead of a sequence of corridors with switches.

## Core Rule

A Chrono Crawler puzzle should ask the player to understand **when** a route, object, or action belongs — not merely find the correct colored timeline.

Changing timeline should meaningfully change at least one of:

- collision
- route topology
- hazard state
- interaction availability
- enemy pressure
- information available to the player

A palette-only timeline change is presentation, not a puzzle.

## Level Rhythm

Every authored level should contain four phases.

### 1. Teach

Introduce one idea in a safe space.

The player should be able to see cause and effect without losing meaningful progress. Do not combine the new idea with an enemy, precision jump, or long echo recording on first contact.

### 2. Twist

Change one assumption about the mechanic.

Examples:

- the same platform exists in a different timeline than expected
- the switch is accessible now but its consequence matters later
- an echo must perform the old action while Elias takes the new route
- the safest-looking timeline becomes hazardous

### 3. Combine

Use the new idea together with one mechanic the player already understands.

The combination should create a new reasoning problem rather than simply make execution busier.

### 4. Mastery

End with a compact room or traversal sequence where the player can recognize the complete logic before executing it.

The mastery room should feel like: "I know what this room wants from me" followed by planning and execution — not trial-and-error against hidden rules.

## Puzzle Readability Rules

### Show the problem before hiding the answer

The player should normally encounter the locked door, missing bridge, unreachable ledge, dangerous route, or visible objective before the mechanism that solves it.

### Keep causal distance understandable

A switch may affect something off-screen, but the game must communicate the relationship through framing, sound, signage, wiring, repeated visual language, or a short return route.

Avoid switches whose only feedback is "something happened somewhere."

### One surprise at a time

A puzzle may combine several known systems. It should not introduce two unrelated new rules in the same failure loop.

### Failure should teach

After a failed attempt, the player should usually understand one more fact about the room.

If failure communicates nothing except "too slow" or "wrong timeline," redesign the setup before tuning difficulty.

### Reset cost stays low

Chrono Crawler is about reasoning through time, not replaying solved platforming. Checkpoints should minimize repetition once the player has proven a section.

## Timeline Design Language

### Past

Typical identity:

- intact structures
- analog or older mechanisms
- overgrowth and forgotten access paths
- fewer modern powered systems
- stable traversal that may take the long route

Good Past questions:

- What used to exist here?
- What action can Elias leave behind?
- What route existed before the city sealed itself?

### Present

Typical identity:

- powered machinery
- switches and controlled access
- most legible state of the environment
- active urban hazards

Good Present questions:

- What can still be operated?
- What choice can be latched for another timeline?
- What information does the functioning city reveal?

### Ruined Future

Typical identity:

- collapsed barriers
- missing safe structures
- exposed maintenance spaces
- corrosion and dangerous shortcuts
- honest consequences of earlier systems

Good Future questions:

- What is gone now, and does its absence help?
- Which shortcut becomes possible because something collapsed?
- What cost does the fastest route introduce?

## Echo Design Rules

Echo is the signature mechanic. Do not reduce it to "record yourself standing on a plate" in every level.

Use echo for different problem classes:

### Spatial persistence

The old Elias remains somewhere the current Elias cannot remain.

### Temporal cooperation

The echo performs an action in one timeline while Elias acts in another.

### Sequencing

The recording creates a delayed chain of actions. The interesting decision is when to start and what route to record.

### Moving reference

The echo itself becomes a clock: the player times another traversal or interaction against where the echo will be.

### Information replay

A future mechanic may allow the echo to reveal or repeat information rather than physically hold a switch. Add this only if a level design genuinely needs it.

Avoid:

- identical pressure-plate setup repeated in adjacent levels
- recordings longer than necessary just to create waiting
- hidden requirements that force rerecording without new insight
- precision platforming during long mandatory recordings unless the recording itself is the challenge

## Enemy Role

Enemies are currently puzzle pressure, not combat targets.

An enemy earns its place if it changes:

- when the player can cross
- which timeline is safe
- where an echo can be recorded
- which route is preferable

Do not add enemies merely to fill empty floor space.

A future timeline-sensitive enemy should change behavior according to a rule the player can learn and exploit.

## Room Templates

These are reusable structures, not copy-paste solutions.

### Visible Lock / Remote Cause

1. Player sees blocked destination.
2. Player finds interaction elsewhere.
3. Timeline shift reveals how the two are connected.
4. Return path becomes shorter after solving.

Best for: switches, doors, environmental storytelling.

### Two-Self Room

1. Elias can reach A or B, not both in one continuous state.
2. Echo records A.
3. Current Elias uses a different timeline/route to reach B.
4. Both states overlap briefly or remain latched.

Best for: echo mastery.

### Three-Timeline Route

1. Destination is visible from the beginning.
2. Past provides first structural segment.
3. Present provides an interaction or powered segment.
4. Future removes a final obstruction or exposes a shortcut.

Best for: timeline mastery. Keep shifts purposeful; three shifts are not automatically a better puzzle than two.

### Route Choice / Optional Memory

1. Critical path is readable and moderate risk.
2. Harder or less obvious timeline route leads to a memory fragment.
3. Optional route teaches or foreshadows something useful but is not required for basic progression.

Best for: replay value and environmental narrative.

### Reversal Room

1. Player learns an apparent rule early in the level.
2. Later room preserves the same visual grammar but reverses one condition.
3. The player solves it by understanding the system rather than memorizing the earlier answer.

Best for: the Twist phase.

## Difficulty Budget

Do not increase all difficulty axes simultaneously.

Axes include:

- reasoning complexity
- number of timeline shifts
- recording length
- platforming precision
- enemy pressure
- hazard density
- distance from checkpoint
- amount of hidden information

A hard reasoning puzzle should usually have forgiving execution. A demanding movement section should use already-understood logic.

## Story Integration

Every level should eventually have:

- **one required story beat** — short enough that replaying the level does not become irritating
- **one environmental motif** — visual evidence of what this district was and what the fracture did to it
- **zero to two optional lore beats** — memory fragment, room, sign, overheard system message, or visual reveal
- **one thematic relationship to the mechanic** — the gameplay idea should echo the story idea when possible

Example principle, not locked story:

> A level about an echo holding an old choice is a natural place to explore Elias refusing to let a past decision end.

Do not force metaphors when they weaken the puzzle. Gameplay clarity comes first.

## Level Design Worksheet

Use this before implementing a new level.

### Identity

- Level name:
- District/location:
- Narrative purpose:
- Emotional tone:
- Approximate duration:

### Core Puzzle Idea

- New idea, if any:
- Known mechanics being reused:
- What the player sees first:
- What wrong assumption we expect:
- What realization solves the level:

### Four-Phase Progression

- Teach room:
- Twist room:
- Combine room:
- Mastery room:

### Timeline Table

| Element | Past | Present | Ruined Future |
| --- | --- | --- | --- |
| Main route | | | |
| Primary interaction | | | |
| Hazard/enemy pressure | | | |
| Optional route | | | |
| Visual story clue | | | |

### Echo Role

- Is echo required?
- Problem class: spatial persistence / temporal cooperation / sequencing / moving reference / none
- Shortest useful recording:
- What prevents this from being another plate puzzle?

### Failure And Reset

- Likely first failure:
- What the player learns from it:
- Checkpoint placement:
- Maximum solved content repeated after failure:

### Narrative Layer

- Required story beat:
- Environmental motif:
- Optional memory/lore:
- Keeper/Mara/girl foreshadowing, if relevant:

### Production Needs

- Existing objects sufficient?
- New object/system genuinely required?
- New art tiles/props:
- Camera requirements:
- New test coverage:

## Gate Before Coding

A level is ready for implementation when we can answer these five questions in one sentence each:

1. What is the player trying to reach or accomplish?
2. What rule prevents them from doing it immediately?
3. What realization changes their plan?
4. Why does the solution specifically belong in Chrono Crawler?
5. What new understanding does the player carry into the next level?

If we cannot answer those, drawing more platforms is not level design yet.
