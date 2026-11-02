"""Turns piano MIDI scores into shared/music-data.js for the Game Boy style player.

    python tools/midi_to_chip.py <folder of .mid files> shared/music-data.js

A Game Boy can only play a few notes at once, so each moment of the score is split:
the highest note is the lead, the lowest is the bass, and anything between becomes
a fast arpeggio.
"""
import json
import struct
import sys
from pathlib import Path

# speed > 1 plays faster than the score's own tempo marking.
PIECES = [
    {"file": "Chop-28-7.mid", "title": "Prelude in A major, Op. 28 No. 7", "composer": "Chopin", "speed": 0.6, "licence": "Public Domain"},
    {"file": "rach-prelude23-04.mid", "title": "Prelude in D major, Op. 23 No. 4", "composer": "Rachmaninoff", "speed": 1.0, "licence": "CC BY-SA 4.0"},
    {"file": "Chop-28-23.mid", "title": "Prelude in F major, Op. 28 No. 23", "composer": "Chopin", "speed": 1.0, "licence": "CC BY-SA 4.0"},
    {"file": "chopin_nocturne_op9_n2.mid", "title": "Nocturne in E-flat major, Op. 9 No. 2", "composer": "Chopin", "speed": 1.0, "licence": "CC BY-SA 3.0"},
    {"file": "rach-prelude23-06.mid", "title": "Prelude in E-flat major, Op. 23 No. 6", "composer": "Rachmaninoff", "speed": 1.0, "licence": "CC BY-SA 4.0"},
    {"file": "Chop-28-3.mid", "title": "Prelude in G major, Op. 28 No. 3", "composer": "Chopin", "speed": 1.0, "licence": "CC BY-SA 4.0"},
]

BASS_BELOW = 55
SHORTEST_SLICE = 0.012


def read_varlen(data, i):
    value = 0
    while True:
        byte = data[i]
        i += 1
        value = (value << 7) | (byte & 0x7F)
        if not byte & 0x80:
            return value, i


def read_midi(path):
    """Returns (ticks_per_beat, tempo changes, raw notes in ticks)."""
    data = path.read_bytes()
    if data[:4] != b"MThd":
        raise ValueError(f"{path.name} is not a MIDI file")
    header_len, _fmt, track_count, division = struct.unpack(">IHHh", data[4:14])
    if division <= 0:
        raise ValueError(f"{path.name} uses SMPTE timing, which isn't supported")
    i = 8 + header_len
    tempos = [(0, 500000)]
    notes = []
    for _ in range(track_count):
        if data[i:i + 4] != b"MTrk":
            raise ValueError(f"{path.name} has a damaged track")
        length = struct.unpack(">I", data[i + 4:i + 8])[0]
        i += 8
        end = i + length
        tick = 0
        status = 0
        open_notes = {}
        while i < end:
            delta, i = read_varlen(data, i)
            tick += delta
            if data[i] & 0x80:
                status = data[i]
                i += 1
            if status == 0xFF:
                kind = data[i]
                size, i = read_varlen(data, i + 1)
                if kind == 0x51:
                    tempos.append((tick, int.from_bytes(data[i:i + 3], "big")))
                i += size
            elif status in (0xF0, 0xF7):
                size, i = read_varlen(data, i)
                i += size
            else:
                top = status & 0xF0
                if top in (0xC0, 0xD0):
                    i += 1
                    continue
                pitch, velocity = data[i], data[i + 1]
                i += 2
                key = (status & 0x0F, pitch)
                if top == 0x90 and velocity:
                    open_notes[key] = (tick, velocity)
                elif top in (0x80, 0x90) and key in open_notes:
                    start, vel = open_notes.pop(key)
                    if tick > start:
                        notes.append((start, tick, pitch, vel))
        i = end
    return division, sorted(tempos), notes


def to_seconds(division, tempos, notes):
    marks = []
    seconds = 0.0
    last_tick, tempo = 0, 500000
    for tick, new_tempo in tempos:
        seconds += (tick - last_tick) * tempo / division / 1e6
        marks.append((tick, seconds, new_tempo))
        last_tick, tempo = tick, new_tempo

    def convert(tick):
        for mark_tick, mark_seconds, mark_tempo in reversed(marks):
            if tick >= mark_tick:
                return mark_seconds + (tick - mark_tick) * mark_tempo / division / 1e6
        return 0.0

    return [(convert(a), convert(b), p, v) for a, b, p, v in notes]


class Voice:
    """Joins neighbouring slices of one channel into held notes."""

    def __init__(self):
        self.events = []
        self.current = None

    def add(self, t0, t1, pitches, velocity, struck):
        if self.current and self.current["pitches"] == pitches and not (struck & set(pitches)):
            self.current["end"] = t1
            return
        self.flush()
        if pitches:
            self.current = {"start": t0, "end": t1, "pitches": pitches, "vel": velocity}

    def flush(self):
        if self.current:
            self.events.append(self.current)
        self.current = None


def split_voices(notes):
    times = sorted({t for a, b, _, _ in notes for t in (a, b)})
    merged = [times[0]]
    for t in times[1:]:
        if t - merged[-1] >= SHORTEST_SLICE:
            merged.append(t)
    lead, mid, bass = Voice(), Voice(), Voice()
    for t0, t1 in zip(merged, merged[1:]):
        active = [n for n in notes if n[0] < t1 - SHORTEST_SLICE / 2 and n[1] > t0 + SHORTEST_SLICE / 2]
        struck = {n[2] for n in active if abs(n[0] - t0) < SHORTEST_SLICE}
        loudness = {}
        for n in active:
            loudness[n[2]] = max(loudness.get(n[2], 0), n[3])
        pitches = sorted(loudness)
        top = low = None
        between = []
        if len(pitches) == 1:
            if pitches[0] < BASS_BELOW:
                low = pitches[0]
            else:
                top = pitches[0]
        elif pitches:
            top, low = pitches[-1], pitches[0]
            between = pitches[1:-1][-3:]
        lead.add(t0, t1, [top] if top is not None else [], loudness.get(top, 0), struck)
        bass.add(t0, t1, [low] if low is not None else [], loudness.get(low, 0), struck)
        mid.add(t0, t1, between, max((loudness[p] for p in between), default=0), struck)
    for voice in (lead, mid, bass):
        voice.flush()
    return lead.events, mid.events, bass.events


def encode(events, speed, first):
    out = []
    for e in events:
        out.append([
            round((e["start"] - first) * 1000 / speed),
            max(1, round((e["end"] - e["start"]) * 1000 / speed)),
            round(e["vel"] / 127 * 15),
            *e["pitches"],
        ])
    return out


def main():
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    tracks = []
    for piece in PIECES:
        division, tempos, raw = read_midi(source / piece["file"])
        notes = to_seconds(division, tempos, raw)
        first = min(n[0] for n in notes)
        lead, mid, bass = split_voices(notes)
        length = (max(n[1] for n in notes) - first) * 1000 / piece["speed"]
        tracks.append({
            "title": piece["title"],
            "composer": piece["composer"],
            "ms": round(length),
            "lead": encode(lead, piece["speed"], first),
            "mid": encode(mid, piece["speed"], first),
            "bass": encode(bass, piece["speed"], first),
        })
        print(f'{piece["composer"]:13}{piece["title"]:42}{length / 1000:6.0f}s  notes {len(raw):5}  lead {len(lead):5}  mid {len(mid):5}  bass {len(bass):5}')
        names = "C C# D D# E F F# G G# A A# B".split()
        print("   lead starts:", " ".join(names[e["pitches"][0] % 12] + str(e["pitches"][0] // 12 - 1) for e in lead[:18]))
    text = (
        "// Generated by tools/midi_to_chip.py. Arranged from the Mutopia Project's scores:\n"
        "// see the music credits in README.md. Each event is [start ms, length ms, volume 0-15, ...MIDI notes].\n"
        "(window.Teva = window.Teva || {}).musicTracks = "
        + json.dumps(tracks, separators=(",", ":"))
        + ";\n"
    )
    output.write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {output} ({len(text) // 1024} KB)")


if __name__ == "__main__":
    main()
