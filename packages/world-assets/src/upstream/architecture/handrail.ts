import * as THREE from 'three';

/** Procedural handrail for a pastel low-poly scene composer.
 * Default envelope: 1.8 × 0.12 × 0.15 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; rear wall attachment plane is local Z=-depth/2.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createHandrail({ variant: 'straight' }));
 */
export type HandrailVariant = 'straight' | 'corner';
export interface HandrailOptions {
  variant?: HandrailVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createHandrail(options: HandrailOptions = {}): THREE.Group {
 const {variant='straight',width:w=1.8,depth:d=0.12,height:h=0.15,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['straight','corner'].includes(variant))throw new RangeError('Unsupported handrail variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Handrail-'+variant;
 root.userData.placement='wall';
 root.userData.mountingPlaneZ=-d/2;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  b('Grip',0,h*.72,d*.20,w,h*.30,d*.35,p);
  for(const x of [-w*.39,w*.39]) b('WallMount',x,h*.40,-d*.23,w*.07,h*.55,d*.55,s);
  if(variant==='corner') b('ReturnGrip',w*.46,h*.72,-d*.10,w*.08,h*.30,d*.75,p);

 return root;
}
