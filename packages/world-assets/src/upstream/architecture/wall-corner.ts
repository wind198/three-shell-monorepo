import * as THREE from 'three';

/** Procedural wall-corner for a pastel low-poly scene composer.
 * Default envelope: 1 × 1 × 2.7 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createWallCorner({ variant: 'inner' }));
 */
export type WallCornerVariant = 'inner' | 'outer';
export interface WallCornerOptions {
  variant?: WallCornerVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createWallCorner(options: WallCornerOptions = {}): THREE.Group {
 const {variant='inner',width:w=1,depth:d=1,height:h=2.7,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['inner','outer'].includes(variant))throw new RangeError('Unsupported wall-corner variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='WallCorner-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const thick=Math.min(w,d)*.14;
  b('WallX',0,h/2,variant==='inner'?-d/2+thick/2:d/2-thick/2,w,h,thick,p);
  b('WallZ',variant==='inner'?-w/2+thick/2:w/2-thick/2,h/2,0,thick,h,d,s);

 return root;
}
