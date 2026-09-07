import * as THREE from 'three';
import {box,sphere,cylinder,group,mat,palette as P,texture,book} from './primitives.js';
import {surface} from './materials.js';
import {createGarden} from './garden.js';
export function createRoom(scene){
const room=group(scene);const wood=surface('wood',0xe2c49e);
box(room,10.5,.35,8.7,P.lightWood,0,-.2,0,.15);box(room,10.5,.10,8.7,wood,0,0,0,.08);
for(let z=-4.05;z<4.2;z+=.48){box(room,10.35,.007,.014,0xcbb18e,0,.055,z,.002);for(let x=-5+(Math.round(z*10)%2)*.7;x<5;x+=1.7)box(room,.012,.006,.47,0xcbb18e,x,.055,z+.24,.002)}
// Open dollhouse walls, with a generous garden window.
box(room,.18,3.35,8.6,0xe8e4d3,-5.15,1.62,0);box(room,10.4,1.1,.18,0xebe7d6,0,.54,-4.25);
box(room,2.1,2.3,.18,0xebe7d6,-4.15,2.2,-4.25);box(room,3.6,2.3,.18,0xebe7d6,3.35,2.2,-4.25);box(room,4.65,.3,.18,0xebe7d6,-.9,3.28,-4.25);
box(room,10.4,.16,.15,P.white,0,.14,-4.1);box(room,.14,.16,8.4,P.white,-5,.14,0);
createGarden(room);box(room,4.9,.16,.45,P.lightWood,-.75,1.09,-4.05);
for(const x of [-3.17,-.75,1.67])box(room,.095,2.13,.17,P.white,x,2.16,-4.12);for(const y of [1.15,2.17,3.19])box(room,4.9,.075,.15,P.white,-.75,y,-4.12);
for(const x of [-3.4,1.92]){box(room,.5,2.44,.25,0xe0cfad,x,2.1,-3.92);for(let i=0;i<5;i++)cylinder(room,.07,.07,2.42,i%2?0xe8d7b8:0xd5c2a0,x-.21+i*.1,2.1,-3.78)}
// Fabric foam mat, 9 × 6.6 metres, with stitched seams.
const fabric=surface('fabric',0xf6ecd4);box(room,9,.09,6.6,0xd6be98,.1,.12,.2,.13);
for(let row=0;row<5;row++)for(let col=0;col<7;col++){let color=[0xf0e5cc,0xe3dfc3,0xeedac3,0xe8e4d0][(row*3+col*5)%4];const m=fabric.clone();m.color.setHex(color);box(room,1.275,.07,1.305,m,-3.75+col*1.285,.19,-2.43+row*1.315,.055)}
// Soft scattered motifs on the mat.
for(const [x,z,r] of [[-1.3,1.8,.35],[2.2,.4,.29],[-.6,-1.2,.25]]){const ring=new THREE.Mesh(new THREE.RingGeometry(r-.018,r,40),mat(0xd2c5a3));ring.rotation.x=-Math.PI/2;ring.position.set(x,.229,z);room.add(ring)}
// Left wall pictures.
for(let i=0;i<3;i++){const f=group(room,-5.02,2.1,-1.9+i*1.1);box(f,.08,.83,.67,P.lightWood);box(f,.09,.68,.52,P.white,.02);sphere(f,.17,[P.yellow,P.green,P.pink][i],.075,.03,0,[.04,1,1]);box(f,.015,.04,.3,0xd5d0b8,.075,-.22,0)}
// Low open shelf with individually modelled books and baskets.
const shelf=group(room,-4.38,0,-.4);for(const y of [.22,.83,1.48])box(shelf,.95,.1,3.8,P.lightWood,0,y);for(const z of [-1.86,0,1.86])box(shelf,.9,1.3,.10,P.lightWood,0,.86,z);for(let i=0;i<11;i++){const b=box(shelf,.47,.4+(i%3)*.08,.12,[P.blue,P.pink,P.yellow,P.green][i%4],0,1.73+(i%3)*.04,-1.57+i*.15);b.rotation.x=(i%4===0?.12:0)}
for(const z of [-1,.9]){box(shelf,.7,.42,.85,0xcfaa78,0,.47,z);for(let y=.3;y<.7;y+=.065)box(shelf,.015,.016,.8,0xe6c595,.36,y,z);box(shelf,.02,.07,.23,0x9d805b,.37,.57,z)}
// Reading bench and cushions.
box(room,1.25,.35,1.25,P.green,-3.8,.43,2.55,.18);box(room,1.08,.16,1.07,0xc7cba8,-3.8,.69,2.55,.13);const pillow=box(room,.65,.18,.65,P.white,-3.93,.85,2.65,.14);pillow.rotation.z=.15;
book(room,-3.45,.8,2.29,P.pink,.4);
// Plant in the corner.
cylinder(room,.28,.2,.47,0xdba78a,4.55,.28,-3.7);for(let i=0;i<9;i++){let a=i*2.4;const leaf=sphere(room,.22,i%2?0x9aa77c:0x778c65,4.55+Math.sin(a)*.25,.68+(i%3)*.22,-3.7+Math.cos(a)*.22,[.5,1.9,.8]);leaf.rotation.z=Math.sin(a)*.65}
// Pennant garland on the wall.
const points=[];for(let i=0;i<=30;i++){const x=2.1+i*.085;points.push(new THREE.Vector3(x,2.6-.3*Math.sin(i/30*Math.PI),-4.11))}room.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xb5a486})));
for(let i=0;i<7;i++){const s=new THREE.Shape();s.moveTo(-.13,0);s.lineTo(.13,0);s.lineTo(0,-.24);s.closePath();const m=new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshStandardMaterial({color:[P.green,P.yellow,P.pink,P.blue][i%4],side:THREE.DoubleSide}));m.position.set(2.27+i*.35,2.6-.3*Math.sin((i+.5)/7*Math.PI),-4.10);room.add(m)}
// Piping follows the mat edge; tiny quilting stitches use a single line buffer.
const stitchPoints=[];
for(let z=-3.04;z<3.47;z+=.105)for(const x of [-4.34,4.53])stitchPoints.push(x,.232,z,x,.232,z+.042);
for(let x=-4.32;x<4.49;x+=.105)for(const z of [-3.04,3.47])stitchPoints.push(x,.232,z,x+.042,.232,z);
const stitchGeo=new THREE.BufferGeometry();stitchGeo.setAttribute('position',new THREE.Float32BufferAttribute(stitchPoints,3));room.add(new THREE.LineSegments(stitchGeo,new THREE.LineBasicMaterial({color:0xbdb393,transparent:true,opacity:.6})));
// Curtain rod, finials, rings and tiebacks.
cylinder(room,.038,.038,5.9,P.wood,-.74,3.36,-3.83).rotation.z=Math.PI/2;
for(const x of [-3.65,2.17])sphere(room,.075,P.lightWood,x,3.36,-3.83);
for(const x of [-3.4,1.92]){box(room,.53,.075,.29,0xc7b18d,x,1.8,-3.91,.03);for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.065,.012,8,16),mat(P.wood));ring.position.set(x-.2+i*.1,3.31,-3.83);ring.rotation.y=Math.PI/2;room.add(ring)}}
// Sill planter, small terracotta lip, stems and flowers.
cylinder(room,.15,.12,.24,0xcb9677,-2.62,1.3,-3.94);cylinder(room,.16,.16,.04,0xdeaa88,-2.62,1.43,-3.94);
for(let i=0;i<5;i++){const x=-2.62+Math.sin(i*2.4)*.1,z=-3.94+Math.cos(i*2.4)*.07;cylinder(room,.008,.008,.21,0x82906a,x,1.54,z);for(let k=0;k<5;k++)sphere(room,.024,0xf4dbb3,x+Math.sin(k*1.26)*.032,1.66,z+Math.cos(k*1.26)*.032);sphere(room,.019,0xd6ad58,x,1.67,z)}
return room;
}
