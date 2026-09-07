import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Yueyue} from '../src/character/Yueyue.js';
import {LEG} from '../src/character/legs.js';

test('soles stay thin, rounded, within the shoe silhouette and on the contact plane',()=>{
  const c=new Yueyue(new THREE.Scene());
  for(const leg of c.legRig){
    leg.sole.geometry.computeBoundingBox();leg.upper.geometry.computeBoundingBox();
    const bounds=leg.sole.geometry.boundingBox,upper=leg.upper.geometry.boundingBox;
    assert.ok(bounds.max.y-bounds.min.y<=.010,'outsole must not look like a thick platform');
    assert.ok(Math.abs(bounds.min.y+LEG.soleHeight)<1e-6,'visible bottom must match the ground-contact height');
    assert.ok(bounds.max.x<upper.max.x&&bounds.max.z<upper.max.z,'outsole must not stick beyond the shoe');
    const positions=leg.sole.geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const r=Math.hypot(positions.getX(i)/bounds.max.x,positions.getZ(i)/bounds.max.z);
      assert.ok(r<1.001,'sole must follow an oval footprint without rectangular corners');
    }
  }
});

test('exposed arms and hands remain outside the skirt throughout walking',()=>{
  const c=new Yueyue(new THREE.Scene());
  for(let frame=0;frame<150;frame++){
    c.root.position.z+=.65/60;c.pose('walk',frame/60,1/60);c.root.updateMatrixWorld(true);
    const inverseBody=c.body.matrixWorld.clone().invert();
    for(const arm of c.armRig)for(const part of ['upperSkin','forearm','palm']){
      const mesh=arm[part],matrix=inverseBody.clone().multiply(mesh.matrixWorld),vertices=mesh.geometry.attributes.position;
      for(let i=0;i<vertices.count;i++){
        const vertex=new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(matrix);
        if(vertex.y<-.16||vertex.y>.24)continue;
        const skirtRadius=.30-(vertex.y+.16)*.25;
        assert.ok(Math.hypot(vertex.x,vertex.z)-skirtRadius>.003,`${part} intersects the skirt at frame ${frame}`);
      }
    }
  }
});
