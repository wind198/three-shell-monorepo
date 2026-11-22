import * as THREE from 'three';

/** Procedural ceiling-panel for a pastel low-poly scene composer.
 * Default envelope: 2 × 2 × 0.12 world units (width × depth × height).
 * +Y up, +Z front. Origin is the top-center attachment point; geometry extends toward -Y.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createCeilingPanel({ variant: 'plain' }));
 */
export type CeilingPanelVariant = 'plain' | 'beam';
export interface CeilingPanelOptions {
  variant?: CeilingPanelVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createCeilingPanel(options: CeilingPanelOptions = {}): THREE.Group {
 const {variant='plain',width:w=2,depth:d=2,height:h=0.12,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['plain','beam'].includes(variant))throw new RangeError('Unsupported ceiling-panel variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='CeilingPanel-'+variant;
 root.userData.placement='ceiling';
 root.userData.attachmentY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  b('CeilingSlab',0,-h*.35,0,w,h*.7,d,p);
  if(variant==='beam') b('InlaidBeam',0,-h*.85,0,w,h*.3,d*.13,s);

 return root;
}
