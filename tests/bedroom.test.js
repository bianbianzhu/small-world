import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createBedroom,connectRooms,bedroomDefinitions} from '../src/world/bedroom.js';
import {createToys,toyDefinitions} from '../src/world/toys.js';
import {createRoom} from '../src/world/room.js';
import {floorHeightAt,DOOR} from '../src/world/surfaces.js';
import {route,blocked} from '../src/behaviors/navigation.js';
import {Director} from '../src/behaviors/Director.js';
import {Yueyue} from '../src/character/Yueyue.js';
import {LEG} from '../src/character/legs.js';

test('every bedroom destination connects to the playroom through the open doorway',()=>{
 for(const a of toyDefinitions)for(const b of bedroomDefinitions)for(const [from,to] of [[a,b],[b,a]]){
  let previous={x:from.approach[0],z:from.approach[1]},crossed=false;const path=route(previous,{x:to.approach[0],z:to.approach[1]});assert.ok(path.length);
  for(const next of path){for(let t=0;t<=1;t+=.02){const x=THREE.MathUtils.lerp(previous.x,next.x,t),z=THREE.MathUtils.lerp(previous.z,next.z,t);assert.ok(!blocked(x,z));if(Math.abs(x-DOOR.x)<.12){crossed=true;assert.ok(z>=1.2&&z<=2.2);}}previous=next;}
  assert.ok(crossed,'must use the door, not cross the partition');
 }
});
test('new bedroom models have finite geometry and the ramp matches its walking surface',()=>{
 const scene=new THREE.Scene();createRoom(scene);const bedroom=createBedroom(scene),connection=connectRooms(scene);scene.updateMatrixWorld(true);
 assert.equal(bedroom.toys.length,2);scene.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite));if(o.geometry?.attributes.position)assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));});
 const ramp=connection.getObjectByName('doorway-ramp');
 for(let i=1;i<10;i++){const x=DOOR.rampStart+(DOOR.rampEnd-DOOR.rampStart)*i/10;const ray=new THREE.Raycaster(new THREE.Vector3(x,1,DOOR.z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(ramp)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-floorHeightAt(x,DOOR.z))<1e-6);}
});
test('Yueyue walks to the bedroom and back, with planted feet across the changing floor heights',()=>{
 const scene=new THREE.Scene(),bedroom=createBedroom(scene),toys=[...createToys(scene),...bedroom.toys],c=new Yueyue(scene),d=new Director(c,toys,()=>{});
 let crossed=0;
 for(const id of ['bedroom-book','bedroom-bear','blocks']){
  const toy=toys.find(t=>t.id===id);d.select(toy);let frames=0;
  while(d.state==='walk'&&frames++<6000){d.update(1/60);if(!c.footsteps.walking)continue;c.root.updateMatrixWorld(true);const leg=c.legRig[1-c.footsteps.swing];const sole=leg.ankle.getWorldPosition(new THREE.Vector3());sole.y-=LEG.soleHeight;
   assert.ok(Math.abs(sole.y-floorHeightAt(sole.x,sole.z))<.004,`shoe floats or sinks near ${sole.x}, ${sole.z}`);
   if(c.root.position.x>5.0&&c.root.position.x<5.4)crossed++;
  }
  assert.equal(d.state,'play',id);for(let i=0;i<(toy.duration+.05)*60;i++)d.update(1/60);assert.equal(d.state,'idle');
 }
 assert.ok(crossed>10);assert.ok(c.root.position.x<4.35);
});
