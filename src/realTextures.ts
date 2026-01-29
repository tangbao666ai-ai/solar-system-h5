import * as THREE from 'three';
import { makePlanetTexture, makeSaturnRingTexture } from './textures';

// Tries to load local "real" textures from /public/textures.
// Falls back to procedural textures if files are missing.

const FILES: Partial<Record<string, string>> = {
  sun: '2k_sun.jpg',
  mercury: '2k_mercury.jpg',
  venus: '2k_venus_surface.jpg',
  earth: '2k_earth_daymap.jpg',
  mars: '2k_mars.jpg',
  jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg',
  uranus: '2k_uranus.jpg',
  neptune: '2k_neptune.jpg',
  moon: '2k_moon.jpg',
};

export function loadBodyTexture(id: string): Promise<THREE.Texture | null> {
  const file = FILES[id];
  if (!file) {
    return Promise.resolve(makePlanetTexture(id));
  }

  const url = `/textures/${file}`;
  const loader = new THREE.TextureLoader();

  return new Promise((resolve) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        resolve(tex);
      },
      undefined,
      () => {
        // missing file → fallback
        resolve(makePlanetTexture(id));
      }
    );
  });
}

export function loadSaturnRingAlpha(): Promise<THREE.Texture> {
  const url = '/textures/2k_saturn_ring_alpha.png';
  const loader = new THREE.TextureLoader();
  return new Promise((resolve) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        resolve(tex);
      },
      undefined,
      () => resolve(makeSaturnRingTexture())
    );
  });
}
