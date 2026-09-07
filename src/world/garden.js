import * as THREE from 'three';
import {group, sphere, cylinder, box} from './primitives.js';
export function createGarden(room) {
  const garden = group(room);
  // A window-sized layered diorama prevents the exterior spilling around the dollhouse.
  const sky = new THREE.ShaderMaterial({side:THREE.DoubleSide, uniforms:{}, vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader:'varying vec2 vUv; void main(){vec3 horizon=vec3(.73,.88,.94);vec3 blue=vec3(.27,.61,.87);gl_FragColor=vec4(mix(horizon,blue,smoothstep(0.,1.,vUv.y)),1.);\n #include <tonemapping_fragment>\n #include <colorspace_fragment>\n}'});
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(4.84,2.12), sky);backdrop.position.set(-.75,2.14,-4.43);garden.add(backdrop);
  const cloudMat = new THREE.MeshBasicMaterial({color:0xf8fcff});
  for (const [x,y,s] of [[-2.35,2.8,.23],[.45,2.6,.17],[-.7,3.02,.11]]) {
    for (let i=0;i<4;i++) sphere(garden,s,cloudMat,x+(i-1.5)*s*.7,y+Math.sin(i*1.7)*s*.2,-4.38,[1.1,.52,.09]);
  }
  for(let i=0;i<8;i++) sphere(garden,.45,i%2?0xa0ba81:0x8caf7f,-2.85+i*.58,1.22+Math.sin(i)*.055,-4.33,[1,.43,.12]);
  // Trunks, leaf clusters and tiny blossoms sit beneath the blue upper half.
  for(const [x,h] of [[-2.75,.65],[1.10,.78]]) {
    cylinder(garden,.032,.045,h,0xa68a63,x,1.3+h/2,-4.28);
    for(let i=0;i<7;i++) sphere(garden,.19,i%2?0x94b97c:0x7ea772,x+Math.sin(i*2.4)*.17,1.4+h+Math.cos(i*2.4)*.13,-4.29,[1,1,.14]);
  }
  for(let i=0;i<12;i++){const x=-2.8+i*.35;box(garden,.025,.23,.025,0xf4e9d2,x,1.25,-4.2,.009);}box(garden,4.1,.025,.025,0xf4e9d2,-.88,1.29,-4.19,.005);
  garden.traverse(o=>{o.castShadow=false;o.receiveShadow=false;});
  return garden;
}
