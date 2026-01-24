import { describe, it, expect } from "vitest"

import { Simulator, Battle } from "../index"

import {
  oracleOpeningTorpedoWithLens,
  oracleShelling,
} from "./oracle/packet-oracle"

function loadGzJson(p: string) {
  const fs = require("node:fs")
  const zlib = require("node:zlib")
  return JSON.parse(zlib.gunzipSync(fs.readFileSync(p)).toString("utf8"))
}

function stageAttacksByTypeSubtype(sim: any, type: string, subtype: string) {
  const stages = Array.isArray(sim?.stages) ? sim.stages : []
  const stage = stages.findLast((s: any) => s && s.type === type && s.subtype === subtype)
  return Array.isArray(stage?.attacks) ? stage.attacks : []
}

function stageAttacksByType(sim: any, type: string) {
  const stages = Array.isArray(sim?.stages) ? sim.stages : []
  const stage = stages.find((s: any) => s && s.type === type)
  return Array.isArray(stage?.attacks) ? stage.attacks : []
}

function summarizeAttack(atk: any) {
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
  const toPos = oracleAtk.to.side === "enemy" ? enemyPosFromIndex(sim, oracleAtk.to.index) : oracleAtk.to.index + 1
  return { fromPos, toPos, damage: oracleAtk.damage, hit: oracleAtk.cl }
}

function fromOracleShelling(sim: any, oracleAtk: any) {
  return {
    fromPos: oracleAtk.from.index + 1,
    toPos: enemyPosFromIndex(sim, oracleAtk.to.index),
    damage: oracleAtk.damage,
    hit: oracleAtk.cl,
  }
}

describe("packet oracle phases", () => {
  it("api_hougeki1 matches oracle (day shelling)", () => {
    // This fixture has a typical day battle with api_hougeki1.
    const json: any = loadGzJson("tests/fixtures/battle-detail/features/injection_kouku/1616044537827.json.gz")
    const battle = new Battle(json)
    const sim = Simulator.auto(battle, { usePoiAPI: false }) as any

    const packet = (json as any).packet?.[0]
    const oracle = oracleShelling(packet, "api_hougeki1")
    expect(oracle).toBeTruthy()

    const attacks = stageAttacksByType(sim, "Shelling")
    const actual = attacks
      .filter((a: any) => a && a.fromShip?.owner === "Ours" && a.toShip?.owner === "Enemy")
      .map(summarizeAttack)
    const expected = (oracle!.attacks || []).map((a: any) => fromOracleShelling(sim, a))
    expect(actual).toEqual(expected)
  })

  it("api_opening_atack matches oracle when present", () => {
    const json: any = loadGzJson("tests/fixtures/battle-detail/features/friendly_info/1584729348536.json.gz")
    const battle = new Battle(json)
    const sim = Simulator.auto(battle, { usePoiAPI: false }) as any

    const packet = (json as any).packet?.[0]
    const friendLen =
      (Array.isArray(sim.mainFleet) ? sim.mainFleet.length : 0) +
      (Array.isArray(sim.escortFleet) ? sim.escortFleet.length : 0)
    const enemyLen =
      (Array.isArray(sim.enemyFleet) ? sim.enemyFleet.length : 0) +
      (Array.isArray(sim.enemyEscort) ? sim.enemyEscort.length : 0)

    const oracle = oracleOpeningTorpedoWithLens(packet, {
      friendLen: friendLen > 0 ? friendLen : undefined,
      enemyLen: enemyLen > 0 ? enemyLen : undefined,
    })
    expect(oracle).toBeTruthy()

    const attacks = stageAttacksByTypeSubtype(sim, "Torpedo", "Opening")
    const actual = attacks
      .filter((a: any) => a && a.fromShip?.owner === "Ours" && a.toShip?.owner === "Enemy")
      .map(summarizeAttack)
    const expected = (oracle!.attacks || []).map((a: any) => fromOracleTorpedo(sim, a))
    expect(actual).toEqual(expected)
  })
})
