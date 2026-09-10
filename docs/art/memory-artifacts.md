# Illustrated Memories

Nine memory collectibles open an inspectable, full-screen DOM overlay instead of the ordinary dialogue box. The world and echo simulation remain paused until the overlay closes. Recovered entries can also be read in the Memory Vault book from the main menu, pause menu, HUD button or J during gameplay and dialogue. Unrecovered entries have no art or narrative text.

## Contents

| Existing save ID | Artifact | Presentation |
| --- | --- | --- |
| reactor-daughter-sketch | Three Suns | Mara's crayon drawing and a handwritten-style caption |
| rain-payphone | The Window Seat | A tram photograph and the remembered phone message |
| rain-lamp-letter | The Long Way Home | A complete letter from Mara, rendered on illustrated stationery |
| canal-bell-token | A Spare Fare | A worn token and Mara's reason for carrying a spare |
| market-photo-strip | An Extra Second | Four photo-booth portraits of Elias and Mara |
| hotel-room-key | Room 00 | A room key and the memory of postponed departures |
| archive-unsent-letter | The Letter He Kept | Elias's unfinished letter to Mara |
| crownline-paper-crown | A Small Kingdom | A crown folded from tram tickets |
| reliquary-first-second | Tomorrow | The calibration notebook, with the next page empty |

The former colleague note at rain-lamp-letter is now Mara's pre-loss letter, as requested. Its existing collectible ID remains unchanged, so prior saves unlock the new view without migration. The archive still reveals the Core's limitations. Elias's later unfinished response echoes her ordinary invitation without suggesting resurrection.

## Implementation

- src/game/content/memory-artifacts.ts owns the typed image manifest, alternative text, inscriptions, letters and titles.
- src/ui/MemoryArtifactView.ts owns rendering, keyboard focus containment and abortable listeners. Required prose is escaped and is real selectable DOM text, never baked into an image.
- src/ui/memories.css owns the scrolling reading surface, responsive columns and stationery treatment. The header remains available while content scrolls. Photographs and objects are never cropped; letter paper is a decorative cover texture that may crop peripheral decorations at narrow widths.
- UIManager owns view lifecycle. The book suspends the underlying dialogue or pause DOM, restores it on close, and returns focus. Clearing or replacing an overlay destroys its handlers.
- GameScene pauses Arcade Physics and simulation while the book is open. Closing resets input before resuming, while a prior pause or focus loss still requires explicit resume.
- MemoryVaultModel owns ordered spreads, collection/read filtering and bookmark selection; MemoryVaultView renders live text, contained focus, keyboard and gamepad navigation.
- Save v2 now additionally persists readMemoryFragmentIds and lastViewedMemoryId. Existing saves default to unread, and reading does not change the gameplay save timestamp.

## Art Delivery

All nine original PNG illustrations are in assets/memories/. They were created using the built-in ImageGen tool and visually inspected as generated. Each delivered image is 1254 x 1254; their combined source size is 23,660,266 bytes. The game requests only the opened artifact image, not all nine at boot. Required lettering is deliberately absent from the raster sources.

Full submitted prompts, per-file dimensions, bytes and SHA-256 hashes are recorded in memory-artifact-provenance.json. No external stock images were downloaded. These are new source assets; existing campaign artwork was not replaced.

## Memory Vault Book

The new 1536 x 1024 background at assets/ui/memory-vault-book.png is an original blank burgundy clothbound book. Desktop uses two scrollable facing pages; narrow screens use one continuous reading surface with fixed navigation. Only the selected memory image is requested. Letters remain actual selectable text. Full prompt and source checksum: memory-vault-provenance.json.

## Verification

- PASS: TypeScript and standard Vite production build using npm run build.
- PASS: browser-independent checks cover artifact mapping, PNG dimensions, image budget, both letters, escaped markup, locked pages, read/save migration, bookmark retry and gamepad button edges.
- Earlier evidence: scripts/check-art.ps1 decoded 23 images. The September 10 invocation via Windows PowerShell was blocked by its script execution policy; it was not bypassed. The new book dimensions/checksum are checked separately in the system suite.
- PASS: Playwright discovery, 57 tests in 17 files.
- NOT RUN: Browser rendering and keyboard playtests, because the existing task browser denial remains in effect. No screenshot approval is claimed.

The memory-artifacts.spec.ts covers all nine book spreads at desktop, portrait and compact-landscape sizes with 125% text, scrolling/focus return, screenshots and failed-image fallback. memory-vault.spec.ts covers gameplay suspension, dialogue/pause preservation, bookmark reload and focus loss. The collection smoke test checks the popup reveal, frozen player/timeline, persisted unlock and clean resume. These browser cases are authored, not locally executed.

To verify manually after browser access is enabled: collect the tutorial drawing; close with Escape and confirm gameplay resumes; open Memory Vault with J and inspect the drawing again; inspect Mara's letter and the photo strip at 125% text; revisit after reload; verify locked entries reveal no artwork. Open the book during dialogue and pause, then verify exact restoration. Finish by reviewing all nine spreads.

## Publication

Publication status is tracked in ../release-status.md. Git access is now available; browser access to the local game is still blocked by the task's saved preference. Source checks are not a visual sign-off.
