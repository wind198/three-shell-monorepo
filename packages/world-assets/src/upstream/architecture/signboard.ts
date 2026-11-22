import * as THREE from 'three';

/** Procedural signboard for a pastel low-poly scene composer.
 * Default envelope: 1.2 × 0.12 × 0.42 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; rear wall attachment plane is local Z=-depth/2.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createSignboard({ variant: 'wall-mounted' }));
 */
export type SignboardVariant = 'wall-mounted' | 'hanging';
export interface SignboardOptions {
  variant?: SignboardVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createSignboard(options: SignboardOptions = {}): THREE.Group {
 const {variant='wall-mounted',width:w=1.2,depth:d=0.12,height:h=0.42,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['wall-mounted','hanging'].includes(variant))throw new RangeError('Unsupported signboard variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Signboard-'+variant;
 root.userData.placement='wall';
 root.userData.mountingPlaneZ=-d/2;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const plateH=h*.75;
  b('SignPlate',0,variant==='hanging'?h*.38:h*.5,d*.05,w,plateH,d*.42,p);
  if(variant==='hanging'){for(const x of [-w*.33,w*.33])b('HangingStrap',x,h*.88,-d*.25,w*.045,h*.24,d*.36,s);}
  else {for(const x of [-w*.38,w*.38])b('WallStandOff',x,h*.5,-d*.32,w*.05,plateH*.3,d*.35,s);}

 return root;
}
