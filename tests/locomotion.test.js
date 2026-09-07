import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Yueyue} from '../src/character/Yueyue.js';
import {createLadder,CASTLE} from '../src/world/castle.js';
import {LEG} from '../src/character/legs.js';

const ankleSole=leg=>leg.ankle.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,-LEG.soleHeight,0));
test('every ladder tread joins both inclined rails and stays level',()=>{
  const root=new THREE.Group(),ladder=createLadder(root);root.updateMatrixWorld(true);
  const {rails,treads}=ladder.userData;
  for(const tread of treads){
    for(const side of [-1,1]){
      const joint=tread.localToWorld(new THREE.Vector3(side*CASTLE.ladder.width/2,0,0));
      const inRail=rails[side===-1?0:1].worldToLocal(joint);
      assert.ok(Math.abs(inRail.x)<1e-8&&Math.abs(inRail.z)<1e-8,'rung is embedded in side rail, not floating beside it');
    }
    assert.equal(tread.rotation.x,0,'tread surface is level');
  }
  assert.ok(treads.at(-1).position.z<treads[0].position.z,'ladder slopes toward the castle as it rises');
  assert.ok(treads.at(-1).position.y<CASTLE.deckHeight);
});
test('pose blending actually moves joints and preserves the intended target',()=>{
  const c=new Yueyue(new THREE.Scene());
  const before=c.arms[0].quaternion.clone();
  c.pose('hug',1,1/60);
  assert.ok(c.arms[0].quaternion.angleTo(before)>.03,'arm should move on first pose update');
  for(let i=0;i<90;i++)c.pose('hug',1,1/60);
  assert.ok(Math.abs(c.arms[0].rotation.x+1.1)<.01,'pose converges instead of overwriting its target');
});
test('walking alternates raised feet, bends knees, and always has a planted sole',()=>{
  const c=new Yueyue(new THREE.Scene());c.root.rotation.y=0;
  const min=[Infinity,Infinity],max=[-Infinity,-Infinity],kneeMin=[Infinity,Infinity],kneeMax=[0,0];
  let previous=null,stanceSamples=0;
  for(let i=0;i<240;i++){
    c.root.position.z+=.65/60;c.pose('walk',i/60,1/60);c.root.updateMatrixWorld(true);
    const feet=c.legRig.map(ankleSole),stance=1-c.footsteps.swing;
    assert.ok(Math.abs(feet[stance].y-.225)<.002,`support shoe floats at frame ${i}: ${feet[stance].y}`);
    for(let j=0;j<2;j++){
      assert.ok(feet[j].y>=.224,'shoe must not penetrate the mat');
      min[j]=Math.min(min[j],feet[j].y);max[j]=Math.max(max[j],feet[j].y);
      const bend=c.legRig[j].knee.quaternion.angleTo(new THREE.Quaternion());kneeMin[j]=Math.min(kneeMin[j],bend);kneeMax[j]=Math.max(kneeMax[j],bend);
    }
    if(previous?.stance===stance){assert.ok(feet[stance].distanceTo(previous.foot)<.002,'stance foot slides along with the body');stanceSamples++;}
    previous={stance,foot:feet[stance].clone()};
  }
  for(let j=0;j<2;j++){assert.ok(max[j]-min[j]>.055,'each leg lifts visibly');assert.ok(kneeMax[j]-kneeMin[j]>.25,'each knee bends during its step');}
  assert.ok(stanceSamples>100);
});
test('stationary character does not march in place or breathe both feet off the floor',()=>{
  const c=new Yueyue(new THREE.Scene());
  for(let i=0;i<120;i++)c.pose('idle',i/60,1/60);
  c.root.updateMatrixWorld(true);const feet=c.legRig.map(ankleSole);
  for(let i=0;i<120;i++)c.pose('walk',2+i/60,1/60);
  c.root.updateMatrixWorld(true);c.legRig.forEach((leg,i)=>assert.ok(ankleSole(leg).distanceTo(feet[i])<1e-4));
});

test('support feet remain grounded along actual navigation turns between toys',async()=>{
  const {createToys}=await import('../src/world/toys.js');const {Director}=await import('../src/behaviors/Director.js');
  const scene=new THREE.Scene(),toys=createToys(scene),c=new Yueyue(scene),d=new Director(c,toys,()=>{});
  for(const toy of toys){d.select(toy);let frames=0;
    while(d.state==='walk'&&frames++<4000){d.update(1/60);if(!c.footsteps.walking)continue;c.root.updateMatrixWorld(true);const i=1-c.footsteps.swing;assert.ok(ankleSole(c.legRig[i]).distanceTo(c.footsteps.anchors[i])<.002,`${toy.id}: planted shoe leaves its ground contact while turning`);}
    assert.equal(d.state,'play');for(let i=0;i<(toy.duration+.1)*60;i++)d.update(1/60);
  }
});
