import * as THREE from 'three';
import {CASTLE} from '../world/castle.js';
import {floorHeightAt} from '../world/surfaces.js';
import {route} from './navigation.js';
const smooth=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x)};
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export class Director{
  constructor(character,toys,onChange){Object.assign(this,{character,toys,onChange,time:0,elapsed:0,paused:false,current:null,state:'idle',wait:1.4,last:null,queue:null,onBeat:null,speed:0});}
  select(toy){
    if(this.state==='play'){this.queue=toy;this.onChange(`玩好手里的，就去${toy.label}…`,toy.id);return;}
    this.current=toy;this.last=toy.id;this.state='walk';this.elapsed=0;this.speed=0;this.beat=-1;
    const end=V(toy.approach[0],.23,toy.approach[1]);
    if(toy.behavior==='ball'&&toy.parts.moving)end.x=toy.position[0]+toy.parts.moving.position.x-.43;
    this.path=route(this.character.root.position,end).map(p=>V(p.x,floorHeightAt(p.x,p.z)+.005,p.z));
    if(!this.path.length){this.state='idle';this.onChange('换一条路，再去找小玩具',null);return;}
    this.onChange(`正在走向${toy.label}…`,toy.id);
  }
  restore(){
    const toy=this.current;if(!toy)return;
    if(toy.parts.page)toy.parts.page.rotation.z=0;
    toy.parts.mallets?.forEach(m=>m.visible=true);
    toy.parts.bars?.forEach(bar=>bar.position.y=.21);
    this.character.armRig?.forEach(a=>a.mallet.visible=false);
    this.character.root.position.y=floorHeightAt(this.character.root.position.x,this.character.root.position.z)+.005;
  }
  face(target,dt){const c=this.character,p=c.root.position,angle=Math.atan2(target.x-p.x,target.z-p.z);c.root.rotation.y+=Math.atan2(Math.sin(angle-c.root.rotation.y),Math.cos(angle-c.root.rotation.y))*(1-Math.exp(-dt*7));}
  world(toy,position){toy.root.updateWorldMatrix(true,false);return toy.root.localToWorld(position.clone());}
  localHold(toy,position){this.character.root.updateWorldMatrix(true,true);return toy.root.worldToLocal(this.character.root.localToWorld(position.clone()));}
  reach(index,target,weight=1){this.character.reach?.(index,target,weight);}
  update(dt){
    if(this.paused)return;dt=Math.min(dt,.05);this.time+=dt;this.elapsed+=dt;const c=this.character,p=c.root.position;
    if(this.state==='idle'){
      c.pose('idle',this.time,dt);
      if(this.elapsed>this.wait){const pool=this.toys.filter(t=>t.id!==this.last);const toy=this.queue??pool[Math.floor(Math.random()*pool.length)];this.queue=null;this.select(toy);}return;
    }
    if(this.state==='walk'){
      const target=this.path[0],delta=target.clone().sub(p);delta.y=0;const distance=delta.length();
      const angle=Math.atan2(delta.x,delta.z),turn=Math.atan2(Math.sin(angle-c.root.rotation.y),Math.cos(angle-c.root.rotation.y));
      if(distance>.025&&Math.abs(turn)>.45){this.speed=0;this.face(target,dt);c.pose('idle',this.time,dt);return;}
      if(distance<.025){p.copy(target);this.path.shift();if(!this.path.length){this.state='play';this.elapsed=0;this.start=p.clone();this.propStart=this.current.parts.moving?.position.clone();this.propRotation=this.current.parts.moving?.quaternion.clone();this.ballVelocity=0;this.onChange(this.current.status,this.current.id);}}
      else{const maxSpeed=Math.min(.65,Math.sqrt(2*.8*distance)+(this.path.length>1?.25:0));this.speed=THREE.MathUtils.damp(this.speed,maxSpeed,5,dt);p.addScaledVector(delta.normalize(),Math.min(distance,dt*this.speed));this.face(target,dt);}
      p.y=floorHeightAt(p.x,p.z)+.005;
      c.pose('walk',this.time,dt);return;
    }
    const toy=this.current,b=toy.behavior,t=this.elapsed,parts=toy.parts;
    this.face(V(toy.position[0],.23,toy.position[1]),dt);
    if(b!=='climb')c.pose(t<.45?'idle':b,this.time,dt);
    const contact=smooth((t-.45)/.75),release=smooth((t-(toy.duration-1.8))/1.3);
    if(b==='read'||b==='hug'){
      const held=this.localHold(toy,b==='read'?V(0,.29,.31):V(0,.30,.27));
      const lift=smooth((t-.8)/1.4)*(1-release);
      parts.moving.position.lerpVectors(this.propStart,held,lift);
      // The actual scene prop is lifted and returned; no duplicate appears in the hands.
      const desired=c.root.quaternion.clone().premultiply(toy.root.quaternion.clone().invert());
      parts.moving.quaternion.slerpQuaternions(this.propRotation,desired,lift);
      if(b==='read'&&parts.page)parts.page.rotation.z=-Math.PI*smooth((t%3.4-1.5)/1.1)*(1-release);
      parts.moving.updateWorldMatrix(true,true);
      for(let i=0;i<2;i++){const offset=b==='read'?V(i===0?-.24:.24,.07,0):V(i===0?-.20:.20,.4,.08);this.reach(i,parts.moving.localToWorld(offset),contact*(1-release));}
    }
    if(b==='stack'){
      const held=this.localHold(toy,V(.05,.59,.27)),top=V(0,.64,0);
      if(t<3)parts.moving.position.lerpVectors(this.propStart,held,smooth((t-1)/2));
      else if(t<6){parts.moving.position.lerpVectors(held,top,smooth((t-3)/3));parts.moving.position.y+=Math.sin(smooth((t-3)/3)*Math.PI)*.13;}
      else parts.moving.position.copy(top);
      parts.moving.rotation.y=THREE.MathUtils.damp(parts.moving.rotation.y,0,6,dt);
      if(t<6.4)for(let i=0;i<2;i++)this.reach(i,this.world(toy,parts.moving.position.clone().add(V(i===0?-.105:.105,0,0))),contact*(1-smooth((t-6)/.4)));
    }
    if(b==='music'){
      parts.mallets?.forEach(m=>m.visible=false);
      const beat=Math.floor(Math.max(0,t-1)*2.8),phase=(Math.max(0,t-1)*2.8)%1,note=[1,4,2,5,2,4][beat%6],strike=Math.pow(Math.abs(phase-.5)*2,1.4)*.10,active=note<3?0:note>3?1:beat%2;
      parts.bars?.forEach((bar,i)=>bar.position.y=.21-(i===note&&phase>.46&&phase<.60?.008:0));
      for(let i=0;i<2;i++){const x=(i===active?-.45+note*.15:(i===0?-.18:.18));this.reach(i,this.world(toy,V(x,.31+(i===active?strike:.10),-.20)),contact*(1-release));c.aimMallet?.(i,this.world(toy,V(x,.255+ (i===active?strike:.10),0)));}
      if(t>1&&phase>=.5&&this.beat!==beat){this.beat=beat;this.onBeat?.(note);}
    }
    if(b==='ball'){
      const cycle=Math.floor(Math.max(0,t-1)/2.4);
      if(t>1&&this.beat!==cycle){this.beat=cycle;this.ballVelocity=.42;}
      const previous=parts.moving.position.x;this.ballVelocity*=Math.exp(-dt*1.6);parts.moving.position.x+=this.ballVelocity*dt;
      if(toy.position[0]+parts.moving.position.x>4.16){parts.moving.position.x=4.16-toy.position[0];this.ballVelocity=-Math.abs(this.ballVelocity)*.3;}
      parts.moving.rotation.z-=(parts.moving.position.x-previous)/.29;
      p.x=THREE.MathUtils.damp(p.x,toy.position[0]+parts.moving.position.x-.43,4,dt);
      const target=this.world(toy,parts.moving.position.clone().add(V(-.27,.06,0)));this.face(this.world(toy,parts.moving.position),dt);this.reach(1,target,contact*(1-release));
    }
    if(b==='climb')this.climb(toy,t,dt);
    if(t>toy.duration){this.restore();this.state='idle';this.elapsed=0;this.wait=.9;this.onChange('看看，还有什么好玩的呢？',null);}
  }
  climb(toy,t,dt){
    const c=this.character,p=c.root.position;
    const origin=this.world(toy,CASTLE.ladder.bottom.clone().setY(0)),top=this.world(toy,CASTLE.ladder.top),slideTop=V(toy.position[0]+.57,toy.root.position.y+CASTLE.deckHeight,toy.position[1]+.53),bottom=V(toy.position[0]+.57,.23,toy.position[1]+2.98);
    if(t<2){p.lerpVectors(this.start,origin,smooth(t/2));this.face(top,dt);c.pose('walk',this.time,dt);}
    else if(t<6){const q=(t-2)/4;const steps=CASTLE.ladder.steps,step=Math.floor(q*steps),phase=smooth(q*steps-step);p.lerpVectors(origin,top,(step+phase)/steps);this.face(V(p.x,p.y,p.z-1),dt);c.pose('climb',this.time,dt);}
    else if(t<8){p.lerpVectors(top,slideTop,smooth((t-6)/2));this.face(V(p.x+1,p.y,p.z),dt);c.pose('walk',this.time,dt);}
    else if(t<11){const q=THREE.MathUtils.clamp((t-8)/3,0,1),travel=q*q*(2-q);p.lerpVectors(slideTop,bottom,travel);this.face(V(p.x,p.y,p.z+1),dt);c.pose('slide',this.time,dt);}
    else{p.copy(bottom);c.pose('idle',this.time,dt);}
  }
}
