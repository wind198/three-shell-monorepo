import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_CONFIG } from '../src/lib/config';
import { createCityCross } from '@three-shell/world-composition';

describe('city cross preset document',()=>{
 it('uses the same typed options as its runtime defaults',()=>{
  const document=JSON.parse(readFileSync(resolve('scenes/city-cross.json'),'utf8'));
  expect(document.schemaVersion).toBe(1);
  expect(document.template).toBe('city-cross');
  expect(document.options).toEqual(DEFAULT_CONFIG.city);
  const scene=createCityCross(document.options);
  expect(scene.name).toBe('CityCross');
 });
 it('mounts all SceneState host tokens',()=>{
  const state=readFileSync(resolve('src/scenes/city-cross/state/scene.state.ts'),'utf8');
  const mount=readFileSync(resolve('src/scenes/city-cross/city-cross.mount.ts'),'utf8');
  for(const [,token] of state.matchAll(/@Inject\((\w+)\)/g)){
   expect(mount).toContain('provide:'+token);
  }
 });
});
