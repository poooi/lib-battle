# TypeScript Migration Plan

This repository is a small library package. The goal of the migration is to
incrementally improve type-safety without breaking the public API or changing
the repo structure.

## Current State

- Main sources live in the repo root: `index.ts`, `packet.ts`, `simulator.ts`.
- `packet.ts` and `simulator.ts` currently use `// @ts-nocheck`.
- Build uses `tsc` and emits JS + `.d.ts` next to sources.
- Tests/fixtures exist under `tests/*.json` but there are no test files yet.

## Non-Goals / Constraints

- Do not move code into `src/` or create a new build output directory.
- Keep public exports stable (`index.ts` must continue to re-export as today).
- Avoid large refactors; prefer small, reviewable changes.

## Typing Principles

- Prefer `unknown` at the boundary + runtime narrowing over `any`.
- Avoid `as unknown as T` and broad assertions over entire payloads.
- If an API payload type exists in `kcsapi`, use it. If not, add a small local
  type with a `FIXME` so it can be upstreamed.
- When the real payload shape differs from `kcsapi` (arrays vs element types,
  optional keys, etc.), model the real shape and leave a short note.

## Where The Types Come From

- Packet format docs: `docs/packet-format-2.1.md`, `docs/packet-format-2.0.md`,
  `docs/packet-format-1.md`.
- Canonical API payload types: `kcsapi`.
- Battle rules notes used in logic: `kcmemo.md` in ElectronicObserver.

## Migration Steps

### Phase 0: Keep Green Baseline

Goal: keep `npm run build`, `npm run lint`, and `npm test` passing while typing
is incrementally improved.

- Keep `strict: false` for now.
- Add/keep minimal global declarations needed for `window` usage.

### Phase 1: Type The Public Model Layer (`packet.ts`)

Goal: remove `// @ts-nocheck` from `packet.ts` first.

Approach:

- Convert the current class-style models to typed constructors without changing
  runtime behavior.
- Add explicit types for:
  - `Battle`, `Fleet`, `Stage`, `Attack`, `Ship`, `Result`
  - string/number enums (`StageType`, `AttackType`, `Rank`, etc.)
- Use narrow utility types (e.g. `ReadonlyArray<number | null>`) where it makes
  intent clear, but avoid heavy refactors.

Deliverable:

- `packet.ts` compiles with TS checking enabled (no `@ts-nocheck`).

### Phase 2: Type Boundary Inputs To The Simulator (`simulator.ts`)

Goal: keep the simulator internals mostly unchanged, but type the key entry
points so internal code can be gradually tightened.

Work items:

- Define a minimal `PoiPacket` boundary type for what this repo reads from a
  captured/poi-provided packet:
  - `poi_path: string`
  - `poi_slot`, `poi_slot_ex` usage
  - the subset of `api_*` keys accessed in `simulate()`, `prepare()`, `prcsDay()`,
    `prcsNight()`, `prcsResult()`.
- Prefer composing the boundary type from `kcsapi` endpoint response types when
  available; otherwise, define local minimal shapes as `unknown` + guards.
- Replace the most error-prone implicit assumptions with small runtime guards
  (null checks, `Array.isArray`, `typeof === 'number'`, etc.).

Deliverable:

- `Simulator2.simulate(packet)` takes a typed `packet` (even if parts are
  `unknown`), and `@ts-nocheck` is removed or narrowed to a smaller region.

### Phase 3: Remove Global `window` Assumptions

Goal: avoid indexing `unknown` globals unsafely.

- Replace `window.$ships` and `window.$slotitems` uses with narrow helper
  functions that validate shape at access-time.
- Keep the global declarations permissive, but localize assertions.

Deliverable:

- All `window.$ships[...]` / `window.$slotitems[...]` reads go through a small
  typed helper (runtime-safe).

### Phase 4: Tighten Internals Opportunistically

Goal: eliminate common bug classes without rewriting the simulator.

- Add types to frequently used helpers:
  - `damageShip`, `preventNullObject`, `simulateShelling`, `simulateTorpedo*`
- Replace ambiguous values (`-1`, `null`, `undefined`) with explicit unions
  where low-risk.
- Add focused tests around tricky branches using the existing fixtures.

Deliverable:

- Simulator logic remains equivalent, but has stronger types and fewer implicit
  assumptions.

### Phase 5 (Optional): Consider Enabling `strict`

Only after Phases 1-4 have landed and the surface area is typed.

- Enable `strict` gradually (or selectively via `tsconfig` options) and fix
  remaining hotspots.

## Test Strategy (Lightweight)

- Add smoke tests that load fixtures from `tests/*.json` and ensure the parser
  + simulator do not throw.
- Prefer invariants over deep snapshot tests (e.g. stage count, rank enum value,
  or “result exists after battleresult packet”).
- Keep fixtures byte-for-byte unchanged.

## Definition Of Done

- No `@ts-nocheck` in `packet.ts` or `simulator.ts`.
- Build/lint/tests pass.
- Public exports unchanged from the user's perspective.
