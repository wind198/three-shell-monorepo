import * as THREE from 'three';

/** Procedural railing for a pastel low-poly scene composer.
 * Default envelope: 1.8 × 0.12 × 1 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createRailing({ variant: 'wood' }));
 */
export type RailingVariant = 'wood' | 'metal';
export interface RailingOptions {
  variant?: RailingVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createRailing(options: RailingOptions = {}): THREE.Group {
 const {variant='wood',width:w=1.8,depth:d=0.12,height:h=1,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['wood','metal'].includes(variant))throw new RangeError('Unsupported railing variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Railing-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const t=Math.min(w*.065,d*.85);
  for(const x of [-w/2+t/2,w/2-t/2]) b('EndPost',x,h/2,0,t,h,d,p);
  b('TopRail',0,h-t/2,0,w,t,d,p);
  const count=variant==='wood'?5:8;
  for(let i=1;i<=count;i++) b('Baluster',-w/2+(w*i)/(count+1),h*.47,0,t*.48,h*.78,d*.52,s);

 return root;
}
