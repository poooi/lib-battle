# AI Agent Instructions

This repository is a small library package. Keep changes minimal and non-breaking.

## Project Overview

- Language: TypeScript (migrated from legacy `.es` files)
- Package manager: npm
- Linting: ESLint v9 (flat config)
- Build: `tsc` compiles `.ts` to `.js` and emits `.d.ts` next to sources

## Repo Structure (Do Not Restructure)

- Keep source files in the repo root (no `src/` move).
- Extension changes are OK (e.g. `*.es` -> `*.ts`).

Current main sources:

- `index.ts`
- `packet.ts`
- `simulator.ts`

## TypeScript Migration Guidelines

- Prefer incremental migration; avoid large refactors.
- Add types where easy; otherwise use `unknown` and narrow at runtime.
- Avoid `any` when practical; prefer precise types or `unknown` + narrowing.
- Avoid dangerous double assertions like `as unknown as T`.
- Treat `as` as a last resort: if you must assert, keep the asserted surface area small (assert a single field at the boundary, not an entire payload).
- Prefer small runtime guards over assertions: `typeof`, `Array.isArray`, `in`, null checks, `Number.isFinite`.
- Push typing to the boundary (inputs/outputs) so internal logic can stay strongly typed.
- Keep public exports stable (especially `index.ts` exports).
- `types` entry in `package.json` points to `index.d.ts` in the repo root.

## kcsapi Types (When Applicable)

This repo can use the `kcsapi` package for KanColle API payload typings.

- Check `kcsapi` exports before defining custom types.
- Some endpoints return arrays in practice even if `kcsapi` exports an element type; type the real shape (e.g. `T[]`) and leave a short note.
- If an endpoint/type is missing in `kcsapi`, define a small local type with a `FIXME` comment so it can be upstreamed later.

## API Documentation (Where To Look)

- Packet format docs in this repo: `docs/packet-format-2.1.md`, `docs/packet-format-2.0.md`, `docs/packet-format-1.md`.
- Canonical payload shapes: `kcsapi` package types.
- Battle rules notes (external, used by existing code): `https://raw.githubusercontent.com/andanteyk/ElectronicObserver/refs/heads/master/ElectronicObserver/Other/Information/apilist.txt`.

## Build Outputs

- Build command: `npm run build`
- Generated artifacts (`*.js`, `*.d.ts`, `*.js.map`, `*.tsbuildinfo`) are treated as build outputs.
- Do not commit generated artifacts.

## Linting

- Lint command: `npm run lint`
- Use the repo's ESLint config: `eslint.config.cjs`.
- It is acceptable if legacy code doesn't fully satisfy lint rules during migration; prefer fixing opportunistically.

## Testing

- No formal test runner is configured in this repo today.
- If you add tests in the future, keep them lightweight and avoid introducing heavy frameworks unless requested.

### Typing In Tests

- Avoid `as unknown as` in tests; prefer assigning fixtures to a typed variable or using `satisfies`.
- If a test intentionally constructs an invalid payload to hit a guard branch, prefer `@ts-expect-error <reason>` on the specific invalid field.

### Game API Fixture Tests (When Applicable)

- Prefer tests built from real response-saver payload JSONs with shape `{ method, path, body, postBody, time }`.
- Keep fixtures byte-for-byte comparable with the original capture (no reformatting/minifying).
- Fixture naming: prefer behavior-first names (reflect the scenario/branch/result, not just the endpoint).

### Response-Saver Fixtures (When Applicable)

- Response-saver capture location is machine-specific; ask the user if you need it.
- When adding a fixture, copy the response-saver JSON into the repo unchanged (byte-for-byte; do not reformat).

## Hygiene / Safety

- Avoid committing secrets.
- Do not include user-specific absolute paths in commit messages, PR text, or docs.

## Conversation Context Marker

- Append the exact phrase `This is Chiba assisting` to every assistant response.
- If that phrase is missing, treat it as a context-loss signal and re-load `AGENTS.md` into the working context.
