# TypeScript Migration Plan

This repository is a small library package. The goal of the migration is to
incrementally improve type-safety without breaking the public API or changing
the repo structure.

## Current State

- Main sources live in the repo root: `index.ts`, `packet.ts`, `simulator.ts`.
- `packet.ts` and `simulator.ts` currently use `// @ts-nocheck`.
- Build uses `tsc` and emits JS + `.d.ts` next to sources.
- Tests exist (vitest) and fixtures live under `tests/*.json`.

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

## Execution Checklist (Keep In Sync)

This section is the step-by-step execution order. Update it as changes land so
progress can be repicked from the plan.

- [x] Sync branch and confirm baseline (pushed `aafa702` to `origin/ts`)
- [x] Hygiene: stop tracking build outputs (commit `cbb9b5c` removed tracked `index.js`)
- [ ] Phase 1: type the public model layer (`packet.ts`) and remove `// @ts-nocheck` (in progress: Battle/Fleet typed; remaining models live in `simulator.ts`)
- [ ] Phase 2: type simulator boundary inputs (`simulator.ts`) and narrow/remove `// @ts-nocheck`
- [ ] Phase 3: remove global `window` assumptions via guarded helpers (in progress: $ships/$slotitems accessors)
- [x] Phase 4a: add vitest smoke tests for existing repo fixtures (in progress: expanded to multiple fixtures; still needs invariants)
- [ ] Phase 4b: add response-saver fixture ingestion + invariant-based tests (planned; see Test Strategy)
- [ ] Phase 5 (optional): consider enabling `strict`

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

- Keep the existing smoke tests, but do not treat them as sufficient coverage.

### Goal: Cover All Code With Real Data

The long-term goal is high behavioral coverage driven by real response-saver captures.
Because we do not want fragile golden snapshots, the plan is to scale fixtures and
assert invariants + a few canonical outcomes.

Planned work items:

- Add a response-saver fixture loader for tests.
  - Input fixture format: `{ method, path, body, postBody, time }` (response-saver JSON).
  - Convert a sequence of response-saver events into a `Battle` packet (V2.0/V2.1):
    - `packet[i].poi_path = path`
    - `packet[i].poi_time = time`
    - spread `body.api_*` into the packet item
    - stitch required `battle.fleet` data using captured `api_port/port` + `api_get_member/*` where available.
  - Store copied fixtures in-repo under `tests/fixtures/response-saver/...`.
  - Copy fixtures byte-for-byte (no reformatting/minifying).
  - Do not record machine-specific absolute paths in the repo.

- Add invariant-based assertions per simulated battle.
  - Structural: stages array exists; each `Attack` has consistent `fromHP/toHP` when present.
  - HP: `0 <= nowHP <= maxHP`; no `NaN`; no positive damage healing.
  - Targeting: invalid indices should be ignored (no throws).
  - Result: when a `battleresult` packet exists, `result` stage exists and rank parses.

- Scale coverage by adding many fixtures rather than deep expected-output snapshots.
  - Organize fixtures by scenario/endpoint: combined fleet, air raid, night only, land base, friendly fleet, etc.
  - When a fixture hits a bug/branch, add the fixture first, then minimal guards.

### Expected Output Without Losing Baseline

Pure golden snapshots of the simulator output are dangerous: if the simulator is the
only source of truth, the “baseline” becomes whatever the current implementation
produces, and refactors can silently change behavior.

Instead, for a subset of curated fixtures, expected outputs should be derived from an
independent oracle embedded in the input packets themselves.

Approach:

- Use the fixture's `battle.packet[*]` fields (KanColle API truth) as the oracle.
- Implement test-side "packet oracles" that parse raw `api_*` structures into a
  canonical minimal representation.
  - Stage presence/order: infer from which keys exist (`api_kouku`,
    `api_air_base_attack`, `api_opening_taisen`, `api_opening_atack`,
    `api_hougeki1/2/3`, `api_raigeki`, `api_hougeki` (night),
    `api_friendly_battle.api_hougeki`, etc.).
  - Attack lists per phase: attacker/defender indices + per-hit damage + crit flags,
    parsed directly from API fields.
    - Shelling: `api_hougeki*` (`api_at_list`, `api_df_list`, `api_damage`, `api_cl_list`, `api_sp_list`)
    - Torpedo: `api_raigeki` and opening forms (`api_frai/api_fydam/api_fcl`, `api_erai/api_eydam/api_ecl`, and list variants)
    - Aerial/LBAC: stage3 damage arrays and flags under `api_kouku` / `api_air_base_attack[*]`
    - Result: `api_win_rank` from `battleresult` when present
- Compare simulator output to oracle output per phase.
  - Stage order/type/subtype match
  - Attack counts match per phase
  - Attacker/target indices match
  - Damage arrays match (with the API's encoded rounding, not simulator-specific rounding)

This keeps the baseline stable across refactors because expected values are computed
from immutable fixture contents, not from the simulator implementation.

- Optional later: add coverage reporting (e.g. v8) to track progress quantitatively.

## Definition Of Done

- No `@ts-nocheck` in `packet.ts` or `simulator.ts`.
- Build/lint/tests pass.
- Public exports unchanged from the user's perspective.
