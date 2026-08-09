import { describe, it, expect } from "vitest"

import fs from "node:fs"

import { Battle, Simulator, Rank } from "../index"
import type { BattleOptions } from "../index"

type Rec = Record<string, unknown>

// Real capture: 5 enemies, the last two have their HP hidden by the game
// (api_e_(max|now)hps = [48, 48, 48, 'N/A', 'N/A']). Every enemy with a real HP
// is sunk and nothing is lost, and the game itself reported api_win_rank 'S'.
const FIXTURE = "tests/fixtures/battle-detail/features/hidden_enemy_hp/1786147087380.json"

function loadBattle(opts: { dropResult?: boolean } = {}) {
  const json = JSON.parse(fs.readFileSync(FIXTURE, "utf8")) as Rec
  const packets = (json.packet as Rec[]).filter(
    (p) => !(opts.dropResult === true && String(p.poi_path).endsWith("battleresult")),
  )
  return new Battle({ ...json, packet: packets } as BattleOptions)
}

describe("enemy with hidden HP", () => {
  it("simulates an S victory when every enemy with known HP is sunk", () => {
    // Without the battleresult packet the rank comes from the simulator.
    const sim = Simulator.auto(loadBattle({ dropResult: true }), { usePoiAPI: false })
    expect(sim?.result.rank).toBe(Rank.S)
  })

  it("agrees with the rank reported by the game", () => {
    const sim = Simulator.auto(loadBattle(), { usePoiAPI: false })
    expect(sim?.result.rank).toBe(Rank.S)
  })

  it("flags the hidden HP enemies and keeps their raw HP", () => {
    const sim = Simulator.auto(loadBattle(), { usePoiAPI: false })
    const enemies = sim?.enemyFleet?.filter((s) => s != null) ?? []
    expect(enemies.map((s) => s.hpUnknown)).toEqual([false, false, false, true, true])
    expect(enemies[3]?.nowHP).toBe("N/A")
    expect(enemies[4]?.maxHP).toBe("N/A")
  })
})
