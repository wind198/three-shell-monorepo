import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverScenes, syncSceneRegistry, withThreeShell } from '../src/index.mjs';

function fixture(cb) {
  const root = mkdtempSync(join(tmpdir(), 'three-shell-next-'));
  mkdirSync(join(root,'src','scenes'),{recursive:true});
  return Promise.resolve().then(()=>cb(root)).finally(()=>rmSync(root,{recursive:true,force:true}));
}
function addScene(root, slug) {
  const p = join(root,'src','scenes',slug);
  mkdirSync(p,{recursive:true});
  writeFileSync(join(p, `${slug}.scene.ts`),'export class StubScene {}');
  writeFileSync(join(p, `${slug}.module.ts`),'export class StubModule {}');
  return p;
}
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function eventually(check, timeout = 3000) {
  const start = Date.now();
  while(Date.now()-start<timeout) {
    if(check()) return;
    await sleep(30);
  }
  throw new Error('Auto-discovery watcher did not update registry');
}

test('initial Next integration writes registry; no manual sync command',()=>fixture(root=>{
  addScene(root,'coffee-shop');
  const config={reactStrictMode:true};
  assert.equal(withThreeShell(config,{root}), config);
  const p=join(root,'src','scenes','.generated','registry.ts');
  const code=readFileSync(p,'utf8');
  assert.match(code,/export function SceneView/);
  assert.match(code,/import\('\.\.\/coffee-shop\/coffee-shop\.module'\)/);
  assert.deepEqual(discoverScenes({root}),['coffee-shop']);
}));

test('repeated discovery is idempotent and detects removed scenes',()=>fixture(async root=>{
  const scene=addScene(root,'coffee-shop');
  const first=syncSceneRegistry({root});
  assert.equal(first.changed,true);
  const before=statSync(first.output).mtimeMs;
  await sleep(40);
  const second=syncSceneRegistry({root});
  assert.equal(second.changed,false);
  assert.equal(statSync(first.output).mtimeMs,before);
  rmSync(scene,{recursive:true,force:true});
  const third=syncSceneRegistry({root});
  assert.equal(third.changed,true);
  assert.deepEqual(third.scenes,[]);
  assert.match(readFileSync(first.output,'utf8'),/SceneId = never/);
}));

test('automatic development watch discovers added scene and optional mount',()=>fixture(async root=>{
  const previous=process.env.NODE_ENV;
  process.env.NODE_ENV='development';
  try {
    withThreeShell({}, {root});
    const output=join(root,'src','scenes','.generated','registry.ts');
    const p=addScene(root,'robot-lab');
    await eventually(()=>readFileSync(output,'utf8').includes("import('../robot-lab/robot-lab.scene')"));
    writeFileSync(join(p,'robot-lab.mount.ts'),'export const createMountProviders = () => [];');
    await eventually(()=>readFileSync(output,'utf8').includes("import('../robot-lab/robot-lab.mount')"));
    rmSync(p,{recursive:true,force:true});
    await eventually(()=>!readFileSync(output,'utf8').includes("import('../robot-lab/robot-lab.scene')"));
  } finally {
    if(previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV=previous;
  }
}));
