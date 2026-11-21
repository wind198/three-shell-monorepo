import {it,expect} from 'vitest';
import {pipe} from '../src';
it('preserves order and shared context',()=>{
 const ctx={value:1};
 pipe<typeof ctx>(x=>{x.value+=2;},x=>{x.value*=3;})(ctx);
 expect(ctx.value).toBe(9);
});
