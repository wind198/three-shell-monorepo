import type * as THREE from 'three';
export interface AssetOptions {
  variant?: string;
  width?: number;
  depth?: number;
  height?: number;
  primaryColor?: THREE.ColorRepresentation;
  secondaryColor?: THREE.ColorRepresentation;
}
export type AssetFactory = (options?: AssetOptions) => THREE.Group;
export interface AssetMetadata {
  id: string; name: string; category: string; placement: string;
  variants: readonly string[];
  dimensions?: { width: number; depth: number; height: number };
}
export interface AssetDefinition extends AssetMetadata {
  factory: string;
  load: () => Promise<unknown>;
}
