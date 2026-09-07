import * as THREE from 'three';
export const ROOM_VIEWS={
 playroom:{target:[-.3,.6,0],offset:[13.3,11.9,17],label:'阳光游戏室',number:'01',english:'THE PLAYROOM',title:'小小世界，<br/>大大的<span>好奇心。</span>',text:'不用赶时间。<br/>陪悦悦，玩一会儿吧。'},
 bedroom:{target:[8.55,.8,0],offset:[9.4,10.0,14.4],label:'悦悦的卧室',number:'02',english:'YUEYUE’S BEDROOM',title:'抱一抱，<br/>做个<span>甜甜的梦。</span>',text:'把今天的小快乐，<br/>轻轻放进梦里。'},
 home:{target:[3.45,.65,0],offset:[17.0,17.0,24.0],label:'悦悦的小家',number:'01 + 02',english:'OUR LITTLE HOME',title:'玩耍与美梦，<br/>只隔<span>一扇小门。</span>',text:'阳光游戏房，柔软小卧室。<br/>每个角落，都有一点喜欢。'}
};
export function createRoomViews(camera,controls){
 let selected='home',transition=null;
 function select(id,animate=true){const view=ROOM_VIEWS[id];if(!view)return;selected=id;const target=new THREE.Vector3(...view.target),offset=new THREE.Vector3(...view.offset).multiplyScalar(innerWidth<760?1.3:1);
   controls.autoRotate=false;document.querySelector('#rotate').classList.remove('active');document.querySelector('#rotate').setAttribute('aria-pressed','false');
   transition={from:camera.position.clone(),fromTarget:controls.target.clone(),to:target.clone().add(offset),target,t:animate?0:1};
   document.querySelectorAll('[data-room]').forEach(b=>{b.classList.toggle('active',b.dataset.room===id);b.setAttribute('aria-pressed',String(b.dataset.room===id));});
   document.querySelector('.intro h1').innerHTML=view.title;document.querySelector('.intro p').innerHTML=view.text;document.querySelector('.room-label').innerHTML=`${view.english} <b>${view.number}</b>`;
   document.querySelector('.location').innerHTML=`<span>⌂</span> ${view.label} <i></i> ${id==='playroom'?'60 m²':id==='bedroom'?'绘本 · 云朵床 · 晚安小熊':'游戏房 ＋ 卧室'}`;
   document.querySelector('#visit-bedroom').hidden=id==='playroom';
 }
 function update(dt){if(!transition)return;transition.t=Math.min(1,transition.t+dt/1.25);const q=transition.t*transition.t*(3-2*transition.t);camera.position.lerpVectors(transition.from,transition.to,q);controls.target.lerpVectors(transition.fromTarget,transition.target,q);if(transition.t===1)transition=null;}
 controls.addEventListener('start',()=>transition=null);
 document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>select(b.dataset.room));
 select('home',false);update(0);
 return {select,update,reset:()=>select(selected),cancel:()=>transition=null};
}
