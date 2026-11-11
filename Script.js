const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let RM = matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ==========================================================================
   WEB AUDIO API SYNTHESIZER (ACOUSTIC CUES)
   ========================================================================== */
const AudioFX = {
  ctx: null,
  muted: localStorage.getItem('bc_sound') === 'off',
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  play(type = 'click') {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      const now = this.ctx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.07);
        osc.frequency.setValueAtTime(659.25, now + 0.14);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.setValueAtTime(620, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'switch') {
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(510, now + 0.06);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch (e) {}
  }
};

/* ==========================================================================
   TEXT-TO-SPEECH (TTS) ASSIST
   ========================================================================== */
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    toast('Text-to-speech not supported on this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.0;
  utter.pitch = 1.0;
  window.speechSynthesis.speak(utter);
  AudioFX.play('click');
  toast('🔊 Reading text aloud...');
}

/* ==========================================================================
   TOAST NOTIFICATION
   ========================================================================== */
const toast = m => {
  const t = $('#toast');
  if (!t) return;
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('on'), 3400);
};

/* ==========================================================================
   COORDINATES & DATA SETS
   ========================================================================== */
const K = 0.28;
const proj = (lo, la) => [+((lo - 82.5) * 0.93 * K).toFixed(3), +((22 - la) * K).toFixed(3)];

// Extended location dataset with real GPS coordinates, direct phone numbers, and operating hours
const L = [
  ['Capital Blood Centre', 'New Delhi · Delhi', ...proj(77.2, 28.6), 'O−', 28.6139, 77.2090, '+91 11 2338 1234', 'Open 24/7'],
  ['Harbour City Blood Bank', 'Mumbai · Maharashtra', ...proj(73.0, 19.1), 'B−', 19.0760, 72.8777, '+91 22 2410 5678', '08:00 - 20:00'],
  ['Garden City Donation Centre', 'Bengaluru · Karnataka', ...proj(77.6, 12.97), '', 12.9716, 77.5946, '+91 80 2221 9012', '09:00 - 18:00'],
  ['Marina Community Blood Centre', 'Chennai · Tamil Nadu', ...proj(80.0, 13.0), '', 13.0827, 80.2707, '+91 44 2836 3456', 'Open 24/7'],
  ['Eastern Riverside Hospital Drive', 'Kolkata · West Bengal', ...proj(88.36, 22.57), 'A+', 22.5726, 88.3639, '+91 33 2282 7890', '08:30 - 19:30'],
  ['Deccan Mobile Donation Van', 'Hyderabad · Telangana', ...proj(78.5, 17.4), 'AB−', 17.3850, 78.4867, '+91 40 2345 6789', '10:00 - 17:00'],
  ['Pink City Clinic Drive', 'Jaipur · Rajasthan', ...proj(75.8, 26.9), '', 26.9124, 75.7873, '+91 141 256 1234', '09:00 - 18:00'],
  ['Brahmaputra Blood Centre', 'Guwahati · Assam', ...proj(91.75, 26.15), '', 26.1445, 91.7362, '+91 361 254 9876', 'Open 24/7'],
  ['Backwater Medical Centre', 'Kochi · Kerala', ...proj(76.45, 10.1), '', 9.9312, 76.2673, '+91 484 235 4321', '08:00 - 20:00']
];

// Active requests array [bloodGroup, hospital, city, urgency, units, phone, patient, reason]
let Q = [
  ['O−', 'Capital Blood Centre', 'New Delhi · Delhi', 'Critical', 4, '+91 98100 12345', 'Ananya R.', 'Emergency Cardiac Surgery'],
  ['B−', 'Harbour City Blood Bank', 'Mumbai · Maharashtra', 'Critical', 2, '+91 98200 23456', 'Rahul M.', 'Accident Trauma Care'],
  ['A+', 'Eastern Riverside Hospital Drive', 'Kolkata · West Bengal', 'Urgent', 3, '+91 98300 34567', 'Subhash B.', 'Thalassemia Transfusion'],
  ['AB−', 'Deccan Mobile Donation Van', 'Hyderabad · Telangana', 'Urgent', 1, '+91 98400 45678', 'Kavitha P.', 'Oncology Support'],
  ['A−', 'Capital Blood Centre', 'New Delhi · Delhi', 'Urgent', 2, '+91 98100 56789', 'Siddharth T.', 'Orthopedic Surgery'],
  ['O+', 'Marina Community Blood Centre', 'Chennai · Tamil Nadu', 'Soon', 6, '+91 98440 67890', 'Deepak N.', 'Scheduled Operation'],
  ['B+', 'Garden City Donation Centre', 'Bengaluru · Karnataka', 'Soon', 2, '+91 98800 78901', 'Pooja K.', 'Maternity Ward'],
  ['O−', 'Eastern Riverside Hospital Drive', 'Kolkata · West Bengal', 'Soon', 3, '+91 98300 89012', 'Bikram S.', 'Liver Transplant Reserve']
];

const ic = { Critical: '● Critical', Urgent: '▲ Urgent', Soon: '○ Soon' };
if ($('#c-req')) $('#c-req').dataset.n = Q.filter(q => q[3] !== 'Soon').length;

/* ==========================================================================
   REVEAL & LIVE COUNTERS
   ========================================================================== */
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
  if (!c || !c.done) return;
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

/* ==========================================================================
   REQUEST BOARD & FILTERING
   ========================================================================== */
let grp = 'All';
let reqSearchQuery = '';

function board() {
  const allGroups = ['All', 'O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'];
  const chipsEl = $('#chips');
  if (chipsEl) {
    chipsEl.innerHTML = allGroups.map(g => `<button class="chip" aria-pressed="${g === grp}" data-g="${g}">${g}</button>`).join('');
  }

  const filtered = Q.filter(q => {
    const matchGrp = (grp === 'All' || q[0] === grp);
    const textStr = `${q[0]} ${q[1]} ${q[2]} ${q[6] || ''} ${q[7] || ''}`.toLowerCase();
    const matchQuery = !reqSearchQuery || textStr.includes(reqSearchQuery.toLowerCase());
    return matchGrp && matchQuery;
  });

  const rqEl = $('#rq');
  if (!rqEl) return;

  if (filtered.length === 0) {
    rqEl.innerHTML = `
      <div class="card pad" style="grid-column:1/-1;text-align:center;padding:40px 20px">
        <h3>No matching requests found</h3>
        <p class="mute">Try resetting the blood group filter or search term.</p>
        <button class="btn sm" onclick="grp='All';$('#boardSearchInput').value='';board()">Reset Filters</button>
      </div>
    `;
    return;
  }

  rqEl.innerHTML = filtered.map((q, idx) => `
    <article class="card pad hov tilt" style="display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="bg">${q[0]}</div>
          <span class="tag ${q[3] === 'Soon' ? 's' : ''}">
            ${q[3] === 'Critical' ? '<i class="pulse-dot"></i>' : ''}${ic[q[3]]}
          </span>
        </div>
        <h3 style="margin-top:10px">${q[1]}</h3>
        <p class="mute" style="margin-bottom:6px;font-size:.9rem">${q[2]}</p>
        <p style="margin-bottom:10px;font-weight:600;font-size:1.05rem;color:var(--cr)">${q[4]} units needed</p>
        ${q[6] ? `<p class="mute" style="font-size:.84rem;margin:0">Patient: <b>${q[6]}</b>${q[7] ? ` · ${q[7]}` : ''}</p>` : ''}
      </div>
      <div class="rq-actions">
        <a class="btn sm" href="tel:${q[5] || '+91104'}">📞 Call</a>
        <button class="btn sm ghost" data-share-req="${idx}" title="Share to WhatsApp">💬 Share</button>
        <button class="btn sm ghost" data-pledge="${q[0]}" data-center="${q[1]}">🩸 Donate</button>
      </div>
    </article>
  `).join('');
}

if ($('#chips')) {
  $('#chips').onclick = e => {
    const b = e.target.closest('[data-g]');
    if (b) {
      AudioFX.play('click');
      grp = b.dataset.g;
      try {
  const urlParams = new URLSearchParams(window.location.search);
  const qGrp = urlParams.get('group');
  if (qGrp) grp = qGrp;
} catch (e) {}
board();
    }
  };
}

if ($('#boardSearchInput')) {
  $('#boardSearchInput').addEventListener('input', e => {
    reqSearchQuery = e.target.value.trim();
    try {
  const urlParams = new URLSearchParams(window.location.search);
  const qGrp = urlParams.get('group');
  if (qGrp) grp = qGrp;
} catch (e) {}
board();
  });
}

if ($('#rq')) {
  $('#rq').onclick = e => {
    const shareBtn = e.target.closest('[data-share-req]');
    if (shareBtn) {
      const idx = +shareBtn.dataset.shareReq;
      const req = Q[idx];
      if (req) {
        AudioFX.play('click');
        const text = encodeURIComponent(
          `🚨 *CRITICAL BLOOD NEEDED* 🚨\n\n` +
          `🩸 Blood Group: *${req[0]}*\n` +
          `📦 Units: *${req[4]} units*\n` +
          `🏥 Hospital: *${req[1]}, ${req[2]}*\n` +
          `${req[6] ? `👤 Patient: ${req[6]}\n` : ''}` +
          `${req[7] ? `🩺 Reason: ${req[7]}\n` : ''}` +
          `📞 Contact: ${req[5] || '104'}\n\n` +
          `Verified on BloodConnect: https://bloodconnect.org#board\n` +
          `Please forward to mobilize donors!`
        );
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      }
      return;
    }

    const pledgeBtn = e.target.closest('[data-pledge]');
    if (pledgeBtn) {
      AudioFX.play('success');
      const bgroup = pledgeBtn.dataset.pledge;
      const center = pledgeBtn.dataset.center;
      toast(`Selected ${bgroup} for ${center}. Opening booking...`);
      if ($('#bc')) {
        const opt = [...$('#bc').options].find(o => o.text.includes(center));
        if (opt) $('#bc').value = opt.value;
      }
      if ($('#dash') && !$('#dash').hidden) {
        $('#me').scrollIntoView();
      } else {
        const dlgAuth = $('#auth');
        if (dlgAuth) dlgAuth.showModal();
      }
    }
  };
}

try {
  const urlParams = new URLSearchParams(window.location.search);
  const qGrp = urlParams.get('group');
  if (qGrp) grp = qGrp;
} catch (e) {}
board();

/* ==========================================================================
   INTERACTIVE TOOLS SUITE (#tools)
   ========================================================================== */

// 1. Tool Tabs Switcher
$$('.tool-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    AudioFX.play('switch');
    $$('.tool-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    $$('.tool-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const targetId = tab.dataset.tab;
    const targetPane = $('#' + targetId);
    if (targetPane) targetPane.classList.add('active');
  });
});

// 2. Tool 1: Blood Compatibility Explorer
let compatSelectedGroup = 'O−';
let compatMode = 'rbc'; // 'rbc' or 'plasma'

const compatData = {
  rbc: {
    give: {
      'O−': ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A−': ['A−', 'A+', 'AB−', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B−': ['B−', 'B+', 'AB−', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB−': ['AB−', 'AB+'],
      'AB+': ['AB+']
    },
    receive: {
      'O−': ['O−'],
      'O+': ['O−', 'O+'],
      'A−': ['O−', 'A−'],
      'A+': ['O−', 'O+', 'A−', 'A+'],
      'B−': ['O−', 'B−'],
      'B+': ['O−', 'O+', 'B−', 'B+'],
      'AB−': ['O−', 'A−', 'B−', 'AB−'],
      'AB+': ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+']
    },
    facts: {
      'O−': ['Universal Red Cell Donor', 'O negative red cells carry zero A, B, or Rh surface antigens, so they can be transfused into any recipient during trauma emergencies.'],
      'O+': ['Most In-Demand Blood Type', 'Over 38% of patients have O positive blood. You can donate red blood cells to anyone with positive blood (O+, A+, B+, AB+).'],
      'A−': ['Rare & Versatile Donor', 'A negative donors can supply red blood cells to A-, A+, AB-, and AB+ patients, making regular donations essential.'],
      'A+': ['Second Most Common Group', 'A positive red cells can help both A+ and AB+ recipients, who make up over 40% of the patient population.'],
      'B−': ['Crucial for Sickle Cell & Oncology', 'Only 1.5% of donors are B negative. Your red cells are life-saving for B-, B+, AB-, and AB+ recipients.'],
      'B+': ['Vital for Regional Patient Care', 'High prevalence in South Asia. B positive blood supports B+ and AB+ recipients in surgical and medical treatments.'],
      'AB−': ['Universal Plasma & Rarest RBC', 'AB negative is the rarest red cell type (under 1%). However, AB- donors make exceptional universal plasma donors.'],
      'AB+': ['Universal Red Cell Recipient', 'AB positive individuals can safely receive red blood cells from any blood group in the world! You are the ideal plasma donor.']
    }
  },
  plasma: {
    give: {
      'AB+': ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'],
      'AB−': ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'],
      'A+': ['A+', 'A−', 'O+', 'O−'],
      'A−': ['A+', 'A−', 'O+', 'O−'],
      'B+': ['B+', 'B−', 'O+', 'O−'],
      'B−': ['B+', 'B−', 'O+', 'O−'],
      'O+': ['O+', 'O−'],
      'O−': ['O+', 'O−']
    },
    receive: {
      'O−': ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'],
      'O+': ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'],
      'A−': ['A−', 'A+', 'AB−', 'AB+'],
      'A+': ['A−', 'A+', 'AB−', 'AB+'],
      'B−': ['B−', 'B+', 'AB−', 'AB+'],
      'B+': ['B−', 'B+', 'AB−', 'AB+'],
      'AB−': ['AB−', 'AB+'],
      'AB+': ['AB−', 'AB+']
    },
    facts: {
      'AB+': ['Universal Plasma Donor', 'AB plasma contains neither anti-A nor anti-B antibodies, meaning it can be given to patients of any blood type!'],
      'AB−': ['Universal Plasma Donor', 'Like AB+, your plasma has no ABO antibodies and is kept on standby in emergency helicopters and burn trauma units.'],
      'A+': ['A-Group Plasma Support', 'Your plasma can be safely given to A and O recipients undergoing complex surgical procedures.'],
      'A−': ['A-Group Plasma Support', 'Contains anti-B antibodies; safe for patients with type A and type O blood.'],
      'B+': ['B-Group Plasma Support', 'Contains anti-A antibodies; safely transfused to patients with type B and type O blood.'],
      'B−': ['B-Group Plasma Support', 'Can be donated to patients with type B and type O.'],
      'O+': ['Universal Plasma Recipient', 'O group patients can safely receive plasma from any blood type because their red cells have no antigens to be attacked.'],
      'O−': ['Universal Plasma Recipient', 'O negative patients can receive plasma from O, A, B, and AB donors without adverse reaction.']
    }
  }
};

function updateCompatExplorer() {
  const allGroups = ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'];
  const data = compatData[compatMode];
  const gives = data.give[compatSelectedGroup] || [];
  const receives = data.receive[compatSelectedGroup] || [];
  const fact = data.facts[compatSelectedGroup] || ['Transfusion Compatibility', 'Always verified by crossmatching.'];

  // Update Buttons
  $$('.compat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.bg === compatSelectedGroup);
  });

  // Update Pills
  const giveEl = $('#compatGivePills');
  if (giveEl) {
    giveEl.innerHTML = allGroups.map(g => {
      const match = gives.includes(g);
      return `<span class="compat-pill ${match ? 'match' : ''}">${match ? '✓ ' : ''}${g}</span>`;
    }).join('');
  }

  const receiveEl = $('#compatReceivePills');
  if (receiveEl) {
    receiveEl.innerHTML = allGroups.map(g => {
      const match = receives.includes(g);
      return `<span class="compat-pill ${match ? 'match' : ''}">${match ? '✓ ' : ''}${g}</span>`;
    }).join('');
  }

  // Update Facts
  if ($('#compatFactTitle')) $('#compatFactTitle').textContent = fact[0];
  if ($('#compatFactDesc')) $('#compatFactDesc').textContent = fact[1];
}

function renderMatrixTable() {
  const table = $('#compatMatrixTable tbody');
  if (!table) return;
  const groups = ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'];
  const data = compatData[compatMode].give;
  table.innerHTML = groups.map(donor => `
    <tr>
      <th style="background:var(--chip)"><b>${donor}</b></th>
      ${groups.map(rec => {
        const canGive = data[donor] && data[donor].includes(rec);
        return `<td class="${canGive ? 'ok' : ''}">${canGive ? '✓' : '—'}</td>`;
      }).join('')}
    </tr>
  `).join('');
}

if ($('#compatTypes')) {
  $('#compatTypes').addEventListener('click', e => {
    const btn = e.target.closest('[data-bg]');
    if (btn) {
      AudioFX.play('click');
      compatSelectedGroup = btn.dataset.bg;
      updateCompatExplorer();
    }
  });
}

$$('.compat-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    AudioFX.play('switch');
    $$('.compat-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    compatMode = btn.dataset.mode;
    updateCompatExplorer();
    renderMatrixTable();
  });
});

updateCompatExplorer();
renderMatrixTable();

// 3. Tool 2: Next Eligible Donation Date Calculator & .ics Generator
function calculateNextDonation() {
  const lastDateInput = $('#calcLastDate');
  if (!lastDateInput) return;
  const val = lastDateInput.value;
  const comp = $('#calcComponent') ? $('#calcComponent').value : 'whole';
  const sex = $('#calcSex') ? $('#calcSex').value : 'male';

  let deferralDays = 90;
  if (comp === 'whole') {
    deferralDays = sex === 'female' ? 120 : 90;
  } else if (comp === 'platelets') {
    deferralDays = 7;
  } else if (comp === 'plasma') {
    deferralDays = 28;
  } else if (comp === 'double_red') {
    deferralDays = 180;
  }

  let lastDate = val ? new Date(val) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDate, daysRemaining, pct;
  if (!lastDate || isNaN(lastDate.getTime())) {
    targetDate = today;
    daysRemaining = 0;
    pct = 100;
  } else {
    lastDate.setHours(0, 0, 0, 0);
    targetDate = new Date(lastDate.getTime() + deferralDays * 24 * 60 * 60 * 1000);
    const diffTime = targetDate.getTime() - today.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    pct = daysRemaining === 0 ? 100 : Math.max(0, Math.min(100, Math.round(((deferralDays - daysRemaining) / deferralDays) * 100)));
  }

  // Update progress ring
  const circle = $('#calcProgressCircle');
  if (circle) {
    const offset = 440 - (440 * pct) / 100;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = pct === 100 ? '#2e7d32' : 'var(--cr)';
  }
  if ($('#calcRingPercent')) $('#calcRingPercent').textContent = pct + '%';
  if ($('#calcRingSubtitle')) $('#calcRingSubtitle').textContent = pct === 100 ? 'Ready to give' : `${daysRemaining} days left`;

  const titleEl = $('#calcResultTitle');
  const descEl = $('#calcResultDesc');
  if (pct === 100) {
    if (titleEl) titleEl.textContent = 'Eligible to Donate Today! 🎉';
    if (descEl) descEl.textContent = 'You have passed the required interval. Book a visit at any blood centre to save up to 3 lives.';
  } else {
    const formatted = targetDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    if (titleEl) titleEl.textContent = `Eligible on ${formatted}`;
    if (descEl) descEl.textContent = `Please allow your body ${daysRemaining} more days to replenish iron and blood reserves. Sync the date to your calendar below.`;
  }
}

function downloadCalendarEvent({ title, description, location, startDate, endDate }) {
  const formatDate = d => d.toISOString().replace(/-|:|\.\d+/g, '');
  const now = formatDate(new Date());
  const start = formatDate(new Date(startDate));
  const end = formatDate(new Date(endDate || (new Date(startDate).getTime() + 60 * 60 * 1000)));

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BloodConnect//Donation Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:bc-${Date.now()}@bloodconnect.org`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location || 'Local Blood Bank'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT9H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Blood Donation Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blood-donation-${new Date(startDate).toISOString().slice(0, 10)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  AudioFX.play('success');
  toast('📅 Downloaded .ics calendar invite.');
}

if ($('#btnCalculateDate')) {
  $('#btnCalculateDate').addEventListener('click', () => {
    AudioFX.play('click');
    calculateNextDonation();
  });
}
if ($('#calcLastDate')) {
  $('#calcLastDate').addEventListener('change', calculateNextDonation);
}
if ($('#calcComponent')) {
  $('#calcComponent').addEventListener('change', calculateNextDonation);
}
if ($('#calcSex')) {
  $('#calcSex').addEventListener('change', calculateNextDonation);
}
if ($('#btnCalcToday')) {
  $('#btnCalcToday').addEventListener('click', () => {
    AudioFX.play('click');
    if ($('#calcLastDate')) $('#calcLastDate').value = '';
    calculateNextDonation();
  });
}
if ($('#btnDownloadIcs')) {
  $('#btnDownloadIcs').addEventListener('click', () => {
    const lastDateVal = $('#calcLastDate') ? $('#calcLastDate').value : '';
    let target = new Date();
    if (lastDateVal) {
      const d = new Date(lastDateVal);
      const sex = $('#calcSex') ? $('#calcSex').value : 'male';
      d.setDate(d.getDate() + (sex === 'female' ? 120 : 90));
      if (d > target) target = d;
    }
    target.setHours(10, 0, 0, 0);
    downloadCalendarEvent({
      title: '🩸 BloodConnect Donation Appointment',
      description: 'Your next eligible date to give blood and save up to 3 lives. Visit https://bloodconnect.org to find your closest centre.',
      location: 'BloodConnect Donation Centre',
      startDate: target
    });
  });
}

// 4. Tool 3: Blood Volume & Safety Estimator (Nadler's Formula)
function updateBloodVolume() {
  const h = +($('#volHeight') ? $('#volHeight').value : 172);
  const w = +($('#volWeight') ? $('#volWeight').value : 68);
  const sex = $('#volSex') ? $('#volSex').value : 'male';

  if ($('#volHeightVal')) $('#volHeightVal').textContent = `${h} cm`;
  if ($('#volWeightVal')) $('#volWeightVal').textContent = `${w} kg`;

  // Nadler's clinical biometric formula (H in meters, W in kg)
  const hm = h / 100;
  let tbv = 0;
  if (sex === 'male') {
    tbv = 0.3669 * Math.pow(hm, 3) + 0.03219 * w + 0.6041;
  } else {
    tbv = 0.3561 * Math.pow(hm, 3) + 0.03308 * w + 0.1833;
  }
  tbv = Math.max(2.5, Math.min(8.5, tbv));

  const stdDonation = 0.45; // 450 mL
  const donationPct = (stdDonation / tbv) * 100;

  if ($('#volLiters')) $('#volLiters').textContent = `${tbv.toFixed(1)} L`;
  if ($('#volPercent')) $('#volPercent').textContent = `${donationPct.toFixed(1)}%`;

  const tag = $('#volSafetyTag');
  if (tag) {
    if (w < 50) {
      tag.textContent = '⚠️ Deferral: Weight is under 50 kg (clinical requirement)';
      tag.style.background = '#d32f2f';
      tag.style.color = '#fff';
    } else if (donationPct > 13) {
      tag.textContent = '⚠️ Caution: Volume exceeds 13% limit; speak with nurse';
      tag.style.background = '#f57c00';
      tag.style.color = '#fff';
    } else {
      tag.textContent = '✓ Safe Clinical Range (Under 13% threshold)';
      tag.style.background = 'rgba(46, 125, 50, 0.2)';
      tag.style.color = '#2e7d32';
    }
  }
}

if ($('#volHeight')) $('#volHeight').addEventListener('input', updateBloodVolume);
if ($('#volWeight')) $('#volWeight').addEventListener('input', updateBloodVolume);
if ($('#volSex')) $('#volSex').addEventListener('change', updateBloodVolume);
updateBloodVolume();

// 5. Tool 4: Live Inventory Radar
const inventoryLevels = [
  { group: 'O−', pct: 18, units: 14, status: 'critical' },
  { group: 'O+', pct: 64, units: 82, status: 'optimal' },
  { group: 'A−', pct: 28, units: 21, status: 'low' },
  { group: 'A+', pct: 78, units: 96, status: 'healthy' },
  { group: 'B−', pct: 15, units: 11, status: 'critical' },
  { group: 'B+', pct: 84, units: 110, status: 'healthy' },
  { group: 'AB−', pct: 22, units: 16, status: 'low' },
  { group: 'AB+', pct: 70, units: 89, status: 'optimal' }
];

function renderInventoryRadar() {
  const grid = $('#invGrid');
  if (!grid) return;
  grid.innerHTML = inventoryLevels.map(item => `
    <div class="inv-card" data-inv-group="${item.group}" title="Filter requests for ${item.group}">
      <div class="inv-head">
        <span class="inv-type" style="color:${item.status === 'critical' ? 'var(--cr)' : 'var(--ink)'}">${item.group}</span>
        <span class="tag ${item.status === 'critical' ? '' : 's'}" style="font-size:.74rem">
          ${item.status === 'critical' ? '● Critical' : item.status === 'low' ? '▲ Low' : item.status === 'optimal' ? 'Optimal' : 'Healthy'}
        </span>
      </div>
      <div class="inv-bar-wrap">
        <div class="inv-bar ${item.status}" style="width:${item.pct}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.82rem" class="mute">
        <span>Reserve: <b>${item.units} units</b></span>
        <span>${item.pct}% capacity</span>
      </div>
    </div>
  `).join('');
}

if ($('#invGrid')) {
  $('#invGrid').addEventListener('click', e => {
    const card = e.target.closest('[data-inv-group]');
    if (card) {
      AudioFX.play('click');
      grp = card.dataset.invGroup;
      try {
  const urlParams = new URLSearchParams(window.location.search);
  const qGrp = urlParams.get('group');
  if (qGrp) grp = qGrp;
} catch (e) {}
board();
      $('#board').scrollIntoView();
      toast(`Filtered board for ${grp} blood requests.`);
    }
  });
}

if ($('#btnRefreshInventory')) {
  $('#btnRefreshInventory').addEventListener('click', () => {
    AudioFX.play('click');
    inventoryLevels.forEach(item => {
      item.units += Math.floor(Math.random() * 5) - 2;
      item.units = Math.max(5, item.units);
      item.pct = Math.min(100, Math.round((item.units / 120) * 100));
      if (item.pct < 20) item.status = 'critical';
      else if (item.pct < 40) item.status = 'low';
      else if (item.pct < 75) item.status = 'optimal';
      else item.status = 'healthy';
    });
    renderInventoryRadar();
    toast('🔄 Telemetry synced with 9 regional blood centres.');
  });
}
renderInventoryRadar();

/* ==========================================================================
   ENHANCED CENTER LOCATOR & GEOLOCATION (#map)
   ========================================================================== */
let mapSearchQuery = '';
let filterUrgentOnly = false;
let userCoords = null;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function renderLocationList(selectedIdx = 0) {
  const locsEl = $('#locs');
  if (!locsEl) return;

  let list = L.map((l, i) => {
    let dist = null;
    if (userCoords && l[5] && l[6]) {
      dist = haversineDistance(userCoords.lat, userCoords.lon, l[5], l[6]);
    }
    return { data: l, originalIndex: i, dist };
  });

  if (mapSearchQuery) {
    const q = mapSearchQuery.toLowerCase();
    list = list.filter(item => item.data[0].toLowerCase().includes(q) || item.data[1].toLowerCase().includes(q));
  }

  if (filterUrgentOnly) {
    list = list.filter(item => !!item.data[4]);
  }

  if (userCoords) {
    list.sort((a, b) => (a.dist || 99999) - (b.dist || 99999));
  }

  if ($('#locCount')) $('#locCount').textContent = `${list.length} centers`;

  if (list.length === 0) {
    locsEl.innerHTML = `<p class="mute" style="text-align:center;padding:20px">No donation centers match your filter.</p>`;
    return;
  }

  locsEl.innerHTML = list.map(item => {
    const l = item.data;
    const i = item.originalIndex;
    const isSelected = i === selectedIdx;
    return `
      <button class="loc" data-i="${i}" aria-pressed="${isSelected}">
        <span class="sw ${l[4] ? 'u' : ''}"></span>
        <span style="flex:1">
          <b>${l[0]}</b><br>
          <small class="mute">${l[1]}</small>
          ${item.dist !== null ? `<br><span class="loc-badge">📍 ${item.dist < 10 ? item.dist.toFixed(1) : Math.round(item.dist)} km away</span>` : ''}
        </span>
        <span class="tag s" style="font-size:.72rem">${l[8] || 'Open'}</span>
      </button>
    `;
  }).join('');
}

function selectCenter(i) {
  const l = L[i];
  if (!l) return;
  const info = $('#info');
  if (info) {
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l[0] + ' ' + l[1])}`;
    info.innerHTML = `
      <h3>${l[0]}</h3>
      <p class="mute" style="margin-bottom:6px">${l[1]} · <b>${l[8] || 'Open'}</b></p>
      ${l[4] ? `<span class="tag">● Urgent: ${l[4]} blood critically needed</span>` : '<span class="tag s">○ Open for routine donations</span>'}
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
        <a class="btn sm" href="#me" onclick="prefillBooking('${l[0]}')">Book a slot</a>
        <a class="btn sm ghost" href="tel:${l[7] || '+91104'}">📞 Call Centre</a>
        <a class="btn sm ghost" href="${gmapsUrl}" target="_blank" rel="noopener">🗺️ Directions</a>
      </div>
    `;
  }
  renderLocationList(i);
}

function prefillBooking(centerName) {
  const bc = $('#bc');
  if (bc) {
    const opt = [...bc.options].find(o => o.text.includes(centerName));
    if (opt) bc.value = opt.value;
  }
}

if ($('#mapSearchInput')) {
  $('#mapSearchInput').addEventListener('input', e => {
    mapSearchQuery = e.target.value.trim();
    renderLocationList();
  });
}

if ($('#chkUrgentOnly')) {
  $('#chkUrgentOnly').addEventListener('change', e => {
    filterUrgentOnly = e.target.checked;
    renderLocationList();
  });
}

if ($('#btnGeoLocation')) {
  $('#btnGeoLocation').addEventListener('click', () => {
    AudioFX.play('click');
    if (!navigator.geolocation) {
      toast('Geolocation is not supported by your browser.');
      return;
    }
    toast('📍 Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        userCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        AudioFX.play('success');
        if ($('#geoStatus')) $('#geoStatus').textContent = '📍 Sorted by distance to you';
        toast('Sorted centers by proximity to your current location.');
        renderLocationList();
        // Auto-select closest
        const closest = L.map((l, i) => ({ dist: haversineDistance(userCoords.lat, userCoords.lon, l[5], l[6]), i }))
                         .sort((a, b) => a.dist - b.dist)[0];
        if (closest) selectCenter(closest.i);
      },
      err => {
        toast('Location access denied or unavailable.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

if ($('#locs')) {
  $('#locs').onclick = e => {
    const b = e.target.closest('[data-i]');
    if (b) {
      AudioFX.play('click');
      selectCenter(+b.dataset.i);
    }
  };
}
try {
  const urlParams = new URLSearchParams(window.location.search);
  const qCenter = urlParams.get('center');
  if (qCenter !== null && !isNaN(+qCenter) && +qCenter >= 0 && +qCenter < L.length) {
    selectCenter(+qCenter);
  } else {
    selectCenter(0);
  }
} catch (e) {
  selectCenter(0);
}

/* ==========================================================================
   ELIGIBILITY QUIZ (#check)
   ========================================================================== */
const E = [
  ['Are you between 18 and 65 years old?', 1],
  ['Do you weigh at least 50 kg (110 lb)?', 1],
  ['Do you feel well today, with no fever, cold or infection?', 1],
  ['In the last 6 months, have you had a tattoo, piercing or major surgery?', 0]
];
let es = 0, ea = [];

function er(f) {
  const el = $('#elig');
  if (!el) return;
  if (es < E.length) {
    el.innerHTML = `
      <p class="mute" style="margin:0">Step ${es + 1} of ${E.length}</p>
      <div class="bar"><i style="width:${(es / E.length) * 100}%"></i></div>
      <h3 id="eq" tabindex="-1">${E[es][0]}</h3>
      <div class="ans">
        <button class="btn" data-a="1">Yes</button>
        <button class="btn ghost" data-a="0">No</button>
      </div>
      ${es ? '<button class="chip" data-back style="margin-top:12px">← Back</button>' : ''}
    `;
  } else {
    const ok = ea.every((a, i) => a === E[i][1]);
    el.innerHTML = `
      <div class="bar"><i style="width:100%"></i></div>
      <h3 id="eq" tabindex="-1">${ok ? 'You may be able to donate! 🎉' : 'Not just yet, and that’s okay'}</h3>
      <p class="mute">${ok ? 'Wonderful. Book a visit and our nurse will confirm everything at your health check.' : 'Based on your answers, please wait a little or speak with a nurse. You can still help by sharing urgent requests.'}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" data-auth>${ok ? 'Book my first donation' : 'Sign in'}</button>
        <button class="chip" data-reset>Start over</button>
      </div>
    `;
    if (ok) AudioFX.play('success');
  }
  if (f) {
    const eq = $('#eq');
    if (eq) eq.focus();
  }
}

if ($('#elig')) {
  $('#elig').onclick = e => {
    const a = e.target.closest('[data-a]');
    if (a) {
      AudioFX.play('click');
      ea[es++] = +a.dataset.a;
      er(1);
    } else if (e.target.closest('[data-back]')) {
      AudioFX.play('click');
      es--;
      er(1);
    } else if (e.target.closest('[data-reset]')) {
      AudioFX.play('click');
      es = 0;
      ea = [];
      er(1);
    }
  };
}

if ($('#btnQuizTts')) {
  $('#btnQuizTts').addEventListener('click', () => {
    if (es < E.length) {
      speakText(`Question ${es + 1} of ${E.length}: ${E[es][0]}`);
    } else {
      const ok = ea.every((a, i) => a === E[i][1]);
      speakText(ok ? 'You may be able to donate! Book your first visit.' : 'Not just yet, and that is okay. You can still support by sharing requests.');
    }
  });
}
er();

/* ==========================================================================
   POST URGENT BLOOD REQUEST SYSTEM
   ========================================================================== */
const postModal = $('#postRequestModal');
const emergCardModal = $('#emergencyCardModal');

function openPostRequestDialog() {
  AudioFX.play('click');
  if (postModal) postModal.showModal();
}

if ($('#heroPostBtn')) $('#heroPostBtn').addEventListener('click', openPostRequestDialog);
if ($('#btnBoardPostRequest')) $('#btnBoardPostRequest').addEventListener('click', openPostRequestDialog);

let lastPostedRequest = null;

if ($('#formPostRequest')) {
  $('#formPostRequest').addEventListener('submit', e => {
    e.preventDefault();
    const patient = $('#reqPatient').value.trim();
    const bloodGroup = $('#reqBloodGroup').value;
    const units = +$('#reqUnits').value;
    const urgency = $('#reqUrgency').value;
    const hospital = $('#reqHospital').value.trim();
    const city = $('#reqCity').value.trim();
    const phone = $('#reqPhone').value.trim();
    const reason = $('#reqReason').value;

    const newReq = [bloodGroup, hospital, city, urgency, units, phone, patient, reason];
    Q.unshift(newReq);
    lastPostedRequest = newReq;

    if ($('#c-req')) $('#c-req').dataset.n = Q.filter(q => q[3] !== 'Soon').length;
    try {
  const urlParams = new URLSearchParams(window.location.search);
  const qGrp = urlParams.get('group');
  if (qGrp) grp = qGrp;
} catch (e) {}
board();
    postModal.close();

    AudioFX.play('alert');
    toast('🚨 Urgent request broadcasted to regional donor network!');

    // Prepare shareable preview
    const preview = $('#emergencyCardPreview');
    if (preview) {
      preview.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:1.6rem;font-weight:700;color:var(--cr)">🩸 ${bloodGroup} NEEDED</span>
          <span class="tag" style="background:#d32f2f;color:#fff">${urgency}</span>
        </div>
        <p style="margin:4px 0"><b>Hospital:</b> ${hospital}, ${city}</p>
        <p style="margin:4px 0"><b>Patient:</b> ${patient} (${units} units)</p>
        <p style="margin:4px 0"><b>Contact:</b> <a href="tel:${phone}" style="color:var(--cr)">${phone}</a></p>
        <p class="mute" style="margin:6px 0 0;font-size:.82rem">Case Reference: BC-${Date.now().toString().slice(-6)}</p>
      `;
    }
    if (emergCardModal) emergCardModal.showModal();
  });
}

if ($('#btnShareWhatsApp')) {
  $('#btnShareWhatsApp').addEventListener('click', () => {
    if (!lastPostedRequest) return;
    AudioFX.play('click');
    const r = lastPostedRequest;
    const msg = encodeURIComponent(
      `🚨 *EMERGENCY BLOOD REQUIRED* 🚨\n\n` +
      `🩸 Blood Group: *${r[0]}*\n` +
      `📦 Units: *${r[4]} units*\n` +
      `🏥 Hospital: *${r[1]}, ${r[2]}*\n` +
      `👤 Patient: *${r[6]}*\n` +
      `🩺 Indication: *${r[7]}*\n` +
      `📞 Contact: *${r[5]}*\n\n` +
      `Broadcast via BloodConnect: https://bloodconnect.org#board\n` +
      `Please forward to potential donors immediately!`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  });
}

if ($('#btnShareTwitter')) {
  $('#btnShareTwitter').addEventListener('click', () => {
    if (!lastPostedRequest) return;
    AudioFX.play('click');
    const r = lastPostedRequest;
    const msg = encodeURIComponent(
      `URGENT: ${r[4]} units of ${r[0]} blood needed for ${r[6]} at ${r[1]}, ${r[2]}. Attendant: ${r[5]}. Please RT! #BloodDonation #BloodNeeded #${r[0].replace(/[^a-zA-Z0-9]/g, '')}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${msg}&url=https://bloodconnect.org`, '_blank');
  });
}

if ($('#btnCopyEmergencyText')) {
  $('#btnCopyEmergencyText').addEventListener('click', () => {
    if (!lastPostedRequest) return;
    const r = lastPostedRequest;
    const msg =
      `EMERGENCY BLOOD REQUIRED:\n` +
      `Blood Group: ${r[0]} (${r[4]} units)\n` +
      `Hospital: ${r[1]}, ${r[2]}\n` +
      `Patient: ${r[6]} (${r[7]})\n` +
      `Contact Attendant: ${r[5]}\n` +
      `Verified on BloodConnect: https://bloodconnect.org`;
    navigator.clipboard.writeText(msg).then(() => {
      AudioFX.play('success');
      toast('📋 Emergency message copied to clipboard.');
    });
  });
}

/* ==========================================================================
   DIGITAL DONOR PASS GENERATOR (CANVAS QR CODE)
   ========================================================================== */
function drawDonorQr(donorId) {
  const canvas = $('#donorQrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#111827';
  const cellSize = w / 21;

  // Draw QR Position Detection Patterns (Corners)
  const drawFinder = (x, y) => {
    ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#111827';
    ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };
  drawFinder(1, 1);
  drawFinder(13, 1);
  drawFinder(1, 13);

  // Timing lines
  for (let i = 8; i < 13; i += 2) {
    ctx.fillRect(i * cellSize, 4 * cellSize, cellSize, cellSize);
    ctx.fillRect(4 * cellSize, i * cellSize, cellSize, cellSize);
  }

  // Pseudo-random deterministic payload grid based on donor ID hash
  let seed = 0;
  for (let c of donorId) seed = (seed * 31 + c.charCodeAt(0)) % 10007;

  for (let row = 0; row < 21; row++) {
    for (let col = 0; col < 21; col++) {
      if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) continue;
      seed = (seed * 16807 + 1) % 2147483647;
      if (seed % 2 === 0) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  // Draw central blood drop emblem
  const cx = w / 2;
  const cy = h / 2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#9b1230';
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 2, cy - 6, 4, 12);
  ctx.fillRect(cx - 6, cy - 2, 12, 4);
}

if ($('#btnPrintPass')) {
  $('#btnPrintPass').addEventListener('click', () => {
    AudioFX.play('click');
    window.print();
  });
}

if ($('#btnDownloadPass')) {
  $('#btnDownloadPass').addEventListener('click', () => {
    const canvas = $('#donorQrCanvas');
    if (!canvas) return;
    AudioFX.play('success');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `bloodconnect-pass-${$('#passDonorId').textContent}.png`;
    a.click();
    toast('📥 Digital donor pass downloaded.');
  });
}

/* ==========================================================================
   AUTH & DASHBOARD
   ========================================================================== */
let signed = 0;
const dlg = $('#auth');

document.addEventListener('click', e => {
  if (e.target.closest('[data-auth]')) {
    AudioFX.play('click');
    signed ? $('#me').scrollIntoView() : dlg.showModal();
  }
});

if ($('#af')) {
  $('#af').onsubmit = e => {
    e.preventDefault();
    signed = 1;
    AudioFX.play('success');
    const n = $('#em').value.split('@')[0];
    const capName = n.charAt(0).toUpperCase() + n.slice(1);
    if ($('#hi')) $('#hi').textContent = 'Welcome back, ' + capName;
    if ($('#passName')) $('#passName').textContent = capName + ' Sharma';
    const randomId = 'BC-2026-' + Math.floor(10000 + Math.random() * 90000);
    if ($('#passDonorId')) $('#passDonorId').textContent = randomId;

    drawDonorQr(randomId);

    localStorage.setItem('bc_signed_in', '1');
    localStorage.setItem('bc_donor_name', capName + ' Sharma');
    localStorage.setItem('bc_donor_id', randomId);

    if ($('#lock')) $('#lock').hidden = 1;
    if ($('#dash')) $('#dash').hidden = 0;
    if ($('#navAuth')) $('#navAuth').textContent = 'My dashboard';
    if (dlg && dlg.open) dlg.close();
    toast(`Signed in as ${capName}. Welcome back!`);
  };
}

if ($('#donorPassCard')) {
  const isSigned = localStorage.getItem('bc_signed_in') === '1';
  if (isSigned) {
    signed = 1;
    const n = localStorage.getItem('bc_donor_name') || 'Arjun Sharma';
    if ($('#hi')) $('#hi').textContent = 'Welcome back, ' + n.split(' ')[0];
    if ($('#passName')) $('#passName').textContent = n;
    let randomId = localStorage.getItem('bc_donor_id') || ('BC-2026-' + Math.floor(10000 + Math.random() * 90000));
    localStorage.setItem('bc_donor_id', randomId);
    if ($('#passDonorId')) $('#passDonorId').textContent = randomId;
    drawDonorQr(randomId);
    if ($('#lock')) $('#lock').hidden = 1;
    if ($('#dash')) $('#dash').hidden = 0;
  } else {
    // Render sample preview pass
    drawDonorQr('BC-2026-98124');
  }
}

if (window.location.hash) {
  const h = window.location.hash.slice(1);
  const tab = document.querySelector(`[data-tab="${h}"]`);
  if (tab) tab.click();
}

if ($('#bc')) {
  $('#bc').innerHTML = L.map(l => `<option>${l[0]}</option>`).join('');
}
if ($('#bd')) {
  $('#bd').min = new Date().toISOString().slice(0, 10);
}

if ($('#bk')) {
  $('#bk').onsubmit = e => {
    e.preventDefault();
    AudioFX.play('success');
    const a = $('#appts');
    if (a.firstChild && a.firstChild.classList && a.firstChild.classList.contains('mute')) a.innerHTML = '';
    const dateVal = $('#bd').value;
    const timeVal = $('#bt').value;
    const centerVal = $('#bc').value;
    const compVal = $('#bcomp') ? $('#bcomp').value : 'Whole blood';

    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.flexWrap = 'wrap';
    li.style.gap = '8px';
    li.innerHTML = `
      <span><b>${dateVal}</b> · ${timeVal} · ${centerVal} (${compVal})</span>
      <div style="display:flex;gap:6px">
        <button class="btn sm ghost" data-ics-appt style="padding:3px 8px;font-size:.76rem">📅 .ics</button>
        <button class="btn sm ghost" data-cancel-appt style="padding:3px 8px;font-size:.76rem;color:#d32f2f">Cancel</button>
      </div>
    `;
    a.appendChild(li);

    if ($('#notes')) {
      $('#notes').insertAdjacentHTML('afterbegin', `<li>Appointment confirmed for ${dateVal} at ${centerVal}.</li>`);
    }
    if ($('#nc')) $('#nc').textContent = '3 new';
    toast('Appointment booked. Thank you for your commitment!');
  };
}

if ($('#appts')) {
  $('#appts').addEventListener('click', e => {
    const icsBtn = e.target.closest('[data-ics-appt]');
    if (icsBtn) {
      AudioFX.play('click');
      downloadCalendarEvent({
        title: '🩸 BloodConnect Donation Appointment',
        description: 'Confirmed appointment to donate blood and save up to 3 lives.',
        location: $('#bc') ? $('#bc').value : 'Blood Bank',
        startDate: new Date()
      });
      return;
    }
    const cancelBtn = e.target.closest('[data-cancel-appt]');
    if (cancelBtn) {
      if (confirm('Are you sure you want to cancel this appointment?')) {
        AudioFX.play('alert');
        cancelBtn.closest('li').remove();
        if ($('#appts').children.length === 0) {
          $('#appts').innerHTML = '<li class="mute">No upcoming appointments. Book your next visit!</li>';
        }
        toast('Appointment cancelled.');
      }
    }
  });
}

if ($('#btnMarkNotesRead')) {
  $('#btnMarkNotesRead').addEventListener('click', () => {
    AudioFX.play('click');
    if ($('#nc')) $('#nc').textContent = '0 new';
    toast('All notifications marked as read.');
  });
}

/* ==========================================================================
   UNIVERSAL COMMAND PALETTE (CTRL+K / CMD+K)
   ========================================================================== */
const cmdPalette = $('#commandPalette');
const cmdInput = $('#cmdInput');
const cmdList = $('#cmdList');

const commandItems = [
  { title: 'Home / Landing Page', cat: 'Navigation', icon: '🏠', action: () => window.location.href = 'index.html' },
  { title: 'Find a Donation Center & 3D Map', cat: 'Navigation', icon: '📍', action: () => window.location.href = 'centers.html' },
  { title: 'Blood Compatibility Explorer', cat: 'Clinical Tools', icon: '🩸', action: () => window.location.href = 'tools.html#tool-compat' },
  { title: 'Next Eligible Date & .ics', cat: 'Clinical Tools', icon: '📅', action: () => window.location.href = 'tools.html#tool-calc' },
  { title: 'Blood Volume & Safety Estimator', cat: 'Clinical Tools', icon: '⚖️', action: () => window.location.href = 'tools.html#tool-volume' },
  { title: 'Live Blood Bank Stock Radar', cat: 'Clinical Tools', icon: '📊', action: () => window.location.href = 'tools.html#tool-inventory' },
  { title: 'Live Urgent Blood Requests', cat: 'Emergency', icon: '📋', action: () => window.location.href = 'requests.html' },
  { title: 'Post an Urgent Blood Request', cat: 'Emergency', icon: '🚨', action: () => {
    const pm = $('#postRequestModal');
    if (pm) pm.showModal();
    else window.location.href = 'requests.html?post=1';
  }},
  { title: 'Emergency Helplines (1910 / 104 / 108)', cat: 'Emergency', icon: '📞', action: () => $('#sosModal').showModal() },
  { title: 'Eligibility Screening Quiz', cat: 'Information', icon: '📋', action: () => window.location.href = 'eligibility.html' },
  { title: 'Donor Dashboard & Pass', cat: 'Account', icon: '👤', action: () => window.location.href = 'dashboard.html' },
  { title: 'About BloodConnect & Network', cat: 'Information', icon: 'ℹ️', action: () => window.location.href = 'about.html' },
  { title: 'Website Settings & Accessibility', cat: 'Controls', icon: '⚙️', action: () => $('#siteSettingsModal').showModal() },
  // Centers
  ...L.map((l, i) => ({
    title: `${l[0]} (${l[1]})`,
    cat: 'Donation Centers',
    icon: '🏥',
    action: () => {
      if (window.location.pathname.includes('centers.html')) {
        selectCenter(i);
      } else {
        window.location.href = `centers.html?center=${i}`;
      }
    }
  })),
  // Blood Groups
  { title: 'Filter Board: O− (Universal Donor)', cat: 'Blood Groups', icon: '🩸', action: () => window.location.href = 'requests.html?group=O−' },
  { title: 'Filter Board: O+ (High Demand)', cat: 'Blood Groups', icon: '🩸', action: () => window.location.href = 'requests.html?group=O+' },
  { title: 'Filter Board: A+ Requests', cat: 'Blood Groups', icon: '🩸', action: () => window.location.href = 'requests.html?group=A+' },
  { title: 'Filter Board: B− Critical Requests', cat: 'Blood Groups', icon: '🩸', action: () => window.location.href = 'requests.html?group=B−' },
  { title: 'Filter Board: AB+ (Universal Recipient)', cat: 'Blood Groups', icon: '🩸', action: () => window.location.href = 'requests.html?group=AB+' }
];

let selectedCmdIndex = 0;

function renderCmdResults(query = '') {
  if (!cmdList) return;
  const q = query.toLowerCase().trim();
  const filtered = commandItems.filter(item =>
    !q || item.title.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    cmdList.innerHTML = `<p class="mute" style="text-align:center;padding:24px">No results matching "${query}"</p>`;
    return;
  }

  cmdList.innerHTML = filtered.map((item, i) => `
    <div class="cmd-item ${i === selectedCmdIndex ? 'selected' : ''}" data-cmd-idx="${i}">
      <span style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.2rem">${item.icon}</span>
        <span>${item.title}</span>
      </span>
      <span class="tag s" style="font-size:.72rem">${item.cat}</span>
    </div>
  `).join('');

  cmdList.querySelectorAll('.cmd-item').forEach((el, i) => {
    el.addEventListener('click', () => {
      AudioFX.play('click');
      cmdPalette.close();
      filtered[i].action();
    });
  });
}

function openCommandPalette() {
  AudioFX.play('click');
  selectedCmdIndex = 0;
  if (cmdPalette) {
    cmdPalette.showModal();
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.focus();
    }
    renderCmdResults('');
  }
}

if ($('#navSearchBtn')) $('#navSearchBtn').addEventListener('click', openCommandPalette);

window.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCommandPalette();
  }
});

if (cmdInput) {
  cmdInput.addEventListener('input', e => {
    selectedCmdIndex = 0;
    renderCmdResults(e.target.value);
  });

  cmdInput.addEventListener('keydown', e => {
    const items = cmdList.querySelectorAll('.cmd-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedCmdIndex = (selectedCmdIndex + 1) % Math.max(1, items.length);
      renderCmdResults(cmdInput.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedCmdIndex = (selectedCmdIndex - 1 + items.length) % Math.max(1, items.length);
      renderCmdResults(cmdInput.value);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = items[selectedCmdIndex];
      if (current) current.click();
    }
  });
}

/* ==========================================================================
   WEBSITE SETTINGS & ACCESSIBILITY CONTROLS
   ========================================================================== */
const settingsModal = $('#siteSettingsModal');

function openSettingsModal() {
  AudioFX.play('click');
  if (settingsModal) settingsModal.showModal();
}

if ($('#navSettingsBtn')) $('#navSettingsBtn').addEventListener('click', openSettingsModal);
if ($('#footerSettingsLink')) $('#footerSettingsLink').addEventListener('click', openSettingsModal);

// Theme Selection
function setTheme(t) {
  AudioFX.play('switch');
  if (t === 'auto') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('bc_theme');
  } else {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('bc_theme', t);
  }
  $$('#themeGroup [data-theme-btn]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.themeBtn === t);
  });
}

$$('#themeGroup [data-theme-btn]').forEach(b => {
  b.addEventListener('click', () => setTheme(b.dataset.themeBtn));
});

const currentTheme = localStorage.getItem('bc_theme') || 'auto';
setTheme(currentTheme);

// Font Size Scaling
function setFontSize(size) {
  AudioFX.play('switch');
  document.documentElement.setAttribute('data-font-size', size);
  localStorage.setItem('bc_font_size', size);
  $$('#fontGroup [data-fs]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.fs === size);
  });
}

$$('#fontGroup [data-fs]').forEach(b => {
  b.addEventListener('click', () => setFontSize(b.dataset.fs));
});

const currentFs = localStorage.getItem('bc_font_size') || 'md';
setFontSize(currentFs);

// High Contrast Mode
const chkContrast = $('#toggleHighContrast');
if (chkContrast) {
  chkContrast.checked = localStorage.getItem('bc_contrast') === 'high';
  chkContrast.addEventListener('change', e => {
    AudioFX.play('switch');
    if (e.target.checked) {
      document.documentElement.setAttribute('data-contrast', 'high');
      localStorage.setItem('bc_contrast', 'high');
      toast('High contrast mode enabled.');
    } else {
      document.documentElement.removeAttribute('data-contrast');
      localStorage.removeItem('bc_contrast');
      toast('Standard contrast restored.');
    }
  });
}

// Motion Pause Toggle
const chkMotion = $('#togglePauseMotion');
if (chkMotion) {
  chkMotion.checked = localStorage.getItem('bc_motion') === 'pause' || RM;
  chkMotion.addEventListener('change', e => {
    AudioFX.play('switch');
    if (e.target.checked) {
      document.documentElement.setAttribute('data-motion', 'pause');
      localStorage.setItem('bc_motion', 'pause');
      RM = true;
      toast('3D rendering and motion paused.');
    } else {
      document.documentElement.removeAttribute('data-motion');
      localStorage.removeItem('bc_motion');
      RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
      toast('Dynamic motion resumed.');
    }
  });
}

// Sound FX Toggle
const chkSound = $('#toggleSoundFx');
if (chkSound) {
  chkSound.checked = AudioFX.muted === false;
  chkSound.addEventListener('change', e => {
    AudioFX.muted = !e.target.checked;
    localStorage.setItem('bc_sound', AudioFX.muted ? 'off' : 'on');
    if ($('#dockSoundStatus')) $('#dockSoundStatus').textContent = AudioFX.muted ? 'OFF' : 'ON';
    if (!AudioFX.muted) AudioFX.play('success');
    toast(`Sound effects ${AudioFX.muted ? 'muted' : 'enabled'}.`);
  });
}

// Reset Settings
if ($('#btnResetSettings')) {
  $('#btnResetSettings').addEventListener('click', () => {
    setTheme('auto');
    setFontSize('md');
    if (chkContrast) { chkContrast.checked = false; chkContrast.dispatchEvent(new Event('change')); }
    if (chkMotion) { chkMotion.checked = false; chkMotion.dispatchEvent(new Event('change')); }
    if (chkSound) { chkSound.checked = true; chkSound.dispatchEvent(new Event('change')); }
    toast('Settings reset to defaults.');
  });
}

/* ==========================================================================
   EMERGENCY SOS HELPLINES MODAL (#sosModal)
   ========================================================================== */
const sosModal = $('#sosModal');
function openSosModal() {
  AudioFX.play('alert');
  if (sosModal) sosModal.showModal();
}
if ($('#navSosBtn')) $('#navSosBtn').addEventListener('click', openSosModal);
if ($('#footerSosLink')) $('#footerSosLink').addEventListener('click', openSosModal);

/* ==========================================================================
   ALERT BANNER ACTIONS (TTS & SHARE)
   ========================================================================== */
if ($('#alertTtsBtn')) {
  $('#alertTtsBtn').addEventListener('click', () => {
    const text = $('#alertText') ? $('#alertText').textContent : 'Critical blood shortage.';
    speakText(text);
  });
}

if ($('#alertShareBtn')) {
  $('#alertShareBtn').addEventListener('click', () => {
    AudioFX.play('click');
    const msg = encodeURIComponent(
      `🚨 *URGENT BLOOD SHORTAGE ALERT* 🚨\n\n` +
      `Critical shortage: O− and B− blood needed within 24 hours across emergency centers.\n` +
      `Check live requests or donate: https://bloodconnect.org#board\n` +
      `Every unit saves up to three lives!`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  });
}

/* ==========================================================================
   FLOATING QUICK DOCK
   ========================================================================== */
const dockToggle = $('#dockToggle');
const dockMenu = $('#dockMenu');

if (dockToggle && dockMenu) {
  dockToggle.addEventListener('click', () => {
    AudioFX.play('switch');
    dockToggle.classList.toggle('open');
    dockMenu.classList.toggle('open');
  });

  if ($('#dockBtnSettings')) $('#dockBtnSettings').addEventListener('click', () => { dockToggle.click(); openSettingsModal(); });
  if ($('#dockBtnTools')) $('#dockBtnTools').addEventListener('click', () => { dockToggle.click(); $('#tools').scrollIntoView(); });
  if ($('#dockBtnSearch')) $('#dockBtnSearch').addEventListener('click', () => { dockToggle.click(); openCommandPalette(); });
  if ($('#dockBtnSos')) $('#dockBtnSos').addEventListener('click', () => { dockToggle.click(); openSosModal(); });
  if ($('#dockBtnSound')) {
    $('#dockBtnSound').addEventListener('click', () => {
      AudioFX.muted = !AudioFX.muted;
      localStorage.setItem('bc_sound', AudioFX.muted ? 'off' : 'on');
      if (chkSound) chkSound.checked = !AudioFX.muted;
      if ($('#dockSoundStatus')) $('#dockSoundStatus').textContent = AudioFX.muted ? 'OFF' : 'ON';
      if (!AudioFX.muted) AudioFX.play('click');
      toast(`Sound effects ${AudioFX.muted ? 'muted' : 'enabled'}.`);
    });
  }
}

/* ==========================================================================
   COOKIE CONSENT BANNER
   ========================================================================== */
const cookieBanner = $('#cookieBanner');
if (cookieBanner) {
  if (localStorage.getItem('bc_cookies')) {
    cookieBanner.hidden = true;
  }
  if ($('#btnAcceptCookies')) {
    $('#btnAcceptCookies').addEventListener('click', () => {
      AudioFX.play('click');
      localStorage.setItem('bc_cookies', 'all');
      cookieBanner.hidden = true;
      toast('Cookie preferences saved.');
    });
  }
  if ($('#btnEssentialCookies')) {
    $('#btnEssentialCookies').addEventListener('click', () => {
      AudioFX.play('click');
      localStorage.setItem('bc_cookies', 'essential');
      cookieBanner.hidden = true;
      toast('Essential cookies applied.');
    });
  }
  if ($('#footerCookiesLink')) {
    $('#footerCookiesLink').addEventListener('click', () => {
      cookieBanner.hidden = false;
      AudioFX.play('click');
    });
  }
}

/* ==========================================================================
   USER FEEDBACK MODAL
   ========================================================================== */
const feedbackModal = $('#feedbackModal');
if ($('#footerFeedbackLink')) {
  $('#footerFeedbackLink').addEventListener('click', () => {
    AudioFX.play('click');
    if (feedbackModal) feedbackModal.showModal();
  });
}

let selectedRating = 5;
if ($('#feedbackStars')) {
  const stars = $$('#feedbackStars span');
  stars.forEach((s, idx) => {
    s.addEventListener('click', () => {
      selectedRating = idx + 1;
      stars.forEach((st, i) => {
        st.style.color = i < selectedRating ? '#f59e0b' : 'var(--bd)';
      });
      AudioFX.play('click');
    });
  });
}

if ($('#formFeedback')) {
  $('#formFeedback').addEventListener('submit', e => {
    e.preventDefault();
    AudioFX.play('success');
    feedbackModal.close();
    toast('Thank you for your valuable feedback! Together we save lives.');
    $('#formFeedback').reset();
  });
}

/* ==========================================================================
   3D DROP SCULPTURE & 3D INDIA MAP (THREE.JS)
   ========================================================================== */
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

function isMotionPaused() {
  return RM || document.documentElement.getAttribute('data-motion') === 'pause';
}

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

try {
  const el = $('#hero3d');
  if (el) {
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
    if ($('#fb')) $('#fb').style.display = 'none';

    jobs.push(t => {
      if (!v.v) return;
      if (isMotionPaused()) {
        R.render(S, C);
        return;
      }
      t *= 0.001;
      g.rotation.y += 0.0035 + vy;
      vy *= 0.94;
      g.rotation.x += (ty * 0.35 - g.rotation.x) * 0.05;
      g.position.x += (tx * 0.4 - g.position.x) * 0.05;
      drop.position.y = -0.5 + Math.sin(t * 1.2) * 0.07;
      ring.rotation.z = 0.3 + t * 0.12;
      cells.forEach(c => {
        const u = c.userData;
        const a = u.a + t * u.sp;
        c.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 0.8 + u.ph) * 0.12, Math.sin(a) * u.r * 0.9);
        c.rotation.set(t * 0.5 + u.ph, 0, t * 0.3 + u.ph);
      });
      pts.rotation.y = t * 0.05;
      pts.position.y = Math.sin(t * 0.6) * 0.1;
      R.render(S, C);
    });
  }
} catch (e) {}

try {
  const el = $('#map3d');
  if (el) {
    const R = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));

    const S = new THREE.Scene();
    const C = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    const cs = getComputedStyle(document.documentElement);
    const navy = new THREE.Color(cs.getPropertyValue('--navy').trim() || '#1b2a4e');
    const red = new THREE.Color(0xc8203f);

    S.environment = makeEnv(R);

    const TOP = 0.5;
    const IN = [[68.2, 23.7], [70.1, 24.3], [71.1, 24.5], [70.8, 25.6], [70.0, 26.4], [69.5, 27.2], [70.4, 28.0], [71.8, 27.8], [72.9, 29.0], [73.9, 29.9], [74.7, 31.1], [74.9, 31.9], [75.4, 32.6], [74.3, 32.9], [73.7, 34.7], [74.0, 36.0], [75.0, 37.0], [76.3, 36.6], [77.8, 35.5], [78.9, 34.7], [79.2, 33.2], [78.5, 32.4], [78.8, 31.2], [79.1, 30.6], [80.2, 30.4], [80.9, 29.8], [80.2, 28.8], [81.9, 28.0], [83.4, 27.4], [84.7, 27.2], [85.9, 26.6], [87.3, 26.4], [88.1, 26.4], [88.1, 27.5], [88.3, 27.9], [88.8, 28.1], [88.9, 27.3], [89.1, 26.7], [90.4, 26.8], [91.6, 26.8], [91.6, 27.8], [92.7, 28.1], [93.8, 28.7], [95.0, 29.2], [96.1, 29.4], [97.3, 28.3], [96.8, 27.4], [96.0, 27.2], [95.2, 26.0], [94.7, 25.4], [94.4, 24.5], [94.1, 23.8], [93.4, 23.0], [93.1, 22.1], [92.8, 21.9], [92.2, 22.6], [92.3, 23.5], [91.8, 23.2], [91.5, 23.0], [91.2, 23.6], [91.6, 24.2], [92.3, 24.9], [91.9, 25.2], [91.2, 25.2], [90.3, 25.1], [89.8, 25.3], [89.8, 26.0], [89.0, 26.3], [88.5, 26.4], [88.1, 25.3], [88.4, 24.3], [88.7, 23.8], [88.9, 23.3], [89.0, 22.5], [89.0, 21.7], [88.1, 21.6], [87.0, 21.5], [86.8, 20.9], [86.4, 20.2], [85.8, 19.8], [85.1, 19.3], [84.4, 18.5], [83.3, 17.7], [82.3, 16.9], [81.3, 16.3], [80.9, 15.8], [80.2, 15.5], [80.1, 14.0], [80.3, 13.1], [80.1, 12.0], [79.8, 11.9], [79.9, 10.8], [79.3, 10.3], [78.9, 9.3], [78.1, 8.9], [77.5, 8.1], [76.5, 8.9], [76.2, 10.0], [75.6, 11.6], [74.9, 12.9], [74.4, 14.5], [73.9, 15.5], [73.4, 16.8], [73.0, 17.9], [72.8, 19.0], [72.7, 20.2], [72.8, 21.2], [72.6, 22.2], [72.1, 21.6], [71.0, 20.8], [70.3, 20.9], [69.0, 22.3], [69.8, 22.45], [70.5, 22.7], [70.1, 23.15], [69.1, 22.95], [68.5, 23.3]];

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
        if (h) selectCenter(h.object.userData.i);
      }
      d = null;
    };

    el.onpointercancel = () => d = null;

    const v = vis(el);
    new ResizeObserver(() => fit(R, C, el)).observe(el);

    jobs.push(t => {
      if (!v.v) return;
      if (isMotionPaused()) {
        R.render(S, C);
        return;
      }
      t *= 0.001;
      if (!d) { az += 0.0014 * dir; if (az > 0.95) dir = -1; if (az < -0.45) dir = 1; }
      const rr = rad * Math.max(1, 1.15 / Math.max(C.aspect, 0.55));
      C.position.set(rr * Math.sin(pol) * Math.sin(az), rr * Math.cos(pol), rr * Math.sin(pol) * Math.cos(az));
      C.lookAt(0, 0, 0);

      rings.forEach((r, i) => {
        const k = ((t * 0.7 + i * 0.4) % 1);
        r.scale.setScalar(1 + k * 1.8);
        r.material.opacity = 0.6 * (1 - k);
      });

      R.render(S, C);
    });
  }
} catch (e) {
  if ($('#map3d')) $('#map3d').style.display = 'none';
}

(function loop(t) {
  requestAnimationFrame(loop);
  jobs.forEach(j => j(t));
})(0);

/* ==========================================================================
   PAGE SCROLL PROGRESS & MAGNETIC INTERACTIONS
   ========================================================================== */
(() => {
  const prog = $('#prog');
  const onScroll = () => {
    if (!prog) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (isMotionPaused() || !matchMedia('(hover:hover)').matches) return;

  const hero = $('.hero');
  if (hero) {
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
  }

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
