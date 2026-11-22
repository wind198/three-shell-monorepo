import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Inject, Injectable } from '@three-shell/core';
import type { RoomConfig } from '@/lib/room-types';

export const CANVAS_CONTAINER = Symbol('LIGHTING_ROOM_CONTAINER');
export const ROOM_CONFIG = Symbol('LIGHTING_ROOM_CONFIG');
export const ROOM_REPORT = Symbol('LIGHTING_ROOM_REPORT');

/** Owns renderer, camera, lights, environment and all associated cleanup. */
@Injectable()
export class SceneState {
 scene!: THREE.Scene;
 renderer!: THREE.WebGLRenderer;
 camera!: THREE.OrthographicCamera;
 controls!: OrbitControls;
 keyLight!: THREE.DirectionalLight;
 ambientLight!: THREE.HemisphereLight;
 floor!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
 grid!: THREE.GridHelper;
 assetMount!: THREE.Group;
 private resizeObserver?: ResizeObserver;
 constructor(
   @Inject(CANVAS_CONTAINER) private readonly container: HTMLElement,
   @Inject(ROOM_CONFIG) readonly getConfig: () => RoomConfig,
   @Inject(ROOM_REPORT) readonly report: (message: string) => void,
 ) {}
 onSceneInit(): void {
   this.scene = new THREE.Scene();
   this.scene.background = new THREE.Color('#f6f2e9');
   this.camera = new THREE.OrthographicCamera(-3, 3, 3, -3, .05, 250);
   this.camera.position.set(4, 3.2, 4);
   this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
   this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
   this.renderer.setSize(Math.max(1, this.container.clientWidth), Math.max(1, this.container.clientHeight), false);
   this.renderer.shadowMap.enabled = true;
   this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   this.renderer.outputColorSpace = THREE.SRGBColorSpace;
   this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
   this.renderer.toneMappingExposure = 1.25;
   this.container.appendChild(this.renderer.domElement);

   this.ambientLight = new THREE.HemisphereLight(0xffffff, 0xc5b8a7, 1.4);
   this.scene.add(this.ambientLight);
   this.keyLight = new THREE.DirectionalLight(0xfff5e5, 2.8);
   this.keyLight.position.set(4, 7, 5);
   this.keyLight.castShadow = true;
   this.keyLight.shadow.mapSize.set(1024, 1024);
   this.keyLight.shadow.camera.left = -12;
   this.keyLight.shadow.camera.right = 12;
   this.keyLight.shadow.camera.top = 12;
   this.keyLight.shadow.camera.bottom = -12;
   this.keyLight.shadow.camera.near = .1;
   this.keyLight.shadow.camera.far = 60;
   this.keyLight.shadow.bias = -.00015;
   this.scene.add(this.keyLight, this.keyLight.target);

   this.floor = new THREE.Mesh(
     new THREE.PlaneGeometry(40, 40),
     new THREE.MeshStandardMaterial({ color: '#eee8dc', roughness: 1, metalness: 0 }),
   );
   this.floor.rotation.x = -Math.PI / 2;
   this.floor.position.y = -.006;
   this.floor.receiveShadow = true;
   this.floor.name = 'InspectionFloor';
   this.scene.add(this.floor);
   this.grid = new THREE.GridHelper(20, 20, '#a9a39a', '#d8d1c5');
   this.grid.position.y = .002;
   this.grid.visible = false;
   this.scene.add(this.grid);

   this.assetMount = new THREE.Group();
   this.assetMount.name = 'CurrentAsset';
   this.scene.add(this.assetMount);

   this.controls = new OrbitControls(this.camera, this.renderer.domElement);
   this.controls.enableDamping = true;
   this.controls.dampingFactor = .08;
   this.controls.minZoom = .15;
   this.controls.maxZoom = 12;
   this.controls.target.set(0, 1, 0);
   this.controls.update();
   this.resizeObserver = new ResizeObserver(() => this.resize());
   this.resizeObserver.observe(this.container);
   this.resize();
 }
 resize(): void {
   const width = Math.max(1, this.container.clientWidth);
   const height = Math.max(1, this.container.clientHeight);
   const verticalSize = this.camera.top - this.camera.bottom;
   const halfWidth = verticalSize * (width / height) / 2;
   this.camera.left = -halfWidth;
   this.camera.right = halfWidth;
   this.camera.updateProjectionMatrix();
   this.renderer.setSize(width, height, false);
 }
 onSceneDestroy(): void {
   this.resizeObserver?.disconnect();
   this.controls?.dispose();
   this.floor?.geometry.dispose();
   this.floor?.material.dispose();
   this.grid?.geometry.dispose();
   const gridMaterials = Array.isArray(this.grid?.material) ? this.grid.material : [this.grid?.material];
   for (const material of gridMaterials) material?.dispose();
   this.keyLight?.shadow.map?.dispose();
   this.renderer?.dispose();
   this.renderer?.domElement.remove();
 }
}
