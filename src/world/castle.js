import * as THREE from 'three';
import {box,sphere,group,palette as P} from './primitives.js';

// Model and climb path share the same local-space geometry.
export const CASTLE = {
  deckHeight: 1.42,
  ladder: {x:-.65, width:.64, bottom:new THREE.Vector3(-.65,.05,1.53), top:new THREE.Vector3(-.65,1.42,.57), steps:6},
};
export function createLadder(parent){
  const {bottom,top,width,steps}=CASTLE.ladder;
  const ladder=group(parent);ladder.name='castle-ladder';
  const direction=top.clone().sub(bottom),length=direction.length();
  const rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
  const rails=[];
  for(const side of [-1,1]){
    const rail=box(ladder,.09,length+.09,.11,P.lightWood);rail.name=`ladder-rail-${side}`;
    rail.position.copy(bottom).lerp(top,.5);rail.position.x+=side*width/2;rail.quaternion.copy(rotation);rails.push(rail);
  }
  const treads=[];
  for(let i=0;i<steps;i++){
    // Every rung joins the exact same centreline as the rails, with a level top.
    const center=bottom.clone().lerp(top,(i+.5)/steps);
    const tread=box(ladder,width+.025,.075,.18,0xe3c599,center.x,center.y,center.z,.025);
    tread.name=`ladder-tread-${i}`;treads.push(tread);
    for(const side of [-1,1])sphere(tread,.016,0xac8e65,side*(width/2-.035),0,.093,[1,1,.25]);
  }
  ladder.userData.rails=rails;ladder.userData.treads=treads;
  return ladder;
}
