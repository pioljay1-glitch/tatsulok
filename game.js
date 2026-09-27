import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

const CHARS = {
  peyudo: { name: 'PEYUDO', faction: 'Panginoon', color: 0xc9a44a, speed: 7.2, will: 8, heart: 3 },
  misteryo: { name: 'MISTERYO', faction: 'Panginoon', color: 0x2a2a32, speed: 6.4, will: 9, heart: 2 },
  bangag: { name: 'BANGAG', faction: 'Panginoon', color: 0x8a6a22, speed: 4.6, will: 10, heart: 1 },
  pula: { name: 'PULA', faction: 'Panginoon', color: 0x8a1a1a, speed: 6.0, will: 9, heart: 2 },
  tanikala: { name: 'TANIKALA', faction: 'Panginoon', color: 0x44444c, speed: 5.4, will: 8, heart: 2 },
  presyo: { name: 'PRESYO', faction: 'Malakas', color: 0xb8862a, speed: 6.6, will: 7, heart: 3 },
  pintuan: { name: 'PINTUAN', faction: 'Malakas', color: 0x3a3a48, speed: 6.2, will: 8, heart: 3 },
  ling: { name: 'LING', faction: 'Mabuti', color: 0x6aa89a, speed: 5.8, will: 5, heart: 9 },
  batid: { name: 'BATID', faction: 'Mabuti', color: 0x7a6a4a, speed: 5.6, will: 6, heart: 8 },
  tisa: { name: 'TISA', faction: 'Mabuti', color: 0x4a7a3a, speed: 5.2, will: 5, heart: 9 },
  subalit: { name: 'SUBALIT', faction: 'Mabuti', color: 0x4a6a8a, speed: 6.8, will: 6, heart: 8 }
};

const MISSIONS = [
  { id: 'baha', title: 'BAHA', pos: [16, 0, -4], color: 0x2a4a6a,
    prompt: 'Ang tubig tumataas sa baryo. Sino ang unang ililigtas?',
    a: { label: 'Iligtas ang palasyo', will: 2, heart: -2, text: 'Iniligtas mo ang trono. Ang masa ay nalunod.' },
    b: { label: 'Iligtas ang baryo', will: -1, heart: 3, text: 'Nailigtas ang tao. Nawalan ng pabor ang Panginoon.' } },
  { id: 'lindol', title: 'LINDOL', pos: [-14, 0, -8], color: 0x6a5a3a,
    prompt: 'Gumuho ang tulay. May kontrata sa likod ng semento.',
    a: { label: 'Sikreto — itago', will: 3, heart: -3, text: 'Nanatiling tahimik. Ang susunod na lindol ay handa na.' },
    b: { label: 'Ilantad ang korapsyon', will: -2, heart: 3, text: 'Umalingawngaw ang katotohanan. May nagtatago sa anino.' } },
  { id: 'tanikala', title: 'PANG-AALIPIN', pos: [0, 0, 18], color: 0x4a2a2a,
    prompt: 'May kadena sa plaza. Ang susi ay nasa iyo.',
    a: { label: 'Higpitan ang sistema', will: 3, heart: -3, text: 'Lumakas ang Tatlong Panig. Nawala ang malaya.' },
    b: { label: 'Pakawalan sila', will: -2, heart: 4, text: 'Nabuksan ang kandado. May kapalit ang kalayaan.' } }
];

const state = {
  playerName: localStorage.getItem('tatsulok_player') || '',
  charId: localStorage.getItem('tatsulok_char') || 'peyudo',
  will: 5, heart: 5, resolved: {}, near: null, ended: false
};

const $ = (id) => document.getElementById(id);

function bootUI() {
  const grid = $('charGrid');
  grid.innerHTML = Object.entries(CHARS).map(([id, c]) =>
    `<button class="chip ${id===state.charId?'on':''}" data-id="${id}"><b>${c.name}</b><span>${c.faction}</span></button>`).join('');
  grid.querySelectorAll('.chip').forEach(btn => {
    btn.onclick = () => {
      grid.querySelectorAll('.chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.charId = btn.dataset.id;
      localStorage.setItem('tatsulok_char', state.charId);
    };
  });
  $('pname').value = state.playerName;
  $('enterBtn').onclick = () => {
    const name = $('pname').value.trim();
    if (!name) { $('lobbyHint').textContent = 'Kailangan ng pangalan.'; return; }
    state.playerName = name;
    localStorage.setItem('tatsulok_player', name);
    const c = CHARS[state.charId];
    state.will = c.will; state.heart = c.heart;
    $('lobby').classList.add('hide');
    $('hud').classList.remove('hide');
    $('hint').classList.remove('hide');
    updateHUD();
    start3D();
  };
}

function updateHUD() {
  const c = CHARS[state.charId];
  $('hudName').textContent = `${state.playerName} · ${c.name}`;
  $('hudWill').textContent = `LOOB ${state.will}`;
  $('hudHeart').textContent = `PUSO ${state.heart}`;
}

function endGame() {
  state.ended = true;
  const score = state.heart - state.will;
  let verdict = 'Ang Tatsulok ay nanatiling balanse — at malamig.';
  if (score >= 4) verdict = 'Pinili mo ang tao. Ang trono ay nanginginig.';
  else if (score <= -4) verdict = 'Pinili mo ang poder. Ang plaza ay tahimik.';
  $('modalTitle').textContent = 'TAPOS ANG RITWAL';
  $('modalBody').textContent = verdict + ' Hindi lang ito laban ng lakas — laban din ito ng paninindigan.';
  $('choiceA').textContent = 'Ulitin';
  $('choiceB').textContent = 'Lobby';
  $('modal').classList.remove('hide');
  $('choiceA').onclick = () => location.reload();
  $('choiceB').onclick = () => location.reload();
}

function start3D() {
  const canvas = $('view');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080c);
  scene.fog = new THREE.FogExp2(0x0a0c12, 0.028);

  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 1.7, 8);

  const controls = new PointerLockControls(camera, document.body);
  $('view').addEventListener('click', () => controls.lock());
  controls.addEventListener('lock', () => $('hint').classList.add('hide'));
  controls.addEventListener('unlock', () => { if (!state.ended) $('hint').classList.remove('hide'); });

  scene.add(new THREE.HemisphereLight(0x8899aa, 0x1a1210, 0.55));
  const key = new THREE.DirectionalLight(0xe8d4a0, 1.15);
  key.position.set(8, 18, 6); key.castShadow = true;
  scene.add(key);
  scene.add(new THREE.PointLight(0x6a88aa, 18, 40).translateY(9));
  const ember = new THREE.PointLight(0xc45a2a, 10, 22); ember.position.set(-8, 3, 8); scene.add(ember);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(42, 64), new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.82, metalness: 0.18 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const ring = new THREE.Mesh(new THREE.RingGeometry(7.6, 8.2, 64), new THREE.MeshStandardMaterial({ color: 0xc9a44a, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; scene.add(ring);

  const tri = new THREE.Mesh(new THREE.ConeGeometry(3.2, 4.4, 3), new THREE.MeshStandardMaterial({ color: 0xb8923a, metalness: 0.85, roughness: 0.25, emissive: 0x3a2a10, emissiveIntensity: 0.35 }));
  tri.position.y = 2.2; scene.add(tri);

  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffaa33, emissiveIntensity: 1.4 }));
  inner.position.y = 2.3; scene.add(inner);

  function pillar(x, z, h) {
    const g = new THREE.Group();
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, h, 8), new THREE.MeshStandardMaterial({ color: 0x1c1e26, roughness: 0.55, metalness: 0.25 }));
    p.position.y = h / 2; p.castShadow = true; g.add(p);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 1.5), new THREE.MeshStandardMaterial({ color: 0xc9a44a, metalness: 0.6, roughness: 0.3 }));
    cap.position.y = h; g.add(cap);
    g.position.set(x, 0, z); scene.add(g);
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    pillar(Math.cos(a) * 22, Math.sin(a) * 22, 8 + (k % 3));
  }

  const hall = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, 18, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x101218, roughness: 0.9, side: THREE.BackSide }));
  hall.position.y = 9; scene.add(hall);

  const nodes = [];
  MISSIONS.forEach(m => {
    const g = new THREE.Group();
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15), new THREE.MeshStandardMaterial({ color: m.color, emissive: m.color, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.4 }));
    stone.position.y = 1.3; stone.castShadow = true; g.add(stone);
    const glow = new THREE.PointLight(m.color, 8, 10); glow.position.y = 2; g.add(glow);
    g.position.set(m.pos[0], 0, m.pos[2]);
    g.userData = m; scene.add(g); nodes.push(g);
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 4, 8), new THREE.MeshStandardMaterial({ color: CHARS[state.charId].color, metalness: 0.35, roughness: 0.5 }));
  body.position.y = 0.95; scene.add(body);

  const keys = {};
  addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'KeyE') tryInteract(); });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const vel = new THREE.Vector3();
  const clock = new THREE.Clock();
  const speed = CHARS[state.charId].speed;

  function tryInteract() {
    if (!state.near || state.ended) return;
    const m = state.near.userData;
    if (state.resolved[m.id]) return;
    $('modalTitle').textContent = m.title;
    $('modalBody').textContent = m.prompt;
    $('choiceA').textContent = m.a.label;
    $('choiceB').textContent = m.b.label;
    $('modal').classList.remove('hide');
    controls.unlock();
    const pick = (side) => {
      const ch = m[side];
      state.will = Math.max(0, state.will + ch.will);
      state.heart = Math.max(0, state.heart + ch.heart);
      state.resolved[m.id] = side;
      state.near.traverse(o => { if (o.material) o.material.emissiveIntensity = 0.05; });
      $('modal').classList.add('hide');
      updateHUD();
      $('toast').textContent = ch.text;
      $('toast').classList.remove('hide');
      setTimeout(() => $('toast').classList.add('hide'), 3200);
      if (Object.keys(state.resolved).length >= 3) setTimeout(endGame, 900);
      else setTimeout(() => controls.lock(), 200);
    };
    $('choiceA').onclick = () => pick('a');
    $('choiceB').onclick = () => pick('b');
  }

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    inner.rotation.y += dt * 0.6;
    tri.rotation.y += dt * 0.15;
    nodes.forEach(n => { n.children[0].rotation.y += dt * 0.4; n.children[0].position.y = 1.3 + Math.sin(performance.now()/700 + n.position.x)*0.12; });
    if (controls.isLocked && !state.ended) {
      const forward = Number(keys.KeyW) - Number(keys.KeyS);
      const side = Number(keys.KeyD) - Number(keys.KeyA);
      vel.x -= vel.x * 8 * dt; vel.z -= vel.z * 8 * dt;
      vel.z -= forward * speed * dt;
      vel.x -= side * speed * dt;
      controls.moveRight(-vel.x * dt);
      controls.moveForward(-vel.z * dt);
      const p = controls.getObject().position;
      const r = Math.hypot(p.x, p.z);
      if (r > 36) { p.x *= 36/r; p.z *= 36/r; }
      p.y = 1.7;
    }
    const p = controls.getObject().position;
    body.position.x = p.x; body.position.z = p.z;
    let nearest = null, nd = 3.4;
    nodes.forEach(n => {
      const d = n.position.distanceTo(p);
      if (d < nd && !state.resolved[n.userData.id]) { nd = d; nearest = n; }
    });
    state.near = nearest;
    $('prompt').textContent = nearest ? `E — harapin ang ${nearest.userData.title}` : '';
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}

bootUI();
