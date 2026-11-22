import * as THREE from 'three';

/** Procedural window for a pastel low-poly scene composer.
 * Default envelope: 1.2 × 0.15 × 1.2 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; rear wall attachment plane is local Z=-depth/2.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createWindow({ variant: 'square' }));
 */
export type WindowVariant = 'square' | 'tall' | 'wide';
export interface WindowOptions {
  variant?: WindowVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createWindow(options: WindowOptions = {}): THREE.Group {
 const {variant='square',width:w=1.2,depth:d=0.15,height:h=1.2,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['square','tall','wide'].includes(variant))throw new RangeError('Unsupported window variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Window-'+variant;
 root.userData.placement='wall';
 root.userData.mountingPlaneZ=-d/2;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const rail=Math.min(w,h)*.075;
  b('TintedGlass',0,h/2,-d*.13,w-2*rail,h-2*rail,d*.40,p);
  for(const x of [-w/2+rail/2,w/2-rail/2])b('FrameSide',x,h/2,0,rail,h,d,s);
  for(const y of [rail/2,h-rail/2])b('FrameHorizontal',0,y,0,w-2*rail,rail,d,s);
  b('WindowSill',0,rail*.5,d*.27,w,rail,d*.45,s);
  if(variant==='wide')b('CenterMullion',0,h/2,d*.02,rail*.8,h-2*rail,d*.76,s);
  if(variant==='tall')b('Crossbar',0,h*.48,d*.04,w-2*rail,rail*.72,d*.72,s);

 return root;
}
