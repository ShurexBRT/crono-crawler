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
- `Elias char sprite transparent.png`
- `platform assets.png`
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

- Dodati su texture kljucevi za Elias sprite sheet, platform atlas i backdrop slike u `src/game/assets/manifest.ts`.
- Dodat je `BootScenePolished` i Phaser config sada koristi njega.
- GitHub Pages workflow je promenjen tako da posle `npm run build` kopira root `assets/` u `dist/assets/`.
- Time je ispravljen problem gde kod referencira slike, ali ih browser na GitHub Pages ne vidi.

## Build fix

- Build je pucao zato sto je `BootScenePolished` nasledio `BootScene`, a imao je private metodu istog imena kao base class.
- Metoda je preimenovana u `registerExternalEliasAnimationFrames`.
- Posle toga je GitHub Actions build prosao.

## Title screen

- Prvi pokusaj je bio los jer je DOM naslov i meni bio renderovan preko nove title slike.
- Drugi pokusaj je takodje bio los jer je title art bio postavljen kao CSS background, ali se nije ucitao pouzdano na GitHub Pages, pa su se videli samo transparentni hotspotovi preko starog Phaser canvas backgrounda.
- To je ispravljeno tako sto `src/ui/uiPolish.ts` sada renderuje pravi `<img src="assets/chrono_crawler_title_screen_concept.png">` element preko celog title screena.
- `src/ui/titleArt.css` sada stilizuje taj image element sa `object-fit: cover` i drzi transparentne klik hotspotove preko nacrtanih Start/Continue/Options zona.
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

- Prvo je koriscen `Elias char sprite.png`, ali taj fajl je bio concept sheet sa tamnom pozadinom.
- Nakon toga je dodat `Elias char sprite transparent.png` i `BootScenePolished` sada ucitava transparentni sheet umesto starog concept sheeta.
- Transparentni sheet se dinamicki sece kao grid od 6 kolona i 5 redova.
- Registrovane su animacije za idle, walk, run, jump, fall i time-shift.
- `Player.ts` koristi transparentni Elias atlas kada je ucitan.
- Uklonjen je stari blend-mode workaround za crnu kocku jer transparentni atlas vise ne zahteva taj hack.
- Player scale se racuna iz visine idle frame-a da se manje oslanja na hardkodovanu velicinu starog concept sheeta.

## Echo / clone

- `GhostClone.ts` sada koristi isti transparentni Elias atlas kada je dostupan.
- Echo koristi oko 80% providnosti i plavi tint.
- Echo bira idle/run/jump/fall animaciju na osnovu replay pokreta.
- Echo trail sada koristi trenutni Elias frame umesto starog generickog ghost placeholdera, kada je transparentni atlas ucitan.

## Timeline platforme

- Dodat je `platform assets.png` kao platform atlas.
- `BootScenePolished` registruje tri platform frame-a: `past`, `present`, `future`.
- `TimelineBlock` sada koristi platform atlas kao visual layer kada je atlas ucitan.
- Pri promeni timeline-a, timeline block menja frame na osnovu trenutnog vremena.
- Collision logika ostaje na nevidljivom/static rectangle body-ju, tako da gameplay ostaje stabilan dok se vizuelni layer menja.

## Poznata ogranicenja

- Pretpostavljeno je da `Elias char sprite transparent.png` ima 6 kolona i 5 redova.
- Pretpostavljeno je da `platform assets.png` ima 3 horizontalna reda: past, present, future.
- Ako layout asseta nije takav, frame slicing treba rucno podesiti.
- Hotspot pozicije na title screenu mozda treba jos rucno namestati.
- Treba proveriti da li svaki backdrop stvarno najbolje odgovara svom nivou.

## Sledeci koraci

1. Sacekati novi GitHub Pages deploy.
2. Proveriti da li se transparentni Elias renderuje bez crne kocke.
3. Proveriti da li echo koristi Elias sprite sa providnoscu.
4. Proveriti da li timeline platforme menjaju vizuelni state za past/present/future.
5. Ako Elias ili platforme izgledaju iseceno, podesiti grid slicing u `BootScenePolished`.
6. Proveriti alignment title screen hotspotova.
