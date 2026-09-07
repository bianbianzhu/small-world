import * as THREE from 'three';
import {floorHeightAt} from '../world/surfaces.js';
import {route,blocked} from './navigation.js';
import {PUPPY} from '../character/Puppy.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const BOUNDS={minX:-3.55,maxX:11.3,minZ:-3.35,maxZ:3.5};
// The puppy roams both rooms on the same A* grid as Yueyue, pauses to sniff or sit,
// and now and then trots over to greet her. `friend` is Yueyue's root; `toys` are kept clear
// so it never settles on top of a play mat, book pile or the xylophone.
export class Wander{
  constructor(puppy,{friend=null,toys=[],onChange=()=>{}}={}){Object.assign(this,{puppy,friend,toys,onChange,time:0,elapsed:0,paused:false,state:'idle',act:'idle',wait:1.2,path:[],speed:0,pending:null});}
  spot(){
    const p=this.puppy.root.position,f=this.friend?.position;
    for(let i=0;i<40;i++){
      const near=f&&Math.random()<.3;
      const x=near?f.x+(Math.random()-.5)*2.6:THREE.MathUtils.lerp(BOUNDS.minX,BOUNDS.maxX,Math.random()),z=near?f.z+(Math.random()-.5)*2.6:THREE.MathUtils.lerp(BOUNDS.minZ,BOUNDS.maxZ,Math.random());
      if(!this.open(x,z)||Math.hypot(x-p.x,z-p.z)<1.2||(f&&Math.hypot(x-f.x,z-f.z)<.75))continue;
      return {x,z};
    }
    return null;
  }
  open(x,z){return x>=BOUNDS.minX&&x<=BOUNDS.maxX&&z>=BOUNDS.minZ&&z<=BOUNDS.maxZ&&!blocked(x,z)&&!this.toys.some(t=>Math.hypot(x-t.position[0],z-t.position[1])<.95);}
  go(end,act=null){
    this.path=route(this.puppy.root.position,end).map(q=>V(q.x,floorHeightAt(q.x,q.z)+.005,q.z));
    if(!this.path.length)return false;
    this.state='run';this.elapsed=0;this.speed=0;this.pending=act;this.onChange('run');return true;
  }
  // Called when the puppy is clicked or picks Yueyue at random: run to a spot beside her,
  // off to one side so the toy she is facing stays clear.
  come(){
    const f=this.friend;if(!f)return false;
    for(const turn of [.9,-.9,1.6,-1.6,0,Math.PI]){const a=f.rotation.y+turn,x=f.position.x+Math.sin(a)*.7,z=f.position.z+Math.cos(a)*.7;if(!this.open(x,z))continue;if(this.go({x,z},'greet'))return true;}
    return false;
  }
  next(){
    if(this.friend&&Math.random()<.22&&this.come())return;
    for(let i=0;i<6;i++){const s=this.spot();if(s&&this.go(s))return;}
    this.elapsed=0;this.wait=1;
  }
  arrive(){
    const act=this.pending??(Math.random()<.45?'sniff':Math.random()<.5?'sit':'idle');this.pending=null;
    this.state='idle';this.act=act;this.elapsed=0;
    this.wait=act==='idle'?.8+Math.random()*1.4:act==='sniff'?1.8+Math.random()*1.8:act==='greet'?2.5+Math.random()*1.5:3+Math.random()*3;
    this.onChange(act);
  }
  face(target,dt,rate=10){const r=this.puppy.root,p=r.position,angle=Math.atan2(target.x-p.x,target.z-p.z);r.rotation.y+=Math.atan2(Math.sin(angle-r.rotation.y),Math.cos(angle-r.rotation.y))*(1-Math.exp(-dt*rate));}
  update(dt){
    if(this.paused)return;dt=Math.min(dt,.05);this.time+=dt;this.elapsed+=dt;const d=this.puppy,p=d.root.position;
    if(this.state==='idle'){
      if(this.act==='greet'&&this.friend)this.face(this.friend.position,dt,6);
      d.pose(this.act,this.time,dt);
      if(this.elapsed>this.wait)this.next();
      return;
    }
    const target=this.path[0],delta=target.clone().sub(p);delta.y=0;const distance=delta.length();
    if(distance<.03){p.copy(target);this.path.shift();if(!this.path.length)this.arrive();}
    else{
      // Quick to start, eases into each stop; corners are taken at a canter rather than a halt.
      const maxSpeed=Math.min(PUPPY.speed,Math.sqrt(2*1.6*distance)+(this.path.length>1?.45:0));
      this.speed=THREE.MathUtils.damp(this.speed,maxSpeed,6,dt);p.addScaledVector(delta.normalize(),Math.min(distance,dt*this.speed));this.face(target,dt);
    }
    p.y=floorHeightAt(p.x,p.z)+.005;
    d.pose(this.speed>.08?'trot':'idle',this.time,dt);
  }
}
