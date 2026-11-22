import type * as THREE from 'three';
import { assetList, type AssetOptions } from '@three-shell/world-assets';
import type { InspectionOptions } from './room-types';

/** Lighting Room metadata only. Factories stay in world-assets/world-composition. */
export type InspectionKind = 'asset' | 'shophouse' | 'shophouse-row' | 'sidewalk' | 'road' | 'city';
export interface InspectionEntry {
  id: string;
  name: string;
  category: string;
  placement: string;
  variants: readonly string[];
  dimensions?: { width: number; depth: number; height: number };
  kind: InspectionKind;
  create: (options: InspectionOptions) => Promise<THREE.Group>;
}

const primitives: InspectionEntry[] = assetList.map(asset => ({
  id:asset.id, name:asset.name, category:asset.category, placement:asset.placement,
  variants:asset.variants, dimensions:asset.dimensions, kind:'asset',
  async create(options) {
    const mod = await asset.load() as Record<string, unknown>;
    const factory = mod[asset.factory];
    if (typeof factory !== 'function') throw new Error('Missing '+asset.factory);
    return (factory as (options:AssetOptions)=>THREE.Group)({
      ...(options.variant?{variant:options.variant}:{}),
      ...(options.width!==undefined?{width:options.width}:{}),
      ...(options.depth!==undefined?{depth:options.depth}:{}),
      ...(options.height!==undefined?{height:options.height}:{}),
      primaryColor:options.primaryColor,
      secondaryColor:options.secondaryColor,
    });
  },
}));

const assemblies: InspectionEntry[] = [
  {
    id:'assembly/shophouse', name:'Shophouse', category:'assemblies',
    kind:'shophouse', placement:'floor', variants:['cafe','retail','office'],
    dimensions:{width:3.6,depth:5.8,height:7.87},
    async create(o) {
      const {createShophouse}=await import('@three-shell/world-composition');
      return createShophouse({
        width:o.width, depth:o.depth, floors:o.floors,
        shop:(o.variant || 'cafe') as 'cafe'|'retail'|'office',
        primaryColor:o.primaryColor,secondaryColor:o.secondaryColor,
      });
    },
  },
  {
    id:'assembly/shophouse-row', name:'Shophouse Row', category:'assemblies',
    kind:'shophouse-row', placement:'floor', variants:['mixed','cafe','retail','office'],
    dimensions:{width:11.08,depth:5.8,height:7.87},
    async create(o) {
      const {createShophouseRow}=await import('@three-shell/world-composition');
      const shop=o.variant==='mixed'||!o.variant?undefined:o.variant as 'cafe'|'retail'|'office';
      return createShophouseRow({
        count:o.count, floors:o.floors,width:o.width,depth:o.depth,
        shops:shop?[shop]:undefined,
        primaryColor:o.primaryColor,secondaryColor:o.secondaryColor,
      });
    },
  },
  {
    id:'assembly/sidewalk', name:'Sidewalk Segment', category:'assemblies',
    kind:'sidewalk', placement:'floor', variants:['front','back'],
    dimensions:{width:4,depth:2,height:.115},
    async create(o) {
      const {createSidewalkSegment}=await import('@three-shell/world-composition');
      return createSidewalkSegment({
        length:o.width,depth:o.depth,height:o.height,
        curbSide:(o.variant || 'front') as 'front'|'back',
        color:o.primaryColor,
      });
    },
  },
  {
    id:'assembly/road-cross', name:'Road Cross', category:'assemblies',
    kind:'road', placement:'floor', variants:[],
    async create(o) {
      const {createRoadCross}=await import('@three-shell/world-composition');
      return createRoadCross({roadWidth:o.roadWidth});
    },
  },
  {
    id:'assembly/city-cross', name:'City Cross', category:'assemblies',
    kind:'city', placement:'floor', variants:[],
    async create(o) {
      const {createCityCross}=await import('@three-shell/world-composition');
      return createCityCross({
        rowCount:o.rowCount, roadWidth:o.roadWidth,
        sidewalkWidth:o.sidewalkWidth, floors:o.floors,
      });
    },
  },
];

export const inspectionList: readonly InspectionEntry[] = [...primitives, ...assemblies];
export const inspectionCatalog: Readonly<Record<string, InspectionEntry>> =
  Object.fromEntries(inspectionList.map(item=>[item.id,item]));
