const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;

const toast = m => {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('on'), 3200);
};

const K = 0.28;
const proj = (lo, la) => [+((lo - 82.5) * 0.93 * K).toFixed(3), +((22 - la) * K).toFixed(3)];

const L = [
  ['Capital Blood Centre', 'New Delhi · Delhi', ...proj(77.2, 28.6), 'O−'],
  ['Harbour City Blood Bank', 'Mumbai · Maharashtra', ...proj(73.0, 19.1), 'B−'],
  ['Garden City Donation Centre', 'Bengaluru · Karnataka', ...proj(77.6, 12.97), ''],
  ['Marina Community Blood Centre', 'Chennai · Tamil Nadu', ...proj(80.0, 13.0), ''],
  ['Eastern Riverside Hospital Drive', 'Kolkata · West Bengal', ...proj(88.36, 22.57), 'A+'],
  ['Deccan Mobile Donation Van', 'Hyderabad · Telangana', ...proj(78.5, 17.4), 'AB−'],
  ['Pink City Clinic Drive', 'Jaipur · Rajasthan', ...proj(75.8, 26.9), ''],
  ['Brahmaputra Blood Centre', 'Guwahati · Assam', ...proj(91.75, 26.15), ''],
  ['Backwater Medical Centre', 'Kochi · Kerala', ...proj(76.45, 10.1), '']
];

const Q = [
  ['O−', 'Capital Blood Centre', 'New Delhi · Delhi', 'Critical', 4],
  ['B−', 'Harbour City Blood Bank', 'Mumbai · Maharashtra', 'Critical', 2],
  ['A+', 'Eastern Riverside Hospital Drive', 'Kolkata · West Bengal', 'Urgent', 3],
  ['AB−', 'Deccan Mobile Donation Van', 'Hyderabad · Telangana', 'Urgent', 1],
  ['A−', 'Capital Blood Centre', 'New Delhi · Delhi', 'Urgent', 2],
  ['O+', 'Marina Community Blood Centre', 'Chennai · Tamil Nadu', 'Soon', 6],
  ['B+', 'Garden City Donation Centre', 'Bengaluru · Karnataka', 'Soon', 2],
  ['O−', 'Eastern Riverside Hospital Drive', 'Kolkata · West Bengal', 'Soon', 3]
];

const ic = { Critical: '● Critical', Urgent: '▲ Urgent', Soon: '○ Soon' };
$('#c-req').dataset.n = Q.filter(q => q[3] !== 'Soon').length;

/* reveal + counters */
const live = {};

function count(c) {
  const b = c.querySelector('b');
  const n = +c.dataset.n;
  live[c.id] = n;
  if (RM) {
    b.textContent = n.toLocaleString();
    c.done = 1;
    return;
  }
  const t0 = performance.now();
  (function f(t) {
    const p = Math.min((t - t0) / 1600, 1);
    b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(f);
    else c.done = 1;
  })(t0);
}

const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('in');
    io.unobserve(e.target);
    if (e.target.classList.contains('tilt')) {
      const t = e.target;
      setTimeout(() => { t.classList.remove('rv', 'in'); t.style.transitionDelay = ''; }, 1500);
    }
    if (e.target.dataset.n) count(e.target);
  }
}), { threshold: 0.15 });

$$('.rv').forEach((e, i) => {
  e.style.transitionDelay = (i % 4) * 80 + 'ms';
  io.observe(e);
});

const bump = (c, d) => {
  if (!c.done) return;
  live[c.id] += d;
  c.querySelector('b').textContent = live[c.id].toLocaleString();
};

setInterval(() => {
  const d = 1 + (Math.random() * 3 | 0);
  bump($('#c-units'), d);
  bump($('#c-lives'), d * 3);
}, 3500);

const P = $$('[data-p]');
addEventListener('scroll', () => {
  if (!RM) requestAnimationFrame(() => P.forEach(e => e.style.transform = `translate3d(0,${scrollY * e.dataset.p}px,0)`));
}, { passive: true });

/* 3D tilt + glare on glass cards */
if (!RM && matchMedia('(hover:hover)').matches) {
  let cur = null;
  const rest = el => el.style.removeProperty('--tilt');
  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest ? e.target.closest('.tilt') : null;
    if (cur && cur !== el) rest(cur);
    cur = el;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--tilt', `perspective(900px) rotateX(${((0.5 - y) * 9).toFixed(2)}deg) rotateY(${((x - 0.5) * 11).toFixed(2)}deg) translateZ(12px)`);
    el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    if (!e.relatedTarget && cur) { rest(cur); cur = null; }
  });
}

/* request board */
let grp = 'All';
const groups = ['All', ...new Set(Q.map(q => q[0]))];

function board() {
  $('#chips').innerHTML = groups.map(g => `<button class="chip" aria-pressed="${g === grp}" data-g="${g}">${g}</button>`).join('');
  $('#rq').innerHTML = Q.filter(q => grp === 'All' || q[0] === grp).map(q => `
    <article class="card pad hov tilt">
      <div class="bg">${q[0]}</div>
      <h3>${q[1]}</h3>
      <p class="mute" style="margin-bottom:8px">${q[2]}<br>${q[4]} units needed</p>
      <span class="tag ${q[3] === 'Soon' ? 's' : ''}">${ic[q[3]]}</span>
      <div style="margin-top:14px"><button class="btn sm" data-c="${q[1]}">Contact</button></div>
    </article>
  `).join('');
}

$('#chips').onclick = e => {
  const b = e.target.closest('[data-g]');
  if (b) {
    grp = b.dataset.g;
    board();
  }
};

$('#rq').onclick = e => {
  const b = e.target.closest('[data-c]');
  if (b) toast('Request sent. ' + b.dataset.c + ' will call you shortly.');
};
board();

/* eligibility */
const E = [
  ['Are you between 18 and 65 years old?', 1],
  ['Do you weigh at least 50 kg (110 lb)?', 1],
  ['Do you feel well today, with no fever, cold or infection?', 1],
  ['In the last 6 months, have you had a tattoo, piercing or major surgery?', 0]
];
let es = 0, ea = [];

function er(f) {
  const el = $('#elig');
  if (es < E.length) {
    el.innerHTML = `
      <p class="mute" style="margin:0">Step ${es + 1} of ${E.length}</p>
      <div class="bar"><i style="width:${(es / E.length) * 100}%"></i></div>
      <h3 id="eq" tabindex="-1">${E[es][0]}</h3>
      <div class="ans">
        <button class="btn" data-a="1">Yes</button>
        <button class="btn ghost" data-a="0">No</button>
      </div>
      ${es ? '<button class="chip" data-back>← Back</button>' : ''}
    `;
  } else {
    const ok = ea.every((a, i) => a === E[i][1]);
    el.innerHTML = `
      <div class="bar"><i style="width:100%"></i></div>
      <h3 id="eq" tabindex="-1">${ok ? 'You may be able to donate! 🎉' : 'Not just yet, and that’s okay'}</h3>
      <p class="mute">${ok ? 'Wonderful. Book a visit and our nurse will confirm everything at your health check.' : 'Based on your answers, please wait a little or speak with a nurse. You can still help by sharing urgent requests.'}</p>
      <button class="btn" data-auth>${ok ? 'Book my first donation' : 'Sign in'}</button>
      <button class="chip" data-reset>Start over</button>
    `;
  }
  if (f) $('#eq').focus();
}

$('#elig').onclick = e => {
  const a = e.target.closest('[data-a]');
  if (a) {
    ea[es++] = +a.dataset.a;
    er(1);
  } else if (e.target.closest('[data-back]')) {
    es--;
    er(1);
  } else if (e.target.closest('[data-reset]')) {
    es = 0;
    ea = [];
    er(1);
  }
};
er();

/* auth + dashboard */
let signed = 0;
const dlg = $('#auth');

document.addEventListener('click', e => {
  if (e.target.closest('[data-auth]')) {
    signed ? $('#me').scrollIntoView() : dlg.showModal();
  }
});

$('#af').onsubmit = e => {
  e.preventDefault();
  signed = 1;
  const n = $('#em').value.split('@')[0];
  $('#hi').textContent = 'Welcome back, ' + n.charAt(0).toUpperCase() + n.slice(1);
  $('#lock').hidden = 1;
  $('#dash').hidden = 0;
  $('#navAuth').textContent = 'My dashboard';
  dlg.close();
  $('#me').scrollIntoView();
};

$('#bc').innerHTML = L.map(l => `<option>${l[0]}</option>`).join('');
$('#bd').min = new Date().toISOString().slice(0, 10);

$('#bk').onsubmit = e => {
  e.preventDefault();
  const a = $('#appts');
  if (a.firstChild && a.firstChild.classList && a.firstChild.classList.contains('mute')) a.innerHTML = '';
  a.insertAdjacentHTML('beforeend', `<li>${$('#bd').value} · ${$('#bt').value} · ${$('#bc').value}</li>`);
  $('#notes').insertAdjacentHTML('afterbegin', '<li>Appointment confirmed. See you soon!</li>');
  $('#nc').textContent = '3 new';
  toast('Appointment booked. Thank you!');
};

/* studio reflections so glass and gloss have something to reflect */
function makeEnv(R) {
  try {
    const pm = new THREE.PMREMGenerator(R);
    const es = new THREE.Scene();
    es.add(new THREE.Mesh(
      new THREE.BoxGeometry(30, 30, 30),
      new THREE.MeshBasicMaterial({ color: 0x1b2748, side: THREE.BackSide })
    ));
    const panel = (w, h, x, y, z, hex, k) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      es.add(m);
    };
    panel(14, 8, 8, 12, 10, 0xffffff, 5);
    panel(5, 16, -12, 3, 6, 0xffd9e0, 3);
    panel(16, 4, 0, -11, 8, 0x7f9bff, 2.2);
    panel(6, 6, -4, 6, -12, 0xffffff, 3);
    const tex = pm.fromScene(es, 0.03).texture;
    pm.dispose();
    return tex;
  } catch (err) {
    return null;
  }
}

/* 3D */
const jobs = [];

function fit(R, C, el) {
  const w = el.clientWidth, h = el.clientHeight;
  if (!w || !h) return;
  R.setSize(w, h, false);
  C.aspect = w / h;
  C.updateProjectionMatrix();
}

function vis(el) {
  const o = { v: 1 };
  new IntersectionObserver(e => o.v = e[0].isIntersecting).observe(el);
  return o;
}

try {
  const el = $('#hero3d');
  const R = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio, 2));

  const S = new THREE.Scene();
  const C = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  C.position.set(0, 0.4, 8);

  const pr = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    pr.push(new THREE.Vector2(0.85 * Math.sin(Math.PI * Math.pow(t, 0.6)), -0.9 + t * 2.9));
  }

  S.environment = makeEnv(R);

  const g = new THREE.Group();

  /* glass shell around a deep-red core */
  const shell = new THREE.Mesh(
    new THREE.LatheGeometry(pr, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0xd42a4d,
      roughness: 0.04,
      transparent: true,
      opacity: 0.62,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.6,
      depthWrite: false
    })
  );
  const core = new THREE.Mesh(
    new THREE.LatheGeometry(pr, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x7d0a24,
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: 0x3a0412,
      envMapIntensity: 0.9
    })
  );
  core.scale.setScalar(0.78);
  core.position.y = 0.12;
  const drop = new THREE.Group();
  drop.add(core, shell);
  drop.position.y = -0.5;
  g.add(drop);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.045, 32, 180),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1,
      envMapIntensity: 2
    })
  );
  ring.rotation.set(1.2, 0.25, 0.3);
  ring.position.y = 0.05;
  g.add(ring);
  S.add(g);

  /* biconcave red blood cells orbiting the drop */
  const cp = [];
  const R0 = 0.5;
  const half = r => 0.25 * Math.sqrt(Math.max(0, 1 - r * r)) * (0.207 + 2.003 * r * r - 1.123 * r * r * r * r);
  for (let i = 0; i <= 24; i++) cp.push(new THREE.Vector2(R0 * i / 24, half(i / 24)));
  for (let i = 23; i >= 0; i--) cp.push(new THREE.Vector2(R0 * i / 24, -half(i / 24)));
  const cellGeo = new THREE.LatheGeometry(cp, 48);
  const cellMat = new THREE.MeshPhysicalMaterial({
    color: 0xc41e3d,
    roughness: 0.28,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    emissive: 0x3a0412,
    envMapIntensity: 1.1
  });
  const cells = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(cellGeo, cellMat);
    m.scale.setScalar(0.38 + Math.random() * 0.26);
    m.userData = {
      a: (i / 9) * 6.283 + Math.random() * 0.5,
      r: 1.55 + Math.random() * 0.45,
      y: (Math.random() - 0.5) * 2.2,
      sp: 0.12 + Math.random() * 0.2,
      ph: Math.random() * 6.28
    };
    S.add(m);
    cells.push(m);
  }

  S.add(new THREE.AmbientLight(0xffffff, 0.35));
  const l1 = new THREE.PointLight(0xffe0e4, 1.2);
  l1.position.set(3, 3, 5);
  const l2 = new THREE.PointLight(0x6c8cf0, 1);
  l2.position.set(-4, -1, 3);
  S.add(l1, l2);

  const N = 70;
  const pa = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i += 3) {
    const r = 2 + Math.random() * 1.8;
    const a = Math.random() * 6.28;
    const b = Math.random() * 3 - 1.5;
    pa[i] = Math.cos(a) * r;
    pa[i + 1] = b * 1.4;
    pa[i + 2] = Math.sin(a) * r;
  }

  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  const pts = new THREE.Points(
    pg,
    new THREE.PointsMaterial({ size: 0.07, color: 0xe0405c, transparent: true, opacity: 0.55 })
  );
  S.add(pts);

  let drag = 0, lx = 0, vy = 0, tx = 0, ty = 0;
  el.onpointerdown = e => {
    drag = 1;
    lx = e.clientX;
    el.setPointerCapture(e.pointerId);
  };
  el.onpointerup = () => drag = 0;

  el.onpointermove = e => {
    const r = el.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (drag) {
      vy += (e.clientX - lx) * 0.0015;
      lx = e.clientX;
    }
  };

  const v = vis(el);
  new ResizeObserver(() => fit(R, C, el)).observe(el);
  $('#fb').style.display = 'none';

  jobs.push(t => {
    if (!v.v) return;
    t *= 0.001;
    g.rotation.y += (RM ? 0 : 0.0035) + vy;
    vy *= 0.94;
    g.rotation.x += (ty * 0.35 - g.rotation.x) * 0.05;
    g.position.x += (tx * 0.4 - g.position.x) * 0.05;
    drop.position.y = -0.5 + (RM ? 0 : Math.sin(t * 1.2) * 0.07);
    const tt = RM ? 0 : t;
    ring.rotation.z = 0.3 + tt * 0.12;
    cells.forEach(c => {
      const u = c.userData;
      const a = u.a + tt * u.sp;
      c.position.set(Math.cos(a) * u.r, u.y + Math.sin(tt * 0.8 + u.ph) * 0.12, Math.sin(a) * u.r * 0.9);
      c.rotation.set(tt * 0.5 + u.ph, 0, tt * 0.3 + u.ph);
    });
    pts.rotation.y = t * 0.05;
    pts.position.y = Math.sin(t * 0.6) * 0.1;
    R.render(S, C);
  });
} catch (e) {}

try {
  const el = $('#map3d');
  const R = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio, 2));

  const S = new THREE.Scene();
  const C = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  const cs = getComputedStyle(document.documentElement);
  const navy = new THREE.Color(cs.getPropertyValue('--navy').trim());
  const red = new THREE.Color(0xc8203f);

  S.environment = makeEnv(R);

  const TOP = 0.5;
  const IN = [[68.2, 23.7], [70.1, 24.3], [71.1, 24.5], [70.8, 25.6], [70.0, 26.4], [69.5, 27.2], [70.4, 28.0], [71.8, 27.8], [72.9, 29.0], [73.9, 29.9], [74.7, 31.1], [74.9, 31.9], [75.4, 32.6], [74.3, 32.9], [73.7, 34.7], [74.0, 36.0], [75.0, 37.0], [76.3, 36.6], [77.8, 35.5], [78.9, 34.7], [79.2, 33.2], [78.5, 32.4], [78.8, 31.2], [79.1, 30.6], [80.2, 30.4], [80.9, 29.8], [80.2, 28.8], [81.9, 28.0], [83.4, 27.4], [84.7, 27.2], [85.9, 26.6], [87.3, 26.4], [88.1, 26.4], [88.1, 27.5], [88.3, 27.9], [88.8, 28.1], [88.9, 27.3], [89.1, 26.7], [90.4, 26.8], [91.6, 26.8], [91.6, 27.8], [92.7, 28.1], [93.8, 28.7], [95.0, 29.2], [96.1, 29.4], [97.3, 28.3], [96.8, 27.4], [96.0, 27.2], [95.2, 26.0], [94.7, 25.4], [94.4, 24.5], [94.1, 23.8], [93.4, 23.0], [93.1, 22.1], [92.8, 21.9], [92.2, 22.6], [92.3, 23.5], [91.8, 23.2], [91.5, 23.0], [91.2, 23.6], [91.6, 24.2], [92.3, 24.9], [91.9, 25.2], [91.2, 25.2], [90.3, 25.1], [89.8, 25.3], [89.8, 26.0], [89.0, 26.3], [88.5, 26.4], [88.1, 25.3], [88.4, 24.3], [88.7, 23.8], [88.9, 23.3], [89.0, 22.5], [89.0, 21.7], [88.1, 21.6], [87.0, 21.5], [86.8, 20.9], [86.4, 20.2], [85.8, 19.8], [85.1, 19.3], [84.4, 18.5], [83.3, 17.7], [82.3, 16.9], [81.3, 16.3], [80.9, 15.8], [80.2, 15.5], [80.1, 14.0], [80.3, 13.1], [80.1, 12.0], [79.8, 11.9], [79.9, 10.8], [79.3, 10.3], [78.9, 9.3], [78.1, 8.9], [77.5, 8.1], [76.5, 8.9], [76.2, 10.0], [75.6, 11.6], [74.9, 12.9], [74.4, 14.5], [73.9, 15.5], [73.4, 16.8], [73.0, 17.9], [72.8, 19.0], [72.7, 20.2], [72.8, 21.2], [72.6, 22.2], [72.1, 21.6], [71.0, 20.8], [70.3, 20.9], [69.0, 22.3], [69.8, 22.45], [70.5, 22.7], [70.1, 23.15], [69.1, 22.95], [68.5, 23.3]];

  /* extruded land: glass top, crimson glowing rim */
  const shp = new THREE.Shape();
  IN.forEach((p, i) => {
    const x = (p[0] - 82.5) * 0.93 * K, y = (p[1] - 22) * K;
    if (i) shp.lineTo(x, y); else shp.moveTo(x, y);
  });
  const land = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shp, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2, curveSegments: 1 }),
    [
      new THREE.MeshPhysicalMaterial({ color: navy, transparent: true, opacity: 0.58, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.5 }),
      new THREE.MeshPhysicalMaterial({ color: 0xc8203f, transparent: true, opacity: 0.8, roughness: 0.2, clearcoat: 1, envMapIntensity: 1.2, emissive: 0x3a0412 })
    ]
  );
  land.rotation.x = -Math.PI / 2;
  S.add(land);

  const edge = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(IN.map(p => new THREE.Vector3((p[0] - 82.5) * 0.93 * K, TOP + 0.015, -(p[1] - 22) * K))),
    new THREE.LineBasicMaterial({ color: 0xff8096, transparent: true, opacity: 0.9 })
  );
  S.add(edge);

  /* ocean glass slab + grid */
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(13, 0.2, 13),
    new THREE.MeshPhysicalMaterial({ color: navy, transparent: true, opacity: 0.14, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.4, depthWrite: false })
  );
  slab.position.y = -0.1;
  S.add(slab);

  const gd = new THREE.GridHelper(13, 26, navy, navy);
  gd.position.y = 0.01;
  gd.material.transparent = true;
  gd.material.opacity = 0.2;
  S.add(gd);

  S.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dl = new THREE.DirectionalLight(0xffffff, 0.8);
  dl.position.set(3, 6, 4);
  S.add(dl);


  const pins = [], rings = [], pk = [];
  L.forEach((l, i) => {
    const u = !!l[4];
    const gp = new THREE.Group();
    const m = new THREE.MeshPhysicalMaterial({ color: u ? red : navy, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2, emissive: u ? 0x3a0412 : 0x000000 });
    const cn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 20), m);
    cn.rotation.x = Math.PI;
    cn.position.y = 0.21;
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), m);
    sp.position.y = 0.58;
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 0.5;
    hit.userData.i = i;
    gp.add(cn, sp, hit);
    if (u) {
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.8, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xff3a5c, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      beam.position.y = 1.5;
      gp.add(beam);
    }
    gp.position.set(l[2], TOP, l[3]);
    S.add(gp);

    const sh = new THREE.Mesh(
      new THREE.CircleGeometry(0.24, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2, depthWrite: false })
    );
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(l[2], TOP + 0.02, l[3]);
    S.add(sh);
    pins.push(gp);
    pk.push(hit);

    if (u) {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.25, 0.32, 32),
        new THREE.MeshBasicMaterial({ color: red, transparent: true, side: THREE.DoubleSide })
      );
      r.rotation.x = -Math.PI / 2;
      r.position.set(l[2], TOP + 0.03, l[3]);
      S.add(r);
      rings.push(r);
    }
  });

  let az = 0.5, pol = 1, sel = -1, d = null, dir = 1;
  const rad = 14;

  function sel_(i) {
    sel = i;
    const l = L[i];
    $('#info').innerHTML = `
      <h3>${l[0]}</h3>
      <p class="mute" style="margin-bottom:8px">${l[1]}</p>
      ${l[4] ? `<span class="tag">● Urgent: ${l[4]} needed</span>` : '<span class="tag s">○ Open for donations</span>'}
      <div style="margin-top:14px"><button class="btn sm" data-auth>Book a slot</button></div>
    `;
    $$('.loc').forEach((b, j) => b.setAttribute('aria-pressed', j === i));
  }

  $('#locs').innerHTML = L.map((l, i) => `
    <button class="loc" data-i="${i}" aria-pressed="false">
      <span class="sw ${l[4] ? 'u' : ''}"></span>
      <span>${l[0]}<br><small class="mute">${l[1]}</small></span>
    </button>
  `).join('');

  $('#locs').onclick = e => {
    const b = e.target.closest('[data-i]');
    if (b) sel_(+b.dataset.i);
  };
  sel_(0);

  el.onpointerdown = e => {
    d = { x: e.clientX, y: e.clientY, m: 0 };
    el.setPointerCapture(e.pointerId);
  };

  el.onpointermove = e => {
    if (!d) return;
    az -= (e.clientX - d.x) * 0.006;
    pol = Math.max(0.5, Math.min(1.35, pol - (e.clientY - d.y) * 0.004));
    d.m += Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y);
    d.x = e.clientX;
    d.y = e.clientY;
  };

  el.onpointerup = e => {
    if (d && d.m < 6) {
      const r = el.getBoundingClientRect();
      const rc = new THREE.Raycaster();
      rc.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), C);
      const h = rc.intersectObjects(pk)[0];
      if (h) sel_(h.object.userData.i);
    }
    d = null;
  };

  el.onpointercancel = () => d = null;

  const v = vis(el);
  new ResizeObserver(() => fit(R, C, el)).observe(el);

  jobs.push(t => {
    if (!v.v) return;
    t *= 0.001;
    if (!d && !RM) { az += 0.0014 * dir; if (az > 0.95) dir = -1; if (az < -0.45) dir = 1; }
    const rr = rad * Math.max(1, 1.15 / Math.max(C.aspect, 0.55));
    C.position.set(rr * Math.sin(pol) * Math.sin(az), rr * Math.cos(pol), rr * Math.sin(pol) * Math.cos(az));
    C.lookAt(0, 0, 0);

    pins.forEach((p, i) => {
      const s = i === sel ? 1.3 : 1;
      p.scale.setScalar(p.scale.x + (s - p.scale.x) * 0.15);
    });

    rings.forEach((r, i) => {
      const k = ((t * 0.7 + i * 0.4) % 1);
      r.scale.setScalar(1 + k * 1.8);
      r.material.opacity = 0.6 * (1 - k);
    });

    R.render(S, C);
  });
} catch (e) {
  $('#map3d').style.display = 'none';
}

(function loop(t) {
  requestAnimationFrame(loop);
  jobs.forEach(j => j(t));
})(0);

/* ---- home page effects ---- */
(() => {
  const prog = $('#prog');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (RM || !matchMedia('(hover:hover)').matches) return;

  const hero = $('.hero');
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    hero.style.setProperty('--sx', (x * 100).toFixed(1) + '%');
    hero.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
    hero.style.setProperty('--px', ((x - 0.5) * 2).toFixed(3));
    hero.style.setProperty('--py', ((y - 0.5) * 2).toFixed(3));
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--px', 0);
    hero.style.setProperty('--py', 0);
  });

  $$('.mag').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
      b.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1) + 'px');
    });
    b.addEventListener('pointerleave', () => {
      b.style.setProperty('--tx', '0px');
      b.style.setProperty('--ty', '0px');
    });
  });
})();
