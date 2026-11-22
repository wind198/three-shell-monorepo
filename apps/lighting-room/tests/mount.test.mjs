import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('every injected SceneState host token is mounted', () => {
  const state = readFileSync(resolve('src/scenes/lighting-room/state/scene.state.ts'), 'utf8');
  const mount = readFileSync(resolve('src/scenes/lighting-room/lighting-room.mount.ts'), 'utf8');
  const required = [...state.matchAll(/@Inject\((\w+)\)/g)].map(match => match[1]);
  assert.deepEqual(required, ['CANVAS_CONTAINER', 'ROOM_CONFIG', 'ROOM_REPORT']);
  for (const token of required) {
    assert.match(mount, new RegExp('provide:\\s*' + token + '\\b'));
  }
  assert.match(mount, /onAssetStatus\?\.\(message\)/);
});
