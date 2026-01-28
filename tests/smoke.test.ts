import { describe, it, expect } from "vitest"

import { Simulator, Battle } from "../index"
import type { BattleOptions } from "../index"

import fs from "node:fs"

type Rec = Record<string, unknown>

function asRec(v: unknown): Rec | null {
  return v != null && typeof v === "object" ? (v as Rec) : null
}

function asUnknownArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

import battleJson from "./v2+carrier+support+aerial+night.json"
import injectionKoukuJson from "./api_injection_kouku.json"
import airBaseInjectionJson from "./api_air_base_injection.json"

import {
  oracleOpeningTorpedoWithLens,
  oracleNightHougekiFriend,
  oracleFriendlyNightShelling,
} from "./oracle/packet-oracle"

function stageAttacksByType(sim: unknown, type: string): unknown[] {
  const s = asRec(sim)
  const stages = asUnknownArray(s?.stages)
  const stage = stages.find((st) => asRec(st)?.type === type)
  return asUnknownArray(asRec(stage)?.attacks)
}

function stageAttacksByTypeSubtype(sim: unknown, type: string, subtype: string): unknown[] {
  const s = asRec(sim)
  const stages = asUnknownArray(s?.stages)
  for (let i = stages.length - 1; i >= 0; i--) {
    const st = stages[i]
    if (asRec(st)?.type === type && asRec(st)?.subtype === subtype) {
      return asUnknownArray(asRec(st)?.attacks)
    }
  }
  return []
}

function summarizeTorpedoAttack(atk: unknown) {
  const a = asRec(atk)
  const fromShip = asRec(a?.fromShip)
  const toShip = asRec(a?.toShip)
  const damage = asUnknownArray(a?.damage)
  const hit = asUnknownArray(a?.hit)
  return {
    // Simulator Ship.pos is 1-based for our side. Keep it stable in tests.
    fromPos: typeof fromShip?.pos === "number" ? fromShip.pos : null,
    // Enemy Ship.pos is 0-based with a null sentinel at index 0.
    toPos: typeof toShip?.pos === "number" ? toShip.pos : null,
    damage: damage.filter((x): x is number => typeof x === "number").map((x) => Math.floor(x)),
    hit: hit.filter((x): x is number => typeof x === "number").map((x) => Math.floor(x)),
  }
}

function summarizeShellingAttack(atk: unknown) {
  const a = asRec(atk)
  const fromShip = asRec(a?.fromShip)
  const toShip = asRec(a?.toShip)
  const damage = asUnknownArray(a?.damage)
  const hit = asUnknownArray(a?.hit)
  return {
    fromPos: typeof fromShip?.pos === "number" ? fromShip.pos : null,
    toPos: typeof toShip?.pos === "number" ? toShip.pos : null,
    damage: damage.filter((x): x is number => typeof x === "number").map((x) => Math.floor(x)),
    hit: hit.filter((x): x is number => typeof x === "number").map((x) => Math.floor(x)),
  }
}

function enemyPosFromIndex(sim: unknown, idx: number) {
  if (idx !== 0) return idx
  const s = asRec(sim)
  const enemy0 = asUnknownArray(s?.enemyFleet)[0]
  return enemy0 ? 0 : null
}

function fromOracleTorpedo(sim: unknown, oracleAtk: unknown) {
  const o = asRec(oracleAtk)
  const from = asRec(o?.from)
  const to = asRec(o?.to)
  const fromSide = typeof from?.side === "string" ? from.side : ""
  const toSide = typeof to?.side === "string" ? to.side : ""
  const fromIndex = typeof from?.index === "number" ? from.index : 0
  const toIndex = typeof to?.index === "number" ? to.index : 0

  const fromPos = fromSide === "friend" ? fromIndex + 1 : fromIndex
  // For opening torpedo, api_frai target index matches enemy Ship.pos (0-based with null sentinel at 0).
  const toPos = toSide === "enemy" ? enemyPosFromIndex(sim, toIndex) : toIndex + 1
  return {
    fromPos,
    toPos,
    damage: asUnknownArray(o?.damage).filter((x): x is number => typeof x === "number"),
    hit: asUnknownArray(o?.cl).filter((x): x is number => typeof x === "number"),
  }
}

function fromOracleShelling(sim: unknown, oracleAtk: unknown) {
  const o = asRec(oracleAtk)
  const from = asRec(o?.from)
  const to = asRec(o?.to)
  const fromIndex = typeof from?.index === "number" ? from.index : 0
  const toIndex = typeof to?.index === "number" ? to.index : 0
  return {
    // api_at_list is 0-based with -1 sentinel; Ship.pos is 1-based for our side.
    fromPos: fromIndex + 1,
    toPos: enemyPosFromIndex(sim, toIndex),
    damage: asUnknownArray(o?.damage).filter((x): x is number => typeof x === "number"),
    hit: asUnknownArray(o?.cl).filter((x): x is number => typeof x === "number"),
  }
}

function fromOracleFriendlyShelling(sim: unknown, oracleAtk: unknown) {
  const o = asRec(oracleAtk)
  const from = asRec(o?.from)
  const to = asRec(o?.to)
  const fromIndex = typeof from?.index === "number" ? from.index : 0
  const toIndex = typeof to?.index === "number" ? to.index : 0
  return {
    // Friend fleet Ship.pos is 0-based in simulator (_initEnemy), so keep it.
    fromPos: fromIndex,
    toPos: enemyPosFromIndex(sim, toIndex),
    damage: asUnknownArray(o?.damage).filter((x): x is number => typeof x === "number"),
    hit: asUnknownArray(o?.cl).filter((x): x is number => typeof x === "number"),
  }
}

describe("smoke", () => {
  it("simulates a captured battle without throwing", () => {
    const battleData = battleJson as unknown
    const battle = new Battle(battleData as BattleOptions)
    expect(() => Simulator.auto(battle, { usePoiAPI: false })).not.toThrow()
  })

  it("api_opening_atack torpedo matches packet oracle", () => {
    const battleData = airBaseInjectionJson as unknown
    const battle = new Battle(battleData as BattleOptions)
    const sim = Simulator.auto(battle, { usePoiAPI: false })
    const packet = asUnknownArray(asRec(airBaseInjectionJson as unknown)?.packet)[0]
    const oracle = oracleOpeningTorpedoWithLens(packet, {
      friendLen: asUnknownArray(asRec(sim)?.mainFleet).length || undefined,
      enemyLen: asUnknownArray(asRec(sim)?.enemyFleet).length || undefined,
    })
    expect(oracle).toBeTruthy()

    const torpedoAttacks = stageAttacksByTypeSubtype(sim, "Torpedo", "Opening")
    const actual = torpedoAttacks
      .filter((a) => {
        const damage = asUnknownArray(asRec(a)?.damage)
        return damage.some((d) => typeof d === "number" && d > 0)
      })
      .map(summarizeTorpedoAttack)

    const expected = asUnknownArray(oracle?.attacks)
      .filter((a) => {
        const damage = asUnknownArray(asRec(a)?.damage)
        return damage.some((d) => typeof d === "number" && d > 0)
      })
      .map((a) => fromOracleTorpedo(sim, a))
    expect(actual).toEqual(expected)
  })

  it("api_hougeki matches packet oracle (night)", () => {
    const battleData = battleJson as unknown
    const battle = new Battle(battleData as BattleOptions)
    const sim = Simulator.auto(battle, { usePoiAPI: false })
    const packet = asUnknownArray(asRec(battleJson as unknown)?.packet).find((p) => asRec(p)?.api_hougeki != null)
    const oracleAttacks = oracleNightHougekiFriend(packet, {
      mainFleetLen: asUnknownArray(asRec(sim)?.mainFleet).length,
    })
    expect(oracleAttacks.length).toBeGreaterThan(0)

    const shellingAttacks = stageAttacksByTypeSubtype(sim, "Shelling", "Night")
    const actual = shellingAttacks.filter(Boolean).map(summarizeShellingAttack)
    const expected = oracleAttacks.map((a) => fromOracleShelling(sim, a))
    expect(actual).toEqual(expected)
  })

  it("api_friendly_battle.api_hougeki matches packet oracle (night)", () => {
    // Use battle-detail fixture so we have friendly info + night.
    const p = "tests/fixtures/battle-detail/features/friendly_info/1584729348536.json"
    const json = JSON.parse(fs.readFileSync(p, "utf8")) as unknown
    const battle = new Battle(json as BattleOptions)
    const sim = Simulator.auto(battle, { usePoiAPI: false })
    const packet = asUnknownArray(asRec(json)?.packet).find((x) => asRec(x)?.api_friendly_battle != null)
    const oracle = oracleFriendlyNightShelling(packet)
    expect(oracle).toBeTruthy()

    // Friendly attacks are simulated as a separate Night shelling stage.
    const stages = asUnknownArray(asRec(sim)?.stages)
    const friendlyStage = stages.find((st) => {
      const r = asRec(st)
      if (r?.type !== "Shelling" || r?.subtype !== "Night") return false
      const attacks = asUnknownArray(r?.attacks)
      return attacks.some((a) => asRec(asRec(a)?.fromShip)?.owner === "Friend")
    })
    const friendlyAttacks = asUnknownArray(asRec(friendlyStage)?.attacks).filter(
      (a) => asRec(asRec(a)?.fromShip)?.owner === "Friend",
    )

    const actual = friendlyAttacks.filter(Boolean).map(summarizeShellingAttack)
    const expected = asUnknownArray(oracle?.attacks).map((a) => fromOracleFriendlyShelling(sim, a))
    expect(actual).toEqual(expected)
  })

  it("simulates injection kouku battle without throwing", () => {
    const battleData = injectionKoukuJson as unknown
    const battle = new Battle(battleData as BattleOptions)
    expect(() => Simulator.auto(battle, { usePoiAPI: false })).not.toThrow()
  })

  it("simulates air base injection battle without throwing", () => {
    const battleData = airBaseInjectionJson as unknown
    const battle = new Battle(battleData as BattleOptions)
    expect(() => Simulator.auto(battle, { usePoiAPI: false })).not.toThrow()
  })
})
