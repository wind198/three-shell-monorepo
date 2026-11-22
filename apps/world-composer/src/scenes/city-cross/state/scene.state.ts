import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Injectable, Inject } from '@three-shell/core';
import type { ComposerConfig } from '@/lib/config';

export const HOST_CONTAINER = Symbol('WORLD_COMPOSER_CONTAINER');
export const HOST_CONFIG = Symbol('WORLD_COMPOSER_CONFIG');
export const HOST_REPORT = Symbol('WORLD_COMPOSER_REPORT');

@Injectable()
export class SceneState {
 scene!: THREE.Scene;
 camera!: THREE.OrthographicCamera;
 renderer!: THREE.WebGLRenderer;
 controls!: OrbitControls;
 sun!: THREE.DirectionalLight;
 ambient!: THREE.HemisphereLight;
 grid!: THREE.GridHelper;
 content!: THREE.Group;
 private observer?: ResizeObserver;
 constructor(
  @Inject(HOST_CONTAINER) readonly container: HTMLElement,
  @Inject(HOST_CONFIG) readonly getConfig: () => ComposerConfig,
  @Inject(HOST_REPORT) readonly report: (status:string)=>void,
 ) {}
 onSceneInit(): void {
  this.scene = new THREE.Scene();
  this.scene.background = new THREE.Color('#e4f0f2');
  this.camera = new THREE.OrthographicCamera(-18,18,12,-12,.1,300);
  this.camera.position.set(28,32,28);
  this.renderer = new THREE.WebGLRenderer({antialias:true});
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  this.renderer.setSize(Math.max(this.container.clientWidth,1),Math.max(this.container.clientHeight,1),false);
  this.renderer.shadowMap.enabled=true;
  this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
  this.renderer.toneMappingExposure=1.4;
  this.container.appendChild(this.renderer.domElement);
  this.sun=new THREE.DirectionalLight('#fff6e5',3.2);
  this.sun.position.set(-15,27,18);
  this.sun.castShadow=true;
  this.sun.shadow.mapSize.set(2048,2048);
  this.sun.shadow.camera.left=-52;
  this.sun.shadow.camera.right=52;
  this.sun.shadow.camera.top=52;
  this.sun.shadow.camera.bottom=-52;
  this.sun.shadow.camera.near=.5;
  this.sun.shadow.camera.far=120;
  this.sun.shadow.bias=-.00035;
  this.ambient = new THREE.HemisphereLight('#edf8ff','#97a69a',1.8);
  this.scene.add(this.sun,this.sun.target,this.ambient);
  this.content = new THREE.Group();
  this.content.name='CityCompositionRoot';
  this.scene.add(this.content);
  this.grid = new THREE.GridHelper(100,50,'#adb7b0','#d3d9d0');
  this.grid.position.y=.012;
  this.grid.visible=false;
  this.scene.add(this.grid);
  this.controls = new OrbitControls(this.camera,this.renderer.domElement);
  this.controls.enableDamping=true;
  this.controls.dampingFactor=.075;
  this.controls.maxPolarAngle=Math.PI*.49;
  this.controls.minZoom=.28;
  this.controls.maxZoom=8;
  this.controls.target.set(0,0,0);
  this.controls.update();
  this.observer = new ResizeObserver(()=>this.resize());
  this.observer.observe(this.container);
  this.resize();
 }
 resize():void {
  const w=Math.max(1,this.container.clientWidth),h=Math.max(1,this.container.clientHeight);
  const halfHeight=(this.camera.top-this.camera.bottom)/2;
  this.camera.left=-halfHeight*w/h;
  this.camera.right=halfHeight*w/h;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(w,h,false);
 }
 onSceneDestroy():void {
  this.observer?.disconnect();
  this.controls?.dispose();
  this.grid?.geometry.dispose();
  for(const mat of Array.isArray(this.grid?.material)?this.grid.material:[this.grid?.material]) mat?.dispose();
  this.sun?.shadow.map?.dispose();
  this.renderer?.dispose();
  this.renderer?.domElement.remove();
 }
}
