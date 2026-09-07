export const BEDROOM={x:8.55,width:6.6,depth:8.7};
export const BATHROOM={x:14.25,width:4.8,depth:8.7};
export const DOOR={x:5.25,z:1.7,halfWidth:1.1,rampStart:4.60,rampEnd:5.12};
// Opening in the bedroom's low outer wall; the two wooden floors meet at the same height.
export const BATH_DOOR={x:11.8,z:1.15,halfWidth:.6};
// Fluffy bath mat in front of the tub, thick enough to count as a walking surface.
export const BATH_MAT={x:13.05,z:-2.4,halfWidth:.62,halfDepth:.5,height:.085};
export function floorHeightAt(x,z){
  if(x>=DOOR.rampStart&&x<=DOOR.rampEnd&&Math.abs(z-DOOR.z)<=.8)return .225-(x-DOOR.rampStart)/(DOOR.rampEnd-DOOR.rampStart)*.175;
  if(x>BATH_DOOR.x){if(Math.abs(x-BATH_MAT.x)<BATH_MAT.halfWidth&&Math.abs(z-BATH_MAT.z)<BATH_MAT.halfDepth)return BATH_MAT.height;return .05;}
  if(x>5.12){if(((x-8.55)/1.55)**2+((z-1.65)/1.3)**2<1)return .08;return .05;}
  if(Math.hypot(x+2.95,z-.2)<.74)return .27;
  if(x>=-4.4&&x<=4.60&&z>=-3.1&&z<=3.5)return .225;
  return .05;
}
