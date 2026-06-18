# Chrono Crawler Worklog

Ovaj dokument belezi stvarno odradjene izmene u repozitorijumu, bez ulepsavanja.

## Zateceno stanje

- Projekat je vec bio Phaser + TypeScript + Vite browser igra.
- Vec su postojali main menu, intro, pause/options/credits, HUD, local save/continue, tutorial, tri nivoa i finalni Keeper puzzle nivo.
- Vec su postojali timeline switching, echo recording/replay, checkpoints, prost enemy patrol i proceduralni/generated placeholder art.
- Leveli su data-driven kroz `src/game/content/levels.ts`.

## Player movement

- Podesen je walk/run speed da kretanje bude brze i manje tromo.
- Zadrzana je postojeca logika za acceleration/deceleration, jump buffer, coyote timing, landing squash i jump/land feedback.

## Asseti koje je korisnik dodao

U root `assets/` folder dodati su:

- `Elias char sprite.png`
- `chrono_crawler_title_screen_concept.png`
- `fading_clockwork_city_in_ruins.png`
- `gloomy_industrial_nightscape_with_steam_and_lights.png`
- `gothic_cityscape_under_stormy_skies.png`
- `misty_alley_in_a_futuristic_city.png`
- `ruins_of_a_fractured_city_skyline.png`
- `steampunk_observatory_with_glowing_machinery.png`
- `stormy_night_over_gothic_cityscape.png`
- `underground_sewer_cityscape_with_glowing_lights.png`

## Asset loading i deployment

- Dodati su texture kljucevi za Elias sprite sheet i backdrop slike u `src/game/assets/manifest.ts`.
- Dodat je `BootScenePolished` i Phaser config sada koristi njega.
- GitHub Pages workflow je promenjen tako da posle `npm run build` kopira root `assets/` u `dist/assets/`.
- Time je ispravljen problem gde kod referencira slike, ali ih browser na GitHub Pages ne vidi.

## Build fix

- Build je pucao zato sto je `BootScenePolished` nasledio `BootScene`, a imao je private metodu istog imena kao base class.
- Metoda je preimenovana u `registerExternalEliasAnimationFrames`.
- Posle toga je GitHub Actions build prosao.

## Title screen

- Prvi pokusaj je bio los jer je DOM naslov i meni bio renderovan preko nove title slike.
- To je zamenjeno u `src/ui/uiPolish.ts`.
- Sada title art slika sluzi kao glavni meni.
- Dodati su transparentni klik hotspotovi preko nacrtanih Start/Continue/Options zona.
- Dodat je `src/ui/titleArt.css` i importovan u `src/main.ts`.
- Credits je ostavljen kao malo odvojeno dugme jer na slici nema ocigledan Credits item.

## Backdropovi u levelima

- Prvi pokusaj je bio los jer je novi backdrop bio iza starog proceduralnog skyline backgrounda.
- `src/game/phaser/scenePolish.ts` je promenjen tako da novi backdrop bude glavni background.
- Stari generated skyline/searchlight/rain background se vise ne crta kroz patched `drawBackground`.
- Ostavljena je blaga tint/floor logika zbog citljivosti gameplay objekata.

## Signage i tekstovi

- Dodati su natpisi u levelima, npr. `CORE ACCESS`, `TEMPORAL BREACH`, `NO FUTURE / NO LOSS`, `MERCY IS STILLNESS`, `PLATFORM 13`, `ANCHOR I`, `I STOPPED GOODBYE`.
- Prepisani su subtitles, objectives, intro lines i story-zone hintovi da budu kraci i manje genericki.
- Prepisan je deo main menu, intro, credits i ending teksta.

## Elias animacije

- `Elias char sprite.png` se koristi kao grubi sprite sheet.
- Registrovane su animacije za idle, walk, run, jump, fall i time-shift.
- `Player.ts` koristi te animacije kada je sheet ucitan.
- Time-shift animacija se pokrece kada se promeni timeline.
- Idle je stabilizovan tako sto koristi samo prvi idle frame, jer vise idle frameova iz concept sheeta prave jitter.
- Dodato je blend mode resenje da se umanji vidljiva tamna kocka oko Eliasa.

## Poznata ogranicenja

- `Elias char sprite.png` nije pravi transparentni production atlas nego concept sheet.
- Tamna kocka oko Eliasa je samo ublazena, nije resena savrseno.
- Pravo resenje je transparentni sprite atlas ili pouzdano runtime ciscenje backgrounda.
- Hotspot pozicije na title screenu mozda treba jos rucno namestati.
- Treba proveriti da li svaki backdrop stvarno najbolje odgovara svom nivou.

## Sledeci koraci

1. Sacekati novi GitHub Pages deploy.
2. Proveriti alignment title screen hotspotova.
3. Proveriti da li Elias izgleda prihvatljivo sa trenutnim blend mode resenjem.
4. Ako ne izgleda dobro, napraviti pravi transparentni Elias atlas.
5. Proveriti sve levele i po potrebi promeniti backdrop mapping.
