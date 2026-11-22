import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncSceneRegistry } from '../../../packages/next/src/discovery.mjs';
const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const report = syncSceneRegistry({ root });
if (report.scenes.length !== 1 || report.scenes[0] !== 'city-cross') throw new Error('Expected one city-cross scene');
console.log('[world-composer] generated scene registry');
