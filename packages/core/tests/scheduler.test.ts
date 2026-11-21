import {describe,it,expect} from 'vitest';
import {SimulationRuntime,pipe, type FrameContext} from '../src';
function fixture(){
  const calls:string[]=[];
  const frame:FrameContext={dt:0,frameDelta:0,frameId:0,simulationTick:0,alpha:0};
  const runtime=new SimulationRuntime(frame,{fixedDelta:.02,maxFrameDelta:.1,maxStepsPerFrame:3,
    simulation:pipe(ctx=>calls.push(`physics:${ctx.simulationTick}`)),
    presentation:pipe(ctx=>calls.push(`render:${ctx.frameId}`))});
  return {runtime,frame,calls};
}
describe('fixed-step scheduler',()=>{
  it('runs two simulation steps followed by a presentation stage',()=>{
    const {runtime,frame,calls}=fixture();runtime.start();runtime.tick(0);runtime.tick(50);
    expect(calls).toEqual(['render:1','physics:1','physics:2','render:2']);
    expect(frame.alpha).toBeCloseTo(.5);
  });
  it('caps catch-up and discards excess',()=>{
    const {runtime,frame}=fixture();runtime.start();runtime.tick(0);runtime.tick(5000);expect(frame.simulationTick).toBe(3);
  });
  it('pauses simulation, keeps presentation, resumes without jumps',()=>{
    const {runtime,frame}=fixture();runtime.start();runtime.tick(0);runtime.pause();runtime.tick(1000);
    expect(frame.simulationTick).toBe(0);expect(frame.frameId).toBe(2);
    runtime.resume();runtime.tick(1500);runtime.tick(1520);expect(frame.simulationTick).toBe(1);
  });
  it('halts after a stage fails',()=>{
    const {runtime}=fixture();runtime.start();runtime.tick(0);
    const f:FrameContext={dt:0,frameDelta:0,frameId:0,simulationTick:0,alpha:0};
    const broken=new SimulationRuntime(f,{simulation:()=>{throw Error('fail');},presentation:()=>{}});
    broken.start();broken.tick(0);expect(()=>broken.tick(20)).toThrow('fail');expect(broken.isRunning).toBe(false);
  });
});
