const dice3d = document.getElementById('dice-3d');
const scene  = document.getElementById('dice-scene');
let current = 1;
let recentFaces = [1];

function qMul(a, b) {
  return [
    a[0]*b[0] - a[1]*b[1] - a[2]*b[2] - a[3]*b[3],
    a[0]*b[1] + a[1]*b[0] + a[2]*b[3] - a[3]*b[2],
    a[0]*b[2] - a[1]*b[3] + a[2]*b[0] + a[3]*b[1],
    a[0]*b[3] + a[1]*b[2] - a[2]*b[1] + a[3]*b[0],
  ];
}
function qNorm(q) { const l = Math.hypot(...q); return q.map(v => v / l); }
function qAxis(ax, ay, az, deg) {
  const r = deg * Math.PI / 360, s = Math.sin(r);
  return [Math.cos(r), ax*s, ay*s, az*s];
}
function qCSS(q) {
  const [w, x, y, z] = q;
  return `matrix3d(${1-2*(y*y+z*z)},${2*(x*y+z*w)},${2*(x*z-y*w)},0,${2*(x*y-z*w)},${1-2*(x*x+z*z)},${2*(y*z+x*w)},0,${2*(x*z+y*w)},${2*(y*z-x*w)},${1-2*(x*x+y*y)},0,0,0,0,1)`;
}
function qRotV(q, vx, vy, vz) {
  const [w, x, y, z] = q;
  const ix = w*vx+y*vz-z*vy, iy = w*vy+z*vx-x*vz,
        iz = w*vz+x*vy-y*vx, iw = -x*vx-y*vy-z*vz;
  return [iw*-x+ix*w+iy*-z-iz*-y, iw*-y-ix*-z+iy*w+iz*-x, iw*-z+ix*-y-iy*-x+iz*w];
}
function slerp(a, b, t) {
  let d = a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];
  if (d < 0) { b = b.map(v => -v); d = -d; }
  if (d > 0.9995) return qNorm(a.map((v, i) => v + t*(b[i]-v)));
  const th0 = Math.acos(d), th = th0*t;
  const s0 = Math.cos(th) - d*Math.sin(th)/Math.sin(th0), s1 = Math.sin(th)/Math.sin(th0);
  return qNorm(a.map((v, i) => s0*v + s1*b[i]));
}

const FACE_Q = {
  1: [1,0,0,0],
  2: qAxis(0,1,0, -90),
  3: qAxis(1,0,0,  90),
  4: qAxis(1,0,0, -90),
  5: qAxis(0,1,0,  90),
  6: qAxis(0,1,0, 180),
};

const FACE_N = {
  1:[0,0,1],  6:[0,0,-1],
  2:[1,0,0],  5:[-1,0,0],
  3:[0,1,0],  4:[0,-1,0],
};

function detectFront(q) {
  let best = 1, bestZ = -Infinity;
  for (const [f, n] of Object.entries(FACE_N)) {
    const [,,wz] = qRotV(q, ...n);
    if (wz > bestZ) { bestZ = wz; best = Number(f); }
  }
  return best;
}

let qCurrent = [1,0,0,0];
let animId = null;

function applyQ(q, anim) {
  dice3d.style.transition = anim ? 'transform 0.45s cubic-bezier(0.33,1,0.68,1)' : 'none';
  dice3d.style.transform = qCSS(q);
}

function animateTo(from, to, dur, onDone) {
  if (animId) cancelAnimationFrame(animId);
  const t0 = performance.now();
  function step(now) {
    const t = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - t, 3);
    qCurrent = slerp(from, to, e);
    applyQ(qCurrent, false);
    if (t < 1) { animId = requestAnimationFrame(step); }
    else { qCurrent = [...to]; applyQ(qCurrent, false); if (onDone) onDone(); }
  }
  animId = requestAnimationFrame(step);
}

function goToFace(face, animated) {
  current = face;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('v-' + face).classList.add('active');
  if (!animated) { qCurrent = [...FACE_Q[face]]; applyQ(qCurrent, false); return; }
  animateTo([...qCurrent], FACE_Q[face], 420);
}

function randomRoll() {
  let next;
  do { next = Math.floor(Math.random() * 6) + 1; } while (recentFaces.includes(next));
  recentFaces = [current, next];

  // relative rotation `delta` that takes the dice from its current
  // orientation exactly onto the target face: delta * from = to
  const from = [...qCurrent];
  const to = FACE_Q[next];
  const fromConj = [from[0], -from[1], -from[2], -from[3]];
  const delta = qNorm(qMul(to, fromConj));
  const w = Math.min(1, Math.max(-1, delta[0]));
  const angleDeg = 2 * Math.acos(w) * 180 / Math.PI;
  const sinHalf = Math.sqrt(Math.max(0, 1 - w*w));
  const axis = sinHalf < 1e-6 ? [0,1,0] : [delta[1]/sinHalf, delta[2]/sinHalf, delta[3]/sinHalf];

  // randomize the path: go the "short way" or the "long way" around,
  // plus a random number of extra full turns — both still land exactly
  // on `to` since a 360° rotation about any axis is the identity
  const useAlt = Math.random() < 0.5;
  const baseAxis = useAlt ? axis.map(v => -v) : axis;
  const baseAngle = useAlt ? 360 - angleDeg : angleDeg;
  const spins = 1 + Math.floor(Math.random() * 2);
  const totalAngle = baseAngle + 360 * spins;

  current = next;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('v-' + next).classList.add('active');
  if (animId) cancelAnimationFrame(animId);
  const t0 = performance.now(), dur = 600 + Math.random() * 200;
  function step(now) {
    const t = Math.min((now - t0) / dur, 1);
    const e = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const spinQ = qAxis(baseAxis[0], baseAxis[1], baseAxis[2], totalAngle * e);
    qCurrent = qNorm(qMul(spinQ, from));
    applyQ(qCurrent, false);
    if (t < 1) { animId = requestAnimationFrame(step); }
    else { qCurrent = [...FACE_Q[next]]; applyQ(qCurrent, false); }
  }
  animId = requestAnimationFrame(step);
}

goToFace(1, false);

let pressing = false, isDrag = false;
let startX = 0, startY = 0, prevX = 0, prevY = 0;
const THRESH = 5;

function pDown(cx, cy) {
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  pressing = true; isDrag = false;
  startX = prevX = cx; startY = prevY = cy;
}
function pMove(cx, cy) {
  if (!pressing) return;
  if (!isDrag && (Math.abs(cx-startX) > THRESH || Math.abs(cy-startY) > THRESH)) isDrag = true;
  if (!isDrag) return;
  const ddx = cx-prevX, ddy = cy-prevY;
  prevX = cx; prevY = cy;
  const dist = Math.hypot(ddx, ddy);
  if (dist < 0.5) return;
  const ax = -ddy/dist, ay = ddx/dist;
  const dq = qAxis(ax, ay, 0, dist * 0.85);
  qCurrent = qNorm(qMul(dq, qCurrent));
  applyQ(qCurrent, false);
}
function pUp() {
  if (!pressing) return;
  pressing = false;
  scene.style.cursor = 'grab';
  if (!isDrag) { randomRoll(); }
  else { goToFace(detectFront(qCurrent), true); }
}

scene.addEventListener('mousedown', e => { pDown(e.clientX, e.clientY); scene.style.cursor = 'grabbing'; e.preventDefault(); });
window.addEventListener('mousemove', e => { if (pressing) pMove(e.clientX, e.clientY); });
window.addEventListener('mouseup', () => pUp());
scene.addEventListener('touchstart', e => { e.preventDefault(); pDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
scene.addEventListener('touchmove',  e => { e.preventDefault(); pMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
scene.addEventListener('touchend',   e => { e.preventDefault(); pUp(); }, { passive: false });
