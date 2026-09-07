import * as THREE from 'three';
import {box,sphere,cylinder,group,book,mat,palette as P} from './primitives.js';
import {surface} from './materials.js';
import {createGarden} from './garden.js';
import {BEDROOM,DOOR,floorHeightAt} from './surfaces.js';
import {detailToy} from './toyDetails.js';

const rose=0xd6a8a1,linen=0xf2e4d1,peach=0xe9c6af;
function rod(parent,a,b,r,color){const d=b.clone().sub(a),m=cylinder(parent,r,r,d.length(),color);m.position.copy(a).lerp(b,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
function star(parent,r,color,x,y,z){const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,s=i%2?r*.45:r;const px=Math.cos(a)*s,py=Math.sin(a)*s;if(i===0)shape.moveTo(px,py);else shape.lineTo(px,py);}shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008});const m=new THREE.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function flower(parent,x,y,z,r=.09){const g=group(parent,x,y,z);for(let i=0;i<5;i++)sphere(g,r*.47,P.white,Math.sin(i*1.256)*r*.58,0,Math.cos(i*1.256)*r*.58,[1,.15,1]);sphere(g,r*.3,P.yellow,0,.006,0,[1,.25,1]);return g;}
function teddy(parent,x,y,z,scale=1){const bear=group(parent,x,y,z);bear.scale.setScalar(scale);const fur=surface('fabric',0xcaa77e);sphere(bear,.19,fur,0,.22,0,[1,1.15,.8]);sphere(bear,.19,fur,0,.53,0);for(const s of [-1,1]){sphere(bear,.065,fur,s*.15,.68,0);sphere(bear,.034,peach,s*.15,.68,.05);sphere(bear,.075,fur,s*.21,.25,.025,[.8,1.3,1]);sphere(bear,.08,fur,s*.11,.08,.11);sphere(bear,.018,P.dark,s*.067,.56,.171);}sphere(bear,.074,linen,0,.47,.158,[1,.68,.4]);sphere(bear,.022,P.dark,0,.50,.19);box(bear,.23,.055,.11,rose,0,.365,.05,.02);return bear;}
export const bedroomDefinitions=[
{id:'bedroom-book',label:'睡前绘本',icon:'☾',room:'bedroom',behavior:'read',position:[7.65,1.85],approach:[7.40,1.45],duration:13,status:'在卧室里，读一个温柔的小故事'},
{id:'bedroom-bear',label:'晚安小熊',icon:'♡',room:'bedroom',behavior:'hug',position:[9.65,2.10],approach:[9.23,1.92],duration:12,status:'抱抱小熊，今天也要做个好梦'}
];
export function createBedroom(scene){
 const root=group(scene,BEDROOM.x);root.name='yueyue-bedroom';const wood=surface('wood',0xe2c49e),paint=0xf0dfd5;
 box(root,BEDROOM.width,.35,8.7,P.lightWood,0,-.2,0,.13);box(root,BEDROOM.width,.10,8.7,wood);
 for(let z=-4.05;z<4.2;z+=.48){box(root,6.48,.005,.012,0xcbb18e,0,.052,z,.002);for(let x=-3.1+(Math.round(z*10)%2)*.6;x<3.2;x+=1.65)box(root,.009,.004,.47,0xcbb18e,x,.053,z+.24,.001);}
 // Matching open dollhouse shell, with an inset blue-sky window.
 box(root,6.6,1.08,.18,paint,0,.54,-4.25);box(root,1.9,2.3,.18,paint,-2.35,2.2,-4.25);box(root,1.85,2.3,.18,paint,2.375,2.2,-4.25);box(root,2.85,.28,.18,paint,.075,3.28,-4.25);
 const garden=group(root,.54,0,0);garden.scale.x=.60;createGarden(garden);
 box(root,2.95,.13,.38,wood,.09,1.1,-4.04);
 for(const x of [-1.36,.09,1.54])box(root,.065,2.1,.12,P.white,x,2.15,-4.12);
 for(const y of [1.13,2.17,3.18])box(root,2.95,.065,.12,P.white,.09,y,-4.12);
 for(const x of [-1.52,1.71])for(let i=0;i<4;i++)cylinder(root,.055,.055,2.34,surface('fabric',i%2?rose:peach),x-.12+i*.08,2.06,-3.87);
 box(root,6.5,.15,.12,P.white,0,.14,-4.12);
 // The outer wall is low at the front to keep the small objects visible.
 box(root,.16,1.02,8.5,paint,3.25,.51,0);box(root,.17,.075,8.5,linen,3.25,1.05,0);
 // Tiny wallpaper dots are geometry, lit with the rest of the room.
 for(let row=0;row<3;row++)for(let col=0;col<7;col++)sphere(root,.025,0xdcc3b2,-3.0+col*.22,.43+row*.25,-4.147,[1,1,.12]);
 // House-frame low toddler bed, quilted blanket and cloud headboard.
 const bed=group(root,1.45,.05,-1.55);bed.name='cloud-bed';
 for(const x of [-.92,.92])for(const z of [-1.45,1.45])box(bed,.13,.25,.13,wood,x,.125,z);
 box(bed,2.04,.18,3.2,wood,0,.25,0,.08);box(bed,1.88,.22,3.02,surface('fabric',linen),0,.45,0,.15);
 box(bed,2.07,.6,.14,peach,0,.65,-1.52,.09);for(const [x,r] of [[-.72,.29],[-.35,.38],[.07,.43],[.53,.36]])sphere(bed,r,surface('fabric',linen),x,.98,-1.51,[1,1,.25]);
 const pillow=box(bed,1.22,.20,.62,surface('fabric',P.white),0,.66,-1.05,.13);pillow.rotation.x=.06;
 for(const x of [-.33,.33])sphere(bed,.14,surface('fabric',P.white),x,.7,-1.37,[.7,.45,1.7]);
 box(bed,1.93,.14,2.02,surface('fabric',rose),0,.60,.46,.08);
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){const x=-.72+col*.48,z=-.29+row*.47;box(bed,.465,.028,.455,surface('fabric',[rose,linen,peach,0xc2c7aa][(row+col*2)%4]),x,.682,z,.025);if((row+col)%3===0)flower(bed,x,.70,z,.075);}
 for(const x of [-1.0,1.0]){box(bed,.08,.10,2.15,wood,x,.85,.36);for(let z=-.65;z<1.42;z+=.29)box(bed,.055,.40,.055,wood,x,.63,z,.025);}
 // Two timber roof frames and a light fabric canopy at the head end.
 for(const z of [-1.53,1.53]){for(const x of [-1.03,1.03])rod(bed,new THREE.Vector3(x,.32,z),new THREE.Vector3(x,2.10,z),.035,wood);rod(bed,new THREE.Vector3(-1.03,2.1,z),new THREE.Vector3(0,2.77,z),.035,wood);rod(bed,new THREE.Vector3(0,2.77,z),new THREE.Vector3(1.03,2.1,z),.035,wood);}
 rod(bed,new THREE.Vector3(0,2.77,-1.53),new THREE.Vector3(0,2.77,1.53),.035,wood);
 const canopy=group(bed,0,2.45,-1.02);for(const side of [-1,1]){const panel=box(canopy,1.22,.018,1.05,surface('fabric',0xf0d7c4),side*.51,0,0,.006);panel.rotation.z=-side*.58;}
 for(let i=0;i<5;i++){const x=-.72+i*.36,y=2.30+Math.sin(i*Math.PI/4)*.12;rod(bed,new THREE.Vector3(x,2.62-Math.abs(x)*.64,-1.0),new THREE.Vector3(x,y,-1.0),.006,P.lightWood);star(bed,.074,P.yellow,x,y-.06,-1.0);}
 teddy(bed,.61,.69,-1.0,.60);
 // Mushroom night light and bedside necessities.
 const night=group(root,-.18,.05,-2.75);box(night,.70,.62,.66,wood,0,.31,0,.06);box(night,.61,.25,.025,linen,0,.42,.34);sphere(night,.036,P.wood,0,.42,.374);book(night,-.02,.66,.03,P.green,.1);
 cylinder(night,.18,.21,.035,peach,.02,.725,0);cylinder(night,.075,.095,.26,P.white,.02,.86,0);
 const shade=new THREE.MeshPhysicalMaterial({color:0xe5b389,roughness:.8,emissive:0xffbb70,emissiveIntensity:.18});sphere(night,.31,shade,.02,1.03,0,[1,.54,1]);
 const lamp=new THREE.PointLight(0xffc486,1.3,3.2,2);lamp.position.set(BEDROOM.x-.16,1.05,-2.75);scene.add(lamp);
 // Wardrobe with curved crown, doors, brass knobs and drawer seams.
 const wardrobe=group(root,-2.05,.05,-3.38);box(wardrobe,1.63,2.13,1.03,surface('wood',0xd8bd96),0,1.065,0,.10);box(wardrobe,1.73,.13,1.10,wood,0,2.14,0,.06);
 for(const side of [-1,1]){box(wardrobe,.72,1.51,.075,0xe9d9c0,side*.395,1.26,.535,.07);box(wardrobe,.57,1.29,.020,linen,side*.395,1.26,.58,.05);sphere(wardrobe,.037,0xb59059,side*.10,1.20,.615);}
 for(const y of [.20,.43]){box(wardrobe,1.44,.19,.06,peach,0,y,.55,.025);for(const x of [-.38,.38])sphere(wardrobe,.026,P.wood,x,y,.60);}
 // Reading nook, little stool, basket and face cushion.
 const chair=group(root,-2.02,.05,-.67);box(chair,1.07,.40,1.05,surface('fabric',0xb8c4a6),0,.25,0,.15);box(chair,1.03,.74,.23,surface('fabric',0xb8c4a6),0,.72,-.43,.10);for(const x of [-.49,.49])box(chair,.17,.48,.89,surface('fabric',0xaebd9b),x,.53,.03,.075);
 const cushion=sphere(chair,.29,surface('fabric',linen),0,.69,-.17,[1,1,.36]);for(const x of [-.085,.085])sphere(chair,.015,P.dark,x,.73,-.06);sphere(chair,.018,rose,0,.65,-.05);book(chair,.12,.485,.24,P.pink,.2);
 cylinder(root,.36,.37,.32,surface('fabric',peach),-1.88,.21,.43);flower(root,-1.88,.375,.43,.12);
 const basket=group(root,-2.65,.05,2.72);cylinder(basket,.35,.27,.45,0xcaaa7c,0,.225);for(let y=.1;y<.44;y+=.065){const ring=new THREE.Mesh(new THREE.TorusGeometry(.28+y*.13,.010,6,32),mat(0xe3c49c));ring.rotation.x=Math.PI/2;ring.position.y=y;basket.add(ring);}teddy(basket,0,.32,0,.75);
 // Large soft flower rug, stitched border and scattered fabric petals.
 const rug=cylinder(root,1,1,.03,surface('fabric',0xe7d1bf),0,.065,1.65);rug.scale.set(1.55,1,1.3);rug.name='bedroom-rug';
 const rim=new THREE.Mesh(new THREE.TorusGeometry(1,.012,6,64),mat(0xc3ab90));rim.rotation.x=Math.PI/2;rim.scale.set(1.47,1.22,1);rim.position.set(0,.083,1.65);root.add(rim);
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7;flower(root,Math.sin(a)*1.20,.083,1.65+Math.cos(a)*.99,.065);}
 // Low dresser, bunny slippers and a keepsake shelf.
 const dresser=group(root,2.52,.05,2.80);box(dresser,1.03,.78,1.04,wood,0,.39,0,.06);for(const y of [.21,.55]){box(dresser,.91,.27,.035,linen,0,y,.54,.03);sphere(dresser,.035,P.wood,0,y,.58);}book(dresser,-.16,.83,.03,P.yellow,.15);book(dresser,-.13,.91,.04,P.blue,-.1);
 cylinder(dresser,.13,.10,.22,peach,.26,.89,-.15);for(let i=0;i<5;i++)sphere(dresser,.075,P.green,.26+Math.sin(i*2.4)*.08,1.07+Math.cos(i)*.08,-.15,[.7,1.5,.7]);
 for(const x of [.96,1.24]){sphere(root,.10,surface('fabric',rose),x,.10,.48,[.9,.50,1.5]);for(const side of [-1,1])sphere(root,.023,linen,x+side*.035,.155,.43,[.7,1.6,1]);}
 // Moon-and-star wall ornament, with actual crescent geometry.
 const moonShape=new THREE.Shape();moonShape.absarc(0,0,.25,Math.PI*.3,Math.PI*1.7,false);moonShape.quadraticCurveTo(-.02,-.10,.147,.202);moonShape.closePath();const moon=new THREE.Mesh(new THREE.ExtrudeGeometry(moonShape,{depth:.035,bevelEnabled:true,bevelSegments:2,bevelSize:.012,bevelThickness:.008}),mat(P.yellow));moon.position.set(2.40,2.59,-4.12);root.add(moon);star(root,.11,P.white,2.85,2.36,-4.10);star(root,.065,P.yellow,2.10,2.15,-4.10);
 const toys=bedroomDefinitions.map(def=>{const toyRoot=group(scene,def.position[0],floorHeightAt(...def.position),def.position[1]),parts={};toyRoot.name=def.id;
   if(def.behavior==='read'){book(toyRoot,-.2,.035,-.08,P.pink,-.15);parts.moving=group(toyRoot,.06,.055,.07);for(const side of [-1,1])box(parts.moving,.29,.022,.40,P.white,side*.145,.035,0,.008);detailToy('books',toyRoot,parts);}
   else parts.moving=teddy(toyRoot,0,0,0,.85);
   toyRoot.traverse(o=>{if(o.isMesh)o.userData.toyId=def.id;});return {...def,root:toyRoot,parts};
 });
 return {root,toys,lamp};
}
export function connectRooms(scene){
 const root=group(scene);root.name='connecting-door';const wood=surface('wood',0xe2c49e);
 // Cutaway partition leaves the rooms legible from the dollhouse camera.
 for(const [z,length] of [[-1.825,4.85],[3.575,1.55]]){box(root,.18,.90,length,0xebded0,DOOR.x,.45,z);box(root,.22,.075,length,wood,DOOR.x,.93,z);}
 for(const z of [.60,2.80]){box(root,.22,1.66,.14,wood,DOOR.x,.83,z,.06);sphere(root,.09,P.cream,DOOR.x,1.65,z);}
 const arch=new THREE.Mesh(new THREE.TorusGeometry(1.1,.072,12,48,Math.PI),wood);arch.rotation.y=Math.PI/2;arch.position.set(DOOR.x,1.66,DOOR.z);arch.castShadow=true;arch.receiveShadow=true;root.add(arch);
 // A real wedge connects the foam mat to the lower wooden floor.
 const x0=DOOR.rampStart,x1=DOOR.rampEnd,z0=.90,z1=2.50;
 const vertices=[x0,.225,z0,x0,.225,z1,x1,.05,z1,x1,.05,z0,x0,.05,z0,x0,.05,z1];
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex([0,1,2,0,2,3,0,4,5,0,5,1,0,3,4,1,5,2]);geometry.computeVertexNormals();
 const ramp=new THREE.Mesh(geometry,wood);ramp.name='doorway-ramp';ramp.receiveShadow=true;ramp.castShadow=true;root.add(ramp);
 return root;
}
