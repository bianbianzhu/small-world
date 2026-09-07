import * as THREE from 'three';
import {group,sphere,box,palette as P} from '../world/primitives.js';
// Two-segment arm with an explicit wrist anchor. Targets are in world coordinates.
export function createArm(body,side,skin,cloth){
  const shoulder=group(body,side*.25,.25,0),elbow=group(shoulder,0,-.16,0),hand=group(elbow,0,-.17,0);
  sphere(shoulder,.079,cloth,0,-.047,0,[1,1.12,1]);const upperSkin=sphere(shoulder,.054,skin,0,-.11,0,[1,1.25,1]);
  const forearm=sphere(elbow,.052,skin,0,-.074,0,[1,1.6,1]);const palm=sphere(hand,.058,skin,0,0,0,[1,.92,.7]);
  sphere(hand,.023,skin,-side*.043,.01,.022,[1,1.25,1]);
  for(let i=0;i<3;i++)sphere(hand,.016,skin,-.027+i*.026,-.035,.009,[.8,1.1,1]);
  const mallet=group(hand);cylinderStick(mallet);mallet.visible=false;
  shoulder.rotation.z=side*.32;
  return {shoulder,elbow,hand,mallet,side,upperSkin,forearm,palm};
}
function cylinderStick(parent){box(parent,.025,.025,.23,P.lightWood,0,0,.075,.01);sphere(parent,.045,P.white,0,0,.2);}
const down=new THREE.Vector3(0,-1,0);
export function solveArm(arm,target,weight=1){
  const parent=arm.shoulder.parent;parent.updateWorldMatrix(true,false);const local=parent.worldToLocal(target.clone()).sub(arm.shoulder.position);
  const upper=.16,lower=.17;const d=THREE.MathUtils.clamp(local.length(),.045,upper+lower-.001),direction=local.normalize();
  const bend=new THREE.Vector3(arm.side*.6,-.8,-.15);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
  const along=(upper*upper-lower*lower+d*d)/(2*d);const elbow=direction.clone().multiplyScalar(along).addScaledVector(bend,Math.sqrt(Math.max(0,upper*upper-along*along)));
  const q=new THREE.Quaternion().setFromUnitVectors(down,elbow.clone().normalize());arm.shoulder.quaternion.slerp(q,weight);
  const forearm=direction.multiplyScalar(d).sub(elbow).normalize().applyQuaternion(q.clone().invert());
  arm.elbow.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(down,forearm),weight);
}
