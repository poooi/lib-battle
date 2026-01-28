# lib-battle

Battle simulation library used by poi.

## Tests

### Real-data fixtures (poi battle-detail)

This repo includes a curated set of real `battle-detail` captures from poi.
They are already in the `Battle` JSON format this library consumes (V2.0/V2.1),
just gzipped.

Fixture layout (folder groups):

- `tests/fixtures/battle-detail/bulk/recent/`
  - Representative baseline slice (recent captures at copy time).
  - Purpose: broad regression coverage over the most common flows.
  - This is the default bucket for fixtures that aren't deliberately curated
    into a feature folder.
- `tests/fixtures/battle-detail/combined/each_battle+ec_midnight_battle/`
  - Combined fleet day battle + ec midnight battle.
- `tests/fixtures/battle-detail/combined/midnight_battle/`
  - Combined fleet night battle.
- `tests/fixtures/battle-detail/sortie/ld_airbattle/`
  - Land-base air raid battles (air-raid rank rules).
- `tests/fixtures/battle-detail/features/friendly_info/`
  - Captures including `api_friendly_info`.
- `tests/fixtures/battle-detail/features/air_base_attack/`
  - Captures including `api_air_base_attack`.
- `tests/fixtures/battle-detail/features/injection_kouku/`
  - Captures including `api_injection_kouku`.

Tests in `tests/battle-detail.test.ts` run invariants over each group.
