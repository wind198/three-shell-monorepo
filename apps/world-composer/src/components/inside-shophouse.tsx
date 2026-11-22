'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SceneView } from '@/scenes/.generated/registry';
import { DEFAULT_CONFIG, type ComposerConfig, type TimeOfDay } from '@/lib/config';
import type { InsideShophouseOptions } from '@three-shell/world-composition';

const namedParts=[
 {id:'ServiceCounter',label:'Coffee counter',description:'Service and checkout'},
 {id:'EspressoMachine',label:'Espresso machine',description:'Coffee preparation'},
 {id:'CafeSeating',label:'Dining tables',description:'Customer seating'},
 {id:'Lounge',label:'Lounge',description:'Relaxation corner'},
 {id:'BackWall',label:'Rear wall',description:'Shop interior'},
 {id:'LeftWall',label:'Side wall',description:'Open-roof cutaway'},
];
export function InsideShophouseView(){
 const [config,setConfig]=useState<ComposerConfig>(DEFAULT_CONFIG);
 const [status,setStatus]=useState('Initializing scene…');
 const patch=(partial:Partial<InsideShophouseOptions>)=>setConfig(previous=>({
  ...previous,coffee:{...previous.coffee,...partial},selection:'',
 }));
 const patchEnvironment=(partial:Partial<ComposerConfig['environment']>)=>setConfig(previous=>({
  ...previous,environment:{...previous.environment,...partial},
 }));
 return <main className="shell">
  <header className="topbar">
   <div className="brand"><span className="mark">◈</span><strong>THREESHELL</strong><span className="crumb"> / Inside Shophouse</span></div>
   <nav className="actions" aria-label="Scenes">
    <Link href="/" className="scene-link">City Cross</Link>
    <Link href="/coffee-shop" className="scene-link active-scene">Coffee Shop</Link>
   </nav>
  </header>
  <div className="columns">
   <aside className="tree">
    <div className="sidebar-heading"><h2>Interior hierarchy</h2><span className="tag">SCENE</span></div>
    <button className={config.selection===''?'node selected':'node'} onClick={()=>setConfig(c=>({...c,selection:''}))}>
     <span className="symbol">◇</span>Inside Shophouse<span className="node-meta">Root</span>
    </button>
    <div className="tree-content">
     <div className="folder">▾ Architecture</div>
     <div className="leaf">└ Floor · Cutaway walls · Awning</div>
     <div className="folder">▾ Coffee shop furniture</div>
     {namedParts.map(part=><button key={part.id}
       className={config.selection===part.id?'node level2 selected':'node level2'}
       onClick={()=>setConfig(c=>({...c,selection:part.id}))}>
       <span className="symbol">▦</span><span>{part.label}</span>
      </button>)}
     <div className="folder">▾ Environment</div>
     <div className="leaf">└ Lighting · Shadows · Camera</div>
    </div>
    <div className="tree-bottom"><span className="dot"/>{status}</div>
   </aside>
   <section className="viewer">
    <div className="viewer-heading">
     <div><span className="eyebrow">LOW-POLY INTERIOR</span><h1>Shophouse coffee shop</h1>
      <p>Open-roof interior · Counter, seating and lounge</p></div>
     <span className="view-label">Orthographic · Isometric</span>
    </div>
    <div className="canvas">
     <SceneView scene="inside-shophouse" className="scene-view" config={config}
       onStatus={setStatus} onReady={()=>setStatus('Scene initializing…')}
       onError={(error:unknown)=>setStatus('Renderer error: '+String(error))}/>
     <div className="canvas-chip">Drag to orbit · Scroll to zoom · Right-drag to pan</div>
    </div>
    <footer className="viewer-footer">
     <div><strong>{config.coffee.tableCount??3} dining tables</strong><span> · Service counter · Open facade</span></div>
     <div>7.5 m × 10 m interior</div>
    </footer>
   </section>
   <aside className="inspector">
    <div className="sidebar-heading"><h2>Interior inspector</h2>
      <button className="reset" onClick={()=>setConfig(DEFAULT_CONFIG)}>Reset</button></div>
    <div className="form-scroll">
     <section className="panel"><h3>Shop layout</h3>
      <label className="range">Dining tables <output>{config.coffee.tableCount??3}</output>
       <input type="range" min="1" max="6" step="1" value={config.coffee.tableCount??3}
        onChange={e=>patch({tableCount:Number(e.target.value)})}/></label>
      <label className="check"><span>Lounge sofa</span><input type="checkbox"
       checked={config.coffee.showLounge!==false} onChange={e=>patch({showLounge:e.target.checked})}/></label>
      <label className="check"><span>Plants and pendants</span><input type="checkbox"
       checked={config.coffee.showDecor!==false} onChange={e=>patch({showDecor:e.target.checked})}/></label>
     </section>
     <section className="panel"><h3>Lighting</h3>
      <label htmlFor="time" className="field-label">Time of day</label>
      <select id="time" value={config.environment.time}
       onChange={e=>patchEnvironment({time:e.target.value as TimeOfDay})}>
       <option value="day">Soft daylight</option>
       <option value="golden-hour">Golden hour</option>
       <option value="evening">Evening</option>
      </select>
      <label className="check"><span>Shadows</span><input type="checkbox" checked={config.environment.shadows}
       onChange={e=>patchEnvironment({shadows:e.target.checked})}/></label>
      <label className="check"><span>Grid</span><input type="checkbox" checked={config.environment.showGrid}
       onChange={e=>patchEnvironment({showGrid:e.target.checked})}/></label>
     </section>
     <section className="panel"><h3>Selected component</h3>
      <p className="info">{namedParts.find(p=>p.id===config.selection)?.label??'Inside Shophouse'}</p>
      <p className="hint">{namedParts.find(p=>p.id===config.selection)?.description??'Select a component in the hierarchy to view its bounds.'}</p>
     </section>
    </div>
   </aside>
  </div>
 </main>;
}
