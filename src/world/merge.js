import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Collapses the thousands of tiny primitives into a few dozen draw calls.
// A `unit` is any node that is animated as a whole (toy roots, movable toy parts, character joints):
// meshes are merged per nearest unit ancestor, so they keep following that node's transform.
// Meshes in `exclude` (and their descendants) are animated individually and are left untouched.

const scratch=new THREE.Matrix4();
function signature(m,mesh){
  const bump=m.bumpMap?`${m.bumpMap.repeat.x},${m.bumpMap.repeat.y},${m.bumpScale}`:'';
  return [m.type,m.roughness,m.metalness,m.side,m.transparent,m.opacity,m.depthWrite,m.flatShading,
    m.emissive?.getHex(),m.emissiveIntensity,m.clearcoat,m.clearcoatRoughness,m.sheen,bump,m.map?.uuid??'',
    mesh.castShadow,mesh.receiveShadow].join('|');
}
function prepare(mesh,relative){
  const source=mesh.geometry,geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',source.attributes.position.clone());
  if(source.attributes.normal)geometry.setAttribute('normal',source.attributes.normal.clone());
  if(source.attributes.uv)geometry.setAttribute('uv',source.attributes.uv.clone());
  if(source.index)geometry.setIndex(source.index.clone());
  const count=geometry.attributes.position.count;
  if(!geometry.attributes.normal)geometry.computeVertexNormals();
  if(!geometry.attributes.uv)geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(count*2),2));
  if(!geometry.index)geometry.setIndex(Array.from({length:count},(_,i)=>i));
  const c=mesh.material.color??new THREE.Color(1,1,1),colors=new Float32Array(count*3);
  for(let i=0;i<count;i++){colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geometry.applyMatrix4(relative);
  return geometry;
}
function mergeable(o){
  if(!o.isMesh||!o.visible)return false;
  const m=o.material;
  return !Array.isArray(m)&&!m.isShaderMaterial&&!m.vertexColors&&!!m.color;
}
export function mergeStatic(scene,{units=[],exclude=[]}={}){
  scene.updateMatrixWorld(true);
  const skip=new Set();for(const root of exclude)root.traverse(o=>skip.add(o));
  const unitSet=new Set(units);const unitOf=o=>{for(let p=o.parent;p;p=p.parent)if(unitSet.has(p))return p;return scene;};
  const buckets=new Map();
  scene.traverse(o=>{
    if(skip.has(o)||!mergeable(o))return;
    const unit=unitOf(o),key=signature(o.material,o);
    const id=`${unit.uuid}|${key}`;
    if(!buckets.has(id))buckets.set(id,{unit,material:o.material,cast:o.castShadow,receive:o.receiveShadow,meshes:[]});
    buckets.get(id).meshes.push(o);
  });
  const materials=new Map(),removed=[],stats={before:0,after:0,vertices:0};
  for(const {unit,material,cast,receive,meshes} of buckets.values()){
    stats.before+=meshes.length;
    const inverse=scratch.copy(unit.matrixWorld).invert();
    const geometries=meshes.map(m=>prepare(m,new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld)));
    const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
    if(!merged)continue;
    const key=signature(material,{castShadow:cast,receiveShadow:receive});
    if(!materials.has(key)){const shared=material.clone();shared.color.set(1,1,1);shared.vertexColors=true;materials.set(key,shared);}
    const mesh=new THREE.Mesh(merged,materials.get(key));
    mesh.castShadow=cast;mesh.receiveShadow=receive;mesh.name='merged-static';
    const toyId=meshes[0].userData.toyId;if(toyId)mesh.userData.toyId=toyId;
    unit.add(mesh);stats.after++;stats.vertices+=merged.attributes.position.count;
    removed.push(...meshes);
  }
  for(const m of removed){m.removeFromParent();m.geometry.dispose();}
  return stats;
}
