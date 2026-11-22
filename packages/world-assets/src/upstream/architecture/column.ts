import * as THREE from 'three';

/** Procedural column for a pastel low-poly scene composer.
 * Default envelope: 0.4 × 0.4 × 2.7 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createColumn({ variant: 'square' }));
 */
export type ColumnVariant = 'square' | 'round';
export interface ColumnOptions {
  variant?: ColumnVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
const CYLINDER = new THREE.CylinderGeometry(1,1,1,8);
export function createColumn(options: ColumnOptions = {}): THREE.Group {
 const {variant='square',width:w=0.4,depth:d=0.4,height:h=2.7,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['square','round'].includes(variant))throw new RangeError('Unsupported column variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Column-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 const cy=(name:string,x:number,y:number,z:number,r:number,height:number,m:THREE.Material,segments=8):THREE.Mesh=>{
   const mesh=new THREE.Mesh(segments===8?CYLINDER:new THREE.CylinderGeometry(1,1,1,segments),m);
   mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(r,height,r);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  b('Foot',0,h*.035,0,w,h*.07,d,s);
  if(variant==='square') b('SquareShaft',0,h*.5,0,w*.72,h*.86,d*.72,p);
  else cy('OctagonalShaft',0,h*.5,0,Math.min(w,d)*.37,h*.86,p,8);
  b('Capital',0,h*.965,0,w,h*.07,d,s);

 return root;
}
