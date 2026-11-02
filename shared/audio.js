// Every sound is synthesised, so games need no audio files and work offline.
(function () {
  const T = (window.Teva = window.Teva || {});
  let ctx = null;
  let master = null;

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    if (T.music) T.music.begin();
  }

  function tone(from, to, dur, delay = 0, type = 'sine', vol = 0.6) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise(dur, delay = 0, freq = 900, vol = 0.5) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const g = ctx.createGain();
    src.buffer = buf;
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    g.gain.value = vol;
    src.connect(filter).connect(g).connect(master);
    src.start(t);
  }

  T.audio = {
    unlock,
    context: () => ctx,
    chirp() {
      tone(620, 980, 0.12);
      tone(860, 1320, 0.15, 0.13);
    },
    giggle() {
      [0, 0.1, 0.2, 0.3].forEach((d, i) => tone(900 + i * 90, 1250 + i * 90, 0.08, d));
    },
    hop() {
      tone(280, 560, 0.12);
    },
    munch() {
      noise(0.09, 0, 1200);
    },
    boing() {
      tone(180, 640, 0.24, 0, 'triangle');
    },
    bubble() {
      tone(420 + Math.random() * 300, 1000 + Math.random() * 400, 0.09, 0, 'sine', 0.4);
    },
    crack() {
      noise(0.07, 0, 2600, 0.8);
      noise(0.05, 0.06, 1800, 0.6);
    },
    tada() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.26, i * 0.09, 'triangle'));
    },
    lullaby() {
      [523, 659, 784, 659, 587, 494, 523].forEach((f, i) => tone(f, f, 0.7, i * 0.55, 'sine', 0.3));
    },
    sunrise() {
      [392, 523, 659, 784].forEach((f, i) => tone(f, f, 0.34, i * 0.13, 'triangle', 0.4));
    },
  };
})();
