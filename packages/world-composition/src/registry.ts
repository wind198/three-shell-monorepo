import * as THREE from 'three';
import type { CompositionNode, AssemblyFactory } from './types';
import { applyTransform } from './anchors';
import { createShophouse, createShophouseRow } from './assemblies/shophouse';
import { createSidewalkSegment } from './assemblies/sidewalk';
import { createRoadCross } from './assemblies/road-cross';
import { createCityCross } from './assemblies/city-cross';

/** Template registry resolves serialized nodes to factory-created THREE.Group assemblies. */
export class CompositionRegistry {
  private readonly factories = new Map<string, AssemblyFactory<any>>();
  register<T>(template: string, factory: AssemblyFactory<T>): this {
    if (!template || this.factories.has(template)) throw new Error('Duplicate/invalid template: '+template);
    this.factories.set(template,factory);
    return this;
  }
  compose(node: CompositionNode): THREE.Group {
    const factory = this.factories.get(node.template);
    if (!factory) throw new Error('Unknown composition template: '+node.template);
    const group = factory(node.props);
    group.name = node.id;
    group.userData.template = node.template;
    group.userData.nodeId = node.id;
    return applyTransform(group,node.transform);
  }
}
export function createDefaultRegistry(): CompositionRegistry {
  return new CompositionRegistry()
    .register('shophouse',createShophouse)
    .register('shophouse-row',createShophouseRow)
    .register('sidewalk-segment',createSidewalkSegment)
    .register('road-cross',createRoadCross)
    .register('city-cross',createCityCross);
}
