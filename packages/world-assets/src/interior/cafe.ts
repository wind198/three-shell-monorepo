import * as THREE from 'three';

/** Reusable, roofless-friendly low-poly coffee furniture. +Y up, local origin on floor. */
const CUBE = new THREE.BoxGeometry(1,1,1);
const ROUND = new THREE.CylinderGeometry(1,1,1,12);
const LEAF = new THREE.IcosahedronGeometry(.32,0);
const matte = (color:THREE.ColorRepresentation) => new THREE.MeshStandardMaterial({color,roughness:1,metalness:0});
function block(root:THREE.Group, name:string, xyz:readonly [number,number,number], size:readonly [number,number,number], material:THREE.Material) {
 const mesh=new THREE.Mesh(CUBE,material);
 mesh.name=name;mesh.position.set(...xyz);mesh.scale.set(...size);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
 return mesh;
}
function cylinder(root:THREE.Group,name:string,xyz:readonly [number,number,number],radius:number,height:number,material:THREE.Material) {
 const mesh=new THREE.Mesh(ROUND,material);
 mesh.name=name;mesh.position.set(...xyz);mesh.scale.set(radius,height,radius);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
 return mesh;
}
export function createCafeChair(color:THREE.ColorRepresentation='#8FD6BE'):THREE.Group {
 const root=new THREE.Group();root.name='CafeChair';
 const seat=matte(color),legs=matte('#9B744E');
 block(root,'Seat',[0,.49,0],[.58,.12,.55],seat);
 block(root,'Backrest',[0,.88,-.24],[.58,.75,.10],seat);
 for(const x of [-.22,.22])for(const z of [-.2,.2])block(root,'ChairLeg',[x,.23,z],[.07,.45,.07],legs);
 return root;
}
export function createCafeTable():THREE.Group {
 const root=new THREE.Group();root.name='CafeTable';
 const top=matte('#D9A86C'),base=matte('#6B8178');
 cylinder(root,'RoundTop',[0,.76,0],.72,.12,top);
 cylinder(root,'Pedestal',[0,.38,0],.10,.69,base);
 cylinder(root,'Foot',[0,.07,0],.35,.12,base);
 return root;
}
export function createCafeCounter(length=3.2):THREE.Group {
 if(!Number.isFinite(length)||length<=0)throw new RangeError('Counter length must be positive');
 const root=new THREE.Group();root.name='ServiceCounter';
 const wood=matte('#D9A86C'),front=matte('#8FD6BE'),dark=matte('#6C8178');
 block(root,'CounterBody',[0,.53,0],[length-.08,1.06,.77],front);
 block(root,'CounterTop',[0,1.10,0],[length,.13,.96],wood);
 block(root,'CounterKick',[0,.09,.405],[length-.13,.12,.038],dark);
 return root;
}
export function createEspressoMachine():THREE.Group {
 const root=new THREE.Group();root.name='EspressoMachine';
 const metal=matte('#C9CED3'),dark=matte('#4E5962'),brass=matte('#D9A86C');
 block(root,'Housing',[0,.32,0],[.72,.58,.47],metal);
 block(root,'ControlPanel',[0,.48,.242],[.60,.18,.026],dark);
 block(root,'DripTray',[0,.08,.285],[.63,.04,.24],dark);
 for(const x of [-.20,.20]) {
   cylinder(root,'GroupHead',[x,.23,.255],.06,.12,brass);
   block(root,'Handle',[x,.17,.36],[.08,.055,.29],dark);
 }
 return root;
}
export function createCafeSofa():THREE.Group {
 const root=new THREE.Group();root.name='CafeSofa';
 const fabric=matte('#F29B91'),feet=matte('#9B744E');
 block(root,'SeatCushion',[0,.46,0],[1.74,.30,.74],fabric);
 block(root,'Backrest',[0,.88,-.33],[1.74,.90,.20],fabric);
 for(const x of [-.76,.76]){
   block(root,'Armrest',[x,.68,0],[.21,.55,.73],fabric);
   for(const z of [-.24,.24])block(root,'SofaFoot',[x,.16,z],[.10,.30,.10],feet);
 }
 return root;
}
export function createCafePlanter():THREE.Group {
 const root=new THREE.Group();root.name='CafePlanter';
 const pot=matte('#F4B183'),leaf=matte('#6EBF8B'),stem=matte('#5C815E');
 cylinder(root,'Pot',[0,.27,0],.26,.54,pot);
 cylinder(root,'Stem',[0,.72,0],.055,.48,stem);
 for (const [i,x,z] of [[0,-.22,.1],[1,.18,-.12],[2,.08,.23]] as const){
   const leafMesh=new THREE.Mesh(LEAF,leaf);
   leafMesh.name='Leaves-'+i;leafMesh.position.set(x,1.02+(i%2)*.13,z);
   leafMesh.castShadow=true;leafMesh.receiveShadow=true;root.add(leafMesh);
 }
 return root;
}
export function createCafeCup():THREE.Group {
 const root=new THREE.Group();root.name='CafeCup';
 const white=matte('#FFF8EC'),coffee=matte('#8D654E');
 cylinder(root,'CupBody',[0,.09,0],.105,.18,white);
 cylinder(root,'CoffeeSurface',[0,.187,0],.091,.006,coffee);
 block(root,'CupHandle',[.115,.105,0],[.075,.035,.06],white);
 return root;
}
