import * as THREE from 'three';

/** Procedural awning for a pastel low-poly scene composer.
 * Default envelope: 1.6 × 0.95 × 0.3 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; rear wall attachment plane is local Z=-depth/2.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createAwning({ variant: 'flat' }));
 */
export type AwningVariant = 'flat' | 'sloped';
export interface AwningOptions {
  variant?: AwningVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createAwning(options: AwningOptions = {}): THREE.Group {
 const {variant='flat',width:w=1.6,depth:d=0.95,height:h=0.3,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['flat','sloped'].includes(variant))throw new RangeError('Unsupported awning variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='Awning-'+variant;
 root.userData.placement='wall';
 root.userData.mountingPlaneZ=-d/2;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  b('Canopy',0,h*.65,0,w,d*.82,h*.26,p);
  if(variant==='sloped') { const canopy=root.getObjectByName('Canopy')!; canopy.rotation.x=-0.12; }
  for(const x of [-w*.38,w*.38]){b('WallBracket',x,h*.27,-d*.42,w*.065,h*.52,d*.10,s);b('Brace',x,h*.35,-d*.23,w*.065,h*.075,d*.45,s);}

 return root;
}
