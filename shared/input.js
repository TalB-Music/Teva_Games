// One input layer for every game: keyboard + gamepad. Touch and mouse are
// handled per game with pointer events.
//
// Off-brand Switch pads often report mapping !== "standard", so nothing here
// relies on a specific button number meaning a specific thing. Chrome also
// hides a pad until a button is pressed on it.
(function () {
  const T = (window.Teva = window.Teva || {});
  const listeners = [];
  const prev = new Map();
  const state = { x: 0, y: 0, keyX: 0, keyY: 0, padX: 0, padY: 0, padName: '' };
  const DEADZONE = 0.5;
  const HOME_HOLD_MS = 1200;

  function emit(name, arg) {
    if (T.audio) T.audio.unlock();
    listeners.forEach((l) => l[name] && l[name](arg));
  }

  // Some non-standard pads put the d-pad on a single "hat" axis.
  const HAT = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

  function readDirection(p) {
    let x = 0;
    let y = 0;
    if (Math.abs(p.axes[0] || 0) > DEADZONE) x = Math.sign(p.axes[0]);
    if (Math.abs(p.axes[1] || 0) > DEADZONE) y = Math.sign(p.axes[1]);
    if (p.mapping === 'standard') {
      if (p.buttons[12] && p.buttons[12].pressed) y = -1;
      if (p.buttons[13] && p.buttons[13].pressed) y = 1;
      if (p.buttons[14] && p.buttons[14].pressed) x = -1;
      if (p.buttons[15] && p.buttons[15].pressed) x = 1;
    } else if (p.axes.length >= 10 && Math.abs(p.axes[9]) <= 1.01) {
      const hat = HAT[Math.round((p.axes[9] + 1) / (2 / 7)) % 8];
      x = hat[0];
      y = hat[1];
    }
    return { x, y };
  }

  let homeSince = 0;

  function pollPads(now) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let padX = 0;
    let padY = 0;
    let bothMenuButtons = false;
    for (const p of pads) {
      if (!p) continue;
      state.padName = p.id;
      const old = prev.get(p.index) || [];
      const next = p.buttons.map((b) => b.pressed);
      next.forEach((pressed, i) => {
        const isDpad = p.mapping === 'standard' && i >= 12 && i <= 15;
        if (pressed && !old[i] && !isDpad) emit('button', i);
      });
      prev.set(p.index, next);
      if (next[8] && next[9]) bothMenuButtons = true;
      const d = readDirection(p);
      padX = padX || d.x;
      padY = padY || d.y;
    }
    if (bothMenuButtons) {
      homeSince = homeSince || now;
      if (now - homeSince > HOME_HOLD_MS && T.goHome) T.goHome();
    } else {
      homeSince = 0;
    }
    if (padX !== state.padX || padY !== state.padY) {
      state.padX = padX;
      state.padY = padY;
      updateDirection();
    }
  }

  function updateDirection() {
    const x = state.keyX || state.padX;
    const y = state.keyY || state.padY;
    const changed = x !== state.x || y !== state.y;
    state.x = x;
    state.y = y;
    if (changed && (x || y)) emit('direction', { x, y });
  }

  const ARROWS = {
    ArrowLeft: ['keyX', -1],
    ArrowRight: ['keyX', 1],
    ArrowUp: ['keyY', -1],
    ArrowDown: ['keyY', 1],
  };
  const IGNORED = /^(F\d+|Tab|Alt|Control|Meta|Shift|CapsLock)/;
  let escapeTimer = 0;

  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey || IGNORED.test(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape') {
      if (!e.repeat) escapeTimer = setTimeout(() => T.goHome && T.goHome(), HOME_HOLD_MS);
      return;
    }
    if (e.repeat) return;
    const arrow = ARROWS[e.key];
    if (arrow) {
      state[arrow[0]] = arrow[1];
      updateDirection();
    } else {
      emit('key', e.key);
    }
  });

  addEventListener('keyup', (e) => {
    if (e.key === 'Escape') clearTimeout(escapeTimer);
    const arrow = ARROWS[e.key];
    if (arrow && state[arrow[0]] === arrow[1]) {
      state[arrow[0]] = 0;
      updateDirection();
    }
  });

  addEventListener('pointerdown', () => T.audio && T.audio.unlock(), { capture: true });

  // Stop long-press menus and pinch gestures from pulling a toddler out of the game.
  addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('gesturestart', (e) => e.preventDefault());

  function loop(now) {
    pollPads(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  T.input = {
    listen(listener) {
      listeners.push(listener);
    },
    get x() {
      return state.x;
    },
    get y() {
      return state.y;
    },
  };

  // A grown-up's way out: press and hold, so small hands don't leave by accident.
  T.addHomeButton = function (href) {
    T.goHome = () => location.assign(href);
    const btn = document.createElement('button');
    btn.id = 'home';
    btn.setAttribute('aria-label', 'Press and hold to go back to all the games');
    btn.innerHTML =
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="ring" cx="24" cy="24" r="21" pathLength="100"/>' +
      '<path d="M24 12 11 24h4v12h7v-8h4v8h7V24h4Z"/></svg>';
    let timer = 0;
    const stop = () => {
      clearTimeout(timer);
      btn.classList.remove('holding');
    };
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      btn.classList.add('holding');
      timer = setTimeout(T.goHome, HOME_HOLD_MS);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((n) => btn.addEventListener(n, stop));
    document.body.appendChild(btn);
  };
})();
