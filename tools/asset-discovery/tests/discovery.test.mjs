import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateCatalog, syncAssetCatalog } from '../discovery.mjs';

test('discovers typed factories and excludes invalid files', () => {
 const dir=mkdtempSync(join(tmpdir(),'three-assets-'));
 try {
  mkdirSync(join(dir,'src/upstream/cafe'),{recursive:true});
  writeFileSync(join(dir,'src/upstream/cafe/chair.ts'),"export type ChairVariant = 'plain' | 'cushion'; export function createChair() {}");
  writeFileSync(join(dir,'src/upstream/cafe/broken.ts'),'export const noFactory = true;');
  const result=generateCatalog({packageRoot:dir});
  assert.equal(result.entries.length,1);
  assert.equal(result.issues.length,1);
  assert.match(result.content,/createChair/);
  assert.match(result.content,/plain/);
  assert.equal(syncAssetCatalog({packageRoot:dir}).changed,true);
  assert.equal(syncAssetCatalog({packageRoot:dir}).changed,false);
 } finally { rmSync(dir,{recursive:true,force:true}); }
});
