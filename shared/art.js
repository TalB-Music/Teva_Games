// All artwork is inline SVG. Emoji look different on Xiaomi and on Windows, and
// the dinosaur has to be just as cute on both.
(function () {
  const T = (window.Teva = window.Teva || {});

  const BODY = '#35C9A5';
  const BODY_DARK = '#1FA587';
  const BELLY = '#FFE680';
  const SPIKE = '#FF7F8E';
  const INK = '#20324A';

  function dino() {
    return `
<svg class="dino" viewBox="0 -14 410 436" aria-hidden="true" data-eyes="open" data-mouth="smile">
  <g class="d-tail">
    <path d="M336 214l20-26 8 32Z M300 200l24-30 8 36Z" fill="${SPIKE}" stroke="${SPIKE}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M254 280C320 330 398 302 402 226c1-16-16-20-24-6-18 32-62 32-118 2Z" fill="${BODY}"/>
  </g>
  <ellipse cx="136" cy="388" rx="50" ry="27" fill="${BODY_DARK}"/>
  <ellipse cx="262" cy="388" rx="50" ry="27" fill="${BODY_DARK}"/>
  <g fill="#fff" opacity=".85">
    <circle cx="104" cy="394" r="7"/><circle cx="124" cy="401" r="7"/><circle cx="145" cy="402" r="7"/>
    <circle cx="232" cy="402" r="7"/><circle cx="253" cy="401" r="7"/><circle cx="273" cy="394" r="7"/>
  </g>
  <g class="d-body">
    <ellipse cx="200" cy="288" rx="110" ry="100" fill="${BODY}"/>
    <ellipse cx="197" cy="304" rx="72" ry="72" fill="${BELLY}"/>
    <path d="M144 288q53 22 106 0M138 318q59 24 118 0M152 348q45 18 90 0" fill="none" stroke="#F7CF58" stroke-width="7" stroke-linecap="round"/>
    <ellipse class="d-arm d-arm-l" cx="98" cy="280" rx="20" ry="36" fill="${BODY_DARK}" transform="rotate(24 98 280)"/>
    <ellipse class="d-arm d-arm-r" cx="298" cy="280" rx="20" ry="36" fill="${BODY_DARK}" transform="rotate(-24 298 280)"/>
  </g>
  <g class="d-head">
    <path d="M86 70 112 16l36 40Z M160 44l34-54 34 54Z M238 56l38-40 24 54Z" fill="${SPIKE}" stroke="${SPIKE}" stroke-width="12" stroke-linejoin="round"/>
    <ellipse cx="192" cy="142" rx="136" ry="106" fill="${BODY}"/>
    <g fill="${BODY_DARK}" opacity=".5">
      <circle cx="92" cy="86" r="11"/><circle cx="116" cy="66" r="7"/><circle cx="294" cy="92" r="9"/>
    </g>
    <ellipse cx="96" cy="182" rx="26" ry="17" fill="#FF9DAB" opacity=".85"/>
    <ellipse cx="288" cy="182" rx="26" ry="17" fill="#FF9DAB" opacity=".85"/>
    <g class="d-eyes d-eyes-open">
      <circle cx="136" cy="130" r="40" fill="#fff"/>
      <circle cx="248" cy="130" r="40" fill="#fff"/>
      <g class="d-pupils">
        <circle cx="140" cy="134" r="27" fill="${INK}"/>
        <circle cx="252" cy="134" r="27" fill="${INK}"/>
        <circle cx="150" cy="122" r="10" fill="#fff"/>
        <circle cx="262" cy="122" r="10" fill="#fff"/>
        <circle cx="130" cy="146" r="5" fill="#fff"/>
        <circle cx="242" cy="146" r="5" fill="#fff"/>
      </g>
    </g>
    <path class="d-eyes d-eyes-happy" d="M102 142q34-44 68 0M214 142q34-44 68 0" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
    <path class="d-eyes d-eyes-shut" d="M104 128q32 28 64 0M216 128q32 28 64 0" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="178" cy="172" r="4.5" fill="${BODY_DARK}"/>
    <circle cx="206" cy="172" r="4.5" fill="${BODY_DARK}"/>
    <g class="d-mouth d-mouth-smile">
      <path d="M160 192q32 30 64 0" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <path d="M204 201l14-5-4 15Z" fill="#fff"/>
    </g>
    <g class="d-mouth d-mouth-open">
      <ellipse cx="192" cy="208" rx="38" ry="28" fill="#7A2E3F"/>
      <ellipse cx="192" cy="222" rx="24" ry="12" fill="#FF8FA3"/>
    </g>
  </g>
</svg>`;
  }

  function egg(colors = { shell: '#FFF8E0', spot: '#35C9A5', spot2: '#FF7F8E' }) {
    return `
<svg class="egg" viewBox="0 0 300 360" aria-hidden="true">
  <path d="M150 10c85 0 135 120 135 205s-60 135-135 135S15 300 15 215 65 10 150 10Z" fill="${colors.shell}"/>
  <path d="M15 215c0 85 60 135 135 135 50 0 95-22 118-64-60 30-180 26-253-71Z" fill="#000" opacity=".05"/>
  <ellipse cx="108" cy="110" rx="26" ry="32" fill="${colors.spot}" transform="rotate(16 108 110)"/>
  <circle cx="196" cy="86" r="18" fill="${colors.spot2}"/>
  <circle cx="216" cy="196" r="32" fill="${colors.spot}"/>
  <circle cx="86" cy="226" r="24" fill="${colors.spot2}"/>
  <circle cx="150" cy="288" r="18" fill="${colors.spot}"/>
  <path class="crack crack-1" d="M64 170l34 20 26-24 28 26 26-22" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path class="crack crack-2" d="M178 170l30 18 26-22 28 24M98 190l-10 30M152 192l6 34" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  }

  T.art = { dino, egg };

  T.icons = {
    leaf: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 94C18 78 8 44 50 6c42 38 32 72 0 88Z" fill="#7BE36B"/><path d="M50 92V30M50 62 32 46M50 62l18-16M50 80 36 68M50 80l14-12" fill="none" stroke="#1E8F4E" stroke-width="5" stroke-linecap="round"/></svg>`,
    ball: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="#FFD84D"/><path d="M50 6c-24 26-24 62 0 88 24-26 24-62 0-88Z" fill="#fff"/><path d="M50 6C8 14-2 70 28 88 18 62 26 26 50 6ZM50 6c42 8 52 64 22 82 10-26 2-62-22-82Z" fill="#39A9F4"/><ellipse cx="32" cy="26" rx="9" ry="5" fill="#fff" opacity=".8" transform="rotate(-35 32 26)"/></svg>`,
    bubbles: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="40" cy="58" r="32" fill="#D8F5FF" stroke="#fff" stroke-width="5"/><circle cx="76" cy="28" r="18" fill="#D8F5FF" stroke="#fff" stroke-width="4"/><circle cx="82" cy="72" r="11" fill="#D8F5FF" stroke="#fff" stroke-width="3"/><path d="M22 52a20 20 0 0 1 14-14" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`,
    moon: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M62 8a44 44 0 1 0 30 62A36 36 0 0 1 62 8Z" fill="#FFE680"/><circle cx="36" cy="46" r="4" fill="#E8B93B"/><path d="M28 62q10 9 20 2" fill="none" stroke="#E8B93B" stroke-width="4" stroke-linecap="round"/><path d="m80 22 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#fff"/></svg>`,
    heart: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 90C8 60 4 34 18 20c12-12 26-6 32 8 6-14 20-20 32-8 14 14 10 40-32 70Z" fill="#FF5D87"/></svg>`,
    star: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="m50 6 13 29 32 4-24 22 7 32-28-16-28 16 7-32L5 39l32-4Z" fill="#FFD84D" stroke="#FFD84D" stroke-width="6" stroke-linejoin="round"/></svg>`,
    shell: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M12 76 30 22l18 22 20-30 18 62Z" fill="#FFF8E0" stroke="#FFF8E0" stroke-width="6" stroke-linejoin="round"/></svg>`,
    zzz: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M22 24h56L22 78h56" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    crumb: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="#7BE36B"/></svg>`,
    tub: `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#E8FBFF" stroke="#fff" stroke-width="2"><circle cx="20" cy="42" r="6"/><circle cx="31" cy="40" r="7"/><circle cx="44" cy="39" r="8"/><circle cx="58" cy="39" r="8"/><circle cx="70" cy="41" r="6"/></g><rect x="10" y="40" width="80" height="12" rx="6" fill="#7FD6FF"/><circle cx="30" cy="92" r="5" fill="#FF7F8E"/><circle cx="70" cy="92" r="5" fill="#FF7F8E"/><path d="M12 50h76v16a22 22 0 0 1-22 22H34a22 22 0 0 1-22-22Z" fill="#fff"/><path d="M12 66a22 22 0 0 0 22 22h32a22 22 0 0 0 22-22c-20 10-56 10-76 0Z" fill="#DDECF5"/><rect x="6" y="45" width="88" height="9" rx="4.5" fill="#FF9DAB"/></svg>`,
    duck: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M14 58c0 22 16 32 38 32 24 0 38-14 36-36-8 6-20 8-32 4-8-2-34-10-42 0Z" fill="#FFD84D"/><circle cx="36" cy="36" r="24" fill="#FFD84D"/><path d="M14 34 0 40l14 8Z" fill="#FF9A5C" stroke="#FF9A5C" stroke-width="4" stroke-linejoin="round"/><circle cx="29" cy="30" r="4.5" fill="#20324A"/></svg>`,
    drop: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6c18 26 32 42 32 58a32 32 0 0 1-64 0C18 48 32 32 50 6Z" fill="#7FD6FF"/><ellipse cx="38" cy="62" rx="6" ry="10" fill="#fff" opacity=".8"/></svg>`,
    toothbrush: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="40" y="48" width="58" height="12" rx="6" fill="#FF5D87"/><rect x="4" y="46" width="42" height="14" rx="6" fill="#39A9F4"/><path d="M8 46V32M15 46V32M22 46V32M29 46V32M36 46V32M43 46V32" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M6 28q7-8 14-1t14-1 12 2" fill="none" stroke="#9FF0D8" stroke-width="7" stroke-linecap="round"/></svg>`,
  };

  // The little world every game takes place in. Day and night cross-fade.
  T.addScene = function () {
    const scene = document.createElement('div');
    scene.id = 'scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = `
      <div class="sky sky-night"></div>
      <div class="stars"></div>
      <svg class="sun" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#FFD84D"/><g stroke="#FFD84D" stroke-width="7" stroke-linecap="round"><path d="M50 6v8M50 86v8M6 50h8M86 50h8M19 19l6 6M75 75l6 6M19 81l6-6M75 25l6-6"/></g></svg>
      <div class="moon">${T.icons.moon}</div>
      <svg class="cloud cloud-a" viewBox="0 0 200 90"><path d="M40 84a34 34 0 0 1 0-68 46 46 0 0 1 84-6 38 38 0 0 1 36 74Z" fill="#fff"/></svg>
      <svg class="cloud cloud-b" viewBox="0 0 200 90"><path d="M40 84a34 34 0 0 1 0-68 46 46 0 0 1 84-6 38 38 0 0 1 36 74Z" fill="#fff"/></svg>
      <svg class="volcano" viewBox="0 0 400 260" preserveAspectRatio="xMidYMax meet">
        <path d="M0 260C80 220 120 90 158 50q42-20 84 0c38 40 78 170 158 210Z" fill="#B79BEA"/>
        <path d="M158 50q42-20 84 0l14 26c-14 18-22-4-36 6s-20 22-34 4-24-2-34-8-12 6-8-2Z" fill="#FF8A5C"/>
        <circle cx="178" cy="150" r="8" fill="#6F58A8"/><circle cx="222" cy="150" r="8" fill="#6F58A8"/>
        <path d="M186 172q14 12 28 0" fill="none" stroke="#6F58A8" stroke-width="6" stroke-linecap="round"/>
        <g fill="#fff"><circle class="puff puff-a" cx="200" cy="36" r="14"/><circle class="puff puff-b" cx="200" cy="36" r="10"/></g>
      </svg>
      <div class="ground">
        <svg class="ground-edge" viewBox="0 0 1000 60" preserveAspectRatio="none"><path d="M0 60V34c120-34 260-34 400-8s300 24 600-14v48Z"/></svg>
        <svg class="fern fern-l" viewBox="0 0 120 150"><g fill="none" stroke="#1E9C6E" stroke-width="16" stroke-linecap="round"><path d="M60 146C58 100 40 60 14 40"/><path d="M60 146c0-50 2-90 6-130"/><path d="M60 146c6-40 24-74 48-92"/></g></svg>
        <svg class="fern fern-r" viewBox="0 0 120 150"><g fill="none" stroke="#1E9C6E" stroke-width="16" stroke-linecap="round"><path d="M60 146C58 100 40 60 14 40"/><path d="M60 146c0-50 2-90 6-130"/><path d="M60 146c6-40 24-74 48-92"/></g></svg>
      </div>`;
    const stars = scene.querySelector('.stars');
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('i');
      s.style.left = (i * 37) % 100 + '%';
      s.style.top = (i * 23) % 56 + '%';
      s.style.animationDelay = (i % 7) * 0.4 + 's';
      stars.appendChild(s);
    }
    document.body.prepend(scene);
  };

  // Short-lived pictures that fly around: hearts, stars, crumbs.
  T.fx = {
    layer() {
      let l = document.getElementById('fx');
      if (!l) {
        l = document.createElement('div');
        l.id = 'fx';
        l.setAttribute('aria-hidden', 'true');
        document.body.appendChild(l);
      }
      return l;
    },
    make(icon, x, y, size) {
      const el = document.createElement('div');
      el.className = 'fx-item';
      el.innerHTML = T.icons[icon];
      el.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px`;
      this.layer().appendChild(el);
      return el;
    },
    burst(icon, x, y, count = 6, size = 44, spread = 170) {
      for (let i = 0; i < count; i++) {
        const el = this.make(icon, x, y, size * (0.7 + Math.random() * 0.6));
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
        const dist = spread * (0.5 + Math.random() * 0.6);
        el.animate(
          [
            { transform: 'translate(0,0) scale(.3)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * dist * 0.6}px,${Math.sin(angle) * dist * 0.6}px) scale(1.1)`, opacity: 1, offset: 0.5 },
            { transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(.8)`, opacity: 0 },
          ],
          { duration: 800 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }
        ).onfinish = () => el.remove();
      }
    },
  };
})();
