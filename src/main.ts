import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { createSolarSystem, formatBodyInfo } from './solarSystem';

const app = document.getElementById('app')!;
const info = document.getElementById('info')!;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);

// Make it brighter / clearer on mobile screens
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x05070c, 110, 380);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 65, 130);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 18;
controls.maxDistance = 420;
controls.target.set(0, 0, 0);
controls.update();

// Starfield background (cheap points)
{
  const starGeom = new THREE.BufferGeometry();
  const N = 2200;
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    // random in a sphere shell
    const r = 900 * (0.6 + Math.random() * 0.4);
    const theta = Math.random() * Math.PI * 2;
    const u = Math.random() * 2 - 1;
    const s = Math.sqrt(1 - u * u);
    positions[i * 3 + 0] = r * s * Math.cos(theta);
    positions[i * 3 + 1] = r * u;
    positions[i * 3 + 2] = r * s * Math.sin(theta);
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0x9fb0ff, size: 1.2, sizeAttenuation: true, transparent: true, opacity: 0.6 });
  const stars = new THREE.Points(starGeom, starMat);
  scene.add(stars);
}

const solar = createSolarSystem();
scene.add(solar.root);

// pick/select
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedId: string | null = null;

function setInfo(id: string | null) {
  selectedId = id;
  if (!id) {
    info.innerHTML = '点击任意行星/卫星查看信息；右上角可调时间倍率与视角。';
    return;
  }
  const inst = solar.bodies.get(id);
  if (!inst) return;
  const lines = formatBodyInfo(inst.spec);
  info.innerHTML = lines.map(s => `• ${escapeHtml(s)}`).join('<br/>');
}

function escapeHtml(s: string) {
  return s.replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

renderer.domElement.addEventListener('pointerdown', (ev) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(mouse, camera);

  const meshes: THREE.Object3D[] = [];
  for (const inst of solar.bodies.values()) meshes.push(inst.mesh);

  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length) {
    const id = hits[0].object.name;
    setInfo(id);
    if (state.follow === id) return;
  }
});

// GUI
const state = {
  speedDaysPerSec: 40,
  view: 'Free' as 'Free' | 'Top' | 'Side',
  follow: '' as string,
  showOrbits: true,
};

const gui = new GUI({ width: 320, title: 'Controls' });

gui.add(state, 'speedDaysPerSec', 0, 300, 1).name('时间倍率 (天/秒)');

gui.add(state, 'showOrbits').name('显示轨道').onChange((v: boolean) => {
  for (const inst of solar.bodies.values()) if (inst.orbitLine) inst.orbitLine.visible = v;
});

gui.add(state, 'view', ['Free', 'Top', 'Side']).name('视角').onChange((v: string) => {
  if (v === 'Top') {
    camera.position.set(0, 170, 0.01);
    controls.target.set(0, 0, 0);
  } else if (v === 'Side') {
    camera.position.set(0, 40, 170);
    controls.target.set(0, 0, 0);
  }
  controls.update();
});

const followOptions: Record<string, string> = { '': '不跟随' };
for (const inst of solar.bodies.values()) {
  if (inst.spec.kind === 'sun') continue;
  followOptions[inst.spec.id] = inst.spec.nameZh;
}

gui.add(state, 'follow', followOptions).name('跟随天体').onChange((id: string) => {
  if (id) setInfo(id);
});

// initial
setInfo(null);

// Animation loop
let last = performance.now();
let tDays = 0;

function tick(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  tDays += dt * state.speedDaysPerSec;
  solar.update(tDays);

  // follow: move target to selected body
  if (state.follow) {
    const inst = solar.bodies.get(state.follow);
    if (inst) {
      const p = new THREE.Vector3();
      inst.mesh.getWorldPosition(p);
      controls.target.lerp(p, 0.08);
    }
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
