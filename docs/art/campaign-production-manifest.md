# Campaign Production Art

## Delivered Sources

- Twelve original PNG backdrops, one for each stage, at 1672 x 941. The runtime manifest is `src/game/assets/backdrops.ts`.
- Elias source atlas: `assets/sprites/elias-production-source.png`, 1774 x 887 RGBA. Six columns and three source rows (idle, running, jump/activation). Row boundaries are 0, 33.6%, 64.8%, 100% to avoid cutting the authored heads.
- Keeper/Mara source atlas: `assets/sprites/story-characters-production.png`, 1536 x 1024 RGBA. Two columns, Keeper left, Mara right. Boot trims each alpha silhouette independently.
- Existing code-authored production platform, door, switch, plate, checkpoint, memory, and rustmite textures are now used across the campaign instead of only in the reactor.

All new raster art was generated with the built-in OpenAI ImageGen tool. Exact prompts, source checksums, dimensions, and sampled transparency ratios are in `campaign-asset-provenance.json`. No new stock downloads or third-party image licenses were introduced. This does not certify the provenance of legacy repository assets.

## Runtime Packing

`characterAtlas.ts` normalizes Elias into 320 x 300 cells on a 6-column, 5-row canvas. It uses one scale for every pose, derives it from standing height, and aligns feet at y=289. Idle occupies row 0, running row 1, jump/fall row 3, activation row 4. Stable animation keys remain `elias.idle`, `elias.walk`, `elias.run`, `elias.jump`, `elias.fall`, and `elias.time-shift`.

The activation animation currently repeats one authored pose while the separate chronal FX system animates the effect. A dedicated six-frame activation cycle and a final motion/edge review remain polish items. Two generated cleanup variants with baked checkerboards were rejected and are not loaded or copied into the project.

## Parallax

- Far painted matte: x=0.12, y=0.10 scroll factors, cover scaling without aspect distortion.
- Middle architecture: x=0.38, y=0.28, motif selected per location.
- Gameplay geometry: normal world scroll, collision independent of decoration.
- Near ceiling details: x=1.08, y=0, restricted to the upper 68 pixels to keep landing areas clear.
- Weather: screen-local deterministic rain/dust. Present holds particles still; Past moves, Future carries ash. Reduced motion stops ambient movement.
- Timeline state changes backdrop tint plus intact/broken middle-layer details; it does not load three copies of the same matte.

`GameScene.preload` requests only the current stage's image and reuses cached textures on restart. Menus and ending use the same runtime asset URLs to avoid duplicate hashed downloads. Deprecated prototype-patching backdrop modules remain in source history but are no longer imported by the game config.

## Verification

`npm run test:systems` checks all image paths, PNG dimensions, campaign mapping, download budget, and parallax coverage at camera extremes. `scripts/check-art.ps1` independently checks real sprite transparency and source checksums using System.Drawing. Both pass in the restricted workspace.

`campaign-visual.spec.ts` covers every level in three timelines at desktop and compact-landscape sizes, screenshots, real renderer pixel samples, HUD overlap, and far camera positioning. `hotel-traversal.spec.ts` isolates the staircase and uses keyboard input for eight real jumps. These browser cases have been discovered but not executed here: browser access is blocked by the task permissions. Source-image inspection is not a substitute for gameplay visual sign-off.
