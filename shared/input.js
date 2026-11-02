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
  // A, B, X and Y all select. Shoulder, menu and stick-click buttons do nothing.
  const MAIN_BUTTONS = 4;
  const PAD_ICON =
    '<svg viewBox="0 0 64 40" aria-hidden="true"><path class="pad-body" d="M18 3h28c10 0 16 10 17 24 1 11-9 14-14 7l-5-7H20l-5 7C10 41 0 38 1 27 2 13 8 3 18 3Z"/>' +
    '<path class="pad-marks" d="M18 11v10M13 16h10"/><circle class="pad-dot" cx="45" cy="12" r="3"/><circle class="pad-dot" cx="51" cy="18" r="3"/></svg>';

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

  // Chrome's Gamepad API can miss Switch-style pads on Windows, even when Windows
  // itself sees them, so the pad can also be read directly over WebHID. It's shaped
  // like a standard gamepad, and the rest of this file treats it as one.
  const NINTENDO_SIMPLE_REPORT = 0x3f;
  const HID_BUTTONS = 18;
  const HID_BIT_TO_BUTTON = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17];
  const HID_HAT_TO_DPAD = [[12], [12, 15], [15], [13, 15], [13], [13, 14], [14], [12, 14]];
  let hidPad = null;

  function readHidReport(report) {
    if (!hidPad || report.reportId !== NINTENDO_SIMPLE_REPORT || report.data.byteLength < 7) return;
    hidPad.live = true;
    const data = report.data;
    const bits = data.getUint8(0) | (data.getUint8(1) << 8);
    const pressed = new Array(HID_BUTTONS).fill(false);
    HID_BIT_TO_BUTTON.forEach((button, bit) => {
      pressed[button] = Boolean(bits & (1 << bit));
    });
    (HID_HAT_TO_DPAD[data.getUint8(2)] || []).forEach((button) => {
      pressed[button] = true;
    });
    hidPad.buttons = pressed.map((value) => ({ pressed: value }));
    hidPad.axes = [(data.getUint8(4) - 128) / 128, (data.getUint8(6) - 128) / 128];
  }

  async function attachHid(device) {
    try {
      if (!device.opened) await device.open();
    } catch (e) {
      console.warn(`Couldn't open ${device.productName}: ${e.message}`);
      return;
    }
    hidPad = {
      index: 'hid',
      id: device.productName,
      device,
      live: false,
      mapping: 'standard',
      axes: [0, 0],
      buttons: new Array(HID_BUTTONS).fill({ pressed: false }),
    };
    device.addEventListener('inputreport', readHidReport);
  }

  async function chooseHid() {
    T.audio && T.audio.unlock();
    try {
      const [device] = await navigator.hid.requestDevice({
        filters: [{ vendorId: 0x057e }, { usagePage: 1, usage: 4 }, { usagePage: 1, usage: 5 }],
      });
      if (device) attachHid(device);
    } catch (e) {
      // Chrome refused or the list was closed. The icon stays for another try.
    }
  }

  // A grown-up clicks this once. Chrome remembers the choice for next time.
  function addConnectButton() {
    if (document.getElementById('pad-connect') || document.getElementById('pad-badge')) return;
    const btn = document.createElement('button');
    btn.id = 'pad-connect';
    btn.setAttribute('aria-label', 'Connect a controller');
    btn.innerHTML = PAD_ICON;
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', chooseHid);
    document.body.appendChild(btn);
  }

  async function setUpHid() {
    if (!navigator.hid) return;
    // The icon stays until the pad actually sends something, because a remembered
    // pad can still fail to open or be switched off.
    addConnectButton();
    navigator.hid.addEventListener('connect', (e) => attachHid(e.device));
    navigator.hid.addEventListener('disconnect', (e) => {
      if (!hidPad || hidPad.device !== e.device) return;
      hidPad = null;
      prev.delete('hid');
      const badge = document.getElementById('pad-badge');
      if (badge) badge.remove();
      addConnectButton();
    });
    try {
      const [known] = await navigator.hid.getDevices();
      if (known) attachHid(known);
    } catch (e) {
      // Blocked by the page's host. The icon may still offer a way in.
    }
  }

  // A little picture shows that the controller is working, since nothing else says so.
  function padFound() {
    if (!document.getElementById('pad-badge')) {
      const badge = document.createElement('div');
      badge.id = 'pad-badge';
      badge.setAttribute('role', 'img');
      badge.setAttribute('aria-label', 'Controller connected');
      badge.innerHTML = PAD_ICON;
      document.body.appendChild(badge);
    }
    const connect = document.getElementById('pad-connect');
    if (connect) connect.remove();
    emit('padFound');
    if (T.audio) T.audio.chirp();
  }

  addEventListener('gamepaddisconnected', (e) => {
    prev.delete(e.gamepad.index);
    const anyLeft = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean);
    const badge = document.getElementById('pad-badge');
    if (badge && !anyLeft) badge.remove();
  });

  // Some pads have a turbo mode that presses a button by itself, over and over.
  // Anything faster than small hands can go is ignored until it slows down.
  const AUTO_FIRE_WINDOW_MS = 1500;
  const AUTO_FIRE_PRESSES = 5;
  const recentPresses = new Map();

  function isAutoFire(key, now) {
    const presses = (recentPresses.get(key) || []).filter((t) => now - t < AUTO_FIRE_WINDOW_MS);
    presses.push(now);
    recentPresses.set(key, presses);
    return presses.length >= AUTO_FIRE_PRESSES;
  }

  function pollPads(now) {
    const browserPads = [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean);
    const pads = browserPads.length || !hidPad || !hidPad.live ? browserPads : [hidPad];
    let padX = 0;
    let padY = 0;
    for (const p of pads) {
      if (!p) continue;
      state.padName = p.id;
      if (!prev.has(p.index)) padFound();
      const old = prev.get(p.index) || [];
      const next = p.buttons.map((b) => b.pressed);
      next.forEach((pressed, i) => {
        const isDpad = p.mapping === 'standard' && i >= 12 && i <= 15;
        if (pressed && !old[i] && !isDpad && i < MAIN_BUTTONS && !isAutoFire(`${p.index}:${i}`, now)) emit('button', i);
      });
      prev.set(p.index, next);
      const d = readDirection(p);
      padX = padX || d.x;
      padY = padY || d.y;
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
  setUpHid();

  T.input = {
    listen(listener) {
      listeners.push(listener);
    },
    attachHid,
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
