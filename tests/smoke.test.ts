import { describe, it, expect } from "vitest"

import { Simulator, Battle } from "../index"

import battleJson from "./v2+carrier+support+aerial+night.json"
import injectionKoukuJson from "./api_injection_kouku.json"
import airBaseInjectionJson from "./api_air_base_injection.json"

import {
  oracleOpeningTorpedoWithLens,
  oracleNightHougekiFriend,
  oracleFriendlyNightShelling,
} from "./oracle/packet-oracle"

function stageAttacksByType(sim: any, type: string) {
  const stages = Array.isArray(sim?.stages) ? sim.stages : []
  const stage = stages.find((s: any) => s && s.type === type)
  return Array.isArray(stage?.attacks) ? stage.attacks : []
}

function stageAttacksByTypeSubtype(sim: any, type: string, subtype: string) {
  const stages = Array.isArray(sim?.stages) ? sim.stages : []
  const stage = stages.findLast((s: any) => s && s.type === type && s.subtype === subtype)
  return Array.isArray(stage?.attacks) ? stage.attacks : []
}

function summarizeTorpedoAttack(atk: any) {
  return {
    // Simulator Ship.pos is 1-based for our side. Keep it stable in tests.
    fromPos: atk?.fromShip?.pos ?? null,
    // Enemy Ship.pos is 0-based with a null sentinel at index 0.
    toPos: atk?.toShip?.pos ?? null,
    damage: Array.isArray(atk?.damage) ? atk.damage.map((x: any) => Math.floor(x)) : [],
    hit: Array.isArray(atk?.hit) ? atk.hit.map((x: any) => Math.floor(x)) : [],
  }
}

function summarizeShellingAttack(atk: any) {
  return {
    fromPos: atk?.fromShip?.pos ?? null,
    toPos: atk?.toShip?.pos ?? null,
    damage: Array.isArray(atk?.damage) ? atk.damage.map((x: any) => Math.floor(x)) : [],
    hit: Array.isArray(atk?.hit) ? atk.hit.map((x: any) => Math.floor(x)) : [],
  }
}

function enemyPosFromIndex(sim: any, idx: number) {
  if (idx !== 0) return idx
  const enemy0 = Array.isArray(sim?.enemyFleet) ? sim.enemyFleet[0] : null
  return enemy0 ? 0 : null
}

function fromOracleTorpedo(sim: any, oracleAtk: any) {
  const fromPos = oracleAtk.from.side === "friend" ? oracleAtk.from.index + 1 : oracleAtk.from.index
  // For opening torpedo, api_frai target index matches enemy Ship.pos (0-based with null sentinel at 0).
  const toPos = oracleAtk.to.side === "enemy" ? enemyPosFromIndex(sim, oracleAtk.to.index) : oracleAtk.to.index + 1
  return { fromPos, toPos, damage: oracleAtk.damage, hit: oracleAtk.cl }
}

function fromOracleShelling(sim: any, oracleAtk: any) {
  return {
    // api_at_list is 0-based with -1 sentinel; Ship.pos is 1-based for our side.
    fromPos: oracleAtk.from.index + 1,
    toPos: enemyPosFromIndex(sim, oracleAtk.to.index),
    damage: oracleAtk.damage,
    hit: oracleAtk.cl,
  }
}

function fromOracleFriendlyShelling(sim: any, oracleAtk: any) {
  return {
    // Friend fleet Ship.pos is 0-based in simulator (_initEnemy), so keep it.
    fromPos: oracleAtk.from.index,
    toPos: enemyPosFromIndex(sim, oracleAtk.to.index),
    damage: oracleAtk.damage,
    hit: oracleAtk.cl,
  }
}

describe("smoke", () => {
  it("simulates a captured battle without throwing", () => {
    const battleData: any = battleJson
    const battle = new Battle(battleData)
    expect(() => Simulator.auto(battle, { usePoiAPI: false })).not.toThrow()
  })

  it("api_opening_atack torpedo matches packet oracle", () => {
    const battleData: any = airBaseInjectionJson
    const battle = new Battle(battleData)
    const sim = Simulator.auto(battle, { usePoiAPI: false }) as any
    const oracle = oracleOpeningTorpedoWithLens((airBaseInjectionJson as any).packet?.[0], {
      friendLen: Array.isArray(sim.mainFleet) ? sim.mainFleet.length : undefined,
      enemyLen: Array.isArray(sim.enemyFleet) ? sim.enemyFleet.length : undefined,
    })
    expect(oracle).toBeTruthy()

    const torpedoAttacks = stageAttacksByTypeSubtype(sim, "Torpedo", "Opening")
    const actual = torpedoAttacks
      .filter((a: any) => Array.isArray(a?.damage) && a.damage.some((d: any) => typeof d === "number" && d > 0))
      .map(summarizeTorpedoAttack)

    const expected = (oracle!.attacks || [])
      .filter((a: any) => Array.isArray(a?.damage) && a.damage.some((d: any) => typeof d === "number" && d > 0))
      .map((a: any) => fromOracleTorpedo(sim, a))
    expect(actual).toEqual(expected)
  })

  it("api_hougeki matches packet oracle (night)", () => {
    const battleData: any = battleJson
    const battle = new Battle(battleData)
    const sim = Simulator.auto(battle, { usePoiAPI: false }) as any
    const packet = (battleJson as any).packet?.find((p: any) => p && p.api_hougeki)
    const oracleAttacks = oracleNightHougekiFriend(packet, {
      mainFleetLen: Array.isArray(sim.mainFleet) ? sim.mainFleet.length : 0,
    })
    expect(oracleAttacks.length).toBeGreaterThan(0)

    const shellingAttacks = stageAttacksByTypeSubtype(sim, "Shelling", "Night")
    const actual = shellingAttacks.filter(Boolean).map(summarizeShellingAttack)
    const expected = oracleAttacks.map((a: any) => fromOracleShelling(sim, a))
    expect(actual).toEqual(expected)
  })

  it("api_friendly_battle.api_hougeki matches packet oracle (night)", () => {
    // Use battle-detail fixture so we have friendly info + night.
    const fs = require("node:fs")
    const zlib = require("node:zlib")
    const p = "tests/fixtures/battle-detail/features/friendly_info/1584729348536.json.gz"
    const json: any = JSON.parse(zlib.gunzipSync(fs.readFileSync(p)).toString("utf8"))
    const battle = new Battle(json)
    const sim = Simulator.auto(battle, { usePoiAPI: false }) as any
    const packet = (json as any).packet?.find((x: any) => x && x.api_friendly_battle)
    const oracle = oracleFriendlyNightShelling(packet)
    expect(oracle).toBeTruthy()

    // Friendly attacks are simulated as a separate Night shelling stage.
    const friendlyStage = (sim.stages || []).find((s: any) => {
      if (!s || s.type !== "Shelling" || s.subtype !== "Night") return false
      const attacks = Array.isArray(s.attacks) ? s.attacks : []
      return attacks.some((a: any) => a?.fromShip?.owner === "Friend")
    })
    const friendlyAttacks = Array.isArray(friendlyStage?.attacks)
      ? friendlyStage.attacks.filter((a: any) => a?.fromShip?.owner === "Friend")
      : []

    const actual = friendlyAttacks.filter(Boolean).map(summarizeShellingAttack)
    const expected = (oracle!.attacks || []).map((a: any) => fromOracleFriendlyShelling(sim, a))
    expect(actual).toEqual(expected)
  })

  it("simulates injection kouku battle without throwing", () => {
    const battleData: any = injectionKoukuJson
    const battle = new Battle(battleData)
    expect(() => Simulator.auto(battle, { usePoiAPI: false })).not.toThrow()
  })

  it("simulates air base injection battle without throwing", () => {
    const battleData: any = airBaseInjectionJson
    const battle = new Battle(battleData)
    expect(() => Simulator.auto(battle, { usePoiAPI: false })).not.toThrow()
  })
})
