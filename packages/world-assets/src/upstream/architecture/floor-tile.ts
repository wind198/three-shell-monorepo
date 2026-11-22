import * as THREE from 'three';

/** Procedural floor-tile for a pastel low-poly scene composer.
 * Default envelope: 1 × 1 × 0.08 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createFloorTile({ variant: 'square' }));
 */
export type FloorTileVariant = 'square' | 'rectangular';
export interface FloorTileOptions {
  variant?: FloorTileVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createFloorTile(options: FloorTileOptions = {}): THREE.Group {
 const {variant='square',width:w=1,depth:d=1,height:h=0.08,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['square','rectangular'].includes(variant))throw new RangeError('Unsupported floor-tile variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='FloorTile-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  b('TileBase',0,h*.44,0,w,h*.88,d,s);
  b('TileSurface',0,h*.94,0,w*.98,h*.12,d*.98,p);
  if(variant==='rectangular') b('LongGroutInset',0,h*.997,0,w*.025,h*.006,d*.93,s);

 return root;
}
