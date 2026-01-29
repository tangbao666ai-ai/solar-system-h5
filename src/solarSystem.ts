import * as THREE from 'three';
import { BODIES, BodySpec, byId } from './astroData';
import { loadBodyTexture, loadSaturnRingAlpha } from './realTextures';

export type BodyInstance = {
  spec: BodySpec;
  pivot: THREE.Object3D; // orbit plane pivot, positioned at parent
  mesh: THREE.Mesh;
  orbitLine?: THREE.Line;
};

export type SolarSystem = {
  root: THREE.Object3D;
  bodies: Map<string, BodyInstance>;
  update: (tDays: number) => void;
};

function makeOrbitLine(radius: number, segments = 256, color = 0x2a335a) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
  return new THREE.Line(geom, mat);
}

function degToRad(d = 0) { return (d * Math.PI) / 180; }

function colorMaterial(color: number, map?: THREE.Texture | null) {
  return new THREE.MeshStandardMaterial({
    color,
    map: map || undefined,
    roughness: 0.85,
    metalness: 0.0
  });
}

export function createSolarSystem(): SolarSystem {
  const root = new THREE.Object3D();

  // subtle ecliptic plane grid reference
  const grid = new THREE.GridHelper(220, 44, 0x142048, 0x0d1430);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  root.add(grid);

  const bodies = new Map<string, BodyInstance>();

  // Create instances
  for (const spec of BODIES) {
    const geom = new THREE.SphereGeometry(spec.radius, 40, 28);

    const map = null; // loaded async (real textures if available, else procedural fallback)

    const mat = spec.kind === 'sun'
      ? new THREE.MeshStandardMaterial({
          color: spec.color,
          emissive: spec.color,
          emissiveIntensity: 2.2,
          roughness: 0.6
        })
      : colorMaterial(spec.color, map);

    // envMapIntensity helps when we enable global environment lighting
    if (mat instanceof THREE.MeshStandardMaterial) {
      mat.envMapIntensity = spec.kind === 'planet' ? 1.1 : 0.9;
    }

    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = spec.id;
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    const pivot = new THREE.Object3D();
    pivot.name = spec.id + ':pivot';

    const inst: BodyInstance = { spec, pivot, mesh };
    bodies.set(spec.id, inst);
  }

  // Parent/child wiring + orbit lines
  for (const inst of bodies.values()) {
    const { spec, pivot, mesh } = inst;

    if (!spec.parentId) {
      // root body (sun)
      root.add(pivot);
      pivot.add(mesh);
      mesh.position.set(0, 0, 0);
      continue;
    }

    const parent = bodies.get(spec.parentId);
    if (!parent) throw new Error(`Missing parent ${spec.parentId} for ${spec.id}`);

    // place pivot at parent's mesh position (which is attached to parent's pivot)
    parent.pivot.add(pivot);

    // orbit plane tilt
    pivot.rotation.x = degToRad(spec.inclinationDeg || 0);

    // attach mesh at orbit radius on X axis
    const r = spec.semiMajorAxis || 0;
    mesh.position.set(r, 0, 0);
    pivot.add(mesh);

    // orbit line drawn in pivot plane, centered at parent
    inst.orbitLine = makeOrbitLine(r, 192, spec.kind === 'moon' ? 0x223055 : 0x2a335a);
    pivot.add(inst.orbitLine);
  }

  // Saturn ring (alpha texture if available)
  {
    const sat = bodies.get('saturn');
    if (sat) {
      const ringMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const inner = sat.spec.radius * 1.35;
      const outer = sat.spec.radius * 2.35;
      const ringGeom = new THREE.RingGeometry(inner, outer, 128);
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.name = 'saturn:ring';
      ring.rotation.x = Math.PI / 2; // align with our orbit plane
      ring.rotation.z = degToRad(18);
      sat.mesh.add(ring);

      // load alpha map (real if present, else procedural)
      loadSaturnRingAlpha().then((tex) => {
        ringMat.map = tex;
        ringMat.needsUpdate = true;
      });
    }
  }

  // add sun light (brighter) to improve readability
  const sunLight = new THREE.PointLight(0xfff2cc, 6.5, 1000, 1.6);
  sunLight.position.set(0, 0, 0);
  root.add(sunLight);

  // Key light for better shape definition (helps mobile screens)
  const key = new THREE.DirectionalLight(0xdbe6ff, 1.15);
  key.position.set(80, 120, 60);
  root.add(key);

  // Ambient to keep night side visible
  root.add(new THREE.AmbientLight(0x8aa2ff, 0.55));

  // Load textures async (real if you add files under public/textures)
  for (const inst of bodies.values()) {
    const id = inst.spec.id;
    const mat = inst.mesh.material;

    if (id === 'sun') {
      // optional: allow sun texture, but keep emissive so it looks like a light source
      loadBodyTexture('sun').then((tex) => {
        if (tex && mat instanceof THREE.MeshStandardMaterial) {
          mat.map = tex;
          mat.needsUpdate = true;
        }
      });
      continue;
    }

    loadBodyTexture(id).then((tex) => {
      if (tex && mat instanceof THREE.MeshStandardMaterial) {
        mat.map = tex;
        mat.needsUpdate = true;
      }
    });
  }

  // Update function
  const update = (tDays: number) => {
    // tDays is simulated days since 0
    for (const inst of bodies.values()) {
      const { spec, pivot } = inst;
      if (!spec.parentId) continue;
      const period = spec.periodDays || 1;
      const phase = (tDays / period) * Math.PI * 2;
      pivot.rotation.y = phase;
    }
  };

  // Add labels on selection (done elsewhere)
  return { root, bodies, update };
}

export function formatBodyInfo(spec: BodySpec) {
  const parent = spec.parentId ? byId.get(spec.parentId) : undefined;
  const kind = spec.kind === 'sun' ? '恒星' : (spec.kind === 'planet' ? '行星' : '卫星');

  const parts: string[] = [];
  parts.push(`${spec.nameZh} / ${spec.nameEn}（${kind}）`);
  if (parent) parts.push(`绕转：${parent.nameZh}`);
  if (spec.periodDays) parts.push(`公转周期（演示用）：${spec.periodDays} 天`);
  if (spec.facts?.length) parts.push(...spec.facts);

  return parts;
}
