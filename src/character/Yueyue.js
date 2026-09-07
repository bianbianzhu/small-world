import * as THREE from 'three';
import {group,box,sphere,cylinder,palette as P} from '../world/primitives.js';
import {surface} from '../world/materials.js';
import {createArm,solveArm} from './arms.js';
import {createLeg,Footsteps} from './legs.js';
export class Yueyue{
constructor(scene){this.root=group(scene,0,.23,.3);this.rig=group(this.root);this.body=group(this.rig,0,.47,0);const skin=0xf0c29f,hair=new THREE.MeshPhysicalMaterial({color:0x362c26,roughness:.42,clearcoat:.18});const cloth=surface('fabric',0xdba77e);
sphere(this.body,.24,0xd9a076,0,.13,0,[1,1.1,.78]);const dress=cylinder(this.body,.20,.30,.4,cloth,0,.04,0);for(const x of [-.11,.11]){box(this.body,.065,.32,.04,0xf1d0a1,x,.17,.174,.02);sphere(this.body,.024,P.cream,x,.2,.2)}
this.head=group(this.body,0,.52,0);sphere(this.head,.29,skin,0,0,0,[1,1.04,.91]);sphere(this.head,.295,hair,0,.105,-.042,[1, .84,.87]);
// Scalloped fringe, two short pigtails and soft round cheeks.
for(let i=0;i<7;i++)sphere(this.head,.08,hair,-.23+i*.075,.155-(i%2)*.023,.18,[.85,1.2,.7]);for(const s of [-1,1]){sphere(this.head,.10,hair,s*.3,.1,-.04,[1.1,.8,1]);sphere(this.head,.041,P.yellow,s*.277,.16,.009);sphere(this.head,.056,skin,s*.284,-.02,0);sphere(this.head,.047,0xe59c89,s*.17,-.078,.224,[1,.55,.18]);sphere(this.head,.026,0x342c28,s*.10,.015,.247,[1,1.25,.5]);sphere(this.head,.009,P.white,s*.10-.006,.025,.26);}
sphere(this.head,.027,skin,0,-.04,.266,[1,.8,.6]);const smile=new THREE.Mesh(new THREE.TorusGeometry(.038,.008,8,20,Math.PI),new THREE.MeshStandardMaterial({color:0xa66b5a}));smile.rotation.z=Math.PI;smile.position.set(0,-.084,.254);this.head.add(smile);
this.armRig=[];this.arms=[];this.legs=[];this.legRig=[];for(const s of [-1,1]){const arm=createArm(this.body,s,skin,cloth);this.armRig.push(arm);this.arms.push(arm.shoulder);const leg=createLeg(this.rig,s,skin);this.legRig.push(leg);this.legs.push(leg.hip)}
this.held=group(this.body,0,-.02,.28);this.held.visible=false;for(const s of [-1,1]){const pg=box(this.held,.2,.018,.29,P.white,s*.1,0,0,.008);pg.rotation.z=s*.15;}this.root.rotation.y=Math.PI*.15;
// Sewn bib, pocket, hem piping, socks and tiny shoe straps.
box(this.body,.19,.15,.045,cloth,0,.03,.204,.03);
for(const x of [-.073,.073])for(let i=0;i<5;i++)box(this.body,.008,.008,.005,P.cream,x,-.02+i*.022,.23,.002);
for(let i=0;i<18;i++){const a=i/18*Math.PI*2;sphere(this.body,.014,P.cream,Math.sin(a)*.286,-.14,Math.cos(a)*.286,[1,.6,1]);}

for(let i=0;i<5;i++){const a=i*Math.PI*.4;sphere(this.body,.014,P.white,Math.sin(a)*.024,.05+Math.cos(a)*.024,.233,[1,1,.3]);}sphere(this.body,.01,P.yellow,0,.05,.24);
this.eyes=[];this.head.traverse(o=>{if(o.isMesh&&o.geometry.parameters?.radius===.026)this.eyes.push(o)});
this.poseNodes=[this.rig,this.body,this.head,...this.arms,...this.legs];
this.footsteps=new Footsteps(this);

}
pose(type,t,dt=1/60){const previous=this.poseNodes.map(n=>({p:n.position.clone(),q:n.quaternion.clone()}));const wave=type==='walk'?Math.sin((this.footsteps.swing+this.footsteps.progress)*Math.PI):Math.sin(t*8);this.rig.position.y=0;this.body.rotation.set(0,0,0);this.head.rotation.set(0,0,0);this.arms.forEach((a,i)=>a.rotation.set(0,0,this.armRig[i].side*.32));this.legs.forEach(a=>a.rotation.set(0,0,0));this.legRig.forEach(l=>{l.knee.rotation.set(0,0,0);l.ankle.rotation.set(0,0,0)});this.held.visible=false;this.armRig.forEach(a=>{a.elbow.quaternion.identity();a.hand.quaternion.identity();a.mallet.visible=type==='music'});
if(type==='walk'){this.rig.position.y=0;this.legs[0].rotation.x=wave*.42;this.legs[1].rotation.x=-wave*.42;this.arms[0].rotation.x=-wave*.32;this.arms[1].rotation.x=wave*.32;this.armRig.forEach(a=>{a.elbow.rotation.x=-.12;a.shoulder.rotation.z=a.side*(.32+Math.abs(wave)*.025)});this.body.rotation.z=Math.sin(t*4)*.035;}
else if(type==='read'){this.rig.position.y=-.23;this.legs.forEach(l=>l.rotation.x=-1.15);this.arms.forEach(a=>a.rotation.x=-.85);this.head.rotation.x=.28;this.head.rotation.y=Math.sin(t*.8)*.13;this.held.rotation.z=Math.sin(t*1.8)*.055;this.arms[1].rotation.x+=Math.sin(t*2)*.12;}
else if(type==='stack'||type==='music'||type==='ball'){this.rig.position.y=type==='stack'?0:type==='music'?-.19:-.15;this.legs.forEach(l=>l.rotation.x=-.7);this.body.rotation.x=.24;this.head.rotation.x=.28;this.arms[0].rotation.x=-.75+Math.sin(t*(type==='music'?7:2.5))*.4;this.arms[1].rotation.x=-.85+Math.cos(t*(type==='music'?7:2.5))*.4;}
else if(type==='hug'){this.arms.forEach((a,i)=>{a.rotation.x=-1.1;a.rotation.z=i===0?-.35:.35});this.body.rotation.z=Math.sin(t*2)*.10;this.head.rotation.z=Math.sin(t*2)*.1;}
else if(type==='climb'){this.arms[0].rotation.x=-2+wave*.3;this.arms[1].rotation.x=-2-wave*.3;this.legs[0].rotation.x=.3+wave*.55;this.legs[1].rotation.x=.3-wave*.55;}
else if(type==='slide'){this.legs.forEach(l=>l.rotation.x=-1.2);this.arms.forEach((a,i)=>{a.rotation.x=-.8;a.rotation.z=i===0?1:-1});this.body.rotation.x=-.2;}
else{this.rig.position.y=0;this.body.position.y=.47+Math.sin(t*2)*.006;this.head.rotation.y=Math.sin(t*.7)*.16;this.arms.forEach(a=>a.rotation.x=Math.sin(t*2)*.025)}
const blend=1-Math.exp(-dt*9);this.poseNodes.forEach((n,i)=>{
  // slerpQuaternions copies its first argument internally; preserve the target first.
  const target=n.quaternion.clone();n.position.lerpVectors(previous[i].p,n.position,blend);n.quaternion.slerpQuaternions(previous[i].q,target,blend);
});
this.footsteps.update(type,dt);
const blink=t%4.8;this.eyes.forEach(e=>e.scale.y=1.25*(blink<.14?Math.max(.08,Math.abs(blink-.07)/.07):1));

}
reach(index,target,weight=1){solveArm(this.armRig[index],target,weight);}
aimMallet(index,target){const arm=this.armRig[index];const from=this.handPosition(index);arm.hand.quaternion.identity();arm.hand.updateWorldMatrix(true,false);const parentQ=arm.hand.parent.getWorldQuaternion(new THREE.Quaternion());const desired=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),target.clone().sub(from).normalize());arm.hand.quaternion.copy(parentQ.invert().multiply(desired));}
handPosition(index){this.root.updateWorldMatrix(true,true);return this.armRig[index].hand.getWorldPosition(new THREE.Vector3());}
}
