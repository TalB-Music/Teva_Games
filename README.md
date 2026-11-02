# Teva Games

A little portal of dinosaur games for Teva. Plain HTML, CSS and JavaScript with no build step, made for a Xiaomi 12 and for Chrome on a PC, with touch, mouse, keyboard or a Switch-style controller.

## Play

**On the PC:** run a local server from this folder, then open http://localhost:8123 in Chrome:

```bash
python -m http.server 8123
```

**On the phone, over home Wi-Fi:** run this on the PC instead, then open `http://<PC's IP address>:8123` on the phone. Windows may ask you to allow it through the firewall.

```bash
python -m http.server 8123 --bind 0.0.0.0
```

## Controls

| | Touch or mouse | Controller | Keyboard |
| --- | --- | --- | --- |
| Do something | Tap a stone | Any of the first four buttons | 1, 2, 3, 4 |
| Walk | Tap the ground | Stick or d-pad | Arrow keys |
| Giggle | Tap the dino | Any other button | Any other key |
| Back to all games | Hold the house | Hold + and − | Hold Esc |

If a controller misbehaves, open `tools/pad-test.html` to see what it reports.

## Add a game

1. Make a folder at `games/<id>/` with an `index.html`.
2. Load `shared/audio.js`, `shared/input.js` and `shared/art.js`, plus `shared/world.css`.
3. Add it to the list in `shared/games.js`, and remove one of the waiting eggs.

## Rules for Teva's games

- No reading, and nothing to lose.
- Every press makes something happy happen.
- Big targets, and a grown-up's way out that small hands won't trigger by accident.
- Draw everything as SVG, so it looks the same on every device.

Add `?reset=1` to the Dino Friend address to start again from the egg.
