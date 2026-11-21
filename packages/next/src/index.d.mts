export interface ThreeShellOptions { root?: string; scenesDir?: string }
export declare function withThreeShell<T extends object>(config?: T, options?: ThreeShellOptions): T;
export declare function discoverScenes(options?: ThreeShellOptions): string[];
export declare function registrySource(options?: ThreeShellOptions): {source: string; scenes: string[]; output: string};
export declare function syncSceneRegistry(options?: ThreeShellOptions & {dryRun?: boolean}): {output: string; scenes: string[]; content: string; created: boolean; changed: boolean};
