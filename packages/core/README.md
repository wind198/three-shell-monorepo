# @three-shell/core

Engine-neutral framework core: module metadata, dependency injection, lifecycle hooks, synchronous composition and fixed-step scheduling. No Three.js, Rapier, React, or Next.js runtime dependency.

## Thin Three.js assembly helpers

The optional `@three-shell/core/assembly` subpath provides simple helpers for
imperative Three.js factories. The core scheduler and DI APIs do **not** import
Three.js; consumers of this subpath supply `three`.

```ts
import { group, place, repeat, row, add } from '@three-shell/core/assembly';

const doors = repeat(3, () => createDoor());
const frontage = row(doors, 1.5); // fixed origin-to-origin X step
const house = group('Shophouse', frontage);
add(house, place(createWindow(), 0, 2.2, 0));
```

`row` and `stack` accept explicit center-to-center/base-to-base steps,
respectively. They do not infer geometry bounds, enforce snapping, or own material
lifecycle. Each `repeat` iteration invokes the factory independently. Existing
`pipe` remains a stage-composition utility for scene operators.
