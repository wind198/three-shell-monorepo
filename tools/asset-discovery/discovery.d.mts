export interface CatalogReport { changed: boolean; count: number; issues: string[]; output: string }
export declare function generateCatalog(args: { packageRoot: string }): {
 content: string; entries: {definition: object;factory:string}[]; issues: string[]
};
export declare function syncAssetCatalog(args: { packageRoot: string; dryRun?: boolean }): CatalogReport;
export declare function withWorldAssets<T>(config: T, args?: { packageRoot?: string }): T;
