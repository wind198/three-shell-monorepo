import * as THREE from 'three';

/** Procedural wall-segment for a pastel low-poly scene composer.
 * Default envelope: 2 × 0.15 × 2.7 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createWallSegment({ variant: 'full' }));
 */
export type WallSegmentVariant = 'full' | 'half-height';
export interface WallSegmentOptions {
  variant?: WallSegmentVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createWallSegment(options: WallSegmentOptions = {}): THREE.Group {
 const {variant='full',width:w=2,depth:d=0.15,height:h=2.7,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['full','half-height'].includes(variant))throw new RangeError('Unsupported wall-segment variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='WallSegment-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const H=variant==='full'?h:h*.5;
  b('WallBody',0,H/2,0,w,H,d,p);
  b('WallCapping',0,H-h*.018,0,w,h*.036,d,s);

 return root;
}
