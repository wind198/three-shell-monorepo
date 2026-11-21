'use client';
import { useRef, useState } from 'react';
import { SceneView } from '../scenes/.generated/registry';
import type { ThreeApplication, FrameContext } from '@three-shell/core';
import type { EntityStore } from '../scenes/demo/state/entity.store';


type Controller = ThreeApplication<FrameContext>;
export function Dashboard() {
  const controller = useRef<Controller | null>(null);
  const entityStore = useRef<EntityStore | null>(null);
  const [status, setStatus] = useState('Initializing');
  const [metrics, setMetrics] = useState({ fps: 0, objects: 0 });
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [interval, setInterval] = useState(1);
  const store = () => entityStore.current;
  const readyHandler = (instance: Controller) => {
    controller.current = instance;
    void import('../scenes/demo/state/entity.store').then(({ EntityStore }) => {
      if (controller.current === instance) { entityStore.current = instance.resolve(EntityStore); setStatus('Running'); }
    }).catch(error => { if (controller.current === instance) { console.error(error); setStatus('Failed'); } });
  };
  const disposeHandler = () => { controller.current = null; entityStore.current = null; setStatus('Initializing'); };
  const ready = status === 'Running' || status === 'Paused';
  return <main className="app">
    <header><div><strong>THREESHELL</strong><span> / framework playground</span></div><span className="status">{status}</span></header>
    <section className="layout"><div className="main">
      <SceneView scene="demo" className="viewport" onReady={readyHandler} onDispose={disposeHandler} onMetrics={setMetrics} onError={error => { console.error(error); setStatus('Failed'); }}><span className="corner">THREE.JS + RAPIER</span></SceneView>
      <div className="controls">
        <button disabled={!ready} onClick={() => store()?.enqueueSpawn()}>+ Spawn object</button>
        <button disabled={!ready} onClick={() => { const c = controller.current; if (!c) return; if (c.isPaused) { c.resume(); setPaused(false); setStatus('Running'); } else { c.pause(); setPaused(true); setStatus('Paused'); } }}>{paused ? 'Resume' : 'Pause'}</button>
        <button disabled={!ready} onClick={() => (store() && (store()!.commands.clearRequested = true))}>Clear world</button>
        <label><input type="checkbox" checked={auto} onChange={e => { setAuto(e.target.checked); (store() && (store()!.settings.autoSpawn = e.target.checked)); }} /> Auto spawn</label>
      </div>
      <div className="stats"><div>OBJECTS <b>{metrics.objects}</b></div><div>SIMULATION <b>60 Hz</b></div><div>FPS <b>{metrics.fps || '—'}</b></div></div>
    </div><aside><p className="eyebrow">NESTJS-INSPIRED ARCHITECTURE</p><h1>Behavior, not boilerplate.</h1>
        <p>ThreeShell is a thin composition root. Module-scoped providers own the actual behavior.</p>
        <h3>SIMULATION · FIXED STEP</h3><ol><li>processCommands()</li><li>spawnScheduled()</li><li>capturePreviousTransforms()</li><li>simulate()</li><li>removeFallenBodies()</li><li>enforceObjectLimit()</li></ol>
        <h3>PRESENTATION · EACH FRAME</h3><ol><li>synchronizeTransforms()</li><li>camera.update()</li><li>renderer.render()</li><li>reportMetrics()</li></ol>
        <h3>SPAWN INTERVAL <small>{interval.toFixed(1)}s</small></h3><input type="range" min="0.2" max="3" step="0.1" value={interval} onChange={e => { const n = Number(e.target.value); setInterval(n); (store() && (store()!.settings.spawnInterval = n)); }} />
        <p className="foot">Module DI • Lifecycle hooks • One render loop • Explicit pipeline ordering</p>
      </aside></section>
  </main>;
}
