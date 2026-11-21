import { existsSync, watch } from 'node:fs';
import { resolve } from 'node:path';
import { syncSceneRegistry } from './discovery.mjs';

const activeWatchers = new Map();
/**
 * Next.js integration. Does not need an explicit generator command or prebuild script.
 * Initial discovery happens when Next evaluates config; changes are watched in dev.
 * The watcher is deliberately outside webpack, so it works with Turbopack too.
 */
export function withThreeShell(config = {}, options = {}) {
  const root = resolve(options.root ?? process.cwd());
  const scenesDir = options.scenesDir ?? 'src/scenes';
  const key = `${root}::${scenesDir}`;
  const sync = () => syncSceneRegistry({root, scenesDir});
  sync();
  if (process.env.NODE_ENV === 'development' && !activeWatchers.has(key)) {
    const scenesRoot = resolve(root, scenesDir);
    if (existsSync(scenesRoot)) {
      let running = false;
      let pending = false;
      const refresh = () => {
        if (running) { pending = true; return; }
        running = true;
        try { do { pending = false; sync(); } while(pending); }
        catch(error) { console.error('[three-shell] scene discovery failed:', error); }
        finally { running = false; }
      };
      // Node 22+ supports recursive fs.watch on Linux, macOS and Windows.
      const watcher = watch(scenesRoot, {recursive:true}, (_event, filename) => {
        if (filename && String(filename).includes('.generated')) return;
        refresh();
      });
      watcher.unref();
      activeWatchers.set(key, watcher);
    }
  }
  return config;
}
export { syncSceneRegistry, discoverScenes, registrySource } from './discovery.mjs';
