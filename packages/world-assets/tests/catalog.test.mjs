import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
test('source snapshot contains 20 architecture factories', () => {
 const catalog = JSON.parse(readFileSync(resolve('catalog/assets.json'), 'utf8'));
 assert.equal(catalog.length,20);
 assert.ok(catalog.some(item=>item.id==='architecture/door'));
});
