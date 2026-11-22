import * as THREE from 'three';

/** Procedural baseboard for a pastel low-poly scene composer.
 * Default envelope: 2 × 0.06 × 0.12 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; rear wall attachment plane is local Z=-depth/2.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createBaseboard({ variant: 'straight' }));
 */
export type BaseboardVariant = 'straight' | 'corner';
export interface BaseboardOptions {
  variant?: BaseboardVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createBaseboard(options: BaseboardOptions = {}): THREE.Group {
 const {variant='straight',width:w=2,depth:d=0.06,height:h=0.12,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['straight','corner'].includes(variant))throw new RangeError('Unsupported baseboard variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Baseboard-'+variant;
 root.userData.placement='wall';
 root.userData.mountingPlaneZ=-d/2;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  if(variant==='straight') b('Skirting',0,h/2,0,w,h,d,p);
  else {b('LongSkirting',-w*.25,h/2,-d*.25,w*.5,h,d,p);b('ReturnSkirting',0,h/2,0,d,h,d,s);}

 return root;
}
