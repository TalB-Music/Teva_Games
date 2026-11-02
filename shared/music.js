// Background music in the style of a Game Boy: two pulse channels and a 4-bit
// wave channel. Notes come from shared/music-data.js and are played live, so the
// music needs no audio files.
(function () {
  const T = (window.Teva = window.Teva || {});
  const MUSIC_LEVEL = 0.2;
  const LOOK_AHEAD = 0.4;
  const ARP_STEP = 0.05;
  const GAP_BETWEEN_PIECES = 2.5;
  const MUTE_KEY = 'teva.music.muted';
  const PLACE_KEY = 'teva.music.place';

  let ctx = null;
  let bus = null;
  let waves = null;
  let timer = 0;
  let index = 0;
  let startedAt = 0;
  let cursors = null;
  let ducked = false;
  let began = false;
  let muted = read('localStorage', MUTE_KEY) === '1';
  const sounding = new Set();
  const listeners = [];

  function read(store, key) {
    try {
      return window[store].getItem(key);
    } catch (e) {
      return null;
    }
  }
  function write(store, key, value) {
    try {
      window[store].setItem(key, value);
    } catch (e) {
      // Private windows can refuse storage. The setting just won't be remembered.
    }
  }

  function pulseWave(duty) {
    const real = new Float32Array(32);
    const imag = new Float32Array(32);
    for (let n = 1; n < 32; n++) real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
    return ctx.createPeriodicWave(real, imag);
  }

  // The Game Boy's wave channel plays 32 samples of 4 bits, which gives its bass that buzz.
  function steppedTriangle() {
    const samples = [];
    for (let i = 0; i < 32; i++) samples.push(Math.round((1 - Math.abs(i / 16 - 1)) * 15) / 7.5 - 1);
    const real = new Float32Array(16);
    const imag = new Float32Array(16);
    for (let n = 1; n < 16; n++) {
      samples.forEach((s, i) => {
        real[n] += (s * Math.cos((2 * Math.PI * n * i) / 32)) / 16;
        imag[n] += (s * Math.sin((2 * Math.PI * n * i) / 32)) / 16;
      });
    }
    return ctx.createPeriodicWave(real, imag);
  }

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  // Volume falls in small steps, like the hardware's envelope, then holds so long notes still sing.
  function note(wave, pitches, at, seconds, level, decays) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.setPeriodicWave(wave);
    const end = at + Math.max(seconds, 0.04);

    if (pitches.length > 1) {
      let i = 0;
      for (let t = at; t < end; t += ARP_STEP) osc.frequency.setValueAtTime(hz(pitches[i++ % pitches.length]), t);
    } else {
      osc.frequency.setValueAtTime(hz(pitches[0]), at);
    }

    gain.gain.setValueAtTime(level, at);
    if (decays) {
      let v = level;
      for (let t = at + 0.08; t < end && v > level * 0.45; t += 0.08) {
        v *= 0.88;
        gain.gain.setValueAtTime(v, t);
      }
    }
    gain.gain.setValueAtTime(0, end);

    osc.connect(gain).connect(bus);
    osc.start(at);
    osc.stop(end + 0.01);
    sounding.add(osc);
    osc.onended = () => sounding.delete(osc);
  }

  function scheduleEvents(list, cursorName, wave, volume, until, decays) {
    while (cursors[cursorName] < list.length) {
      const e = list[cursors[cursorName]];
      const at = startedAt + e[0] / 1000;
      if (at > until) break;
      cursors[cursorName]++;
      const end = at + e[1] / 1000;
      if (end <= ctx.currentTime) continue;
      const from = Math.max(at, ctx.currentTime);
      note(wave, e.slice(3), from, end - from, (0.25 + (e[2] / 15) * 0.75) * volume, decays);
    }
  }

  function tick() {
    const track = T.musicTracks[index];
    const until = ctx.currentTime + LOOK_AHEAD;
    scheduleEvents(track.lead, 'lead', waves.lead, 0.55, until, true);
    scheduleEvents(track.mid, 'mid', waves.mid, 0.2, until, false);
    scheduleEvents(track.bass, 'bass', waves.bass, 0.62, until, true);

    const elapsed = ctx.currentTime - startedAt;
    write('sessionStorage', PLACE_KEY, JSON.stringify({ index, ms: Math.max(0, elapsed * 1000) }));
    if (elapsed > track.ms / 1000 + GAP_BETWEEN_PIECES) play((index + 1) % T.musicTracks.length);
  }

  function silence() {
    sounding.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped.
      }
    });
    sounding.clear();
  }

  function play(next, fromMs = 0) {
    silence();
    index = next;
    startedAt = ctx.currentTime + 0.05 - fromMs / 1000;
    const skip = (list) => {
      let i = 0;
      while (i < list.length && list[i][0] + list[i][1] <= fromMs) i++;
      return i;
    };
    const track = T.musicTracks[index];
    cursors = { lead: skip(track.lead), mid: skip(track.mid), bass: skip(track.bass) };
    clearInterval(timer);
    timer = setInterval(tick, 120);
    tick();
    listeners.forEach((l) => l());
  }

  function applyLevel() {
    if (!bus) return;
    const level = muted || ducked ? 0 : MUSIC_LEVEL;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setTargetAtTime(level, ctx.currentTime, 0.15);
  }

  function setUp() {
    if (ctx) return true;
    ctx = T.audio.context();
    if (!ctx) return false;
    bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(ctx.destination);
    waves = { lead: pulseWave(0.25), mid: pulseWave(0.125), bass: steppedTriangle() };
    return true;
  }

  // Sound can't start until the first press, so audio.js calls this when it can.
  function begin() {
    if (began || !setUp()) return;
    began = true;
    let place = null;
    try {
      place = JSON.parse(read('sessionStorage', PLACE_KEY));
    } catch (e) {
      place = null;
    }
    const known = place && T.musicTracks[place.index];
    play(known ? place.index : 0, known ? place.ms : 0);
    applyLevel();
  }

  // Stops the music when the phone locks or the app goes to the background.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });

  function setMuted(next) {
    muted = next;
    write('localStorage', MUTE_KEY, muted ? '1' : '0');
    applyLevel();
    listeners.forEach((l) => l());
  }

  T.music = {
    begin,
    duck(on) {
      ducked = on;
      applyLevel();
    },
    play(i) {
      began = true;
      if (setUp()) {
        play(i);
        applyLevel();
      }
    },
    stop() {
      clearInterval(timer);
      silence();
      index = -1;
      listeners.forEach((l) => l());
    },
    setMuted,
    get muted() {
      return muted;
    },
    get playing() {
      return index;
    },
    onChange(listener) {
      listeners.push(listener);
    },
    addButton() {
      const btn = document.createElement('button');
      btn.id = 'music';
      btn.innerHTML =
        '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/>' +
        '<path class="note" d="M20 14v15.5a5 5 0 1 0 3 4.5V20l9-2.5v8.2a5 5 0 1 0 3 4.3V10Z"/>' +
        '<path class="off" d="M11 11l26 26"/></svg>';
      const show = () => {
        btn.classList.toggle('muted', muted);
        btn.setAttribute('aria-label', muted ? 'Turn the music on' : 'Turn the music off');
      };
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        T.audio.unlock();
        setMuted(!muted);
        show();
      });
      show();
      document.body.appendChild(btn);
    },
  };
})();
