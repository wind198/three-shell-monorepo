# ThreeShell architecture

- **Core (`packages/core`)**: module-scoped DI, provider lifecycle, `ThreeApplication`, `ThreeShell`, synchronous `pipe`, fixed-step `SimulationRuntime`. No Three.js, physics or React dependency.
- **Scene (`apps/*/src/scenes/<slug>`)**: one scene module; a thin scene orchestrator declares fixed-step simulation and presentation ordering through named operator methods.
- **Operators (`operators/`)**: stateless, responsibility-named capability classes. They perform effects and update state but do not own mutable runtime state or run independent animation loops.
- **State (`state/`)**: scene-owned mutable objects, registries, graphics/physics resources and their cleanup. Provider lifecycle hooks initialize and dispose resources safely.
- **Entities (`entities/`)**: per-object interfaces, runtime models and object-local behavior.
- **Host**: browser/React/Next adapters supply mount tokens and start or stop the animation host. The consuming app owns its rendering/physics implementations.

## Dependency direction

```text
SceneModule -> Scene -> Operators -> State -> Entities
                   \                /
                    -> State (animation host binding)
```

This is a conceptual responsibility flow, not a restriction that entities cannot reference engine types. Operators may depend directly on entity types. Implementation details belong inside operators/state and do not create top-level directories such as `resources/` or `physics/`.

## Demo

`demo.module.ts` registers the scene and its capability/state providers. `demo.scene.ts` only wires operator calls, timing, animation host and error delegation. `state/scene.state.ts` owns graphics resources; `state/physics.state.ts` owns Rapier; `state/entity.registry.ts` maintains objects; `state/metrics.state.ts` stores reporting counters. Spawning, physics, camera, rendering and metrics remain stateless operators.

## React / Next discovery

`@three-shell/react` provides `createSceneView` and `SceneView`. `@three-shell/next` discovers scene modules at dev/build time with `withThreeShell()` and generates `src/scenes/.generated/registry`. Consumers render `<SceneView scene="demo" />`; per-scene JSX wrappers are unnecessary.
