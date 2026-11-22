'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import type { ChangeEvent } from 'react';
import { SceneView } from '@/scenes/.generated/registry';
import { DEFAULT_CONFIG, BLOCK_NAMES, type ComposerConfig, type TimeOfDay } from '@/lib/config';

const labels: Record<string,string> = {
 'Block-North-West':'Northwest block',
 'Block-North-East':'Northeast block',
 'Block-South-West':'Southwest block',
 'Block-South-East':'Southeast block',
};
function value(input: string, minimum: number, maximum: number): number {
 const n=Number(input);
 return Number.isFinite(n)?Math.max(minimum,Math.min(maximum,n)):minimum;
}
const counts=(config:ComposerConfig)=>4*(config.city.rowCount??3);

export function WorldComposer() {
 const [config,setConfig]=useState<ComposerConfig>(DEFAULT_CONFIG);
 const [status,setStatus]=useState('Initializing…');
 const fileInput=useRef<HTMLInputElement>(null);
 const patchCity=(patch:Partial<ComposerConfig['city']>)=>setConfig(previous=>({
  ...previous, city:{...previous.city,...patch}, selection:'',
 }));
 const patchEnv=(patch:Partial<ComposerConfig['environment']>)=>setConfig(previous=>({
  ...previous,environment:{...previous.environment,...patch},
 }));
 const exportScene=()=>{
  const document={schemaVersion:1,template:'city-cross',options:config.city};
  const url=URL.createObjectURL(new Blob([JSON.stringify(document,null,2)],{type:'application/json'}));
  const anchor=documentBodyAnchor(url);
  anchor.click();
  anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),500);
 };
 const importScene=async (event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];
  event.target.value='';
  if(!file)return;
  try {
   const parsed:unknown=JSON.parse(await file.text());
   if(typeof parsed!=='object'||!parsed||!('template' in parsed)||parsed.template!=='city-cross'
    ||!('schemaVersion' in parsed)||parsed.schemaVersion!==1||!('options' in parsed)
    ||typeof parsed.options!=='object'||!parsed.options||Array.isArray(parsed.options)) throw Error('Not a city-cross v1 document');
   const options=parsed.options as Record<string,unknown>;
   const next:ComposerConfig['city']={};
   const numeric={
    rowCount:[1,12],roadWidth:[3,24],sidewalkWidth:[.5,8],
    buildingWidth:[2,9],buildingDepth:[3,15],buildingGap:[0,3],floors:[1,8],
   } as const;
   for(const key of Object.keys(numeric) as (keyof typeof numeric)[]) {
    if(options[key]===undefined)continue;
    if(typeof options[key]!=='number'||!Number.isFinite(options[key])||
      options[key]<numeric[key][0]||options[key]>numeric[key][1]) throw Error('Invalid '+key);
    if(['rowCount','floors'].includes(key)&&!Number.isInteger(options[key]))throw Error('Invalid integer '+key);
    (next as Record<string,unknown>)[key]=options[key];
   }
   if(options.showStreetFurniture!==undefined) {
    if(typeof options.showStreetFurniture!=='boolean')throw Error('Invalid showStreetFurniture');
    next.showStreetFurniture=options.showStreetFurniture;
   }
   // The palette is allowed only if every color is a valid hex token.
   if(options.palette!==undefined) {
    if(!Array.isArray(options.palette)||!options.palette.length||
      !options.palette.every((c:unknown)=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c))) throw Error('Invalid palette');
    next.palette=options.palette;
   }
   setConfig(previous=>({...previous,city:{...DEFAULT_CONFIG.city,...next},selection:''}));
   setStatus('Scene document loaded');
  }catch(error){setStatus('Import error: '+String(error));}
 };
 return <main className="shell">
  <header className="topbar">
   <div className="brand"><span className="mark">◈</span><strong>THREESHELL</strong><span className="crumb"> / World Composer</span></div>
   <div className="actions">
    <Link href="/coffee-shop" className="scene-link">Inside Shophouse Coffee Shop</Link>
    <input ref={fileInput} type="file" accept=".json,application/json" className="hidden" aria-label="Import city JSON" onChange={importScene}/>
    <button onClick={()=>fileInput.current?.click()}>Import JSON</button>
    <button onClick={exportScene} className="primary">Export JSON</button>
   </div>
  </header>
  <div className="columns">
   <aside className="tree">
    <div className="sidebar-heading"><h2>Scene hierarchy</h2><span className="tag">LIVE</span></div>
    <button className={config.selection===''?'node selected':'node'} onClick={()=>setConfig(c=>({...c,selection:''}))}>
     <span className="symbol">◇</span>City Cross<span className="node-meta">Root</span>
    </button>
    <div className="tree-content">
     <div className="folder">▾ Road network</div>
     <div className="leaf">└ Cross intersection</div>
     <div className="folder">▾ City blocks</div>
     {BLOCK_NAMES.map(name=><div key={name}>
       <button className={config.selection===name?'node level2 selected':'node level2'}
        onClick={()=>setConfig(c=>({...c,selection:name}))}>
        <span className="symbol">▦</span>{labels[name]}
       </button>
       <div className="leaf inner">└ Shophouse row × {config.city.rowCount}</div>
     </div>)}
     <div className="folder">▾ Environment</div>
     <div className="leaf">└ Sun · ambient · ground</div>
    </div>
    <div className="tree-bottom"><span className="dot"/> {status}</div>
   </aside>
   <section className="viewer">
    <div className="viewer-heading">
     <div><span className="eyebrow">LOW-POLY CITY</span><h1>City crossroads</h1>
      <p>Four shophouse blocks · parameterized streets and sidewalks</p></div>
     <span className="view-label">Orthographic · Isometric</span>
    </div>
    <div className="canvas">
     <SceneView scene="city-cross" config={config} className="scene-view"
      onStatus={setStatus}
      onReady={()=>setStatus('Scene initializing…')}
      onError={(err:unknown)=>setStatus('Renderer error: '+String(err))}/>
     <div className="canvas-chip">Drag to orbit · Scroll to zoom · Right-drag to pan</div>
    </div>
    <footer className="viewer-footer">
     <div><strong>{counts(config)} shophouses</strong><span> across 4 blocks</span></div>
     <div>{config.city.floors} floors · {config.city.roadWidth} m streets</div>
    </footer>
   </section>
   <aside className="inspector">
    <div className="sidebar-heading"><h2>Scene inspector</h2>
      <button className="reset" onClick={()=>setConfig(DEFAULT_CONFIG)}>Reset</button></div>
    <div className="form-scroll">
     <section className="panel"><h3>Shophouse blocks</h3>
      <Range label="Shops per block" value={config.city.rowCount??3} min={1} max={8} step={1}
       onChange={n=>patchCity({rowCount:n})}/>
      <Range label="Building floors" value={config.city.floors??3} min={1} max={6} step={1}
       onChange={n=>patchCity({floors:n})}/>
      <Range label="Building width" value={config.city.buildingWidth??3.6} min={2} max={7} step={.1}
       suffix=" m" onChange={n=>patchCity({buildingWidth:n})}/>
      <Range label="Building depth" value={config.city.buildingDepth??5.8} min={3} max={12} step={.1}
       suffix=" m" onChange={n=>patchCity({buildingDepth:n})}/>
      <Range label="Building gap" value={config.city.buildingGap??.14} min={0} max={2} step={.05}
       suffix=" m" onChange={n=>patchCity({buildingGap:n})}/>
     </section>
     <section className="panel"><h3>Roads and sidewalks</h3>
      <Range label="Street width" value={config.city.roadWidth??7} min={4} max={16} step={.5}
       suffix=" m" onChange={n=>patchCity({roadWidth:n})}/>
      <Range label="Sidewalk width" value={config.city.sidewalkWidth??2} min={.5} max={5} step={.25}
       suffix=" m" onChange={n=>patchCity({sidewalkWidth:n})}/>
      <Check label="Trees and lamps" checked={config.city.showStreetFurniture!==false}
       onChange={b=>patchCity({showStreetFurniture:b})}/>
     </section>
     <section className="panel"><h3>Environment</h3>
      <label className="field-label" htmlFor="time">Time of day</label>
      <select id="time" value={config.environment.time} onChange={e=>patchEnv({time:e.target.value as TimeOfDay})}>
       <option value="day">Soft daylight</option><option value="golden-hour">Golden hour</option><option value="evening">Evening</option>
      </select>
      <Check label="Cast shadows" checked={config.environment.shadows}
       onChange={b=>patchEnv({shadows:b})}/>
      <Check label="Show grid" checked={config.environment.showGrid}
       onChange={b=>patchEnv({showGrid:b})}/>
     </section>
     <section className="panel"><h3>Selected assembly</h3>
      <p className="info">{config.selection?labels[config.selection]??config.selection:'City Cross root'}</p>
      <p className="hint">Select a block in the scene tree to inspect its world-space bounding box.</p>
     </section>
    </div>
   </aside>
  </div>
 </main>;
}
function documentBodyAnchor(url:string) {
 const anchor=document.createElement('a');
 anchor.href=url;
 anchor.download='city-cross.json';
 document.body.appendChild(anchor);
 return anchor;
}
function Range(props:{label:string;value:number;min:number;max:number;step:number;onChange:(n:number)=>void;suffix?:string}){
 return <label className="range"><span>{props.label}<output>{props.value.toFixed(props.step<1?2:0)}{props.suffix??''}</output></span>
  <input type="range" min={props.min} max={props.max} step={props.step} value={props.value}
   onChange={e=>props.onChange(value(e.target.value,props.min,props.max))}/></label>;
}
function Check(props:{label:string;checked:boolean;onChange:(b:boolean)=>void}){
 return <label className="check"><span>{props.label}</span><input type="checkbox" checked={props.checked}
  onChange={e=>props.onChange(e.target.checked)}/></label>;
}
