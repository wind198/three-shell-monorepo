import * as THREE from 'three';
import { createAwning } from '@three-shell/world-assets/architecture/awning';
import { createWindow } from '@three-shell/world-assets/architecture/window';
import { createCafeChair, createCafeCounter, createCafeCup, createCafePlanter, createCafeSofa, createCafeTable, createEspressoMachine } from '@three-shell/world-assets/interior/cafe';
import { add, group, place, repeat } from '../helpers';
import { box, matte, PALETTE, positive, whole } from '../primitives';
import { setAnchors } from '../anchors';

export interface InsideShophouseOptions {
  width?:number;
  depth?:number;
  height?:number;
  tableCount?:number;
  showLounge?:boolean;
  showDecor?:boolean;
}
/** Roof-open, front-open shophouse coffee interior. Entrance faces +Z; viewer looks from +X,+Z. */
export function createInsideShophouse(options:InsideShophouseOptions = {}):THREE.Group {
 const width=positive('width',options.width??7.5);
 const depth=positive('depth',options.depth??10);
 const height=positive('height',options.height??3.75);
 const tableCount=whole('tableCount',options.tableCount??3,6);
 if(width<6||depth<8||height<3)throw new RangeError('Cafe needs width>=6, depth>=8 and height>=3');
 const root=group('InsideShophouse');
 root.userData.template='inside-shophouse';
 const wood=matte('#D9A86C'),wall=matte('#F2E8D5'),accent=matte('#8FD6BE'),
       trim=matte('#8EAB96'),floor=matte('#D9BE99'),glass=matte('#9ACDE8'),
       light=matte('#FFF8EC');
 const y=0;
 // Cutaway architecture: rear and left walls only. No coplanar surface overlays.
 box(root,'FloorSlab',[0,-.11,0],[width+.36,.22,depth+.36],floor);
 box(root,'BackWall',[0,height/2,-depth/2+.09],[width,height,.18],wall);
 box(root,'LeftWall',[-width/2+.09,height/2,0],[.18,height,depth-.18],wall);
 box(root,'BackTopTrim',[0,height-.14,-depth/2+.22],[width-.18,.22,.12],wood);
 box(root,'LeftTopTrim',[-width/2+.22,height-.14,.02],[.12,.22,depth-.36],wood);
 // A simple front entrance frame, roof and right wall intentionally absent.
 box(root,'StorefrontHeader',[0,height-.19,depth/2-.02],[width,.38,.24],accent);
 for(const x of [-width/2+.13,width/2-.13])
   box(root,'StorefrontColumn',[x,height/2,depth/2-.02],[.26,height,.25],trim);
 const awning=createAwning({variant:'sloped',width:width*.75,depth:1.12,height:.25,primaryColor:'#F29B91'});
 add(root,place(awning,0,height-.55,depth/2+.52));
 // Large windows on the visible back wall; mounted proud of the wall plane.
 for(const x of [-width*.26,width*.26]){
   const window=createWindow({variant:'wide',width:width*.27,height:1.28,depth:.12,primaryColor:'#9ACDE8'});
   add(root,place(window,x,1.75,-depth/2+.24));
 }
 // Two-tone floor zones through noncoplanar floor insets, rather than overlays on the slab.
 box(root,'CounterArea',[width*.245,.014,-depth*.245],[width*.48,.028,depth*.38],matte('#E8DDD0'));
 // Rear service counter, oriented along X, with machine and cup stack.
 const counter=createCafeCounter(width*.57);
 add(root,place(counter,width*.14,0,-depth*.305));
 const machine=createEspressoMachine();
 add(root,place(machine,width*.33,1.17,-depth*.305));
 for (let i=0;i<3;i++)add(root,place(createCafeCup(),width*.02+i*.22,1.18,-depth*.23));
 box(root,'MenuBoard',[width*.22,2.87,-depth/2+.255],[width*.49,.52,.05],matte('#4E5962'));
 for(let i=0;i<3;i++)box(root,'MenuLine',[width*.07,2.99-i*.12,-depth/2+.295],[width*.24-i*.09,.029,.013],light);
 // Cafe seating along the open right side, leaving a central entry aisle.
 const seating=group('CafeSeating');
 const positions:readonly (readonly [number,number])[]=[
  [-width*.23,depth*.20],[width*.26,depth*.20],[-width*.23,-depth*.08],
  [width*.27,-depth*.06],[-width*.23,depth*.36],[width*.27,depth*.35],
 ];
 for(const [index,[x,z]] of positions.slice(0,tableCount).entries()) {
   const station=group('TableSet-'+(index+1));
   add(station,createCafeTable());
   for(const side of [-1,1] as const){
     const chair=createCafeChair(index%2===0?'#8FD6BE':'#F4B183');
     chair.rotation.y=side===-1?Math.PI:0;
     add(station,place(chair,0,0,side*.99));
   }
   const cup=createCafeCup();
   add(station,place(cup,.20,.84,.18));
   add(seating,place(station,x,0,z));
 }
 add(root,seating);
 if(options.showLounge!==false) {
  const lounge=group('Lounge');
  const sofa=createCafeSofa();
  sofa.rotation.y=-Math.PI/2;
  add(lounge,place(sofa,-width*.39,0,-depth*.22));
  box(lounge,'CoffeeTableTop',[-width*.19,.46,-depth*.22],[.65,.08,.72],wood);
  box(lounge,'CoffeeTableLeg',[-width*.19,.225,-depth*.22],[.15,.45,.14],trim);
  add(root,lounge);
 }
 if(options.showDecor!==false) {
  for(const [x,z] of [[-width*.41,depth*.39],[width*.42,-depth*.40]]){
   add(root,place(createCafePlanter(),x,0,z));
  }
  // Pendants float below the open roofline; they are static geometry, not lights.
  for(const x of [-width*.19,width*.24]){
   box(root,'PendantCord',[x,height-.43,-depth*.02],[.035,.8,.035],trim);
   box(root,'PendantShade',[x,height-.86,-depth*.02],[.50,.13,.50],matte('#F7D774'));
  }
 }
 setAnchors(root,{
  'entrance':[0,0,depth/2],'back':[0,0,-depth/2],
  'left':[-width/2,0,0],'right':[width/2,0,0],
 });
 return root;
}
