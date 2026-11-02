// Dino Friend: a pet for a very small person. There are no words, nothing to
// lose and nothing goes wrong. Every press makes something happy happen. The
// dino can ask for something, but any choice delights it.
(function () {
  const T = window.Teva;
  const SAVE_KEY = 'teva.dinoPet.v1';
  const ACTIONS = ['feed', 'play', 'bath', 'sleep'];
  const ACTION_ICONS = { feed: 'leaf', play: 'ball', bath: 'bubbles', sleep: 'moon' };
  const ACTION_NAMES = { feed: 'Feed', play: 'Play', bath: 'Bath', sleep: 'Sleep' };
  const NAP_MS = 7000;
  const WALK_SPEED = 240;

  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  T.addScene();
  T.addHomeButton('../../index.html');

  $('anim').innerHTML = T.art.dino();
  $('egg-wrap').innerHTML = T.art.egg();
  const dino = $('anim').querySelector('.dino');

  function load() {
    try {
      if (new URLSearchParams(location.search).has('reset')) localStorage.removeItem(SAVE_KEY);
      return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  const save = load();
  function persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (e) {
      // Private windows can refuse storage. The dino just starts fresh next time.
    }
  }

  // Grows a little with every bit of care, then stays at a cuddly maximum.
  function applyGrowth() {
    const love = Math.min(save.love || 0, 120);
    $('grow').style.transform = `scale(${0.86 + (love / 120) * 0.14})`;
  }

  /* ---------- Buttons ---------- */

  const buttons = {};
  ACTIONS.forEach((action) => {
    const btn = document.createElement('button');
    btn.className = 'act';
    btn.setAttribute('aria-label', ACTION_NAMES[action]);
    btn.innerHTML = T.icons[ACTION_ICONS[action]];
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      press(action);
    });
    $('actions').appendChild(btn);
    buttons[action] = btn;
  });

  function flashButton(action) {
    const btn = buttons[action];
    btn.classList.add('down');
    setTimeout(() => btn.classList.remove('down'), 140);
  }

  /* ---------- Where things are on screen ---------- */

  let x = 0;
  let flipped = false;

  function dinoPoint(fx, fy) {
    const r = dino.getBoundingClientRect();
    return { x: r.left + (flipped ? 1 - fx : fx) * r.width, y: r.top + fy * r.height };
  }
  const mouth = () => dinoPoint(0.47, 0.5);
  const top = () => dinoPoint(0.47, 0.12);
  const belly = () => dinoPoint(0.48, 0.7);

  function walkLimit() {
    const size = dino.getBoundingClientRect().width;
    const stones = innerWidth > innerHeight ? Math.min(innerHeight * 0.36, innerWidth * 0.2) + innerWidth * 0.02 : 0;
    return Math.max(0, innerWidth / 2 - stones - size * 0.42);
  }

  function setX(next, seconds = 0) {
    const limit = walkLimit();
    next = Math.max(-limit, Math.min(limit, next));
    if (next !== x) {
      flipped = next > x;
      $('flip').style.transform = flipped ? 'scaleX(-1)' : '';
    }
    x = next;
    $('pos').style.transition = seconds ? `transform ${seconds}s linear` : '';
    $('pos').style.transform = `translateX(${x}px)`;
  }

  let waddle = null;
  function startWaddle() {
    if (waddle) return;
    waddle = $('anim').animate(
      [{ transform: 'rotate(-5deg)' }, { transform: 'translateY(-5%) rotate(0)' }, { transform: 'rotate(5deg)' }, { transform: 'translateY(-5%) rotate(0)' }, { transform: 'rotate(-5deg)' }],
      { duration: 460, iterations: Infinity }
    );
  }
  function stopWaddle() {
    if (waddle) waddle.cancel();
    waddle = null;
  }

  let walkTimer = 0;
  function walkTo(target) {
    const limit = walkLimit();
    const clamped = Math.max(-limit, Math.min(limit, target));
    const seconds = Math.abs(clamped - x) / WALK_SPEED;
    if (seconds < 0.05) return;
    startWaddle();
    setX(clamped, seconds);
    clearTimeout(walkTimer);
    walkTimer = setTimeout(stopWaddle, seconds * 1000);
  }

  /* ---------- Little reactions ---------- */

  function hop(height = 16, duration = 420) {
    return $('anim').animate(
      [
        { transform: 'scale(1.06,.92)' },
        { transform: `translateY(-${height}%) scale(.95,1.06)`, offset: 0.45 },
        { transform: 'scale(1.08,.9)', offset: 0.85 },
        { transform: 'none' },
      ],
      { duration, easing: 'ease-out' }
    ).finished;
  }

  function wiggle(duration = 700) {
    return $('anim').animate(
      [0, -7, 7, -7, 7, -4, 4, 0].map((deg) => ({ transform: `rotate(${deg}deg)` })),
      { duration }
    ).finished;
  }

  function mood(eyes = 'open', mouthShape = 'smile') {
    dino.dataset.eyes = eyes;
    dino.dataset.mouth = mouthShape;
  }

  function hearts(count = 7) {
    const p = top();
    T.fx.burst('heart', p.x, p.y, count, 50, 230);
  }

  async function delighted() {
    mood('happy', 'open');
    T.audio.chirp();
    hearts();
    await hop(18);
    mood();
  }

  /* ---------- The four things to do ---------- */

  const doAction = {
    async feed(from) {
      const start = from.getBoundingClientRect();
      const size = Math.min(start.height, 110);
      const m = mouth();
      const leaf = T.fx.make('leaf', start.left + start.width / 2, start.top + start.height / 2, size);
      const dx = m.x - (start.left + start.width / 2);
      const dy = m.y - (start.top + start.height / 2);
      mood('open', 'open');
      await leaf.animate(
        [
          { transform: 'translate(0,0) rotate(0)' },
          { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 70}px) rotate(160deg)`, offset: 0.55 },
          { transform: `translate(${dx}px,${dy}px) rotate(320deg) scale(.45)` },
        ],
        { duration: 620, easing: 'ease-in-out' }
      ).finished;
      leaf.remove();
      for (let i = 0; i < 3; i++) {
        mood('happy', 'smile');
        T.audio.munch();
        const p = mouth();
        T.fx.burst('crumb', p.x, p.y + 10, 3, 13, 80);
        await $('anim').animate(
          [{ transform: 'none' }, { transform: 'scale(1.05,.95)' }, { transform: 'none' }],
          { duration: 190 }
        ).finished;
        mood('happy', 'open');
        await wait(60);
      }
    },

    async play() {
      const m = top();
      const size = Math.min(innerWidth, innerHeight) * 0.2;
      const ball = T.fx.make('ball', m.x, m.y - size * 0.3, size);
      const fromX = innerWidth - m.x + size;
      const bounce = (x0, y0, x1, y1, duration) =>
        ball.animate(
          [
            { transform: `translate(${x0}px,${y0}px) rotate(0)` },
            { transform: `translate(${(x0 + x1) / 2}px,${Math.min(y0, y1) - size * 1.2}px) rotate(200deg)`, offset: 0.5 },
            { transform: `translate(${x1}px,${y1}px) rotate(400deg)` },
          ],
          { duration, easing: 'ease-in-out', fill: 'forwards' }
        ).finished;
      await bounce(fromX, -size, 0, 0, 560);
      for (let i = 0; i < 3; i++) {
        T.audio.boing();
        mood('happy', 'open');
        hop(14, 380);
        await bounce(0, 0, 0, 0, 480);
      }
      T.audio.boing();
      await bounce(0, 0, -m.x - size, -size * 0.4, 620);
      ball.remove();
    },

    async bath() {
      mood('shut', 'smile');
      const r = dino.getBoundingClientRect();
      const blow = setInterval(() => {
        const bx = r.left + Math.random() * r.width;
        const by = r.bottom - Math.random() * r.height * 0.4;
        const s = 26 + Math.random() * 54;
        const b = T.fx.make('bubbles', bx, by, s);
        T.audio.bubble();
        b.animate(
          [
            { transform: 'translateY(0) scale(.4)', opacity: 1 },
            { transform: `translate(${(Math.random() - 0.5) * 70}px,-${r.height * 0.8}px) scale(1.1)`, opacity: 0.9, offset: 0.85 },
            { transform: `translate(0,-${r.height}px) scale(1.5)`, opacity: 0 },
          ],
          { duration: 1500 + Math.random() * 500, easing: 'ease-out' }
        ).onfinish = () => b.remove();
      }, 110);
      await wiggle(1500);
      clearInterval(blow);
      mood('happy', 'open');
      const b = belly();
      T.fx.burst('star', b.x, b.y - r.height * 0.3, 8, 40, 260);
      await wiggle(420);
    },

    async sleep() {
      await nap(NAP_MS);
    },
  };

  /* ---------- Sleeping ---------- */

  let wake = null;
  let zzzTimer = 0;

  function startSleeping() {
    document.body.classList.add('night');
    mood('shut', 'smile');
    const puffZ = () => {
      const p = dinoPoint(0.74, 0.2);
      const z = T.fx.make('zzz', p.x, p.y, 34 + Math.random() * 20);
      z.animate(
        [
          { transform: 'translate(0,0) scale(.5)', opacity: 0 },
          { opacity: 1, offset: 0.25 },
          { transform: 'translate(46px,-130px) scale(1.2)', opacity: 0 },
        ],
        { duration: 2400 }
      ).onfinish = () => z.remove();
    };
    puffZ();
    zzzTimer = setInterval(puffZ, 1100);
  }

  function stopSleeping() {
    clearInterval(zzzTimer);
    document.body.classList.remove('night');
    wake = null;
  }

  async function nap(ms) {
    startSleeping();
    T.audio.lullaby();
    await Promise.race([wait(ms), new Promise((r) => (wake = r))]);
    stopSleeping();
    T.audio.sunrise();
    mood('open', 'open');
    await hop(12);
    mood('happy', 'open');
  }

  /* ---------- Wishes ---------- */

  let wish = null;
  let wishTimer = 0;
  let lastWish = null;

  function scheduleWish() {
    clearTimeout(wishTimer);
    wishTimer = setTimeout(showWish, 7000 + Math.random() * 6000);
  }

  function showWish() {
    if (phase !== 'awake' || busy) return scheduleWish();
    const choices = ACTIONS.filter((a) => a !== lastWish);
    wish = choices[Math.floor(Math.random() * choices.length)];
    lastWish = wish;
    $('wish-icon').innerHTML = T.icons[ACTION_ICONS[wish]];
    $('wish').hidden = false;
    buttons[wish].classList.add('wanted');
    T.audio.hop();
  }

  function clearWish() {
    if (wish) buttons[wish].classList.remove('wanted');
    wish = null;
    $('wish').hidden = true;
  }

  /* ---------- The moment-to-moment game ---------- */

  let phase = 'egg';
  let busy = false;

  async function press(action) {
    if (phase !== 'awake') return anyPress();
    flashButton(action);
    if (busy) {
      if (wake) wake();
      else hearts(2);
      return;
    }
    busy = true;
    const granted = action === wish;
    clearWish();
    await doAction[action](buttons[action]);
    save.love = (save.love || 0) + (granted ? 2 : 1);
    persist();
    applyGrowth();
    if (granted) {
      T.audio.tada();
      const p = top();
      T.fx.burst('star', p.x, p.y, 10, 50, 300);
    }
    await delighted();
    busy = false;
    scheduleWish();
  }

  function pat() {
    if (busy) return;
    mood('happy', 'open');
    T.audio.giggle();
    hearts(4);
    hop(14).then(() => {
      if (!busy) mood();
    });
  }

  function anyPress() {
    if (phase === 'egg') return tapEgg();
    if (phase === 'asleep') return wakeUp();
    if (wake) return wake();
    pat();
  }

  /* ---------- Hatching and waking ---------- */

  let cracks = 0;
  const eggWrap = $('egg-wrap');

  async function tapEgg() {
    if (eggWrap.dataset.done) return;
    cracks++;
    T.audio.crack();
    eggWrap.dataset.cracks = cracks;
    eggWrap.animate(
      [0, -11, 11, -8, 8, 0].map((deg) => ({ transform: `rotate(${deg}deg)` })),
      { duration: 380 }
    );
    if (cracks < 3) return;

    eggWrap.dataset.done = '1';
    clearInterval(eggHint);
    const r = eggWrap.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    T.fx.burst('shell', cx, cy, 9, 62, 340);
    T.fx.burst('star', cx, cy, 10, 48, 380);
    T.audio.tada();
    eggWrap.remove();
    $('pos').classList.remove('hidden');
    save.hatched = true;
    persist();
    mood('happy', 'open');
    await $('anim').animate(
      [{ transform: 'scale(.1)' }, { transform: 'scale(1.1)', offset: 0.7 }, { transform: 'none' }],
      { duration: 560, easing: 'cubic-bezier(.3,1.5,.5,1)' }
    ).finished;
    T.audio.chirp();
    hearts(9);
    mood();
    becomeAwake();
  }

  async function wakeUp() {
    phase = 'waking';
    stopSleeping();
    T.audio.sunrise();
    mood('open', 'open');
    await hop(16);
    T.audio.chirp();
    hearts(6);
    mood();
    becomeAwake();
  }

  function becomeAwake() {
    phase = 'awake';
    $('actions').hidden = false;
    scheduleWish();
  }

  /* ---------- Controller and keyboard ---------- */

  T.input.listen({
    // Whatever button gets mashed, something happens. Four map to the four stones.
    button(i) {
      if (phase === 'awake' && i < 4) press(ACTIONS[i]);
      else anyPress();
    },
    key(k) {
      const n = Number(k);
      if (phase === 'awake' && n >= 1 && n <= 4) press(ACTIONS[n - 1]);
      else if (phase === 'awake' && (k === 'Enter' || k === ' ') && wish) press(wish);
      else anyPress();
    },
    direction() {
      if (phase !== 'awake' || wake) anyPress();
    },
  });

  let lastFrame = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (phase === 'awake' && !busy && T.input.x) {
      clearTimeout(walkTimer);
      startWaddle();
      setX(x + T.input.x * WALK_SPEED * dt);
      walkTimer = setTimeout(stopWaddle, 80);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Touch and mouse anywhere ---------- */

  addEventListener('pointerdown', (e) => {
    if (e.target.closest('#home, .act')) return;
    if (phase !== 'awake') return anyPress();
    if (wake) return wake();
    if (e.target.closest('.dino')) return pat();
    if (!busy) {
      const stage = innerWidth / 2;
      walkTo(e.clientX - stage);
      const star = T.fx.make('star', e.clientX, e.clientY, 44);
      star.animate(
        [{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.3)', opacity: 0 }],
        { duration: 500 }
      ).onfinish = () => star.remove();
      T.audio.hop();
    }
  });

  addEventListener('resize', () => setX(x));

  /* ---------- Start ---------- */

  applyGrowth();
  let eggHint = 0;
  if (save.hatched) {
    eggWrap.remove();
    phase = 'asleep';
    startSleeping();
  } else {
    $('pos').classList.add('hidden');
    eggHint = setInterval(() => {
      eggWrap.animate(
        [0, -5, 5, -3, 3, 0].map((deg) => ({ transform: `rotate(${deg}deg)` })),
        { duration: 600 }
      );
    }, 2600);
  }

  // For checking the screens during development.
  window.TevaDebug = { get phase() { return phase; }, get busy() { return busy; }, save, showWish };
})();
