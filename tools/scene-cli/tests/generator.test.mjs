import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateScene, listScenes, normalizeSceneName, parseParts, syncSceneRegistry } from '../src/generator.mjs';

function fixture(callback) {const root=mkdtempSync(join(tmpdir(),'three-shell-'));try{callback(root);}finally{rmSync(root,{recursive:true,force:true});}}
test('normalizes PascalCase and kebab names',()=>{
  assert.deepEqual(normalizeSceneName('CoffeeShop'),{slug:'coffee-shop',className:'CoffeeShop'});
  assert.equal(normalizeSceneName('coffee-shop').className,'CoffeeShop');
  for(const value of ['../x','a/b','a\\b','123scene','']) assert.throws(()=>normalizeSceneName(value));
});
test('generates minimal neutral scene with no barrel, contracts or services',()=>fixture(root=>{
  const result=generateScene({root,name:'CoffeeShop',parts:[]});
  assert.equal(result.created,true);
  assert.deepEqual(Object.keys(result.files).sort(),['coffee-shop.module.ts','coffee-shop.scene.ts']);
  assert.match(readFileSync(join(result.target,'coffee-shop.module.ts'),'utf8'),/@Module\(/);
  assert.deepEqual(listScenes({root}),['coffee-shop']);
  assert.throws(()=>generateScene({root,name:'CoffeeShop',parts:[]}),/already exists/);
}));
test('generates optional directories, operator pipeline, and test',()=>fixture(root=>{
  const {target}=generateScene({root,name:'robot-lab',parts:parseParts('operators,entities,state,assets,tests')});
  for(const file of ['operators/robot-lab.operator.ts','entities/README.md','state/README.md','assets/README.md','tests/robot-lab.scene.test.ts']) assert.ok(existsSync(join(target,file)),file);
  assert.match(readFileSync(join(target,'robot-lab.scene.ts'),'utf8'),/behavior\.update\(ctx\)/);
}));
test('dry-run writes nothing',()=>fixture(root=>{
  const result=generateScene({root,name:'robot-lab',dryRun:true,parts:['operators']});
  assert.equal(result.created,false); assert.ok(!existsSync(result.target));
}));
test('rejects path escape and unknown parts',()=>fixture(root=>{
  assert.throws(()=>generateScene({root,name:'foo',scenesDir:'../escape'}),/safe relative/);
  assert.throws(()=>parseParts('services'),/Unsupported directory/);
}));

test('scene generation never produces a React view file',()=>fixture(root=>{
  const { target, files }=generateScene({root,name:'CoffeeShop',parts:parseParts('operators')});
  assert.ok(!Object.keys(files).some(f=>f.endsWith('.view.tsx')));
  assert.ok(!existsSync(join(target,'coffee-shop.view.tsx')));
  assert.throws(()=>parseParts('react'),/Unsupported directory/);
}));

test('generates static registry and discovers optional mount provider factory',()=>fixture(root=>{
  generateScene({root,name:'CoffeeShop',parts:[]});
  const output=syncSceneRegistry({root});
  assert.match(output.content, /import\('\.\.\/coffee-shop\/coffee-shop\.module'\)/);
  assert.match(output.content, /createSceneView/);
  assert.ok(!output.content.includes("import('../coffee-shop/coffee-shop.mount')"));
  assert.ok(existsSync(output.output));
}));

test('registry auto-discovers scene-specific mount configuration',()=>fixture(root=>{
  const {target}=generateScene({root,name:'CoffeeShop',parts:[]});
  writeFileSync(join(target,'coffee-shop.mount.ts'),'export function createMountProviders() {return [];}');
  const content=syncSceneRegistry({root}).content;
  assert.match(content,/import\('\.\.\/coffee-shop\/coffee-shop\.mount'\)/);
  assert.match(content,/mount\.createMountProviders/);
}));
