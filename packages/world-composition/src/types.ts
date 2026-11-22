import type * as THREE from 'three';
export type Vec3 = readonly [number, number, number];
export type SurfaceColor = THREE.ColorRepresentation;
export interface TransformSpec {
  position?: Vec3;
  rotation?: Vec3; // Euler radians in XYZ order.
  scale?: Vec3;
}
export interface CompositionNode<T extends string = string, P = unknown> {
  id: string;
  template: T;
  props: P;
  transform?: TransformSpec;
}
export type AssemblyFactory<P> = (options: P) => THREE.Group;
export type ShopType = 'cafe' | 'retail' | 'office';
export interface ShophouseOptions {
  width?: number;
  depth?: number;
  floors?: number;
  floorHeight?: number;
  shop?: ShopType;
  primaryColor?: SurfaceColor;
  secondaryColor?: SurfaceColor;
  roofColor?: SurfaceColor;
}
export interface ShophouseRowOptions extends ShophouseOptions {
  count?: number;
  gap?: number;
  shops?: readonly ShopType[];
  floorPattern?: readonly number[];
}
export interface RoadCrossOptions {
  roadWidth?: number;
  span?: number;
}
export interface CityCrossOptions {
  rowCount?: number;
  roadWidth?: number;
  sidewalkWidth?: number;
  buildingWidth?: number;
  buildingDepth?: number;
  buildingGap?: number;
  floors?: number;
  palette?: readonly string[];
  showStreetFurniture?: boolean;
}
export interface CityCrossDocument {
  schemaVersion: 1;
  template: 'city-cross';
  options: CityCrossOptions;
}
