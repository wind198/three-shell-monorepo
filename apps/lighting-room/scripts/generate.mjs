import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncSceneRegistry } from '../../../packages/next/src/discovery.mjs';
import { syncAssetCatalog } from '../../../tools/asset-discovery/discovery.mjs';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const assets = syncAssetCatalog({packageRoot: resolve(root, '../../packages/world-assets')});
const scenes = syncSceneRegistry({root});
if (assets.issues.length) throw new Error('Invalid asset factories: ' + assets.issues.join('; '));
console.log('[lighting-room] ready:',assets.count,'assets,',scenes.scenes.length,'scenes');
