# Quality Review And Steam Readiness

Date: 2026-09-10. Status: CAMPAIGN ALPHA, NOT RELEASE APPROVED.

## Evidence Boundary

The current twelve-stage campaign has not been played end to end. Browser access was explicitly denied again on September 10 by this task's saved preference, despite the user's chat authorization and expanded filesystem permissions. No alternate browser or indirect browsing workaround was attempted. Existing screenshot locations contain no current locally reviewed in-game capture set. Source illustrations can be inspected locally, but they cannot prove in-game framing, animation, puzzle readability, or frame rate.

The standard production build and 32 browser-independent checks pass. All 57 browser tests are discoverable, not locally executed. Main commits 59b87f6 and 5df763c were pushed. The normal Pages workflow passed its first 38 browser cases before the agent prematurely canceled the slow run; no visual review or full campaign completion is inferred from that partial CI result. Publication/deployment evidence is tracked in release-status.md, separately from local browser and full-campaign sign-off.

## Findings

1. RELEASE BLOCKER: no continuous ordinary-input campaign completion evidence. Static geometry and satisfiable flags are necessary but do not prove that timing, collision and echo puzzles are actually playable.
2. RELEASE BLOCKER: no in-game aesthetic sign-off. Gameplay platforms/devices use crisp generated vector textures, while characters and backgrounds use painterly imagery. Their combined visual consistency needs inspection at gameplay scale; this is a risk, not a claim of a verified rendered defect.
3. ART FIX REQUIRED: the Elias source atlas visibly has small red/yellow edge artifacts around coat and hair silhouettes. Inspect the runtime alpha composite on both dark reactor and bright rooftop backgrounds, then clean the source and re-test. Do not replace it with a baked-checkerboard asset.

   Two September 10 ImageGen cleanup candidates were rejected: both were RGB PNGs with a painted checkerboard rather than real alpha. Neither was copied into the repository or referenced by the game. The original transparent source remains unchanged.
4. ANIMATION FIX REQUIRED: activation repeats one source pose; landing/jump frames are repacked from a small pose set. The source pose quality is not enough to certify timing, foot sliding or loop smoothness. A dedicated animation pass is needed before a premium release claim.
5. AUDIO POLISH REQUIRED: the current AudioManager has three sustained ambience oscillators and short synthesized cues. It is a functional sound system, not yet a reviewed level-by-level soundscape or final mix. Listening review remains outstanding.
6. DESKTOP RELEASE MISSING: the repository builds a web application. There is no packaged, tested desktop distribution or verified Steam launch configuration. Do not advertise desktop, controller, Cloud, achievements or Deck support beyond implemented and tested features.

## Preliminary Aesthetic Assessment

This assessment concerns source material, not every rendered level. No overall numerical game score is justified yet.

- Strongest: the memory artifacts give the relationship specific everyday details, and their photo/paper framing makes the different visual medium intentional. Live text is preferable to illegible generated lettering.
- Strong: the inspected reactor has a clear central Core silhouette; the hotel has a distinctive burgundy/jade interior; the rooftops provide a lighter visual and emotional release. These landmarks distinguish chapters without changing the game's architectural identity.
- Needs care: hotel balconies and railings are densely detailed and can compete with actual traversable ledges. Their brightness and parallax placement must be judged with the player and devices present.
- Weakest verified source element: character contours and the limited animation pose set. Fixing the player is a higher priority than adding another decorative backdrop.
- Unrated: HUD obstruction in motion, all-timeline readability, popup composition at 125% text, camera behavior, ending staging and sound/image synchronization. They require actual rendered evidence.

## Campaign Playtest Ledger

Every row remains NOT PLAYED. Complete the chain from New Game using ordinary keyboard input, without fixture positioning or direct flag changes. Separate fixture-based regression screenshots are useful but do not count as completion.

| Stage | Mandatory review focus | Status |
| --- | --- | --- |
| Folded Reactor | Teaching movement, first timeline puzzle, drawing, checkpoint recovery | NOT PLAYED |
| Lock Street | First independent puzzle, Keeper clue, enemy spacing | NOT PLAYED |
| Rain District Crossing | Rain readability, route timing, both memories | NOT PLAYED |
| Glasshouse Station | Mara's repeating signal, uninterrupted route after dialogue | NOT PLAYED |
| Platform 13 | Timeline traversal, station checkpoint, exit requirements | NOT PLAYED |
| Bellweather Canals | Floodgate sequence, safe respawn clearance, optional token | NOT PLAYED |
| Minute Market | Key route, overhead clearance, photo strip | NOT PLAYED |
| Hourglass Hotel | Vertical camera, eight staircase jumps, echo/remote switch, room key | NOT PLAYED |
| Archive of Unsaid Things | Ordered record/testimony/release, reload midway, letter | NOT PLAYED |
| Crownline Rooftops | Timeline spans against bright art, crown route, camera edges | NOT PLAYED |
| Core Reliquary | Three locks, echo recovery, upper route, final memory | NOT PLAYED |
| Still Hour | All anchors, Keeper reveal, explicit final choice, ending persistence | NOT PLAYED |

For each run record elapsed time, deaths, resets, unclear clues, softlocks, inputs, build identity and screenshot paths. At least one pass should collect all nine memories; another should prove that optional memories do not block the ending. Test reload before/after puzzle commitments and every checkpoint timeline. Have unfamiliar human testers check clue comprehension after the internal pass; an author knowing the solution cannot validate discovery alone.

## Release Criteria

These are project acceptance targets, not Valve requirements:

- Zero crashes, lost-save regressions, impossible mandatory jumps or puzzle softlocks in the complete campaign pass.
- No sprite edge contamination, unreadable text, UI overlap, empty parallax edges or ambiguous collision silhouettes in reviewed screenshots and motion capture.
- Test 1366x768 and 1920x1080 gameplay, 844x390 compact landscape, 390x844 menus, 100%/125% text, reduced motion/flashes, and a second browser.
- Measure frame times and memory growth on a named reference machine. Target stable 60 fps during normal play and no progressive restart leak; no performance claim is made before measurement.
- Verify focus loss during play, recording, dialogue and memories; explicit resume must not replay held input. Verify storage denial and successful retry.
- Complete a sound mix pass and an independent narrative read-through. Store screenshots and trailer must represent the actual release build.

## Fixes Delivered In This Review

- FocusLossGuard pauses on window blur or document hiding. Returning focus does not resume automatically. A story/memory overlay is retained, then leads to the pause menu when closed.
- InputController resets keyboard edges and held gamepad action history at resume. Scene shutdown removes focus listeners.
- SaveManager exposes persistence failure/recovery without losing its in-session state or overwriting the last successful disk save on a failed write.
- Main menu, pause and options show a persistent save warning. Save Now does not play a success cue or claim success after a failed write.
- Four added system tests pass. Three browser reliability cases were added but are not executed under the current permission restriction.
- Memory Vault is now a persistent book. Eight more system checks cover source art, locked/read pages, escaped letters, bookmarks, legacy saves, retry after storage failure, and held/new gamepad button edges. Three new browser cases cover gameplay suspension, nested dialogue/pause and reload/focus loss; they are not locally executed.

## Steam Track

Web production is a separate deliverable from a Steam release. A sensible first target is a Windows desktop package containing the existing Phaser game, not an engine rewrite. Packaging, local persistent saves, offline startup, fullscreen/window modes, clean shutdown, install/update behavior and Steam launch all need real testing. No desktop runtime has been selected or introduced in this pass.

Valve reviews the store page and product build, and the build must launch on the operating systems claimed on the page. Listed features must actually be implemented. See [Steamworks Review Process](https://partner.steamgames.com/doc/store/Review_Process).

SteamPipe is the build/depot upload workflow, with app configuration and launch options. A GitHub Pages deployment is not a Steam upload. See [Uploading to Steam](https://partner.steamgames.com/doc/sdk/uploading).

The Content Survey covers player-facing pre-generated AI artwork and narrative. The generated character, environment and memory assets therefore need an accurate disclosure, alongside a provenance review of older repository assets. Do not submit a blanket "no AI" answer. See [Steamworks Content Survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey?language=english).

Store screenshots must depict gameplay rather than standalone concept art. The generated PNGs are source assets, not a substitute for release-build screenshots. See [Steamworks Review Process](https://partner.steamgames.com/doc/store/Review_Process).

Steamworks account/app access, publisher details, agreements, pricing and public store submission remain owner-controlled steps. No purchase, Steam submission or release action was performed.

## Next Execution Order

1. Publish the existing checked alpha on current main and verify the normal Pages deployment, preserving remote history and user-owned files. Do not describe this as a finished Steam release.
2. Remove the saved local browser denial, execute the browser suite, inspect captures, complete the continuous campaign and fix the findings.
3. Polish character contours/animation, tune levels and mix sound based on actual play evidence; publish verified focused updates.
4. Validate controller flow, another browser, performance and an independent human playtest.
5. Package and test the desktop release, then prepare Steam materials and owner-approved submission.
