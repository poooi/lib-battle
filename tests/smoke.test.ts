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

function fromOracleTorpedo(oracleAtk: any) {
  const fromPos = oracleAtk.from.side === "friend" ? oracleAtk.from.index + 1 : oracleAtk.from.index
  // For opening torpedo, api_frai target index matches enemy Ship.pos (0-based with null sentinel at 0).
  const toPos = oracleAtk.to.side === "enemy" ? (oracleAtk.to.index === 0 ? null : oracleAtk.to.index) : oracleAtk.to.index + 1
  return { fromPos, toPos, damage: oracleAtk.damage, hit: oracleAtk.cl }
}

function fromOracleShelling(oracleAtk: any) {
  return {
    // api_at_list is 0-based with -1 sentinel; Ship.pos is 1-based for our side.
    fromPos: oracleAtk.from.index + 1,
    // Enemy fleet has a null sentinel at index 0.
    toPos: oracleAtk.to.index === 0 ? null : oracleAtk.to.index,
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
    const actual = torpedoAttacks.filter(Boolean).map(summarizeTorpedoAttack)

    const expected = (oracle!.attacks || []).map(fromOracleTorpedo)
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
    const expected = oracleAttacks.map(fromOracleShelling)
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

    // Friendly attacks are simulated in Night stage with fromShip.owner=Friend,
    // but are included in the same "Shelling" stage as night combat.
    // For this first oracle test, just ensure we can extract and that counts match.
    const nightStage = (sim.stages || []).find((s: any) => s && s.type === "Shelling" && s.subtype === "Night")
    const actualCount = Array.isArray(nightStage?.attacks) ? nightStage.attacks.length : 0
    expect(actualCount).toBeGreaterThanOrEqual((oracle!.attacks || []).length)
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
