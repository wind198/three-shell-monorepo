#!/usr/bin/env node
import { resolve } from 'node:path';
import { generateScene, listScenes, parseParts, syncSceneRegistry } from '../src/generator.mjs';

function usage() {
  return `ThreeShell scene generator\n\nUsage:\n  three-shell-scene new <name> [--root <project>] [--scenes-dir <relative>] [--with operators,entities,state,assets,tests] [--dry-run] [--json]\n  three-shell-scene sync [--root <project>] [--scenes-dir <relative>] [--dry-run] [--json]\n  three-shell-scene list [--root <project>] [--scenes-dir <relative>] [--json]\n\nDefaults: --root cwd, --scenes-dir src/scenes, --with operators\nNext.js auto-discovers scenes via withThreeShell(). JSX: <SceneView scene="name" />; no scene-specific view file is generated. No index.ts, services/ or contracts/ is generated.\n`;
}
function parse(argv) {
  const [command,name,...rest]=argv;
  if(!['new','list','sync'].includes(command)) throw new Error(usage());
  const args=(command==='list'||command==='sync')?[name,...rest].filter(x=>x!==undefined):rest;
  if(command==='new'&&(!name || name.startsWith('-')))throw new Error(usage());
  const opts={name,root:process.cwd(),scenesDir:'src/scenes',parts:['operators'],dryRun:false,json:false};
  for(let i=0;i<args.length;i++){
    const flag=args[i];
    if(['--root','--scenes-dir','--with'].includes(flag)){
      const val=args[++i];if(!val||val.startsWith('--'))throw new Error(`Missing value for ${flag}`);
      if(flag==='--root')opts.root=resolve(val);
      if(flag==='--scenes-dir')opts.scenesDir=val;
      if(flag==='--with')opts.parts=parseParts(val);
    } else if(flag==='--dry-run')opts.dryRun=true;
    else if(flag==='--json')opts.json=true;
    else throw new Error(`Unknown option: ${flag}`);
  }
  return {command,opts};
}
try {
  if(process.argv.includes('--help')||process.argv.includes('-h')){console.log(usage());process.exit(0);}
  const {command,opts}=parse(process.argv.slice(2));
  if(command==='sync'){
    const result=syncSceneRegistry(opts);
    console.log(opts.json?JSON.stringify({output:result.output,scenes:result.scenes},null,2):`${result.created?'Generated':'Dry run'} ${result.output} (${result.scenes.length} scenes)`);
  } else if(command==='list'){
    const scenes=listScenes(opts);
    console.log(opts.json?JSON.stringify({scenes},null,2):scenes.join('\n')||'(no scenes)');
  }else{
    const result=generateScene(opts);
    const summary={name:result.className,location:result.target,created:result.created,files:Object.keys(result.files)};
    console.log(opts.json?JSON.stringify(summary,null,2):`${result.created?'Created':'Dry run'} ${result.className}SceneModule at ${result.target}\n${summary.files.map(f=>'  '+f).join('\n')}`);
  }
} catch(error){console.error(error.message);process.exitCode=1;}
