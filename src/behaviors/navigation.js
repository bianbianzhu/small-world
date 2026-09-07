import {BATH_DOOR} from '../world/surfaces.js';
// Clearance accounts for the child's body, castle, slide, and fixed furniture.
export const obstacles=[{x1:.80,x2:3.78,z1:-3.6,z2:-.72},{x1:2.35,x2:3.37,z1:-.8,z2:.86},
{x1:5.75,x2:7.6,z1:-4.2,z2:-2.50},
{x1:8.68,x2:11.33,z1:-3.50,z2:.37},
{x1:7.75,x2:8.95,z1:-3.42,z2:-2.10},
{x1:5.70,x2:7.38,z1:-1.50,z2:.80},
{x1:10.25,x2:11.70,z1:1.98,z2:3.65},
// Bathroom: tub with curtain, vanity and step stool, toilet, potty, open shelf, hamper, plant, towel ladder.
{x1:11.95,x2:14.25,z1:-4.4,z2:-2.85},{x1:14.55,x2:16.7,z1:-4.4,z2:-2.55},{x1:15.45,x2:16.7,z1:-2.15,z2:-.85},{x1:15.1,x2:15.7,z1:-.9,z2:-.3},
{x1:15.55,x2:16.7,z1:.55,z2:2.25},{x1:15.75,x2:16.7,z1:3.0,z2:4.0},{x1:11.85,x2:12.7,z1:3.15,z2:4.0},{x1:11.85,x2:12.42,z1:-.95,z2:.15}];
export function blocked(x,z){return (x>4.35&&x<5.60&&(z<1.2||z>2.2))||(x>BATH_DOOR.x-.2&&x<BATH_DOOR.x+.2&&Math.abs(z-BATH_DOOR.z)>BATH_DOOR.halfWidth-.05)||obstacles.some(r=>x>r.x1&&x<r.x2&&z>r.z1&&z<r.z2)}
export function route(start,end){
  const step=.18,minX=-3.7,minZ=-3.5,maxX=16.4,maxZ=3.65;
  const cell=p=>[Math.round((p.x-minX)/step),Math.round((p.z-minZ)/step)];
  const world=([x,z])=>({x:minX+x*step,z:minZ+z*step});
  const key=p=>p.join(',');const from=cell(start),to=cell(end),open=[from],cost=new Map([[key(from),0]]),parent=new Map();let found=false;
  while(open.length){open.sort((a,b)=>cost.get(key(a))+Math.hypot(a[0]-to[0],a[1]-to[1])-cost.get(key(b))-Math.hypot(b[0]-to[0],b[1]-to[1]));const current=open.shift(),k=key(current);if(k===key(to)){found=true;break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const n=[current[0]+dx,current[1]+dz],p=world(n),nk=key(n);if(p.x<minX||p.x>maxX||p.z<minZ||p.z>maxZ||blocked(p.x,p.z))continue;
      const a=world([current[0]+dx,current[1]]),b=world([current[0],current[1]+dz]);if(blocked(a.x,a.z)||blocked(b.x,b.z))continue;
      const c=cost.get(k)+Math.hypot(dx,dz);if(c<(cost.get(nk)??Infinity)){cost.set(nk,c);parent.set(nk,current);if(!open.some(v=>key(v)===nk))open.push(n);}}
  }
  if(!found)return [];
  const path=[to];while(key(path[0])!==key(from))path.unshift(parent.get(key(path[0])));
  // Retain only turning points; collinear grid steps do not cause gait hesitation.
  const compact=path.filter((p,i)=>!i||i===path.length-1||(p[0]-path[i-1][0]!==path[i+1][0]-p[0]||p[1]-path[i-1][1]!==path[i+1][1]-p[1]));
  return [...compact.slice(1).map(world),{x:end.x,z:end.z}];
}
