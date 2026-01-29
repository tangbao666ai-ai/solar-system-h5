import * as THREE from 'three';

// Lightweight procedural textures (CanvasTexture) so the project stays fully static.
// These are *not* NASA-realistic, but they add recognisable surface variety.

function makeCanvas(size = 512) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  return { c, ctx, size };
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function noiseTexture(base1: string, base2: string, seed = 1, intensity = 0.55) {
  const { c, ctx, size } = makeCanvas(512);
  ctx.fillStyle = base1;
  ctx.fillRect(0, 0, size, size);

  const rand = mulberry32(seed);
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;

  // Blend base2 speckles onto base1
  // (Very cheap “cloudy” noise)
  const b2 = hexToRgb(base2);
  for (let i = 0; i < d.length; i += 4) {
    const n = rand();
    const w = Math.max(0, (n - 0.5) * 2) * intensity;
    d[i + 0] = lerp(d[i + 0], b2.r, w);
    d[i + 1] = lerp(d[i + 1], b2.g, w);
    d[i + 2] = lerp(d[i + 2], b2.b, w);
  }
  ctx.putImageData(img, 0, 0);

  // Soft blur-ish by drawing scaled layers
  ctx.globalAlpha = 0.25;
  for (let k = 0; k < 3; k++) {
    const s = 1.0 - k * 0.08;
    const off = (1 - s) * size * 0.5;
    ctx.drawImage(c, off, off, size * s, size * s);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function bandTexture(colors: string[], seed = 2) {
  const { c, ctx, size } = makeCanvas(512);
  const rand = mulberry32(seed);

  // horizontal bands (for Jupiter/Saturn)
  const bandCount = 18;
  for (let i = 0; i < bandCount; i++) {
    const y0 = (i / bandCount) * size;
    const h = size / bandCount + rand() * 10;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(0, y0, size, h);
  }

  // add noisy streaks
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 2200; i++) {
    const y = rand() * size;
    const x = rand() * size;
    const w = 30 + rand() * 140;
    const hh = 1 + rand() * 4;
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.fillRect(x, y, w, hh);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makePlanetTexture(id: string): THREE.Texture | null {
  switch (id) {
    case 'mercury':
      return noiseTexture('#7d7d7d', '#a9a9a9', 10, 0.45);
    case 'venus':
      return noiseTexture('#cda66c', '#f1e2b8', 11, 0.55);
    case 'earth':
      return noiseTexture('#114d9a', '#57c7ff', 12, 0.45);
    case 'mars':
      return noiseTexture('#a5472b', '#e0a08b', 13, 0.55);
    case 'jupiter':
      return bandTexture(['#cfae7a', '#e2c79e', '#b8875d', '#f1e0c6', '#bda27a'], 14);
    case 'saturn':
      return bandTexture(['#d9c28f', '#f0e1bb', '#c8ad78', '#efe6cf', '#bda77a'], 15);
    case 'uranus':
      return noiseTexture('#66d7e6', '#b6f3ff', 16, 0.25);
    case 'neptune':
      return noiseTexture('#2b57ff', '#6db3ff', 17, 0.35);

    // moons
    case 'moon':
      return noiseTexture('#a7a7a7', '#d9d9d9', 30, 0.35);
    case 'titan':
      return noiseTexture('#c68a4a', '#f0d3a1', 31, 0.35);
    default:
      if (id.startsWith('io')) return noiseTexture('#d9b25f', '#ffe9b0', 40, 0.35);
      return null;
  }
}

export function makeSaturnRingTexture(): THREE.Texture {
  const { c, ctx, size } = makeCanvas(1024);
  ctx.clearRect(0, 0, size, size);

  // Draw a horizontal 1D ring gradient into a strip then rely on UVs.
  const g = ctx.createLinearGradient(0, 0, size, 0);
  g.addColorStop(0.00, 'rgba(0,0,0,0)');
  g.addColorStop(0.12, 'rgba(240,232,210,0.15)');
  g.addColorStop(0.20, 'rgba(240,232,210,0.45)');
  g.addColorStop(0.35, 'rgba(210,190,150,0.55)');
  g.addColorStop(0.52, 'rgba(245,238,220,0.40)');
  g.addColorStop(0.70, 'rgba(200,180,140,0.35)');
  g.addColorStop(0.86, 'rgba(245,238,220,0.20)');
  g.addColorStop(1.00, 'rgba(0,0,0,0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // add fine banding
  const rand = mulberry32(99);
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 2400; i++) {
    const x = rand() * size;
    const w = 1 + rand() * 3;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
    ctx.fillRect(x, 0, w, size);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function hexToRgb(hex: string) {
  const h = hex.replace('#', '').trim();
  const v = h.length === 3 ? h.split('').map(ch => ch + ch).join('') : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
