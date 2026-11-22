import * as THREE from 'three';

/** Procedural door-frame for a pastel low-poly scene composer.
 * Default envelope: 1.05 × 0.18 × 2.2 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; rear wall attachment plane is local Z=-depth/2.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createDoorFrame({ variant: 'wood' }));
 */
export type DoorFrameVariant = 'wood' | 'metal';
export interface DoorFrameOptions {
  variant?: DoorFrameVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createDoorFrame(options: DoorFrameOptions = {}): THREE.Group {
 const {variant='wood',width:w=1.05,depth:d=0.18,height:h=2.2,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['wood','metal'].includes(variant))throw new RangeError('Unsupported door-frame variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='DoorFrame-'+variant;
 root.userData.placement='wall';
 root.userData.mountingPlaneZ=-d/2;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const j=w*.075, t=h*.065;
  b('LeftJamb',-w/2+j/2,h/2,0,j,h,d,p);b('RightJamb',w/2-j/2,h/2,0,j,h,d,p);
  b('Lintel',0,h-t/2,0,w-2*j,t,d,p);
  if(variant==='wood') b('WoodHeaderTrim',0,h-t*.25,d*.42,w-2*j,t*.34,d*.15,s);
  else {b('MetalLeftInset',-w/2+j*.8,h*.5,d*.40,j*.15,h*.85,d*.12,s);b('MetalRightInset',w/2-j*.8,h*.5,d*.40,j*.15,h*.85,d*.12,s);}

 return root;
}
