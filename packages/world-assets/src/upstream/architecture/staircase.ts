import * as THREE from 'three';

/** Procedural staircase for a pastel low-poly scene composer.
 * Default envelope: 1.4 × 3 × 1.6 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createStaircase({ variant: 'straight' }));
 */
export type StaircaseVariant = 'straight' | 'L-shaped';
export interface StaircaseOptions {
  variant?: StaircaseVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createStaircase(options: StaircaseOptions = {}): THREE.Group {
 const {variant='straight',width:w=1.4,depth:d=3,height:h=1.6,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['straight','L-shaped'].includes(variant))throw new RangeError('Unsupported staircase variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Staircase-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const n=7, stepH=h/n, stepD=d/n;
  if(variant==='straight') {
    for(let i=0;i<n;i++)b('Step-'+(i+1),0,stepH*(i+1)/2,-d/2+stepD*(i+.5),w,stepH*(i+1),stepD,p);
  }else{
    for(let i=0;i<4;i++)b('LowerStep-'+i,-w*.28,stepH*(i+1)/2,-d/2+stepD*(i+.5),w*.44,stepH*(i+1),stepD,s);
    b('Landing',0,h*.57,0,w,h*.14,d*.34,p);
    for(let i=0;i<3;i++)b('UpperStep-'+i,-w/2+w*(i+.5)/3,stepH*(i+5)/2,d*.33,w/3,stepH*(i+5),d*.34,p);
  }

 return root;
}
