import * as THREE from 'three';
import {group,box,sphere,cylinder,palette as P} from '../world/primitives.js';
// Stride length drives the trot from distance travelled, so paws never skate at any speed.
export const PUPPY={stride:.30,speed:1.15,bodyHeight:.255,legLength:.185};
export class Puppy{
constructor(scene){this.root=group(scene,-1.2,.23,-.6);this.root.userData.puppy=true;this.rig=group(this.root);this.body=group(this.rig,0,PUPPY.bodyHeight,0);const fur=0xe6c396,saddle=0xc79a68,dark=0x3a302a;
// Torso, round chest, cream belly and a darker saddle of fur.
sphere(this.body,.15,fur,0,0,0,[1,.82,1.55]);sphere(this.body,.135,fur,0,-.005,.12,[1,.9,1]);sphere(this.body,.12,P.cream,0,-.06,.02,[.95,.7,1.5]);sphere(this.body,.12,saddle,0,.065,-.06,[.9,.6,1.2]);
this.head=group(this.body,0,.13,.25);sphere(this.head,.125,fur,0,0,0,[1,.95,1]);sphere(this.head,.075,P.cream,0,-.035,.1,[1,.8,1.15]);sphere(this.head,.03,dark,0,-.015,.185,[1,.8,.8]);sphere(this.head,.055,saddle,0,.095,-.02,[1.2,.5,1.1]);
box(this.head,.03,.012,.05,0xe3908f,0,-.078,.14,.01);
// Floppy ears, shiny eyes and a red collar with a brass tag.
this.ears=[];for(const s of [-1,1]){sphere(this.head,.022,dark,s*.055,.03,.105,[1,1.2,.6]);sphere(this.head,.008,P.white,s*.055-.005,.038,.118);const ear=group(this.head,s*.105,.075,-.02);ear.rotation.z=s*.3;sphere(ear,.05,saddle,0,-.075,0,[.55,1.5,.35]);this.ears.push(ear);}
const collar=new THREE.Mesh(new THREE.TorusGeometry(.105,.016,10,28),new THREE.MeshStandardMaterial({color:0xc9705f,roughness:.7}));collar.rotation.x=Math.PI/2+.25;collar.position.set(0,.05,.17);collar.castShadow=true;this.body.add(collar);cylinder(this.body,.022,.022,.008,P.yellow,0,-.045,.26).rotation.x=Math.PI/2;
// Tail wags from its base; legs are shoulder/hip, knee and cream paw.
this.tail=group(this.body,0,.09,-.22);this.tail.rotation.x=-.9;sphere(this.tail,.03,fur,0,0,-.08,[1,1,3]);sphere(this.tail,.035,P.cream,0,0,-.19);
this.legs=[];this.knees=[];for(const [x,z] of [[-.085,.15],[.085,.15],[-.085,-.15],[.085,-.15]]){const hip=group(this.body,x,-.04,z);sphere(hip,.05,z>0?fur:saddle,0,-.05,0,[1,1.6,1]);const knee=group(hip,0,-.1,0);sphere(knee,.038,fur,0,-.04,0,[1,1.5,1]);sphere(knee,.04,P.cream,0,-.085,.012,[1,.75,1.2]);this.legs.push(hip);this.knees.push(knee);}
this.eyes=[];this.head.traverse(o=>{if(o.isMesh&&o.geometry.parameters?.radius===.022)this.eyes.push(o)});
this.poseNodes=[this.rig,this.body,this.head,this.tail,...this.ears,...this.legs,...this.knees];
// Legs settle far faster than the body so a 4 Hz trot keeps its full swing instead of being smoothed away.
this.poseRates=this.poseNodes.map(n=>this.legs.includes(n)||this.knees.includes(n)?40:12);
this.phase=0;this.last=this.root.position.clone();this.root.rotation.y=-Math.PI*.35;
}
pose(type,t,dt=1/60){const previous=this.poseNodes.map(n=>({p:n.position.clone(),q:n.quaternion.clone()}));
const p=this.root.position,travel=Math.hypot(p.x-this.last.x,p.z-this.last.z);this.last.copy(p);if(type==='trot')this.phase+=travel/PUPPY.stride;const cycle=this.phase*Math.PI*2;
this.rig.position.y=0;this.body.position.y=PUPPY.bodyHeight;this.body.rotation.set(0,0,0);this.head.rotation.set(0,0,0);this.tail.rotation.set(-.9,0,0);this.ears.forEach((e,i)=>e.rotation.set(0,0,(i?1:-1)*.3));this.legs.forEach(l=>l.rotation.set(0,0,0));this.knees.forEach(k=>k.rotation.set(0,0,0));
if(type==='trot'){
  // Diagonal pairs swing together; the free leg tucks its knee while the body bobs once per step.
  const offset=[0,Math.PI,Math.PI,0];this.legs.forEach((l,i)=>{const s=Math.sin(cycle+offset[i]);l.rotation.x=s*.6;this.knees[i].rotation.x=(i<2?-1:1)*Math.max(0,-s)*.9});
  this.rig.position.y=Math.abs(Math.sin(cycle))*.022;this.body.rotation.z=Math.sin(cycle)*.04;this.body.rotation.x=-.05;this.head.rotation.x=.12;this.tail.rotation.set(-.6,Math.sin(t*14)*.5,0);this.ears.forEach((e,i)=>e.rotation.x=-.25-Math.abs(Math.sin(cycle))*.35);
}else if(type==='sit'){
  this.rig.position.y=-.07;this.body.rotation.x=-.5;this.head.rotation.x=.42;this.legs.forEach((l,i)=>{l.rotation.x=i<2?.5:-1.35;if(i>=2)this.knees[i].rotation.x=1.7});this.tail.rotation.set(-1.4,Math.sin(t*4)*.3,0);this.head.rotation.y=Math.sin(t*.8)*.25;this.head.rotation.z=Math.sin(t*.35)*.18;
}else if(type==='sniff'){
  this.body.rotation.x=.14;this.head.rotation.x=.8+Math.sin(t*9)*.05;this.legs.forEach((l,i)=>l.rotation.x=i<2?-.16:.14);this.tail.rotation.set(-.7,Math.sin(t*9)*.45,0);this.ears.forEach(e=>e.rotation.x=-.3);
}else if(type==='greet'){
  // Whole back end wiggles with the tail when the puppy meets Yueyue.
  const w=Math.sin(t*18);this.body.rotation.y=w*.07;this.body.rotation.x=-.1;this.tail.rotation.set(-.5,w*.8,0);this.head.rotation.x=-.12;this.head.rotation.z=Math.sin(t*1.3)*.22;this.rig.position.y=Math.max(0,Math.sin(t*9))*.012;this.legs.forEach((l,i)=>{if(i<2)l.rotation.x=-.15});
}else{
  this.body.position.y=PUPPY.bodyHeight+Math.sin(t*3)*.004;this.head.rotation.y=Math.sin(t*.9)*.3;this.head.rotation.z=Math.sin(t*.4)*.12;this.tail.rotation.set(-.9,Math.sin(t*5)*.35,0);
}
this.poseNodes.forEach((n,i)=>{const blend=1-Math.exp(-dt*this.poseRates[i]),target=n.quaternion.clone();n.position.lerpVectors(previous[i].p,n.position,blend);n.quaternion.slerpQuaternions(previous[i].q,target,blend);});
const blink=(t+1.7)%5.3;this.eyes.forEach(e=>e.scale.y=1.2*(blink<.12?Math.max(.1,Math.abs(blink-.06)/.06):1));
}
}
