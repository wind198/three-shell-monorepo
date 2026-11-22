'use client';

import { useMemo, useState } from 'react';
import { inspectionList, type InspectionEntry } from '@/lib/inspection-catalog';
import { SceneView } from '@/scenes/.generated/registry';
import { DEFAULT_CONFIG, LIGHT_PRESETS, type RoomConfig, type LightPreset } from '@/lib/room-types';

const palette = ['#8FD6BE', '#F2E8D5', '#D9A86C', '#F29B91', '#F4B183', '#F7D774', '#9ACDE8', '#C9CED3'];
const friendly = (id: string) => id.replaceAll('-', ' ').replace(/\b\w/g, x => x.toUpperCase());
const clampDimension = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined;
  const number = Number(raw);
  return Number.isFinite(number) && number > 0 ? number : undefined;
};

export function LightingRoom() {
  const [config, setConfig] = useState<RoomConfig>(DEFAULT_CONFIG);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('Initializing renderer…');
  const [showDimensions, setShowDimensions] = useState(false);
  const selected = inspectionList.find(x => x.id === config.assetId);
  const categories = useMemo(() => ['all', ...new Set(inspectionList.map(x => x.category))], []);
  const listed = useMemo(() => inspectionList.filter(x =>
    (category === 'all' || x.category === category) &&
    (x.name.toLowerCase().includes(search.toLowerCase()) || x.id.toLowerCase().includes(search.toLowerCase())),
  ), [category, search]);

  const patchOptions = (patch: Partial<RoomConfig['options']>) =>
    setConfig(previous => ({ ...previous, options: { ...previous.options, ...patch } }));
  const patchLighting = (patch: Partial<RoomConfig['lighting']>) =>
    setConfig(previous => ({ ...previous, lighting: { ...previous.lighting, ...patch } }));
  const patchTransform = (patch: Partial<RoomConfig['transform']>) =>
    setConfig(previous => ({ ...previous, transform: { ...previous.transform, ...patch } }));
  const patchEnvironment = (patch: Partial<RoomConfig['environment']>) =>
    setConfig(previous => ({ ...previous, environment: { ...previous.environment, ...patch } }));

  const selectAsset = (asset: InspectionEntry) => {
    setConfig(previous => ({
      ...previous, assetId: asset.id,
      options: {
        primaryColor: previous.options.primaryColor,
        secondaryColor: previous.options.secondaryColor,
        ...(asset.variants.length ? { variant: asset.variants[0] } : {}),
      },
      transform: { x: 0, y: 0, z: 0, autoRotate: previous.transform.autoRotate },
    }));
  };
  const setPreset = (preset: LightPreset) => patchLighting({ preset, ...LIGHT_PRESETS[preset] });
  const reset = () => setConfig({ ...DEFAULT_CONFIG, assetId: config.assetId, options: {
    primaryColor: DEFAULT_CONFIG.options.primaryColor,
    secondaryColor: DEFAULT_CONFIG.options.secondaryColor,
    ...(selected?.variants.length ? { variant: selected.variants[0] } : {}),
  } });

  return <main className="workspace">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">◈</span><strong>THREESHELL</strong><span className="muted"> / Asset Lighting Room</span></div>
      <div className="header-right"><span className="tag">Low-poly workbench</span><span className="connection-dot" />{status}</div>
    </header>
    <div className="studio-layout">
      <aside className="assets-sidebar">
        <div className="sidebar-top"><h2>Assets &amp; assemblies</h2><span className="count">{inspectionList.length}</span></div>
        <label className="sr-only" htmlFor="asset-search">Search assets</label>
        <input id="asset-search" className="search" placeholder="Search components…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="category-tabs" role="group" aria-label="Asset category">
          {categories.map(item => <button key={item} className={category === item ? 'category active' : 'category'} onClick={() => setCategory(item)}>{friendly(item)}</button>)}
        </div>
        <div className="asset-list">
          {listed.map(item => <button key={item.id}
            className={item.id === config.assetId ? 'asset-item chosen' : 'asset-item'}
            onClick={() => selectAsset(item)} aria-current={item.id === config.assetId ? 'true' : undefined}>
            <span className="asset-glyph">◇</span><span><strong>{item.name}</strong><small>{item.category.replaceAll('-', ' ')} · {item.placement}</small></span>
          </button>)}
          {!listed.length && <div className="empty">No implemented assets in this category.</div>}
        </div>
        <div className="sidebar-foot">Factories are discovered from TypeScript source files. Primitive assets and reusable assemblies can both be previewed.</div>
      </aside>
      <section className="viewer-section" aria-label="Three-dimensional asset preview">
        <div className="viewport-top">
          <div><span className="eyebrow">PREVIEW</span><h1>{selected?.name ?? 'Select an asset'}</h1><p>{selected?.id ?? 'No asset selected'}</p></div>
          <div className="view-chip">Orthographic <span>·</span> +Y up, +Z front</div>
        </div>
        <div className="canvas-shell">
          <SceneView
            scene="lighting-room"
            className="viewport"
            config={config}
            onAssetStatus={setStatus}
            onReady={() => setStatus('Renderer ready')}
            onError={(error: unknown) => setStatus('Renderer error: ' + String(error))}
          />
          <div className="canvas-corner">Orbit: drag · Zoom: scroll · Pan: right-drag</div>
          <div className="canvas-badge">{selected?.placement ?? 'floor'} anchor</div>
        </div>
        <div className="viewport-footer">
          <div><strong>{selected?.name ?? '—'}</strong><span> / {config.options.variant ?? 'default'} variant</span></div>
          <div>{selected?.dimensions ? `${selected.dimensions.width} × ${selected.dimensions.depth} × ${selected.dimensions.height} m` : 'Auto fit'}</div>
        </div>
      </section>
      <aside className="inspector">
        <div className="inspector-heading"><h2>Inspector</h2><button className="text-button" onClick={reset}>Reset all</button></div>
        <div className="inspector-scroll">
          <section className="panel"><h3>{selected?.kind === 'asset' ? 'Asset' : 'Assembly'}</h3>
            <label htmlFor="asset-variant">Variant</label>
            <select id="asset-variant" value={config.options.variant ?? selected?.variants[0] ?? ''} disabled={!selected?.variants.length}
              onChange={e => patchOptions({ variant: e.target.value })}>
              {selected?.variants.length ? selected.variants.map(v => <option key={v} value={v}>{friendly(v)}</option>) : <option value="">Default</option>}
            </select>
            {(selected?.kind === 'shophouse' || selected?.kind === 'shophouse-row' || selected?.kind === 'city') &&
              <Range label="Building floors" min={1} max={6} step={1} value={config.options.floors ?? 3}
                onChange={v => patchOptions({floors:v})} />}
            {selected?.kind === 'shophouse-row' &&
              <Range label="Buildings in row" min={1} max={8} step={1} value={config.options.count ?? 3}
                onChange={v => patchOptions({count:v})} />}
            {selected?.kind === 'city' &&
              <Range label="Shops per block" min={1} max={8} step={1} value={config.options.rowCount ?? 3}
                onChange={v => patchOptions({rowCount:v})} />}
            {(selected?.kind === 'city' || selected?.kind === 'road') &&
              <Range label="Road width" min={4} max={16} step={.5} value={config.options.roadWidth ?? 7}
                suffix=" m" onChange={v => patchOptions({roadWidth:v})} />}
            {selected?.kind === 'city' &&
              <Range label="Sidewalk width" min={.5} max={5} step={.25} value={config.options.sidewalkWidth ?? 2}
                suffix=" m" onChange={v => patchOptions({sidewalkWidth:v})} />}
            {selected && !['road','city'].includes(selected.kind) && <>
              <button className="disclosure" onClick={() => setShowDimensions(x => !x)} aria-expanded={showDimensions}>
                Dimensions <span>{showDimensions ? '−' : '+'}</span>
              </button>
              {showDimensions && <div className="dimension-grid">
                {(['width','depth','height'] as const)
                  .filter(key => key !== 'height' || selected.kind === 'asset' || selected.kind === 'sidewalk')
                  .map(key => <label key={key}>{key === 'width' && selected.kind === 'sidewalk' ? 'Length' : friendly(key)}
                    <input type="number" min="0.01" step="0.05" placeholder={selected.dimensions?.[key]?.toString() ?? 'Default'}
                      value={config.options[key] ?? ''} onChange={e => patchOptions({[key]: clampDimension(e.target.value)})} />
                  </label>)}
                <p>Leave blank to use the factory default.</p>
              </div>}
            </>}
          </section>
          {selected && ['asset','shophouse','shophouse-row','sidewalk'].includes(selected.kind) && <section className="panel"><h3>Palette</h3>
            {(['primaryColor','secondaryColor'] as const).map((key, i) => <div className="color-field" key={key}>
              <label htmlFor={key}>{i === 0 ? 'Primary' : 'Secondary'}</label>
              <div className="color-input"><input id={key} type="color" value={config.options[key]}
                onChange={e => patchOptions({[key]: e.target.value})} /><code>{config.options[key].toUpperCase()}</code></div>
            </div>)}
            <div className="swatches" aria-label="Pastel palette">{palette.map(color => <button key={color}
              style={{backgroundColor:color}} title={color} aria-label={'Use ' + color + ' as primary color'}
              onClick={() => patchOptions({primaryColor:color})} />)}</div>
          </section>}
          <section className="panel"><h3>Lighting</h3>
            <label htmlFor="lighting-preset">Preset</label>
            <select id="lighting-preset" value={config.lighting.preset}
              onChange={e => setPreset(e.target.value as LightPreset)}>
              {Object.keys(LIGHT_PRESETS).map(v => <option key={v} value={v}>{friendly(v)}</option>)}
            </select>
            <Range label="Key intensity" value={config.lighting.intensity} min={0} max={7} step={0.1} onChange={v => patchLighting({intensity:v})} />
            <Range label="Ambient fill" value={config.lighting.ambientIntensity} min={0} max={4} step={0.1} onChange={v => patchLighting({ambientIntensity:v})} />
            <Range label="Azimuth" value={config.lighting.azimuth} min={-180} max={180} step={1} onChange={v => patchLighting({azimuth:v})} suffix="°" />
            <Range label="Elevation" value={config.lighting.elevation} min={5} max={89} step={1} onChange={v => patchLighting({elevation:v})} suffix="°" />
            <div className="color-field"><label htmlFor="light-color">Light color</label>
              <div className="color-input"><input id="light-color" type="color" value={config.lighting.color}
                onChange={e => patchLighting({color:e.target.value})} /><code>{config.lighting.color.toUpperCase()}</code></div></div>
            <Check label="Cast shadows" checked={config.lighting.shadows} onChange={v => patchLighting({shadows:v})}/>
          </section>
          <section className="panel"><h3>Transform</h3>
            {(['x','y','z'] as const).map(axis => <Range key={axis} label={'Rotation ' + axis.toUpperCase()}
              value={config.transform[axis]} min={-180} max={180} step={1} suffix="°"
              onChange={v => patchTransform({[axis]:v})}/>)}
            <Check label="Auto-rotate" checked={config.transform.autoRotate} onChange={v => patchTransform({autoRotate:v})}/>
          </section>
          <section className="panel"><h3>Environment</h3>
            {(['backgroundColor','floorColor'] as const).map(key => <div className="color-field" key={key}>
              <label htmlFor={key}>{key === 'backgroundColor' ? 'Background' : 'Floor'}</label>
              <div className="color-input"><input id={key} type="color" value={config.environment[key]}
                onChange={e => patchEnvironment({[key]:e.target.value})} /><code>{config.environment[key].toUpperCase()}</code></div>
            </div>)}
            <Check label="Show grid" checked={config.environment.showGrid} onChange={v => patchEnvironment({showGrid:v})}/>
          </section>
        </div>
      </aside>
    </div>
  </main>;
}

function Range(props: {label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (value:number)=>void}) {
 return <label className="range-field"><span>{props.label}<output>{props.value.toFixed(props.step < 1 ? 1 : 0)}{props.suffix ?? ''}</output></span>
   <input type="range" min={props.min} max={props.max} step={props.step} value={props.value} onChange={e => props.onChange(Number(e.target.value))}/>
 </label>;
}
function Check(props: {label: string; checked: boolean; onChange: (value:boolean)=>void}) {
 return <label className="check-field"><span>{props.label}</span><input type="checkbox" checked={props.checked} onChange={e => props.onChange(e.target.checked)}/></label>;
}
