# SceneModule standard

A **SceneModule is one complete scene**. `CoffeeShopSceneModule` is one scene; `PhysicsOperator` is not a scene module. Use `@Module` (alias `@SceneModule` retained for compatibility) to declare the scene's DI providers and explicit exports.

## Mandatory files

```text
scenes/<scene-name>/
  <scene-name>.module.ts     # Module composition: providers, imports, exports
  <scene-name>.scene.ts      # Extends ThreeShell; explicit simulation/presentation pipelines
```

## Optional responsibility-oriented directories

| Path | Role | Rules |
|---|---|---|
| `operators/` | Cohesive classes exposing multiple pipeline methods | Methods execute in the order chosen by Scene; do not start separate frame loops |
| `entities/` | Runtime object models/identities and related types | Per-entity objects are not DI providers |
| `state/` | Persistent scene state shared across stages | One authoritative owner for each mutable value |
| `assets/` | Scene-local manifests and load policies | Actual binary assets may belong to app public storage |
| `<responsibility>/` | Precise mechanisms such as `physics/`, `navigation/`, `resources/` | Name for what it owns, not for generic type of class |
| `tests/` | Tests of scene composition and behavior | Isolate frame logic from browser when possible |

For React consumers, `@three-shell/react` exposes `createSceneView(...)`. Call the factory once in the consuming React UI module, passing a lazy scene loader; it returns a JSX component. **Do not create or generate per-scene `*.view.tsx` files**. The loader supplies runtime host tokens and the canvas container through DI. The factory handles stable mounting and forwards current props through `getProps`.

No mandatory `index.ts`, `services/`, `contracts/`, `common/`, or `types/`. Colocate types with their relevant classes. Import providers from their real paths. `@Module.exports` determines DI visibility, **not** TypeScript import access.

## DI and lifecycle

```ts
@Module({
  providers: [CoffeeShopScene, MovementOperator, SceneState],
  exports: [CoffeeShopScene],
})
export class CoffeeShopSceneModule {}
```

`@Injectable()` enables automatic constructor parameter type reflection. Interface, runtime host, or other non-class dependencies must use `@Inject(TOKEN)` with host-supplied tokens. TypeScript legacy decorators, `emitDecoratorMetadata`, and `reflect-metadata` are required. Detect missing and circular dependencies at bootstrap.

Frame scheduling belongs to the framework; rendering/physics resources belong to the scene's implementation. Initialization and destruction hooks own resource lifetime. Scene and operators never perform DI lookups per frame.

## Generator

```bash
pnpm scene:new CoffeeShop --root apps/playground-next
pnpm scene:new Warehouse --root apps/playground-next --with operators,entities,state,assets,tests
pnpm scene:new Blank --root apps/playground-next --with none --dry-run
pnpm scene:list --root apps/playground-next
```

Use `--scenes-dir` to target a different application-relative scene directory. Generator does not edit application bootstrap or existing modules; wire new scene selection explicitly. No automatic scene registration or lifecycle guessing.

## Automatic discovery in Next.js

Use `withThreeShell()` in Next config to discover scenes on dev/build startup and watch them in development. Mount with `<SceneView scene="coffee-shop" />` from the generated registry. No `scene:sync`, `predev`, or manual loader registration is required. The CLI is optional for scaffolding.
