import * as THREE from 'three';

/** Procedural roof-segment for a pastel low-poly scene composer.
 * Default envelope: 2.5 × 2 × 0.4 world units (width × depth × height).
 * +Y up, +Z front. Origin is the top-center attachment point; geometry extends toward -Y.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createRoofSegment({ variant: 'flat' }));
 */
export type RoofSegmentVariant = 'flat' | 'sloped';
export interface RoofSegmentOptions {
  variant?: RoofSegmentVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createRoofSegment(options: RoofSegmentOptions = {}): THREE.Group {
 const {variant='flat',width:w=2.5,depth:d=2,height:h=0.4,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['flat','sloped'].includes(variant))throw new RangeError('Unsupported roof-segment variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='RoofSegment-'+variant;
 root.userData.placement='ceiling';
 root.userData.attachmentY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  if(variant==='flat') b('FlatRoof',0,-h*.5,0,w,h,d,p);
  else {for(const x of [-w*.245,w*.245]){const r=b('RoofPitch',x,-h*.48,0,w*.55,h*.18,d,p);r.rotation.z=x<0?-.50:.50;}b('RidgeCap',0,-h*.14,0,w*.08,h*.15,d,s);}

 return root;
}
