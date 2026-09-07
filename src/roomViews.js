import * as THREE from 'three';
import {viewText,onLangChange} from './i18n.js';
export const ROOM_VIEWS={
 playroom:{target:[-.3,.6,0],offset:[13.3,11.9,17],number:'01'},
 bedroom:{target:[8.55,.8,0],offset:[9.4,10.0,14.4],number:'02'},
 bathroom:{target:[14.25,.8,0],offset:[8.6,9.4,13.2],number:'03'},
 home:{target:[5.6,.65,0],offset:[19.5,19.0,27.0],number:'01 + 02 + 03'}
};
export function createRoomViews(camera,controls){
 let selected='home',transition=null;
 function select(id,animate=true){const view=ROOM_VIEWS[id];if(!view)return;selected=id;const target=new THREE.Vector3(...view.target),offset=new THREE.Vector3(...view.offset).multiplyScalar(innerWidth<760?1.3:1);
   controls.autoRotate=false;document.querySelector('#rotate').classList.remove('active');document.querySelector('#rotate').setAttribute('aria-pressed','false');
   transition={from:camera.position.clone(),fromTarget:controls.target.clone(),to:target.clone().add(offset),target,t:animate?0:1};
   document.querySelectorAll('[data-room]').forEach(b=>{b.classList.toggle('active',b.dataset.room===id);b.setAttribute('aria-pressed',String(b.dataset.room===id));});
   applyCopy(id);
   document.querySelector('#visit-bedroom').hidden=!(id==='bedroom'||id==='home');
   document.querySelector('#visit-bathroom').hidden=!(id==='bathroom'||id==='home');
 }
 function applyCopy(id){const view=ROOM_VIEWS[id],copy=viewText(id);
   document.querySelector('.intro h1').innerHTML=copy.title;document.querySelector('.intro p').innerHTML=copy.text;document.querySelector('.room-label').innerHTML=`${copy.english} <b>${view.number}</b>`;
   document.querySelector('.location').innerHTML=`<span>⌂</span> ${copy.label} <i></i> ${copy.detail}`;
 }
 onLangChange(()=>applyCopy(selected));
 function update(dt){if(!transition)return;transition.t=Math.min(1,transition.t+dt/1.25);const q=transition.t*transition.t*(3-2*transition.t);camera.position.lerpVectors(transition.from,transition.to,q);controls.target.lerpVectors(transition.fromTarget,transition.target,q);if(transition.t===1)transition=null;}
 controls.addEventListener('start',()=>transition=null);
 document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>select(b.dataset.room));
 select('home',false);update(0);
 return {select,update,reset:()=>select(selected),cancel:()=>transition=null};
}
