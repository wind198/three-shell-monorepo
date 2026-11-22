import * as THREE from 'three';

/** Procedural platform for a pastel low-poly scene composer.
 * Default envelope: 2 × 2 × 0.25 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createPlatform({ variant: 'square' }));
 */
export type PlatformVariant = 'square' | 'rectangular';
export interface PlatformOptions {
  variant?: PlatformVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createPlatform(options: PlatformOptions = {}): THREE.Group {
 const {variant='square',width:w=2,depth:d=2,height:h=0.25,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['square','rectangular'].includes(variant))throw new RangeError('Unsupported platform variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Platform-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  b('Foundation',0,h*.43,0,w,h*.86,d,s);
  b('Deck',0,h*.93,0,w,h*.14,d,p);
  if(variant==='rectangular') b('DeckDivision',0,h*.995,0,w*.02,h*.01,d*.94,s);

 return root;
}
