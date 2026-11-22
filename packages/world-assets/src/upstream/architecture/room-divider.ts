import * as THREE from 'three';

/** Procedural room-divider for a pastel low-poly scene composer.
 * Default envelope: 1.8 × 0.3 × 2.1 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createRoomDivider({ variant: 'solid' }));
 */
export type RoomDividerVariant = 'solid' | 'open-shelf';
export interface RoomDividerOptions {
  variant?: RoomDividerVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createRoomDivider(options: RoomDividerOptions = {}): THREE.Group {
 const {variant='solid',width:w=1.8,depth:d=0.3,height:h=2.1,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['solid','open-shelf'].includes(variant))throw new RangeError('Unsupported room-divider variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='RoomDivider-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  if(variant==='solid'){b('DividerPanel',0,h/2,0,w,h,d*.65,p);b('LowerTrim',0,h*.065,d*.38,w,h*.13,d*.20,s);}
  else {const t=Math.min(w*.065,d*.30);for(const x of [-w/2+t/2,w/2-t/2]) b('ShelfUpright',x,h/2,0,t,h,d,p);for(let i=0;i<5;i++)b('OpenShelf',0,t/2+i*(h-t)/4,0,w-t,t,d,s);}

 return root;
}
