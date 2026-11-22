import type { CityCrossOptions } from '@three-shell/world-composition';
export type TimeOfDay = 'day' | 'golden-hour' | 'evening';
export interface ComposerConfig {
  city: CityCrossOptions;
  selection: string;
  environment: { time: TimeOfDay; showGrid: boolean; shadows: boolean };
}
export const DEFAULT_CONFIG: ComposerConfig = {
 city: {
   rowCount: 3, roadWidth: 7, sidewalkWidth: 2,
   buildingWidth: 3.6, buildingDepth: 5.8, buildingGap: .14,
   floors: 3, showStreetFurniture: true,
 },
 selection: '',
 environment: { time: 'day', showGrid: false, shadows: true },
};
export const BLOCK_NAMES = [
  'Block-North-West','Block-North-East','Block-South-West','Block-South-East',
] as const;
