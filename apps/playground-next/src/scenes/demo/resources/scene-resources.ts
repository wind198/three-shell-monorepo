import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Injectable, Inject } from '@three-shell/core';

export const CANVAS_CONTAINER = Symbol('THREE_CANVAS_CONTAINER');

/** Playground-specific owner of WebGL, event listeners, and shared GPU resources. */
@Injectable()
export class SceneResources {
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  geometries!: { box: THREE.BoxGeometry; sphere: THREE.SphereGeometry };
  materials!: THREE.MeshStandardMaterial[];
  private groundGeometry?: THREE.BoxGeometry;
  private groundMaterial?: THREE.MeshStandardMaterial;
  private resizeObserver?: ResizeObserver;
  constructor(@Inject(CANVAS_CONTAINER) private readonly container: HTMLElement) {}

  onSceneInit(): void {
    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10192b);
    scene.fog = new THREE.Fog(0x10192b, 18, 36);
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    this.camera.position.set(9, 7, 12);
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xadc9ff, 0x29314c, 2.5));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(5, 12, 7);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.camera.left = -10; light.shadow.camera.right = 10;
    light.shadow.camera.top = 10; light.shadow.camera.bottom = -10;
    light.shadow.bias = -0.0002;
    scene.add(light);
    this.groundGeometry = new THREE.BoxGeometry(10, .5, 10);
    this.groundMaterial = new THREE.MeshStandardMaterial({color: 0x263c50, roughness: .94});
    const ground = new THREE.Mesh(this.groundGeometry, this.groundMaterial);
    ground.position.y = -.25; ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(10, 20, 0x7295b5, 0x45596d);
    grid.position.y = 0.008; scene.add(grid);
    this.geometries = {box: new THREE.BoxGeometry(1,1,1), sphere: new THREE.SphereGeometry(.5,20,14)};
    this.materials = [0x78aafa,0xf7b46c,0x75d5c2].map(color => new THREE.MeshStandardMaterial({color, roughness:.45}));
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = .075;
    this.controls.target.set(0, 2, 0);
    this.controls.maxPolarAngle = Math.PI * .49;
    this.controls.update();
    const resize = () => {
      const width = Math.max(1, this.container.clientWidth);
      const height = Math.max(1, this.container.clientHeight);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    };
    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(this.container);
    resize();
  }
  onSceneDestroy(): void {
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.groundGeometry?.dispose();
    this.groundMaterial?.dispose();
    this.geometries?.box.dispose();
    this.geometries?.sphere.dispose();
    this.materials?.forEach(material => material.dispose());
    // GridHelper has its own GPU resources.
    this.scene?.traverse(object => {
      if (object instanceof THREE.GridHelper) {
        object.geometry.dispose();
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        mats.forEach(mat => mat.dispose());
      }
      if (object instanceof THREE.Light && 'shadow' in object) {
        (object as THREE.DirectionalLight).shadow?.map?.dispose();
      }
    });
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}
