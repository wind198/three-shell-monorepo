import * as THREE from 'three';

/** Procedural storefront-facade for a pastel low-poly scene composer.
 * Default envelope: 4 × 0.3 × 3 world units (width × depth × height).
 * +Y up, +Z front. Origin is the bottom-center; floor is local Y=0.
 * Geometries are shared by this module; never dispose them per instance.
 * Dispose the per-instance materials when removing the group.
 * Usage: scene.add(createStorefrontFacade({ variant: 'cafe' }));
 */
export type StorefrontFacadeVariant = 'cafe' | 'office';
export interface StorefrontFacadeOptions {
  variant?: StorefrontFacadeVariant;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
const BOX = new THREE.BoxGeometry(1,1,1);
export function createStorefrontFacade(options: StorefrontFacadeOptions = {}): THREE.Group {
 const {variant='cafe',width:w=4,depth:d=0.3,height:h=3,primaryColor='#8FD6BE',secondaryColor='#F2E8D5'}=options;
 if(!['cafe','office'].includes(variant))throw new RangeError('Unsupported storefront-facade variant');
 if(![w,d,h].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Dimensions must be finite and positive');
 const root=new THREE.Group();root.name='StorefrontFacade-'+variant;
 root.userData.placement='floor';
 root.userData.floorY=0;
 const p=new THREE.MeshStandardMaterial({color:primaryColor,roughness:1,metalness:0});
 const s=new THREE.MeshStandardMaterial({color:secondaryColor,roughness:1,metalness:0});
 const b=(name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material):THREE.Mesh=>{
   const mesh=new THREE.Mesh(BOX,m);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
   mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 
  const jw=w*.09, top=h*.20, openingH=h-top;
  b('LeftPier',-w/2+jw/2,h/2,0,jw,h,d,s);b('RightPier',w/2-jw/2,h/2,0,jw,h,d,s);
  b('Fascia',0,h-top/2,0,w-2*jw,top,d,p);
  const doorW=w*.26, bayW=(w-2*jw-doorW)/2;
  for(const side of [-1,1]) {
    const x=side*(doorW+bayW)/2;
    b('WindowPane',x,openingH*.57,0,bayW*.83,openingH*.72,d*.24,variant==='office'?s:p);
    b('WindowSill',x,openingH*.16,d*.26,bayW*.92,h*.045,d*.24,s);
    b('WindowTop',x,openingH*.94,0,bayW*.92,h*.04,d,s);
    b('WindowJamb',side*doorW/2,openingH*.5,0,jw*.38,openingH,d,s);
  }
  b('EntranceHeader',0,openingH-h*.018,0,doorW,h*.04,d,s);
  if(variant==='cafe')b('AwningLip',0,h-top,d*.38,w*.94,h*.07,d*.20,s);
  else b('OfficeSignBand',0,h-top*.45,d*.52,w*.56,top*.32,d*.06,s);

 return root;
}
