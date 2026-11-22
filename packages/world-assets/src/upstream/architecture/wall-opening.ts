import * as THREE from 'three';

/** Procedural wall-opening for a pastel low-poly scene composer.
 * Default envelope: 2 × 0.15 × 2.7 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createWallOpening({ variant: 'window' }));
 */
export type WallOpeningVariant = 'window' | 'door';
export interface WallOpeningOptions {
  variant?: WallOpeningVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createWallOpening(options: WallOpeningOptions = {}): THREE.Group {
 const {variant='window',width:w=2,depth:d=0.15,height:h=2.7,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['window','door'].includes(variant))throw new RangeError('Unsupported wall-opening variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='WallOpening-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const ow=variant==='door'?w*.52:w*.62;
  const oh=variant==='door'?h*.79:h*.47;
  const sill=variant==='door'?0:h*.28;
  const side=(w-ow)/2;
  for(const x of [-w/2+side/2,w/2-side/2])b('SidePier',x,h/2,0,side,h,d,p);
  b('OpeningHeader',0,sill+oh+(h-sill-oh)/2,0,ow,h-sill-oh,d,p);
  if(sill>0)b('OpeningSill',0,sill/2,0,ow,sill,d,s);

 return root;
}
