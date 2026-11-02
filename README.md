# Teva Games

A little portal of dinosaur games for Teva. Plain HTML, CSS and JavaScript with no build step, made for a Xiaomi 12 and for Chrome on a PC, with touch, mouse, keyboard or a Switch-style controller.

## Play

**In a browser, on anything:** https://talb-music.github.io/Teva_Games/

**As an Android app:** download [teva-games.apk](https://github.com/TalB-Music/Teva_Games/releases/latest/download/teva-games.apk) on the phone and install it. Android will ask you to allow installing apps from your browser. The app runs full screen and works offline, and each new version installs over the last.

**While working on it:** run a local server from this folder, then open http://localhost:8123 in Chrome:

```bash
python -m http.server 8123
```

Every push to `main` updates the website and builds a new APK. The APK's signing key is kept in the `KEYSTORE_BASE64` repository secret, never in this repo.

## Controls

| | Touch or mouse | Controller | Keyboard |
| --- | --- | --- | --- |
| Do something | Tap a stone | Any of the first four buttons | 1, 2, 3, 4 |
| Walk | Tap the ground | Stick or d-pad | Arrow keys |
| Giggle | Tap the dino | Any other button | Any other key |
| Back to all games | Hold the house | Hold + and −, or Home | Hold Esc |
| Music on or off | Tap the note | | |

In Chrome on a computer, press a controller button first. If no controller picture appears at the top, click the faint controller icon there and choose your pad. Chrome remembers it, and the pad reconnects by itself after that.

If a controller misbehaves, open `tools/pad-test.html` to see what it reports. To hear every piece of music, open `tools/jukebox.html`.

## Add a game

1. Make a folder at `games/<id>/` with an `index.html`.
2. Load `shared/audio.js`, `shared/music-data.js`, `shared/music.js`, `shared/input.js` and `shared/art.js`, plus `shared/world.css`.
3. Add it to the list in `shared/games.js`, and remove one of the waiting eggs.

## Rules for Teva's games

- No reading, and nothing to lose.
- Every press makes something happy happen.
- Big targets, and a grown-up's way out that small hands won't trigger by accident.
- Draw everything as SVG, so it looks the same on every device.

Add `?reset=1` to the Dino Friend address to start again from the egg.

## Music

Game Boy style arrangements, made by `tools/midi_to_chip.py` from scores engraved by volunteers at the [Mutopia Project](https://www.mutopiaproject.org/). `shared/music-data.js` is shared under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), as the source licences require.

| Piece | Composer | Source licence |
| --- | --- | --- |
| Prelude in A major, Op. 28 No. 7 | Chopin | Public domain |
| Prelude in F major, Op. 28 No. 23 | Chopin | CC BY-SA 4.0 |
| Prelude in G major, Op. 28 No. 3 | Chopin | CC BY-SA 4.0 |
| Nocturne in E-flat major, Op. 9 No. 2 | Chopin | CC BY-SA 3.0 |
| Prelude in D major, Op. 23 No. 4 | Rachmaninoff | CC BY-SA 4.0 |
| Prelude in E-flat major, Op. 23 No. 6 | Rachmaninoff | CC BY-SA 4.0 |

The title font is [Chango](https://fonts.google.com/specimen/Chango), under the SIL Open Font License.
