# Campaign Release Candidate Status

Updated September 10, 2026. This is an expanded, integrated campaign alpha, NOT a release-certified finished game. No full-campaign playtime estimate is validated.

## Implemented

- Twelve connected stages from Folded Reactor to Still Hour, including Hourglass Hotel, Archive of Unsaid Things, Crownline Rooftops, and Core Reliquary.
- Ordered timeline switches, echo-powered remote switches, persistent anchor binding, per-level camera metadata, and live objective checklists.
- Save v2 migration for both prior v1 formats, solved switches, checkpoint timeline, memories, visited story zones, completed levels, and ending state.
- A connected narrative centered on Elias Varren and Mara. The girl is a repeating memory signal, and the Keeper is foreshadowed as a later Elias.
- Seven-beat ending with an explicit No More Corrections action, collected-memory count, and return to menu.
- Memory Vault book from the main and pause menus, HUD button and J during gameplay/dialogue. It has a contents spread, nine memory spreads, locked pages, unread markers and a persistent last-read bookmark. Starting again asks before replacing existing progress.
- Nine illustrated memory popups with original keepsake art, Mara's letter, Elias's unfinished reply, captions, keyboard focus handling and journal replay. Details: docs/art/memory-artifacts.md.
- Twelve newly generated 1672 x 941 environment paintings and two new transparent character atlases. Each stage has a unique matte.
- Explicit parallax renderer: far matte, middle architecture, gameplay, near ceiling details, and timeline-dependent weather. Backdrops load per stage and keep their aspect ratio.
- Production device, platform, memory, checkpoint, and enemy visuals applied across the campaign. Old backdrop and painted-menu monkey patches are no longer active.
- HUD placed above the playfield, compact-layout rules, scroll-safe menus and cinematics, smooth canvas rendering, and updated intro/ending art.
- Recording uses simulation time. Respawn resets the Arcade body. Interaction processing stops after a hazard or dialogue transition.
- Checkpoint/route repairs in Lock Street, canals, station, market, and finale, including low-ceiling overlap found by the new spawn check.
- Focus-loss pause with explicit resume, input reset, preserved story overlays and scene-listener cleanup.
- Visible persistence-failure status and truthful Save Now feedback with recovery after a successful retry.

## Verification

| Check | Result |
| --- | --- |
| TypeScript + production build, npm run build | PASS |
| Browser-independent system checks, npm run test:systems | PASS, 32 checks |
| Source PNG checks | Earlier decode/alpha pass on 23 images; new book header/dimensions/checksum covered by system tests |
| PowerShell art-check rerun, September 10 | BLOCKED by Windows PowerShell script execution policy; no policy bypass |
| Playwright test discovery, node node_modules/@playwright/test/cli.js test --list | PASS, 57 tests |
| Local Vite startup | Started on port 5173; recent rebuild/reload activity appears in server logs |
| Actual browser smoke/visual execution | BLOCKED, not passed |
| Full keyboard traversal through the campaign | NOT PERFORMED |
| Main publication / production deploy | Preparing publication from origin/main 56a4f2b; no deployment success claimed in this snapshot |

Source images were inspected as generated. That is NOT an in-game visual pass. Added browser coverage includes 24 stage/viewport combinations with three timeline screenshots each, actual renderer pixel sampling, HUD overlap, the memory journal, saved switches, ending, and eight real hotel staircase jumps. The staircase case intentionally isolates movement from story popups; it is not a full campaign playthrough.

The standard Vite build now succeeds under the expanded filesystem permissions. On September 10, the browser still explicitly rejected http://127.0.0.1:5173 because of a saved user preference. No alternate browser, Playwright invocation or indirect browsing workaround was used after that rejection. The local runner remains available for environments where Vite config subprocess startup fails.

## Publication State

Remote main was read at 56a4f2b4dfc344795c660ea7db94418dd183d4d3 and reconciled into the local source before further edits. Its newer save v2, narrative, input, production-art, and Pages work was preserved.

Git access is now available. Fetch succeeded, the old local HEAD was verified as an ancestor of origin/main, and a mixed reset aligned local metadata to 56a4f2b without changing any working source or untracked files. Earlier Git/GitHub write denials are historical, not the current publication blocker.

The local Pages workflow now requires build, systems tests, and browser smoke tests before deployment and uploads playtest evidence. This workflow change is not active remotely yet.

User-owned .agents/, AGENTS.md, and docs/game-architecture.md were left untouched and must not be included accidentally in a release commit.

## Release Gates

1. Remove the saved browser denial before local browser playtesting. Git publication is separately available.
2. Run all browser tests and inspect actual screenshots at desktop, compact landscape, portrait menus, and text scale 125%.
3. Play New Game to ending with ordinary keyboard input, no fixture positioning. Verify every required jump, ordered puzzle, checkpoint reload, and temporary echo recovery.
4. Inspect sprite contours and animation cadence in motion. The current shift sequence repeats one authored pose with separate FX; authored activation/landing cycles are still polish candidates.
5. Run browser verification of the implemented focus-loss/save-failure fixes, then controller menus and a second browser. Touch controls are not implemented.
6. Tune difficulty and narrative timing from that playtest, then publish focused commits on top of current main and verify Pages deployment.

Suggested commit groups: finish the connected twelve-stage campaign; integrate campaign story and memory journal; add production character/background art and parallax; gate release on gameplay and visual regression checks.

Details: docs/art/campaign-production-manifest.md and docs/art/campaign-asset-provenance.json.

Memory Vault review fixes: fresh gamepad button edges now work; held buttons do not repeat; book padding follows the actual book width; save failure status refreshes when the suspended menu returns; reopening a page retries a failed bookmark write. Eight new browser-independent checks cover these model/save/input contracts and the book source asset. Three added browser scenarios are authored but not locally executed.

Quality findings, per-level playtest ledger and the separate Steam release track: docs/quality-and-steam-readiness.md.
