import * as THREE from 'three';
import {box,sphere,cylinder,group,mat,palette as P} from './primitives.js';
import {surface} from './materials.js';
import {BATHROOM,BATH_DOOR,BATH_MAT,floorHeightAt} from './surfaces.js';

// An all-white bathroom: warm whites for paint and towels, cool whites for tile and porcelain,
// with the only colour coming from pale water, mint towels and the little yellow ducks.
const white=0xfbfaf6,snow=0xf3f4f0,grout=0xe2e6e2,paint=0xf6f5f0,marble=0xf8f8f5,aqua=0xcfe3e6,mint=0xd8e6dc,blush=0xf1dcd5,sage=0xa9b8a3,duckOrange=0xe8934f;
const ceramic=new THREE.MeshPhysicalMaterial({color:white,roughness:.28,clearcoat:.55,clearcoatRoughness:.35});
const chrome=new THREE.MeshStandardMaterial({color:0xe6eaec,metalness:.9,roughness:.22});
const water=new THREE.MeshPhysicalMaterial({color:0xbfdde3,roughness:.15,transparent:true,opacity:.62,clearcoat:.8,clearcoatRoughness:.1});
const frosted=new THREE.MeshStandardMaterial({color:0xe3eff3,roughness:.55,transparent:true,opacity:.78});
const foam=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.25,clearcoat:.4});
const glow=new THREE.MeshStandardMaterial({color:0xfff6e6,emissive:0xffe2b0,emissiveIntensity:.55});
function rod(parent,a,b,r,color){const d=b.clone().sub(a),m=cylinder(parent,r,r,d.length(),color);m.position.copy(a).lerp(b,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
function ring(parent,radius,tube,color,x,y,z,axis='y'){const m=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,40),typeof color==='object'?color:mat(color));if(axis==='y')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.y=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function towelRoll(parent,x,y,z,color,r=.07,length=.46){const m=cylinder(parent,r,r,length,surface('fabric',color),x,y,z);m.rotation.z=Math.PI/2;return m;}
function towelHang(parent,x,y,z,color,w=.26,h=.5){const g=group(parent,x,y,z);box(g,w,h,.05,surface('fabric',color),0,-h/2,0,.02);for(const k of [.55,.62])box(g,w-.06,.012,.012,white,0,-h*k,.03,.004);return g;}
function folded(parent,x,y,z,color,w=.22,d=.16){for(let i=0;i<3;i++)box(parent,w-i*.01,.035,d,surface('fabric',color),x,y+.02+i*.036,z,.012);}
function bottle(parent,x,y,z,color,r=.045,h=.16){cylinder(parent,r,r,h,color,x,y+h/2,z);cylinder(parent,r*.45,r*.45,.03,chrome,x,y+h+.015,z);}
export function duckling(parent,x,y,z,scale=1){
 const g=group(parent,x,y,z);g.scale.setScalar(scale);const feather=P.yellow,pale=0xf2d27a;
 sphere(g,.19,feather,0,.19,0,[1.35,1,.95]);sphere(g,.13,feather,.16,.40,0);box(g,.12,.05,.08,duckOrange,.30,.39,0,.02);
 for(const side of [-1,1]){sphere(g,.017,P.dark,.22,.44,side*.075);sphere(g,.10,pale,-.02,.20,side*.15,[1.1,.6,.5]);sphere(g,.013,blush,.2,.395,side*.105,[1,.7,.3]);}
 sphere(g,.08,feather,-.24,.28,0,[1,.7,.7]);return g;
}
export const bathroomDefinitions=[
{id:'bath-duck',label:'小黄鸭',icon:'♨',room:'bathroom',behavior:'hug',position:[13.35,-2.2],approach:[12.88,-2.55],duration:11,status:'抱着小黄鸭，嘎嘎嘎，一起洗澡澡'},
{id:'bath-cups',label:'泡泡叠叠杯',icon:'◎',room:'bathroom',behavior:'stack',position:[14.95,2.35],approach:[14.95,1.95],duration:12,status:'一个一个，把小杯子叠成小高塔'}
];
export function createBathroom(scene){
 const root=group(scene,BATHROOM.x);root.name='yueyue-bathroom';const W=BATHROOM.width,D=BATHROOM.depth,wood=surface('wood',0xe2c49e);
 // Plinth, grout bed and a field of soft white tiles whose tops form the walking surface at 0.05.
 box(root,W,.35,D,P.lightWood,0,-.2,0,.13);box(root,W,.08,D,grout,0,-.01,0,.02);
 for(let i=0;i<10;i++)for(let j=0;j<18;j++){const x=-W/2+.24+i*.48,z=-4.08+j*.48;box(root,.45,.02,.45,(i+j)%2?white:snow,x,.04,z,.006);}
 // Back wall with a frosted window over the tub; warm-white paint above white subway tile.
 const wx=-1.3,ww=1.4,wy0=1.55,wy1=2.85;
 box(root,W,wy0,.18,paint,0,wy0/2,-4.25);box(root,wx-ww/2+W/2,3.3-wy0,.18,paint,(-W/2+wx-ww/2)/2,(wy0+3.3)/2,-4.25);box(root,W/2-(wx+ww/2),3.3-wy0,.18,paint,(wx+ww/2+W/2)/2,(wy0+3.3)/2,-4.25);box(root,ww,3.3-wy1,.18,paint,wx,(wy1+3.3)/2,-4.25);
 const sky=new THREE.Mesh(new THREE.PlaneGeometry(ww,wy1-wy0),new THREE.MeshBasicMaterial({color:0xc9e2ee}));sky.position.set(wx,(wy0+wy1)/2,-4.36);root.add(sky);
 const glass=box(root,ww,wy1-wy0,.03,frosted,wx,(wy0+wy1)/2,-4.25,.005);glass.castShadow=false;
 for(const x of [wx-ww/2,wx+ww/2])box(root,.07,wy1-wy0+.07,.14,white,x,(wy0+wy1)/2,-4.18);box(root,ww+.14,.07,.14,white,wx,wy1,-4.18);box(root,.05,wy1-wy0,.05,white,wx,(wy0+wy1)/2,-4.2);box(root,ww,.05,.05,white,wx,(wy0+wy1)/2,-4.2);
 box(root,ww+.3,.08,.32,marble,wx,wy0,-4.08,.012);
 // Subway tile wainscot with a mint accent row; alternate rows are offset by half a tile.
 for(let row=0;row<6;row++){const y=.14+row*.19,offset=row%2?.2:0;for(let i=-1;i<13;i++){const x=-2.215+offset+i*.4;const x0=Math.max(x-.185,-2.38),x1=Math.min(x+.185,2.38);if(x1-x0<.08)continue;box(root,x1-x0,.17,.025,white,(x0+x1)/2,y,-4.145,.012);}}
 for(let i=0;i<24;i++)box(root,.16,.16,.025,i%3?white:mint,-2.3+i*.2,1.32,-4.145,.01);box(root,W-.04,.04,.03,white,0,1.44,-4.145,.01);
 // Low outer wall on the right with a bead-board panel; the bedroom wall on the left gets the same panel around the doorway.
 box(root,.16,1.02,D-.2,paint,W/2,.51,0);box(root,.17,.075,D-.2,0xeef0ec,W/2,1.05,0);
 const beads=[];const panel=(x,z0,z1)=>{box(root,.03,.98,z1-z0,white,x,.54,(z0+z1)/2,.01);for(let z=z0+.1;z<z1-.05;z+=.12)beads.push(x+(x<0?.016:-.016),.07,z,x+(x<0?.016:-.016),1.0,z);};
 panel(W/2-.09,-4.15,4.15);const gap=[BATH_DOOR.z-BATH_DOOR.halfWidth-.07,BATH_DOOR.z+BATH_DOOR.halfWidth+.07];panel(-W/2+.055,-4.15,gap[0]);panel(-W/2+.055,gap[1],4.15);
 const beadGeo=new THREE.BufferGeometry();beadGeo.setAttribute('position',new THREE.Float32BufferAttribute(beads,3));root.add(new THREE.LineSegments(beadGeo,new THREE.LineBasicMaterial({color:0xdcdfd9,transparent:true,opacity:.7})));
 // Freestanding tub on chrome feet: a real cavity with translucent water, foam and a paper boat.
 const tub=group(root,-1.15,0,-3.5);tub.name='bathtub';
 for(const x of [-.75,.75])for(const z of [-.32,.32])cylinder(tub,.05,.06,.10,chrome,x,.10,z);
 box(tub,1.9,.10,.95,ceramic,0,.20,0,.04);for(const z of [-.415,.415])box(tub,1.9,.42,.12,ceramic,0,.46,z,.05);for(const x of [-.89,.89])box(tub,.12,.42,.71,ceramic,x,.46,0,.05);
 for(const z of [-.44,.44])box(tub,2.0,.07,.17,ceramic,0,.69,z,.03);for(const x of [-.915,.915])box(tub,.17,.07,1.05,ceramic,x,.69,0,.03);
 const bath=box(tub,1.68,.03,.73,water,0,.55,0,.005);bath.castShadow=false;
 for(let i=0;i<16;i++){const a=i*2.4,r=.03+(i%4)*.014;sphere(tub,r,foam,-.55+Math.sin(a)*.34+(i%3)*.12,.56+r*.5,Math.cos(a*1.3)*.24,[1,.7,1]);}
 for(let i=0;i<6;i++)sphere(tub,.035+(i%2)*.012,foam,.3+i*.09,.585,-.2+Math.sin(i)*.2,[1,.6,1]);
 const boat=group(tub,.35,.565,.12);boat.rotation.y=.5;box(boat,.22,.05,.11,white,0,.02,0,.02);box(boat,.14,.035,.07,blush,0,.06,0,.015);cylinder(boat,.006,.006,.16,P.lightWood,.02,.13,0);const sail=new THREE.Mesh(new THREE.ShapeGeometry((()=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(0,.14);s.lineTo(.09,0);s.closePath();return s;})()),new THREE.MeshStandardMaterial({color:mint,side:THREE.DoubleSide}));sail.position.set(.03,.07,0);boat.add(sail);
 for(let i=0;i<3;i++)duckling(tub,-.78+i*.16,.72,-.42,.24).rotation.y=-.3+i*.35;
 // Wall-mounted rain shower, mixer and a U-shaped curtain rail with the curtain gathered at one end.
 cylinder(root,.018,.018,1.55,chrome,-.35,2.07,-4.10);rod(root,new THREE.Vector3(-.35,2.85,-4.10),new THREE.Vector3(-.35,2.85,-3.55),.018,chrome);cylinder(root,.15,.15,.03,chrome,-.35,2.82,-3.55);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;sphere(root,.008,0xb8c4c8,-.35+Math.sin(a)*.09,2.80,-3.55+Math.cos(a)*.09);}
 for(const dx of [-.16,.16])cylinder(root,.035,.035,.06,chrome,-.35+dx,1.3,-4.07).rotation.x=Math.PI/2;box(root,.34,.07,.06,chrome,-.35,1.3,-4.09,.02);
 rod(root,new THREE.Vector3(-.35,1.3,-4.08),new THREE.Vector3(-.35,1.25,-3.85),.016,chrome);
 for(const x of [-2.3,0])rod(root,new THREE.Vector3(x,2.95,-4.15),new THREE.Vector3(x,2.95,-2.98),.02,chrome);rod(root,new THREE.Vector3(-2.3,2.95,-2.98),new THREE.Vector3(0,2.95,-2.98),.02,chrome);
 for(let i=0;i<6;i++){cylinder(root,.055,.055,2.2,surface('fabric',i%2?aqua:white),-2.22+i*.08,1.85,-2.98);ring(root,.045,.008,chrome,-2.22+i*.08,2.95,-2.98,'x');}
 // Bath mat with a stitched mint border and corner tassels; its top is BATH_MAT.height.
 const matX=BATH_MAT.x-BATHROOM.x,matY=BATH_MAT.height-.0175;box(root,BATH_MAT.halfWidth*2,.035,BATH_MAT.halfDepth*2,surface('fabric',white),matX,matY,BATH_MAT.z,.012);
 for(const s of [-1,1]){box(root,BATH_MAT.halfWidth*2-.14,.004,.014,mint,matX,BATH_MAT.height+.001,BATH_MAT.z+s*(BATH_MAT.halfDepth-.07),.001);box(root,.014,.004,BATH_MAT.halfDepth*2-.14,mint,matX+s*(BATH_MAT.halfWidth-.07),BATH_MAT.height+.001,BATH_MAT.z,.001);}
 for(const sx of [-1,1])for(const sz of [-1,1])sphere(root,.03,surface('fabric',white),matX+sx*(BATH_MAT.halfWidth+.02),.07,BATH_MAT.z+sz*(BATH_MAT.halfDepth+.02),[1,.6,1]);
 // Vanity with a vessel basin, round mirror, sconce and everyday bits on the marble top.
 const vanity=group(root,1.25,0,-3.78);vanity.name='vanity';
 box(vanity,1.2,.08,.6,0xe6e8e4,0,.09,-.05,.02);box(vanity,1.3,.66,.72,white,0,.42,0,.04);
 for(const side of [-1,1]){box(vanity,.55,.5,.03,snow,side*.3,.42,.37,.012);sphere(vanity,.022,chrome,side*.08,.42,.395);}
 box(vanity,1.4,.05,.82,marble,0,.775,0,.015);
 cylinder(vanity,.24,.18,.13,ceramic,0,.865,0);ring(vanity,.215,.028,ceramic,0,.93,0);cylinder(vanity,.19,.16,.02,0xe4e8e6,0,.915,0);
 cylinder(vanity,.025,.025,.24,chrome,0,.92,-.26);const spout=new THREE.Mesh(new THREE.TorusGeometry(.10,.02,8,24,Math.PI),chrome);spout.rotation.y=Math.PI/2;spout.position.set(0,1.04,-.16);spout.castShadow=true;vanity.add(spout);
 cylinder(vanity,.014,.014,.09,chrome,.06,1.0,-.26).rotation.z=Math.PI/2;
 bottle(vanity,-.52,.80,.1,white,.05,.17);bottle(vanity,-.4,.80,.18,mint,.035,.11);
 cylinder(vanity,.045,.04,.11,white,.45,.855,.08);for(const [dx,c] of [[-.02,blush],[.02,aqua]]){const brush=cylinder(vanity,.008,.008,.19,c,.45+dx,.96,.08);brush.rotation.z=dx*3;}
 folded(vanity,.52,.80,-.2,mint,.2,.15);cylinder(vanity,.06,.05,.09,white,-.55,.845,-.2);for(let i=0;i<5;i++)sphere(vanity,.032,sage,-.55+Math.sin(i*2.4)*.05,.93+(i%2)*.03,-.2+Math.cos(i*2.4)*.05,[1,.5,1]);
 const mirror=cylinder(root,.36,.36,.03,new THREE.MeshPhysicalMaterial({color:0xd6e4ea,roughness:.1,clearcoat:1,clearcoatRoughness:.05}),1.25,1.95,-4.135);mirror.rotation.x=Math.PI/2;ring(root,.365,.022,white,1.25,1.95,-4.13,'z');
 const streak=box(root,.05,.34,.012,0xf4f9fa,1.13,2.0,-4.115,.004);streak.rotation.z=.35;
 box(root,.5,.04,.06,chrome,1.25,2.5,-4.12,.015);for(const x of [1.08,1.42]){cylinder(root,.02,.02,.06,chrome,x,2.5,-4.09).rotation.x=Math.PI/2;sphere(root,.055,glow,x,2.42,-4.06);}
 const sconce=new THREE.PointLight(0xfff0d8,1.1,4.2,2);sconce.position.set(BATHROOM.x+1.25,2.4,-3.8);scene.add(sconce);
 // Small shelf beside the mirror, a framed whale print and two hooks with hanging towels.
 box(root,.55,.04,.22,wood,2.05,1.55,-4.05);for(const x of [1.85,2.05])box(root,.03,.12,.02,wood,x,1.49,-4.12);folded(root,1.95,1.57,-4.05,white,.2,.16);bottle(root,2.2,1.57,-4.05,aqua,.03,.1);
 const frame=group(root,2.0,2.45,-4.13);box(frame,.5,.4,.03,P.lightWood,0,0,0,.01);box(frame,.44,.34,.02,white,0,0,.01,.006);sphere(frame,.1,aqua,-.02,-.02,.025,[1.4,.75,.2]);sphere(frame,.05,aqua,.14,.05,.025,[1,.5,.2]);sphere(frame,.012,P.dark,-.08,.0,.045);
 for(const [x,c] of [[.3,white],[.62,mint]]){sphere(root,.022,chrome,x,1.9,-4.13);towelHang(root,x,1.88,-4.09,c,.24,.55);}
 sphere(root,.08,surface('fabric',white),.3,1.86,-4.07,[1,.7,.6]);for(const s of [-1,1])sphere(root,.032,surface('fabric',white),.3+s*.07,1.93,-4.07);
 // Two-step toddler stool in front of the basin.
 const stool=group(root,1.25,0,-3.05);box(stool,.5,.14,.36,wood,0,.12,0,.02);box(stool,.5,.14,.2,wood,0,.26,-.08,.02);for(const x of [-.19,.19])box(stool,.05,.26,.34,wood,x,.18,-.01,.012);sphere(stool,.03,mint,.12,.34,-.08,[1,.4,1]);
 // Toilet with a closed lid, paper holder on the low wall, and a little mint potty beside it.
 const toilet=group(root,1.85,0,-1.5);toilet.name='toilet';
 box(toilet,.42,.40,.5,ceramic,0,.25,0,.12);const bowl=cylinder(toilet,.26,.22,.10,ceramic,-.1,.5,0);bowl.scale.z=1.2;const seat=cylinder(toilet,.27,.27,.04,white,-.1,.565,0);seat.scale.z=1.2;const lid=cylinder(toilet,.27,.27,.04,ceramic,-.1,.605,0);lid.scale.z=1.2;
 box(toilet,.2,.48,.44,ceramic,.37,.74,0,.04);box(toilet,.24,.05,.48,ceramic,.37,.995,0,.015);sphere(toilet,.025,chrome,.37,1.03,0);
 box(root,.06,.1,.05,chrome,2.29,.72,-.95,.01);cylinder(root,.06,.06,.11,white,2.22,.72,-.95).rotation.z=Math.PI/2;box(root,.11,.002,.05,snow,2.22,.66,-.93,.001);
 const potty=group(root,1.15,0,-.6);cylinder(potty,.16,.14,.16,mint,0,.13,0);ring(potty,.135,.035,white,0,.22,0);box(potty,.3,.14,.05,mint,0,.28,-.14,.02);sphere(potty,.02,P.dark,-.04,.3,-.11);sphere(potty,.02,P.dark,.04,.3,-.11);
 // Open shelf against the right wall: rolled towels, a wicker basket, bottles and a plant.
 const shelf=group(root,2.05,0,1.4);shelf.name='bath-shelf';
 for(const z of [-.55,.55])box(shelf,.62,.95,.05,white,0,.525,z,.01);for(const y of [.15,.55,.95])box(shelf,.62,.04,1.1,white,0,y,0,.01);box(shelf,.05,.95,1.1,white,.28,.525,0,.01);
 for(const [z,c] of [[-.36,mint],[-.2,white],[-.04,aqua],[.12,white]])towelRoll(shelf,0,.64,z,c,.07,.44);folded(shelf,0,.57,.36,white,.4,.3);
 const basket=group(shelf,0,.17,-.2);cylinder(basket,.24,.19,.32,0xd8c8ad,0,.16);for(let y=.06;y<.31;y+=.06)ring(basket,.20+y*.12,.008,0xe8dcc4,0,y,0);sphere(basket,.1,surface('fabric',aqua),.02,.33,0,[1.4,.5,1]);
 bottle(shelf,-.1,.97,-.35,white,.045,.18);bottle(shelf,.05,.97,-.15,mint,.04,.14);bottle(shelf,-.12,.97,.02,white,.035,.11);
 cylinder(shelf,.09,.075,.13,white,0,1.035,.32);for(let i=0;i<7;i++)sphere(shelf,.045,sage,Math.sin(i*2.4)*.07,1.13+(i%3)*.04,.32+Math.cos(i*2.4)*.07,[1,.55,1]);
 // Wire laundry hamper with a towel spilling over, and a eucalyptus in a white pot by the door side.
 const hamper=group(root,2.0,0,3.5);cylinder(hamper,.3,.26,.55,white,0,.325);for(let y=.12;y<.58;y+=.11)ring(hamper,.27+y*.06,.007,0xdcdfd9,0,y,0);sphere(hamper,.16,surface('fabric',mint),.05,.62,.02,[1.4,.55,1.1]);sphere(hamper,.1,surface('fabric',mint),.28,.5,.08,[.6,1.4,.8]);
 const plant=group(root,-2.0,0,3.6);cylinder(plant,.22,.18,.35,white,0,.225);cylinder(plant,.2,.2,.03,0xe6e8e4,0,.4);
 for(let i=0;i<4;i++){const a=i*1.6;rod(plant,new THREE.Vector3(Math.sin(a)*.03,.4,Math.cos(a)*.03),new THREE.Vector3(Math.sin(a)*.14,1.02,Math.cos(a)*.14),.008,0x9caa8f);for(let k=0;k<5;k++)sphere(plant,.05,sage,Math.sin(a)*(.05+k*.022)+Math.sin(k*2.1)*.06,.5+k*.11,Math.cos(a)*(.05+k*.022)+Math.cos(k*2.1)*.06,[1,.25,1]);}
 // Short towel ladder leaning on the shared wall, with a mint towel over a rung.
 const ladder=group(root,-2.2,0,-.4);ladder.rotation.z=-.16;for(const z of [-.2,.2])box(ladder,.045,1.05,.045,wood,0,.575,z,.015);for(const y of [.38,.66,.94])rod(ladder,new THREE.Vector3(0,y,-.2),new THREE.Vector3(0,y,.2),.016,wood);
 box(ladder,.06,.34,.3,surface('fabric',mint),.05,.5,0,.02);box(ladder,.06,.28,.3,surface('fabric',white),.03,.82,.02,.02);
 // Bath toys: the rubber duck waits on the mat; stacking cups sit near the open front.
 const toys=bathroomDefinitions.map(def=>{const toyRoot=group(scene,def.position[0],floorHeightAt(...def.position),def.position[1]),parts={};toyRoot.name=def.id;
   if(def.behavior==='hug'){parts.moving=duckling(toyRoot,0,0,0,1);parts.moving.rotation.y=-2.2;}
   else{const colors=[white,mint,aqua];for(let i=0;i<3;i++){cylinder(toyRoot,.11-i*.01,.14-i*.01,.18,colors[i],0,.09+i*.18,0);ring(toyRoot,.135-i*.01,.008,colors[(i+1)%3],0,.005+i*.18,0);}
     parts.moving=group(toyRoot,-.42,.10,.12);cylinder(parts.moving,.08,.11,.20,blush,0,0,0);ring(parts.moving,.105,.008,white,0,-.095,0);sphere(parts.moving,.03,white,0,.1,0,[1,.3,1]);
     const spare=cylinder(toyRoot,.07,.09,.2,aqua,.38,.09,-.1);spare.rotation.z=Math.PI*.52;}
   toyRoot.traverse(o=>{if(o.isMesh)o.userData.toyId=def.id;});return {...def,root:toyRoot,parts};
 });
 return {root,toys,sconce};
}
export function connectBathroom(scene){
 const root=group(scene);root.name='bathroom-door';const wood=surface('wood',0xe2c49e),r=BATH_DOOR.halfWidth+.07;
 // Matching arched frame in the bedroom's low outer wall; both floors already sit at the same height.
 for(const z of [BATH_DOOR.z-r,BATH_DOOR.z+r]){box(root,.22,1.66,.14,wood,BATH_DOOR.x,.83,z,.06);sphere(root,.075,P.cream,BATH_DOOR.x,1.65,z);}
 const arch=new THREE.Mesh(new THREE.TorusGeometry(r,.06,12,40,Math.PI),wood);arch.rotation.y=Math.PI/2;arch.position.set(BATH_DOOR.x,1.66,BATH_DOOR.z);arch.castShadow=true;arch.receiveShadow=true;root.add(arch);
 box(root,.34,.012,BATH_DOOR.halfWidth*2,marble,BATH_DOOR.x,.05,BATH_DOOR.z,.004);
 return root;
}
