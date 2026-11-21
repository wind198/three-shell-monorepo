import { syncSceneRegistry } from '../../../packages/next/src/discovery.mjs';
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const optional = new Set(['operators', 'entities', 'state', 'assets', 'tests']);
const defaultParts = ['operators'];

function toKebab(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').replace(/[_\s]+/g, '-').toLowerCase();
}
function toPascal(kebab) { return kebab.split('-').map(x => x[0].toUpperCase() + x.slice(1)).join(''); }
function assertWithin(root, dest) {
  const rel = relative(root, dest);
  if (!rel || rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) throw new Error('Scene output must be a descendant of the chosen scenes directory');
}

export function normalizeSceneName(raw) {
  if (!raw || typeof raw !== 'string' || raw.includes('/') || raw.includes('\\') || raw === '.' || raw === '..') throw new Error('Scene name must be a single name (e.g. coffee-shop or CoffeeShop)');
  const name = toKebab(raw.trim());
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) throw new Error('Invalid scene name; use letters, digits and hyphens, starting with a letter');
  return { slug:name, className:toPascal(name) };
}
export function parseParts(raw = 'operators') {
  if (raw === 'none') return [];
  const parts = raw.split(',').map(x=>x.trim()).filter(Boolean);
  const invalid = parts.filter(x=>!optional.has(x));
  if (invalid.length) throw new Error(`Unsupported directory: ${invalid.join(', ')}. Options: ${[...optional].join(', ')} or none`);
  return [...new Set(parts)];
}

export function planScene({name, root, scenesDir = 'src/scenes', parts = defaultParts}) {
  const {slug,className} = normalizeSceneName(name);
  if (!root) throw new Error('Provide a project root with --root');
  if (isAbsolute(scenesDir) || scenesDir.split(/[\\/]/).some(x => x === '..' || x === '.')) throw new Error('--scenes-dir must be a safe relative path');
  const projectRoot = resolve(root);
  const scenesRoot = resolve(projectRoot, scenesDir);
  assertWithin(projectRoot, scenesRoot);
  const target = resolve(scenesRoot, slug);
  assertWithin(scenesRoot, target);
  const chosen = [...new Set(parts)];
  for (const part of chosen) if (!optional.has(part)) throw new Error(`Unsupported directory: ${part}`);
  const operator = chosen.includes('operators');
  const files = {};
  files[`${slug}.module.ts`] = `import { Module } from '@three-shell/core';\nimport { ${className}Scene } from './${slug}.scene';\n${operator ? `import { ${className}Operator } from './operators/${slug}.operator';\n` : ''}\n@Module({\n  providers: [${className}Scene${operator ? `, ${className}Operator` : ''}],\n  exports: [${className}Scene],\n})\nexport class ${className}SceneModule {}\n`;
  files[`${slug}.scene.ts`] = `import { Injectable, Inject, ThreeShell, pipe, type FrameContext, type PipelineSpec, type AnimationHost } from '@three-shell/core';\n${operator ? `import { ${className}Operator } from './operators/${slug}.operator';\n` : ''}\n/** The host is supplied by the consuming application; the framework does not own WebGL. */\nexport const ${className.toUpperCase()}_HOST = Symbol('${className.toUpperCase()}_HOST');\n\n@Injectable()\nexport class ${className}Scene extends ThreeShell<FrameContext> {\n  constructor(${operator ? `private readonly behavior: ${className}Operator, ` : ''}@Inject(${className.toUpperCase()}_HOST) private readonly host: AnimationHost) { super(); }\n  getAnimationHost(): AnimationHost { return this.host; }\n\n  createPipelines(): PipelineSpec<FrameContext> {\n    return {\n      simulation: pipe(${operator ? '\n        ctx => this.behavior.update(ctx),\n      ' : ''}),\n      presentation: pipe(${operator ? '\n        ctx => this.behavior.present(ctx),\n      ' : ''}),\n    };\n  }\n}\n`;
  if (operator) files[`operators/${slug}.operator.ts`] = `import { Injectable, type FrameContext } from '@three-shell/core';\n\n/** Group related pipeline methods by responsibility; add other operators as needed. */\n@Injectable()\nexport class ${className}Operator {\n  update(_frame: FrameContext): void {\n    // Fixed-step behavior.\n  }\n\n  present(_frame: FrameContext): void {\n    // Once per display frame.\n  }\n}\n`;
  if (chosen.includes('entities')) files['entities/README.md'] = '# Entities\n\nDefine runtime objects and their object-local state here. Do not register individual entities as DI providers.\n';
  if (chosen.includes('state')) files['state/README.md'] = '# State\n\nScene-owned persistent state that must survive across frames. Avoid duplicating state owned by entities.\n';
  if (chosen.includes('assets')) files['assets/README.md'] = '# Assets\n\nScene asset manifests and loading policy. Place large static assets in the consuming application’s public asset location.\n';
  if (chosen.includes('tests')) files[`tests/${slug}.scene.test.ts`] = `import { describe, expect, it } from 'vitest';\nimport { ${className}SceneModule } from '../${slug}.module';\n\ndescribe('${className}SceneModule', () => {\n  it('registers the scene module', () => {\n    expect(${className}SceneModule).toBeDefined();\n  });\n});\n`;
  return {slug,className,projectRoot,scenesRoot,target,files};
}

export function generateScene(opts) {
  const plan = planScene(opts);
  if (existsSync(plan.target)) throw new Error(`Scene already exists: ${plan.target}`);
  if (opts.dryRun) return {...plan, created:false};
  mkdirSync(plan.scenesRoot,{recursive:true});
  // Write a sibling temp tree, then publish using an atomic rename. Never modify existing scenes.
  const stage = join(plan.scenesRoot, `.tmp-${plan.slug}-${process.pid}-${Math.random().toString(36).slice(2)}`);
  try {
    mkdirSync(stage);
    for (const [path,content] of Object.entries(plan.files)) {
      const dest=join(stage,path); mkdirSync(dirname(dest),{recursive:true}); writeFileSync(dest,content,'utf8');
    }
    if (existsSync(plan.target)) throw new Error(`Scene already exists: ${plan.target}`);
    renameSync(stage,plan.target);
    syncSceneRegistry({root:opts.root,scenesDir:opts.scenesDir});
    return {...plan,created:true};
  } finally {if(existsSync(stage)) rmSync(stage,{recursive:true,force:true});}
}
export function listScenes({root, scenesDir='src/scenes'}) {
  // Reuse path validation but no generation.
  const plan=planScene({name:'placeholder',root,scenesDir,parts:[]});
  if(!existsSync(plan.scenesRoot)) return [];
  return readdirSync(plan.scenesRoot,{withFileTypes:true}).filter(x=>x.isDirectory()&&!x.name.startsWith('.')).map(x=>x.name).filter(name=>existsSync(join(plan.scenesRoot,name,`${name}.module.ts`))).sort();
}

/** CLI compatibility; Next.js normally calls discovery automatically through withThreeShell. */
export { syncSceneRegistry };
