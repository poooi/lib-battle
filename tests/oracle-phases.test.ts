import { describe, it, expect } from "vitest"

import fs from "node:fs"

import { Simulator, Battle } from "../index"
import type { BattleOptions } from "../index"

type Rec = Record<string, unknown>

function asRec(v: unknown): Rec | null {
  return v != null && typeof v === "object" ? (v as Rec) : null
}

function asUnknownArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

import {
  oracleAerialStage3,
  oracleLandBaseStage3,
  oracleOpeningTorpedoWithLens,
  oracleClosingTorpedoWithLens,
  oracleShelling,
} from "./oracle/packet-oracle"

function loadJson(p: string): unknown {
  return JSON.parse(fs.readFileSync(p, "utf8")) as unknown
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

function stageAttacksByType(sim: unknown, type: string): unknown[] {
  const s = asRec(sim)
  const stages = asUnknownArray(s?.stages)
  const stage = stages.find((st) => asRec(st)?.type === type)
  return asUnknownArray(asRec(stage)?.attacks)
}

function summarizeAttack(atk: unknown) {
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
  const enemyFleet0 = asUnknownArray(s?.enemyFleet)[0]
  return enemyFleet0 ? 0 : null
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
    fromPos: fromIndex + 1,
    toPos: enemyPosFromIndex(sim, toIndex),
    damage: asUnknownArray(o?.damage).filter((x): x is number => typeof x === "number"),
    hit: asUnknownArray(o?.cl).filter((x): x is number => typeof x === "number"),
  }
}

function summarizeAerialAttack(atk: unknown) {
  const a = asRec(atk)
  const to = asRec(a?.toShip)
  const owner = typeof to?.owner === "string" ? to.owner : ""
  const side = owner === "Enemy" ? "enemy" : owner === "Ours" ? "friend" : null
  const hitList = asUnknownArray(a?.hit)
  const hit0 = typeof hitList[0] === "number" ? hitList[0] : 0
  const dmgList = asUnknownArray(a?.damage)
  const dmg0 = typeof dmgList[0] === "number" ? dmgList[0] : 0
  const hit = Math.floor(hit0)
  return {
    toSide: side,
    toPos: typeof to?.pos === "number" ? to.pos : null,
    damage: Math.floor(dmg0),
    cl: hit === 2 ? 1 : 0,
  }
}

function fromOracleStage3(sim: unknown, h: unknown) {
  const o = asRec(h)
  const to = asRec(o?.to)
  const toSide = typeof to?.side === "string" ? to.side : ""
  const toIndex = typeof to?.index === "number" ? to.index : 0
  const toPos = toSide === "enemy" ? enemyPosFromIndex(sim, toIndex) : toIndex + 1
  return {
    toSide: toSide === "enemy" ? "enemy" : "friend",
    toPos,
    damage: typeof o?.damage === "number" ? o.damage : 0,
    cl: typeof o?.cl === "number" ? o.cl : 0,
  }
}

describe("packet oracle phases", () => {
  it("api_hougeki1 matches oracle (day shelling)", () => {
    // This fixture has a typical day battle with api_hougeki1.
    const json = loadJson("tests/fixtures/battle-detail/features/injection_kouku/1616044537827.json")
    const battle = new Battle(json as BattleOptions)
    const sim = Simulator.auto(battle, { usePoiAPI: false })

    const packet = asUnknownArray(asRec(json)?.packet)[0]
    const oracle = oracleShelling(packet, "api_hougeki1")
    expect(oracle).toBeTruthy()

    const attacks = stageAttacksByType(sim, "Shelling")
    const actual = attacks
      .filter((a) => asRec(asRec(a)?.fromShip)?.owner === "Ours" && asRec(asRec(a)?.toShip)?.owner === "Enemy")
      .map(summarizeAttack)
    const expected = asUnknownArray(oracle?.attacks).map((a) => fromOracleShelling(sim, a))
    expect(actual).toEqual(expected)
  })

  it("api_opening_atack matches oracle when present", () => {
    const json = loadJson("tests/fixtures/battle-detail/features/friendly_info/1584729348536.json")
    const battle = new Battle(json as BattleOptions)
    const sim = Simulator.auto(battle, { usePoiAPI: false })

    const packet = asUnknownArray(asRec(json)?.packet)[0]
    const friendLen =
      asUnknownArray(asRec(sim)?.mainFleet).length + asUnknownArray(asRec(sim)?.escortFleet).length
    const enemyLen =
      asUnknownArray(asRec(sim)?.enemyFleet).length + asUnknownArray(asRec(sim)?.enemyEscort).length

    const oracle = oracleOpeningTorpedoWithLens(packet, {
      friendLen: friendLen > 0 ? friendLen : undefined,
      enemyLen: enemyLen > 0 ? enemyLen : undefined,
    })
    expect(oracle).toBeTruthy()

    const attacks = stageAttacksByTypeSubtype(sim, "Torpedo", "Opening")
    const actual = attacks
      .filter((a) => asRec(asRec(a)?.fromShip)?.owner === "Ours" && asRec(asRec(a)?.toShip)?.owner === "Enemy")
      .map(summarizeAttack)
    const expected = asUnknownArray(oracle?.attacks).map((a) => fromOracleTorpedo(sim, a))
    expect(actual).toEqual(expected)
  })

  it("api_raigeki matches oracle (closing torpedo)", () => {
    const json = loadJson("tests/fixtures/battle-detail/features/injection_kouku/1616044537827.json")
    const battle = new Battle(json as BattleOptions)
    const sim = Simulator.auto(battle, { usePoiAPI: false })

    const packet = asUnknownArray(asRec(json)?.packet)[0]
    const friendLen =
      asUnknownArray(asRec(sim)?.mainFleet).length + asUnknownArray(asRec(sim)?.escortFleet).length
    const enemyLen =
      asUnknownArray(asRec(sim)?.enemyFleet).length + asUnknownArray(asRec(sim)?.enemyEscort).length

    const oracle = oracleClosingTorpedoWithLens(packet, {
      friendLen: friendLen > 0 ? friendLen : undefined,
      enemyLen: enemyLen > 0 ? enemyLen : undefined,
    })
    expect(oracle).toBeTruthy()

    const attacks = stageAttacksByType(sim, "Torpedo")
    const actual = attacks
      .filter((a) => asRec(asRec(a)?.fromShip)?.owner === "Ours" && asRec(asRec(a)?.toShip)?.owner === "Enemy")
      .map(summarizeAttack)
    const expected = asUnknownArray(oracle?.attacks).map((a) => fromOracleTorpedo(sim, a))
    expect(actual).toEqual(expected)
  })

  it("api_kouku.api_stage3 matches oracle (aerial)", () => {
    const json = loadJson("tests/fixtures/battle-detail/features/injection_kouku/1616044537827.json")
    const battle = new Battle(json as BattleOptions)
    const sim = Simulator.auto(battle, { usePoiAPI: false })

    const packet = asUnknownArray(asRec(json)?.packet)[0]
    const oracle = oracleAerialStage3(packet)
    expect(oracle).toBeTruthy()

    const attacks = stageAttacksByType(sim, "Aerial")
    const actual = attacks
      .filter((a) => asRec(asRec(a)?.toShip)?.owner === "Enemy")
      .map(summarizeAerialAttack)
    const expected = asUnknownArray(oracle?.hits)
      .filter((h) => asRec(asRec(h)?.to)?.side === "enemy")
      .map((h) => fromOracleStage3(sim, h))
    expect(actual).toEqual(expected)
  })

  it("api_air_base_attack[0].api_stage3 matches oracle (LBAS)", () => {
    const json = loadJson("tests/fixtures/battle-detail/features/air_base_attack/1615132578245.json")
    const battle = new Battle(json as BattleOptions)
    const sim = Simulator.auto(battle, { usePoiAPI: false })

    const packet = asUnknownArray(asRec(json)?.packet)[0]
    const oracle = oracleLandBaseStage3(packet, 0)
    expect(oracle).toBeTruthy()

    const stages = asUnknownArray(asRec(sim)?.stages)
    const stage = stages.find((s) => asRec(s)?.type === "LandBase")
    const attacks = asUnknownArray(asRec(stage)?.attacks)

    const actual = attacks
      .filter((a) => asRec(asRec(a)?.toShip)?.owner === "Enemy")
      .map(summarizeAerialAttack)

    const expected = asUnknownArray(oracle?.hits)
      .filter((h) => asRec(asRec(h)?.to)?.side === "enemy")
      .map((h) => fromOracleStage3(sim, h))

    expect(actual).toEqual(expected)
  })
})
