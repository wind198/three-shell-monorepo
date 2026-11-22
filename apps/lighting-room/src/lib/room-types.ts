export type LightPreset = 'studio' | 'daylight' | 'warm' | 'neutral';
export interface InspectionOptions {
  variant?: string;
  width?: number; depth?: number; height?: number;
  floors?: number; count?: number; roadWidth?: number; rowCount?: number;
  sidewalkWidth?: number;
  primaryColor: string; secondaryColor: string;
}
export interface RoomConfig {
  assetId: string;
  options: InspectionOptions;
  lighting: {
    preset: LightPreset; intensity: number; ambientIntensity: number;
    color: string; azimuth: number; elevation: number; shadows: boolean;
  };
  transform: { x: number; y: number; z: number; autoRotate: boolean };
  environment: { backgroundColor: string; floorColor: string; showGrid: boolean };
}
export const DEFAULT_CONFIG: RoomConfig = {
  assetId: 'architecture/door',
  options: { primaryColor: '#8FD6BE', secondaryColor: '#F2E8D5' },
  lighting: { preset: 'studio', intensity: 2.8, ambientIntensity: 1.4,
    color: '#fff5e5', azimuth: 48, elevation: 55, shadows: true },
  transform: { x: 0, y: 0, z: 0, autoRotate: false },
  environment: { backgroundColor: '#f6f2e9', floorColor: '#eee8dc', showGrid: false },
};
export const LIGHT_PRESETS: Record<LightPreset, Pick<RoomConfig['lighting'],
  'intensity' | 'ambientIntensity' | 'color' | 'azimuth' | 'elevation'>> = {
  studio: { intensity: 2.8, ambientIntensity: 1.4, color: '#fff5e5', azimuth: 48, elevation: 55 },
  daylight: { intensity: 3.3, ambientIntensity: 1.7, color: '#ffffff', azimuth: 70, elevation: 65 },
  warm: { intensity: 2.5, ambientIntensity: 1.1, color: '#ffd5a3', azimuth: 35, elevation: 32 },
  neutral: { intensity: 2.1, ambientIntensity: 1.9, color: '#ffffff', azimuth: 60, elevation: 75 },
};
