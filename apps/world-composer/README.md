# City Cross · World Composer

Standalone Next.js viewer for the reusable ThreeShell `@three-shell/world-composition` package.

## Run

From the monorepo root:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:world-composer
```

Open http://localhost:3002.

## Scope

A static, editable **city-cross** preset comprising four corner blocks, shophouse rows, crossing roads, sidewalks, crosswalks, pastel trees and lamps. Controls modify road widths, building footprints, row counts, floor counts and lighting. Choose city blocks in the scene tree to inspect bounds. Export/import a versioned `city-cross.json` document.

## Architecture

- `packages/world-composition`: typed shophouse, shophouse-row, road-cross and city-cross factories, declarative template registry and snap anchors.
- `apps/world-composer/src/scenes/city-cross`: one ThreeShell Scene module with responsibility-specific operators and state providers.
- `packages/world-assets`: source factories used for doors, windows, awnings and storefronts. The composer never modifies upstream modules.
- Only one Three.js renderer and one RAF pipeline per mounted scene. Asset materials are disposed on rebuild; shared immutable geometries are not.

This MVP is a **static composition workbench**, not a complete drag/drop city editor. Physics, traffic, pedestrians and arbitrary-node manipulation are intentionally out of scope.

## Inside Shophouse Coffee Shop

Open [http://localhost:3002/coffee-shop](http://localhost:3002/coffee-shop). A second
auto-discovered ThreeShell Scene reuses the existing renderer/camera/operator classes,
and mounts the `createInsideShophouse()` assembly from `world-composition`.
Architecture is roof-open with a cutaway right side for interior inspection.
Reusable café furniture factories live in `world-assets/src/interior/cafe.ts`.
The inspector controls table count, lounge, decorations, and lighting; the scene tree
can highlight furniture sections. No additional package or application was created.
