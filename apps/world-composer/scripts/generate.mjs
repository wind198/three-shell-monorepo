import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncSceneRegistry } from '../../../packages/next/src/discovery.mjs';
const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const report = syncSceneRegistry({ root });
if (report.scenes.join(',') !== 'city-cross,inside-shophouse') throw new Error('Expected city-cross and inside-shophouse scenes');
console.log('[world-composer] generated scene registry');
