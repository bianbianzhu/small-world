import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Puppy,PUPPY} from '../src/character/Puppy.js';
import {Wander} from '../src/behaviors/Wander.js';
import {blocked} from '../src/behaviors/navigation.js';
import {floorHeightAt} from '../src/world/surfaces.js';
import {toyDefinitions} from '../src/world/toys.js';

const pawBottom=knee=>knee.localToWorld(new THREE.Vector3(0,-.085,.012)).y-.03;
test('all four paws rest on the floor while standing and the trot lifts them in diagonal pairs',()=>{
  const d=new Puppy(new THREE.Scene());d.root.rotation.y=0;
  for(let i=0;i<120;i++)d.pose('idle',i/60,1/60);d.root.updateMatrixWorld(true);
  for(const knee of d.knees)assert.ok(Math.abs(pawBottom(knee)-d.root.position.y)<.015,'standing paw should touch the floor');
  const swing=[[],[],[],[]];
  for(let i=0;i<180;i++){d.root.position.z+=PUPPY.speed/60;d.pose('trot',i/60,1/60);d.legs.forEach((l,j)=>swing[j].push(l.rotation.x));}
  for(const s of swing)assert.ok(Math.max(...s)-Math.min(...s)>.8,'each leg swings visibly while trotting');
  const [fl,fr,bl,br]=swing.map(s=>s[150]);
  assert.ok(fl*br>0&&fr*bl>0&&fl*fr<0,'front-left moves with back-right, opposite to front-right');
  d.pose('idle',4,1/60);const before=d.phase;for(let i=0;i<30;i++)d.pose('trot',5+i/60,1/60);assert.equal(d.phase,before,'a stationary puppy does not paddle in place');
});
test('the puppy roams both rooms without crossing walls or furniture and stays glued to the floor',()=>{
  const scene=new THREE.Scene(),d=new Puppy(scene),friend=new THREE.Group();friend.position.set(-.7,.23,1.55);scene.add(friend);
  const w=new Wander(d,{friend,toys:toyDefinitions});let travelled=0,runs=0;const previous=d.root.position.clone();
  for(let i=0;i<120*60;i++){
    w.update(1/60);const p=d.root.position;
    if(w.state==='run')runs++;else assert.ok(toyDefinitions.every(t=>Math.hypot(p.x-t.position[0],p.z-t.position[1])>.9),'puppy must not settle on top of a toy');
    assert.ok(!blocked(p.x,p.z),`puppy walked into an obstacle at ${p.x.toFixed(2)},${p.z.toFixed(2)}`);
    assert.ok(p.x>-3.8&&p.x<11.5&&p.z>-3.6&&p.z<3.7,'puppy left the home');
    if(w.state==='run')assert.equal(p.y,floorHeightAt(p.x,p.z)+.005,'puppy floats above or sinks into the floor');
    travelled+=Math.hypot(p.x-previous.x,p.z-previous.z);previous.copy(p);
  }
  assert.ok(travelled>12,`puppy should run around, travelled ${travelled.toFixed(1)} m`);
  assert.ok(runs>0&&runs<120*60,'the puppy alternates between running and resting');
});
test('calling the puppy brings it to Yueyue, where it greets her, and pause freezes it',()=>{
  const scene=new THREE.Scene(),d=new Puppy(scene),friend=new THREE.Group();friend.position.set(9.5,.05,1.2);friend.rotation.y=Math.PI;scene.add(friend);
  const w=new Wander(d,{friend});assert.ok(w.come());let frames=0;while(w.state==='run'&&frames++<60*40)w.update(1/60);
  assert.equal(w.state,'idle');assert.equal(w.act,'greet');
  assert.ok(d.root.position.distanceTo(friend.position)<1,'puppy stops within arm\'s reach of Yueyue');
  w.paused=true;const before=d.root.position.clone(),time=w.time;for(let i=0;i<300;i++)w.update(1/60);assert.deepEqual(d.root.position,before);assert.equal(w.time,time);
});
