import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createBathroom,connectBathroom,bathroomDefinitions} from '../src/world/bathroom.js';
import {createBedroom,connectRooms,bedroomDefinitions} from '../src/world/bedroom.js';
import {createToys,toyDefinitions} from '../src/world/toys.js';
import {createRoom} from '../src/world/room.js';
import {floorHeightAt,DOOR,BATH_DOOR,BATH_MAT} from '../src/world/surfaces.js';
import {route,blocked} from '../src/behaviors/navigation.js';
import {Director} from '../src/behaviors/Director.js';
import {Yueyue} from '../src/character/Yueyue.js';
import {LEG} from '../src/character/legs.js';

test('every bathroom destination connects to both other rooms through the two doorways',()=>{
 for(const a of [...toyDefinitions,...bedroomDefinitions])for(const b of bathroomDefinitions)for(const [from,to] of [[a,b],[b,a]]){
  let previous={x:from.approach[0],z:from.approach[1]},crossedBath=false,crossedPlay=false;const path=route(previous,{x:to.approach[0],z:to.approach[1]});assert.ok(path.length,`${from.id} to ${to.id}`);
  for(const next of path){for(let t=0;t<=1;t+=.02){const x=THREE.MathUtils.lerp(previous.x,next.x,t),z=THREE.MathUtils.lerp(previous.z,next.z,t);assert.ok(!blocked(x,z),`${from.id} to ${to.id} blocked at ${x}, ${z}`);
   if(Math.abs(x-BATH_DOOR.x)<.12){crossedBath=true;assert.ok(Math.abs(z-BATH_DOOR.z)<=BATH_DOOR.halfWidth);}
   if(Math.abs(x-DOOR.x)<.12){crossedPlay=true;assert.ok(z>=1.2&&z<=2.2);}}previous=next;}
  assert.ok(crossedBath,'must pass through the bathroom doorway');
  assert.equal(crossedPlay,a.room!=='bedroom','playroom destinations also use the first door');
 }
});
test('bathroom models have finite geometry, toys rest on their floor surface and the mat is a walking surface',()=>{
 const scene=new THREE.Scene();createRoom(scene);createBedroom(scene);connectRooms(scene);const bathroom=createBathroom(scene);connectBathroom(scene);scene.updateMatrixWorld(true);
 assert.equal(bathroom.toys.length,2);scene.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite),o.name||o.type);if(o.geometry?.attributes.position)assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));});
 for(const toy of bathroom.toys){assert.equal(toy.root.position.y,floorHeightAt(...toy.position));assert.ok(!blocked(...toy.approach),`${toy.id} approach is walkable`);}
 assert.equal(floorHeightAt(BATH_MAT.x,BATH_MAT.z),BATH_MAT.height);assert.equal(floorHeightAt(BATH_MAT.x+BATH_MAT.halfWidth+.1,BATH_MAT.z),.05);
 const duck=bathroom.toys.find(t=>t.id==='bath-duck');assert.equal(duck.root.position.y,BATH_MAT.height,'the duck waits on the mat');
 // Nothing but the mat and the door threshold sits on the tiles inside the doorway corridor.
 for(const z of [BATH_DOOR.z-BATH_DOOR.halfWidth+.1,BATH_DOOR.z,BATH_DOOR.z+BATH_DOOR.halfWidth-.1])assert.ok(!blocked(BATH_DOOR.x,z));
 assert.ok(blocked(BATH_DOOR.x,BATH_DOOR.z+BATH_DOOR.halfWidth+.2));assert.ok(blocked(BATH_DOOR.x,BATH_DOOR.z-BATH_DOOR.halfWidth-.2));
});
test('Yueyue walks to the bathroom, plays with both bath toys and comes back, with planted feet',()=>{
 const scene=new THREE.Scene(),bedroom=createBedroom(scene),bathroom=createBathroom(scene),toys=[...createToys(scene),...bedroom.toys,...bathroom.toys],c=new Yueyue(scene),d=new Director(c,toys,()=>{});
 let crossed=0;
 for(const id of ['bath-duck','bath-cups','bedroom-bear','bath-duck','blocks']){
  const toy=toys.find(t=>t.id===id);d.select(toy);let frames=0;
  while(d.state==='walk'&&frames++<9000){d.update(1/60);if(!c.footsteps.walking)continue;c.root.updateMatrixWorld(true);const leg=c.legRig[1-c.footsteps.swing];const sole=leg.ankle.getWorldPosition(new THREE.Vector3());sole.y-=LEG.soleHeight;
   assert.ok(Math.abs(sole.y-floorHeightAt(sole.x,sole.z))<.004,`shoe floats or sinks near ${sole.x}, ${sole.z}`);
   if(Math.abs(c.root.position.x-BATH_DOOR.x)<.2)crossed++;
  }
  assert.equal(d.state,'play',id);
  if(id==='bath-cups'){const rest=toy.parts.moving.position.clone();for(let i=0;i<(toy.duration+.05)*60;i++)d.update(1/60);assert.ok(toy.parts.moving.position.y>rest.y+.4,'the cup was stacked on the tower');}
  else if(id==='bath-duck'){const rest=toy.parts.moving.position.clone();for(let i=0;i<5*60;i++)d.update(1/60);assert.ok(toy.parts.moving.position.distanceTo(rest)>.2,'the duck is lifted into a hug');for(let i=0;i<(toy.duration-5+.05)*60;i++)d.update(1/60);assert.ok(toy.parts.moving.position.distanceTo(rest)<1e-6,'the duck is put back');}
  else for(let i=0;i<(toy.duration+.05)*60;i++)d.update(1/60);
  assert.equal(d.state,'idle');
 }
 assert.ok(crossed>10);assert.ok(c.root.position.x<4.35);
});
