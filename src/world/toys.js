import * as THREE from 'three';
import {box,sphere,cylinder,group,book,palette as P} from './primitives.js';
import {createLadder} from './castle.js';
import {detailToy} from './toyDetails.js';
export const toyDefinitions=[
{id:'castle',label:'云朵城堡',icon:'♜',behavior:'climb',position:[2.3,-2.05],approach:[1.65,-.35],duration:15,status:'爬上小城堡，再滑下来！'},
{id:'blocks',label:'彩虹积木',icon:'▧',behavior:'stack',position:[-.7,1.9],approach:[-.7,1.55],duration:12,status:'认真地搭一座小小高楼'},
{id:'books',label:'绘本时光',icon:'▤',behavior:'read',position:[-2.95,.2],approach:[-2.55,.45],duration:13,status:'翻开绘本，发现一个新故事'},
{id:'music',label:'叮咚木琴',icon:'♫',behavior:'music',position:[1.9,2.3],approach:[1.9,1.87],duration:10,status:'叮叮咚咚，敲出自己的旋律'},
{id:'ball',label:'滚滚球球',icon:'◒',behavior:'ball',position:[3.65,1.05],approach:[3.22,1.05],duration:11,status:'推一推，小球会滚到哪里呢？'},
{id:'bunny',label:'兔兔朋友',icon:'♧',behavior:'hug',position:[-2.2,-2.2],approach:[-1.8,-1.8],duration:12,status:'抱抱兔兔，最喜欢你啦'}];
export function createToys(scene){return toyDefinitions.map(def=>{const root=group(scene,...[def.position[0],.23,def.position[1]]);root.userData.toyId=def.id;const parts={};
if(def.id==='castle'){
box(root,2.5,.2,2.1,P.lightWood,0,.1,0,.12);box(root,1.9,1.2,1.4,0xd5c7a7,0,.7,-.2,.10);box(root,1.04,.89,.025,0x9c937a,0,.57,.515,.3);box(root,.77,.8,.035,0xc1b397,0,.48,.54,.3);
box(root,2.05,.14,1.6,P.lightWood,0,1.35,-.2);for(const x of [-.85,.85]){cylinder(root,.35,.35,1.95,0xe8dac0,x,1.02,-.55);cylinder(root,.03,.49,.73,P.green,x,2.34,-.55);sphere(root,.075,P.yellow,x,2.74,-.55)}
for(let i=0;i<5;i++)box(root,.23,.30,.24,P.cream,-.78+i*.39,1.56,.52);for(const x of [-.85,.85])box(root,.22,.9,.17,0x8c9e85,x,1.02,-.91,.1);
// Ladder on the left; slide slopes toward the open centre.
parts.ladder=createLadder(root);
const slide=group(root,.57,.81,1.49);slide.rotation.x=.56;box(slide,.75,.10,2.3,P.yellow);for(const x of [-.41,.41])box(slide,.10,.23,2.3,0xe9bd69,x,.08,0);box(root,.9,.12,.6,P.yellow,.57,.08,2.48,.12);
const flag=group(root,0,1.51,-.48);cylinder(flag,.018,.018,1.15,P.lightWood,0,.4);box(flag,.36,.23,.025,P.pink,.18,.84,0,.01);
}else if(def.id==='blocks'){
const colors=[P.blue,P.pink,P.yellow,P.green];for(let i=0;i<8;i++){const x=Math.sin(i*5)*.65,z=Math.cos(i*3)*.48;const b=box(root,.27,.27,.27,colors[i%4],x,.14,z,.035);b.rotation.y=i*.5}for(let i=0;i<3;i++)box(root,.22,.18,.22,colors[i],0,.09+i*.18,0);parts.moving=box(root,.20,.20,.20,P.green,-.35,.1,-.05);
}else if(def.id==='books'){
const rug=cylinder(root,.74,.74,.04,0xd3c8af,0,.02);book(root,-.32,.08,-.12,P.green,-.3);book(root,-.25,.16,-.1,P.yellow,.1);parts.moving=group(root,.26,.1,.13);for(const s of [-1,1]){const page=box(parts.moving,.33,.025,.47,P.white,s*.16,.04,0,.01);page.rotation.z=s*.15;for(let i=0;i<3;i++)box(parts.moving,.2,.002,.015,0xb0b697,s*.16,.09,-.13+i*.065,.001)}
}else if(def.id==='music'){
box(root,1.08,.13,.63,P.lightWood,0,.1,0);const colors=[0xc48b7b,0xd8a078,0xe6c476,0xaabc86,0x86b3ab,0x8cabb8,0xb2a7bf];parts.bars=[];for(let i=0;i<7;i++){const b=box(root,.12,.075,.58-i*.035,colors[i],-.45+i*.15,.21,0,.025);parts.bars.push(b);for(const z of [-.16,.16])sphere(root,.015,0xa88b67,-.45+i*.15,.255,z)}parts.mallets=[];for(const x of [-.25,.25]){const stick=cylinder(root,.018,.018,.47,P.lightWood,x,.1,.48);stick.rotation.x=Math.PI/2;parts.mallets.push(stick,sphere(root,.063,P.white,x,.1,.25))}
}else if(def.id==='ball'){
parts.moving=group(root,0,.29,0);const geo=new THREE.SphereGeometry(.29,32,20);const pos=geo.attributes.position;const colors=[];for(let i=0;i<pos.count;i++){const a=Math.atan2(pos.getZ(i),pos.getX(i));const c=new THREE.Color([P.yellow,P.white,P.blue,P.pink,P.green,P.white][Math.floor((a+Math.PI)/ (Math.PI*2)*6)%6]);colors.push(c.r,c.g,c.b)}geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.68}));m.castShadow=true;parts.moving.add(m);
}else if(def.id==='bunny'){
parts.moving=group(root);sphere(parts.moving,.25,P.cream,0,.3,0,[1,1.2,.8]);sphere(parts.moving,.23,P.cream,0,.67,.025);for(const x of [-.11,.11]){sphere(parts.moving,.085,P.cream,x,1,.025,[.8,2.8,.7]);sphere(parts.moving,.052,P.pink,x,1,.078,[.6,2.6,.2]);sphere(parts.moving,.075,P.cream,x*2,.34,.05,[1,1.7,1]);sphere(parts.moving,.09,P.cream,x,.1,.13);sphere(parts.moving,.022,P.dark,x*.7,.69,.235)}sphere(parts.moving,.025,P.pink,0,.61,.248);
}
detailToy(def.id,root,parts);
root.traverse(o=>{if(o.isMesh)o.userData.toyId=def.id});const rest=parts.moving?{position:parts.moving.position.clone(),quaternion:parts.moving.quaternion.clone()}:null;return {...def,root,parts,rest};})}
export function createDecor(scene){const g=group(scene,0,.23,0);
// Each half-arch has its flat ends at local Y=0; align them to the mat top (0.225).
for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.44-i*.075,.035,12,36,Math.PI),new THREE.MeshStandardMaterial({color:[P.pink,P.yellow,P.green,P.blue,P.cream][i],roughness:.8}));m.name=`rainbow-arch-${i}`;m.position.set(-2.6,.225-g.position.y,2.63+i*.006);m.castShadow=true;m.receiveShadow=true;g.add(m)}
// Pull-along wooden duck.
const duck=group(g,.3,0,-2.7);sphere(duck,.22,P.yellow,0,.25,0,[1.5,1,.8]);sphere(duck,.15,P.yellow,.26,.47,0);box(duck,.15,.065,.13,0xd7965c,.41,.45,0);for(const z of [-.17,.17])for(const x of [-.18,.18]){const w=cylinder(duck,.08,.08,.05,P.wood,x,.09,z);w.rotation.x=Math.PI/2}sphere(duck,.014,P.dark,.31,.51,.13);
// Ring stacker.
const stack=group(g,3.55,0,2.5);cylinder(stack,.3,.33,.08,P.lightWood,0,.04);cylinder(stack,.04,.04,.7,P.wood,0,.4);for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.24-i*.035,.053,12,32),new THREE.MeshStandardMaterial({color:[P.pink,P.yellow,P.green,P.blue,P.cream][i]}));ring.rotation.x=Math.PI/2;ring.position.y=.15+i*.11;ring.castShadow=true;stack.add(ring)}sphere(stack,.075,P.yellow,0,.77);
// Little toy train.
for(let i=0;i<3;i++){const x=-.6+i*.48;box(g,.39,.22,.27,[P.blue,P.green,P.pink][i],x,.2,3.07);for(const z of [2.91,3.23])for(const dx of [-.12,.12]){const w=cylinder(g,.08,.08,.05,P.wood,x+dx,.11,z);w.rotation.x=Math.PI/2}if(i===0){cylinder(g,.07,.07,.13,P.yellow,x-.1,.37,3.07);box(g,.15,.22,.23,P.blue,x+.09,.37,3.07)}}
return g;}
