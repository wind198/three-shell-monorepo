import { describe, expect, it } from 'vitest';
import { Container, Injectable, Inject, SceneModule } from '../src';

@Injectable() class Counter {
  value = 0;
  onSceneInit() { this.value = 7; }
  onSceneDestroy() { this.value = -1; }
}
@Injectable() class Consumer { constructor(readonly counter: Counter) {} }
@SceneModule({ providers: [Counter], exports: [Counter] }) class CounterModule {}
@SceneModule({ imports: [CounterModule], providers: [Consumer] }) class AppModule {}

describe('automatic constructor injection', () => {
  it('infers types and honors imported exports and singleton instances', async () => {
    const c = new Container(AppModule);
    await c.initialize();
    const consumer = c.resolve(Consumer);
    expect(consumer.counter.value).toBe(7);
    expect(consumer.counter).toBe(c.resolve(Counter));
    await c.destroy();
    expect(consumer.counter.value).toBe(-1);
  });
  it('honors token overrides for abstract/host parameters', async () => {
    const HOST = Symbol('host');
    @Injectable() class HostConsumer {
      constructor(@Inject(HOST) readonly host: { node: string }) {}
    }
    @SceneModule({providers:[HostConsumer]}) class HostModule {}
    const host = {node:'canvas'};
    const c = new Container(HostModule, [{provide:HOST,useValue:host}]);
    await c.initialize();
    expect(c.resolve(HostConsumer).host).toBe(host);
    await c.destroy();
  });
  it('rejects missing imported exports', () => {
    @SceneModule({providers:[Counter]}) class PrivateModule {}
    @SceneModule({imports:[PrivateModule],providers:[Consumer]}) class BadModule {}
    expect(() => new Container(BadModule).resolve(Consumer)).toThrow(/not visible/);
  });
  it('rejects duplicate provider registrations', () => {
    @SceneModule({providers:[Counter,Counter]}) class Duplicate {}
    expect(() => new Container(Duplicate)).toThrow(/Duplicate provider/);
  });
  it('rejects circular constructor dependencies', () => {
    @Injectable() class Alpha { constructor(@Inject('beta') readonly beta: unknown) {} }
    @Injectable() class Beta { constructor(readonly alpha: Alpha) {} }
    @SceneModule({providers:[Alpha,{provide:'beta',useClass:Beta}]}) class Cyclic {}
    expect(() => new Container(Cyclic).resolve(Alpha)).toThrow(/Circular provider/);
  });
  it('rejects interface injection without @Inject', () => {
    @Injectable() class Bad { constructor(readonly options: {foo:string}) {} }
    @SceneModule({providers:[Bad]}) class BadModule {}
    expect(() => new Container(BadModule).resolve(Bad)).toThrow(/Cannot infer/);
  });
  it('rejects undecorated providers instead of silently constructing without arguments', () => {
    class Bad { constructor(readonly counter: Counter) {} }
    @SceneModule({providers:[Counter,Bad]}) class BadModule {}
    expect(() => new Container(BadModule).resolve(Bad)).toThrow(/@Injectable/);
  });
});
