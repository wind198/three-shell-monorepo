import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { generateCatalog } from '../../../tools/asset-discovery/discovery.mjs';

test('lighting room source snapshot contains usable factories', () => {
 const result = generateCatalog({packageRoot:resolve(process.cwd(),'../../packages/world-assets')});
 assert.equal(result.issues.length,0);
 assert.ok(result.entries.length>=20);
 const door = result.entries.find(entry=>entry.definition.id==='architecture/door');
 assert.equal(door?.factory, 'createDoor');
 assert.deepEqual(door?.definition.variants,['single','double','sliding']);
});

test('lighting room exposes world-composition assemblies', () => {
 const source = readFileSync(resolve('src/lib/inspection-catalog.ts'),'utf8');
 for(const id of ['assembly/shophouse','assembly/shophouse-row','assembly/sidewalk','assembly/road-cross','assembly/city-cross']){
   assert.ok(source.includes(id),id+' should be in the inspector catalog');
 }
});
