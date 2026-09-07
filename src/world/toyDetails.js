import * as THREE from 'three';
import {box,sphere,cylinder,group,palette as P} from './primitives.js';
import {surface} from './materials.js';
export function detailToy(id,root,parts){
  root.traverse(o=>{if(o.isMesh&&o.material.color){const hex=o.material.color.getHex();if([P.wood,P.lightWood,0xe3c599,0xd5c7a7].includes(hex))o.material=surface('wood',hex);if(id==='bunny'&&hex===P.cream)o.material=surface('fabric',hex);}});
  if(id==='castle'){
    for(const x of [-.85,.85]){
      for(let y=.35;y<1.85;y+=.34){const trim=new THREE.Mesh(new THREE.TorusGeometry(.351,.012,8,48),surface('wood',0xd3bfa0));trim.rotation.x=Math.PI/2;trim.position.set(x,y,-.55);root.add(trim);}
      for(let i=0;i<12;i++){const a=i*Math.PI/6;const curve=new THREE.LineCurve3(new THREE.Vector3(x+Math.sin(a)*.48,1.98,-.55+Math.cos(a)*.48),new THREE.Vector3(x+Math.sin(a)*.035,2.67,-.55+Math.cos(a)*.035));const seam=new THREE.Mesh(new THREE.TubeGeometry(curve,1,.009,5,false),surface('wood',0x7f946c));root.add(seam);}
    }
    for(let i=0;i<5;i++)box(root,.22,.017,.008,0xd7c8ab,0,.26+i*.135,.565,.003);
    sphere(root,.026,0xb99457,.24,.57,.57);
  }
  if(id==='blocks'){
    root.children.filter(o=>o.isMesh).forEach((block,i)=>{block.geometry.computeBoundingBox();const face=group(block,0,0,block.geometry.boundingBox.max.z+.002);const badge=new THREE.Mesh(new THREE.RingGeometry(.03,.046,3+i%4),new THREE.MeshStandardMaterial({color:P.white,side:THREE.DoubleSide}));face.add(badge);});
  }
  if(id==='books'){
    parts.page=group(parts.moving,0,.067,0);box(parts.page,.30,.007,.43,P.white,.15,0,0,.003);
    for(const x of [-.16,.15]){sphere(parts.moving,.058,P.yellow,x,.084,-.08,[1,.06,1]);box(parts.moving,.15,.003,.02,P.green,x,.086,.10,.003);}
    for(let i=0;i<3;i++)box(parts.page,.15,.003,.011,0xb6c2a2,.15,.007,-.04+i*.044,.001);
  }
  if(id==='bunny'){
    const m=parts.moving;box(m,.27,.07,.22,P.blue,0,.47,.04,.04);box(m,.07,.17,.035,P.blue,.08,.40,.205,.02);
    for(let i=0;i<8;i++)sphere(m,.008,0xb8a990,0,.14+i*.038,.205,[.6,1,.3]);
    for(const x of [-.11,.11])sphere(m,.052,P.pink,x,.105,.208,[1,.75,.15]);
  }
  if(id==='ball'){
    for(let i=0;i<6;i++){const seam=new THREE.Mesh(new THREE.TorusGeometry(.291,.0025,5,48,Math.PI),new THREE.MeshStandardMaterial({color:0xf8eddb,roughness:.9}));seam.rotation.y=i*Math.PI/3;parts.moving.add(seam);}
  }
}
