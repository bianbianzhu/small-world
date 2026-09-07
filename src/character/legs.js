import * as THREE from 'three';
import {group,sphere,box,mesh,palette as P} from '../world/primitives.js';

import {floorHeightAt} from '../world/surfaces.js';
export const LEG={upper:.17,lower:.17,hipHeight:.36,soleHeight:.062,stepDistance:.17,lift:.075};
export function createLeg(parent,side,skin){
  const hip=group(parent,side*.115,LEG.hipHeight,0);
  const knee=group(hip,0,-LEG.upper,0),ankle=group(knee,0,-LEG.lower,0);
  hip.name=`hip-${side}`;knee.name=`knee-${side}`;ankle.name=`ankle-${side}`;
  sphere(hip,.066,skin,0,-.082,0,[1,1.45,1]);sphere(knee,.060,skin,0,0,0);
  sphere(knee,.057,skin,0,-.074,0,[1,1.45,1]);sphere(knee,.066,P.white,0,-.135,0,[1,.64,1]);
  // Matching oval profiles form a rounded shoe with a thin inset outsole.
  const upperProfile=[[0,-.057],[.80,-.057],[.94,-.035],[1,-.008],[.92,.020],[.70,.045],[.35,.058],[0,.061]];
  const soleProfile=[[0,-.062],[.79,-.062],[.86,-.059],[.87,-.055],[.85,-.053],[0,-.053]];
  const shoeMesh=(profile,color)=>{
    const geometry=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),48);
    geometry.scale(.09,1,.126);
    return mesh(geometry,color,ankle,0,0,.032);
  };
  const upper=shoeMesh(upperProfile,0xa07a54);upper.name=`shoe-upper-${side}`;
  const sole=shoeMesh(soleProfile,0x906b48);sole.name=`shoe-sole-${side}`;
  box(ankle,.14,.025,.045,0xc49a70,0,.025,.064,.012);sphere(ankle,.015,P.cream,.035,.038,.085);
  return {hip,knee,ankle,sole,upper,side};
}
const down=new THREE.Vector3(0,-1,0);
export function solveLeg(leg,soleWorld,heading){
  const parent=leg.hip.parent;parent.updateWorldMatrix(true,false);
  const ankleWorld=soleWorld.clone().add(new THREE.Vector3(0,LEG.soleHeight,0));
  const offset=parent.worldToLocal(ankleWorld).sub(leg.hip.position);
  const d=THREE.MathUtils.clamp(offset.length(),.015,LEG.upper+LEG.lower-.0001),direction=offset.normalize();
  const bend=new THREE.Vector3(0,0,1);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
  const along=(LEG.upper**2-LEG.lower**2+d*d)/(2*d);
  const kneePosition=direction.clone().multiplyScalar(along).addScaledVector(bend,Math.sqrt(Math.max(0,LEG.upper**2-along**2)));
  const upperRotation=new THREE.Quaternion().setFromUnitVectors(down,kneePosition.clone().normalize());
  leg.hip.quaternion.copy(upperRotation);
  const calf=direction.multiplyScalar(d).sub(kneePosition).normalize().applyQuaternion(upperRotation.clone().invert());
  leg.knee.quaternion.setFromUnitVectors(down,calf);
  // Shoes stay horizontal during stance instead of pitching with the shins.
  leg.knee.updateWorldMatrix(true,false);
  leg.ankle.quaternion.copy(leg.knee.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(heading));
}

const ease=t=>t*t*(3-2*t);
export class Footsteps{
  constructor(character){this.character=character;this.lastPosition=character.root.position.clone();this.anchors=[];this.swing=0;this.progress=0;this.walking=false;this.lastTravel=0;this.direction=new THREE.Vector3(0,0,1);}
  floor(x,z){
    const root=this.character.root;
    // Root Y denotes its current support surface (mat or castle deck).
    if(root.position.y>.35)return root.position.y-.005;
    return floorHeightAt(x,z);
  }
  neutral(index,forward=.025){
    const c=this.character;c.root.updateWorldMatrix(true,false);
    const target=c.root.localToWorld(new THREE.Vector3(c.legRig[index].side*.115,0,forward));target.y=this.floor(target.x,target.z);return target;
  }
  beginStep(){
    this.from=this.anchors[this.swing].clone();
    const side=this.character.legRig[this.swing].side;
    const lateral=new THREE.Vector3(this.direction.z,0,-this.direction.x).multiplyScalar(side*.115);
    this.to=this.character.root.position.clone().addScaledVector(this.direction,LEG.stepDistance*1.5).add(lateral);
    this.to.y=this.floor(this.to.x,this.to.z);
  }
  fitReach(targets){
    const c=this.character;c.root.updateWorldMatrix(true,true);let lowerBy=0;
    targets.forEach((target,i)=>{
      const hip=c.legRig[i].hip.getWorldPosition(new THREE.Vector3());
      const horizontal=Math.hypot(hip.x-target.x,hip.z-target.z);
      const vertical=Math.sqrt(Math.max(0,(LEG.upper+LEG.lower-.001)**2-horizontal**2));
      lowerBy=Math.max(lowerBy,hip.y-(target.y+LEG.soleHeight)-vertical);
    });
    // Small pelvis adjustment lets the support leg reach the floor through turns.
    if(lowerBy>0)c.rig.position.y-=lowerBy;
  }
  update(type,dt){
    const c=this.character,current=c.root.position;
    this.lastTravel=Math.hypot(current.x-this.lastPosition.x,current.z-this.lastPosition.z);
    if(this.lastTravel>1e-6)this.direction.set(current.x-this.lastPosition.x,0,current.z-this.lastPosition.z).normalize();
    this.lastPosition.copy(current);
    const heading=c.root.getWorldQuaternion(new THREE.Quaternion());
    if(type==='walk'){
      if(!this.walking){this.anchors=[this.neutral(0),this.neutral(1)];this.swing=0;this.progress=0;this.beginStep();this.walking=true;}
      this.progress+=this.lastTravel/LEG.stepDistance;
      while(this.progress>=1){this.anchors[this.swing].copy(this.to);this.progress-=1;this.swing=1-this.swing;this.beginStep();}
      const target=this.from.clone().lerp(this.to,ease(this.progress));target.y+=Math.sin(this.progress*Math.PI)*LEG.lift;
      this.anchors[this.swing].copy(target);
      this.fitReach(this.anchors);
      for(let i=0;i<2;i++)solveLeg(c.legRig[i],this.anchors[i],heading);
      return;
    }
    this.walking=false;
    if(type==='climb'||type==='slide')return;
    // Settle both feet smoothly after a stride; one foot remains planted throughout.
    const grounded=['read','music','ball'].includes(type);
    for(let i=0;i<2;i++){
      const target=this.neutral(i,grounded?.18:.025);
      if(!this.anchors[i])this.anchors[i]=target.clone();
      this.anchors[i].lerp(target,1-Math.exp(-dt*18));
      if(this.anchors[i].y<this.floor(this.anchors[i].x,this.anchors[i].z))this.anchors[i].y=this.floor(this.anchors[i].x,this.anchors[i].z);
      solveLeg(c.legRig[i],this.anchors[i],heading);
    }
  }
}
