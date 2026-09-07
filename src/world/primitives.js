import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export const palette={cream:0xf3e8d0,wood:0xc99460,lightWood:0xe3be8b,green:0x9baa81,blue:0x91b8c2,pink:0xdca494,yellow:0xeac577,white:0xfff6e3,dark:0x575448};
const materials=new Map();
export function mat(color,roughness=.8){const key=color+'-'+roughness;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness}));return materials.get(key);}
export function mesh(geo,color,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,typeof color==='object'?color:mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function box(parent,w,h,d,color,x=0,y=0,z=0,r=.05){return mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),color,parent,x,y,z);}
export function sphere(parent,r,color,x=0,y=0,z=0,scale=[1,1,1]){const m=mesh(new THREE.SphereGeometry(r,24,16),color,parent,x,y,z);m.scale.set(...scale);return m;}
export function cylinder(parent,r1,r2,h,color,x=0,y=0,z=0){return mesh(new THREE.CylinderGeometry(r1,r2,h,32),color,parent,x,y,z);}
export function group(parent,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
export function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=kind==='wood'?'#dbc096':'#f4ecd8';ctx.fillRect(0,0,512,512);let seed=52;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<2600;i++){ctx.strokeStyle=kind==='wood'?`rgba(135,93,49,${rnd()*.08})`:`rgba(143,124,85,${rnd()*.08})`;ctx.lineWidth=rnd()*1.8;ctx.beginPath();const x=rnd()*512,y=rnd()*512;ctx.moveTo(x,y);ctx.lineTo(x+(kind==='wood'?rnd()*130:3),y+(kind==='wood'?rnd()*3:3));ctx.stroke()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?2:3,2);return t;}
export function book(parent,x,y,z,color,rot=0){const g=group(parent,x,y,z);g.rotation.y=rot;box(g,.4,.065,.5,color,0,0,0,.015);box(g,.37,.045,.46,palette.white,0,.004,0,.006);box(g,.4,.013,.5,color,0,.033,0,.005);box(g,.19,.005,.22,0xefddb5,0,.042,-.035,.002);return g;}
