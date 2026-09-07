import * as THREE from 'three';
const cache = new Map();
// Neutral, tileable microrelief: colour stays on the material, not baked into the weave.
export function surface(kind, color) {
  const key = `${kind}:${color}`;
  if (cache.has(key)) return cache.get(key);
  const size = 256, data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const grain = Math.sin(x * .22 + Math.sin(y * .024) * 3) * 22 + Math.sin(x * .91 + y * .012) * 8;
    const weave = Math.sin(x * Math.PI / 2) * Math.cos(y * Math.PI / 2) * 35;
    const n = kind === 'wood' ? grain : weave;
    const i = (y * size + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = 128 + n; data[i + 3] = 255;
  }
  const bump = new THREE.DataTexture(data, size, size); bump.needsUpdate = true;
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.magFilter = THREE.LinearFilter; bump.minFilter = THREE.LinearMipmapLinearFilter; bump.generateMipmaps = true;
  bump.repeat.set(kind === 'wood' ? 2 : 5, kind === 'wood' ? 1 : 5);
  const material = new THREE.MeshPhysicalMaterial({color, bumpMap:bump, bumpScale:kind === 'wood' ? .012 : .008, roughness:kind === 'wood' ? .62 : .96, clearcoat:kind === 'wood' ? .12 : 0, clearcoatRoughness:.65, sheen:kind === 'wood' ? 0 : .28, sheenColor:new THREE.Color(0xfff0dc)});
  cache.set(key, material); return material;
}
