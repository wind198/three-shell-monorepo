import * as THREE from 'three';

/** Procedural glass-partition for a pastel low-poly scene composer.
 * Default envelope: 1.5 × 0.1 × 2.5 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createGlassPartition({ variant: 'full' }));
 */
export type GlassPartitionVariant = 'full' | 'half-height';
export interface GlassPartitionOptions {
  variant?: GlassPartitionVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createGlassPartition(options: GlassPartitionOptions = {}): THREE.Group {
 const {variant='full',width:w=1.5,depth:d=0.1,height:h=2.5,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['full','half-height'].includes(variant))throw new RangeError('Unsupported glass-partition variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='GlassPartition-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const H=variant==='half-height'?h*.55:h, rail=w*.045;
  b('TintedPane',0,H/2,0,w-2*rail,H-rail*2,d*.36,p);
  for(const x of [-w/2+rail/2,w/2-rail/2]) b('SideStile',x,H/2,0,rail,H,d,s);
  b('TopRail',0,H-rail/2,0,w,rail,d,s);b('BottomRail',0,rail/2,0,w,rail,d,s);

 return root;
}
