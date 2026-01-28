import { describe, it, expect } from "vitest"

import fs from "node:fs"
import path from "node:path"

import { Battle, Simulator, Rank, BattleRankMap, StageType } from "../index"
import type { BattleOptions } from "../index"

type Rec = Record<string, unknown>

function asRec(v: unknown): Rec | null {
  return v != null && typeof v === "object" ? (v as Rec) : null
}

function asUnknownArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown
}

let battleDetailFixtureCache: string[] | null = null

function findBattleDetailFixtures(): string[] {
  if (battleDetailFixtureCache != null) return battleDetailFixtureCache

  const rootDir = path.resolve(__dirname, "fixtures", "battle-detail")
  if (!fs.existsSync(rootDir)) {
    battleDetailFixtureCache = []
    return battleDetailFixtureCache
  }

  const out: string[] = []
  const stack = [rootDir]
  while (stack.length) {
    const dir = stack.pop()!
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name)
      if (ent.isDirectory()) stack.push(p)
      else if (ent.isFile() && ent.name.endsWith(".json")) out.push(p)
    }
  }
  out.sort()
  battleDetailFixtureCache = out
  return out
}

function findBattleDetailFixturesInDir(relativeDir: string): string[] {
  const baseDir = path.resolve(__dirname, "fixtures", "battle-detail")
  const dir = path.resolve(baseDir, relativeDir)
  if (!dir.startsWith(baseDir) || !fs.existsSync(dir)) return []

  const prefix = dir.endsWith(path.sep) ? dir : dir + path.sep
  return findBattleDetailFixtures().filter((p) => p.startsWith(prefix))
}


function assertHpInvariant(sim: unknown) {
  const s = asRec(sim)
  const fleets = [s?.mainFleet, s?.escortFleet, s?.enemyFleet, s?.enemyEscort, s?.friendFleet]
  for (const fleet of fleets) {
    if (!Array.isArray(fleet)) continue
    for (const ship of fleet) {
      if (ship == null) continue
      const r = asRec(ship)
      const maxHP = asNumber(r?.maxHP) ?? 0
      const nowHP = asNumber(r?.nowHP) ?? 0
      expect(Number.isFinite(maxHP)).toBe(true)
      expect(Number.isFinite(nowHP)).toBe(true)
      // If this fails, it's a real bug: HP underflow/overflow indicates
      // incorrect damage application or incorrect initial HP parsing.
      expect(maxHP).toBeGreaterThanOrEqual(0)
      expect(nowHP).toBeGreaterThanOrEqual(0)
      expect(nowHP).toBeLessThanOrEqual(maxHP)
    }
  }
}

function assertStageInvariant(sim: unknown) {
  const validStageTypes = new Set<string>(Object.values(StageType))
  const s = asRec(sim)
  for (const stage of asUnknownArray(s?.stages)) {
    if (stage == null) continue
    const st = asRec(stage)
    const stageType = st?.type
    expect(typeof stageType === "string" && validStageTypes.has(stageType)).toBe(true)

    const attacks = st?.attacks
    if (!Array.isArray(attacks)) continue
    for (const atk of attacks) {
      if (atk == null) continue
      const a = asRec(atk)
      const damage = a?.damage
      const hit = a?.hit
      if (Array.isArray(damage)) {
        for (const d of damage) {
          expect(Number.isFinite(d)).toBe(true)
          expect(d).toBeGreaterThanOrEqual(0)
        }
      }
      if (Array.isArray(hit) && Array.isArray(damage)) {
        expect(hit.length).toBe(damage.length)
      }
      if (a?.fromHP != null) expect(Number.isFinite(a.fromHP)).toBe(true)
      if (a?.toHP != null) expect(Number.isFinite(a.toHP)).toBe(true)
    }
  }
}

function hasPacketKey(battle: unknown, key: string): boolean {
  const b = asRec(battle)
  const packets = asUnknownArray(b?.packet)
  return packets.some((p) => {
    const r = asRec(p)
    return r != null && Object.prototype.hasOwnProperty.call(r, key)
  })
}

function findResultPacket(battle: unknown): unknown {
  const b = asRec(battle)
  const packets = asUnknownArray(b?.packet)
  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i]
    const r = asRec(p)
    const poiPath = typeof r?.poi_path === "string" ? r.poi_path : ""
    if (
      poiPath === "/kcsapi/api_req_sortie/battleresult" ||
      poiPath === "/kcsapi/api_req_combined_battle/battleresult" ||
      poiPath === "/kcsapi/api_req_practice/battle_result"
    ) {
      return p
    }
  }
  return null
}

function sumFleetHp(fleet: unknown, key: "initHP" | "nowHP"): number {
  const ships = asUnknownArray(fleet)
  let sum = 0
  for (const ship of ships) {
    const r = asRec(ship)
    const v = asNumber(r?.[key])
    if (v != null) sum += v
  }
  return sum
}

function assertResultInvariant(sim: unknown, battle: unknown) {
  const resultPacket = findResultPacket(battle)
  const s = asRec(sim)
  const result = asRec(s?.result)
  expect(result).toBeTruthy()

  const rank = result?.rank
  const rankSet = new Set<unknown>(Object.values(Rank) as unknown[])
  expect(rankSet.has(rank)).toBe(true)

  // If we have a battleresult packet with a win rank, the simulator should agree.
  const rp = asRec(resultPacket)
  if (rp && rp.api_win_rank != null) {
    const rk = typeof rp.api_win_rank === "string" ? rp.api_win_rank : "D"
    const expectedKey: keyof typeof BattleRankMap =
      rk === "SS" || rk === "S" || rk === "A" || rk === "B" || rk === "C" || rk === "D" || rk === "E" ? rk : "D"
    let expected = BattleRankMap[expectedKey]
    if (expected === Rank.S) {
      const initHPSum = sumFleetHp(s?.mainFleet, "initHP") + sumFleetHp(s?.escortFleet, "initHP")
      const nowHPSum = sumFleetHp(s?.mainFleet, "nowHP") + sumFleetHp(s?.escortFleet, "nowHP")
      if (nowHPSum >= initHPSum) expected = Rank.SS
    }
    expect(rank).toBe(expected)
  }

  // MVP indices are 0-based in Result; -1 means unknown/missing.
  const mvp = result?.mvp
  if (Array.isArray(mvp)) {
    const m1 = asNumber(mvp[0])
    const m2 = asNumber(mvp[1])
    if (m1 != null) expect(m1).toBeLessThanOrEqual(5)
    if (m2 != null) expect(m2).toBeLessThanOrEqual(5)
    if (m1 != null) expect(m1).toBeGreaterThanOrEqual(-1)
    if (m2 != null) expect(m2).toBeGreaterThanOrEqual(-1)
  }
}

describe("battle-detail fixtures", () => {
  function testFixture(
    filePath: string,
    opts: {
      expectEngagement?: boolean
      engagementIfPresent?: boolean
      expectFriend?: boolean
      expectLandBase?: boolean
      expectAssault?: boolean
    } = {},
  ) {
    const json = readJsonFile(filePath)
    const battle = new Battle(json as BattleOptions)
    const simMaybe = Simulator.auto(battle, { usePoiAPI: false })
    expect(simMaybe).toBeTruthy()
    const sim = simMaybe as unknown

    expect(Array.isArray(asRec(sim)?.stages)).toBe(true)
    assertHpInvariant(sim)
    assertStageInvariant(sim)
    assertResultInvariant(sim, battle)

    const s = asRec(sim)
    const stages = asUnknownArray(s?.stages)

    const shouldExpectEngagement =
      opts.expectEngagement === true || (opts.engagementIfPresent === true && hasPacketKey(battle, "api_formation"))

    if (shouldExpectEngagement) {
      expect(stages.some((st) => asRec(st)?.type === StageType.Engagement)).toBe(true)
    }
    if (opts.expectFriend) {
      expect(Array.isArray(s?.friendFleet)).toBe(true)
    }
    if (opts.expectLandBase) {
      expect(stages.some((st) => asRec(st)?.type === StageType.LandBase)).toBe(true)
    }
    if (opts.expectAssault) {
      expect(
        stages.some((st) => asRec(st)?.type === StageType.Aerial && asRec(st)?.subtype === StageType.Assault),
      ).toBe(true)
    }
  }

  describe("bulk/recent", () => {
    const fixtures = findBattleDetailFixturesInDir("bulk/recent")
    expect(fixtures.length).toBeGreaterThan(0)
    it.each(fixtures)("%s", (filePath) => {
      try {
        testFixture(filePath, { engagementIfPresent: true })
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    })
  })

  describe("combined/each_battle+ec_midnight_battle", () => {
    const fixtures = findBattleDetailFixturesInDir("combined/each_battle+ec_midnight_battle")
    expect(fixtures.length).toBeGreaterThan(0)
    it.each(fixtures)("%s", (filePath) => {
      try {
        testFixture(filePath, { expectEngagement: true })
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    })
  })

  describe("combined/midnight_battle", () => {
    const fixtures = findBattleDetailFixturesInDir("combined/midnight_battle")
    expect(fixtures.length).toBeGreaterThan(0)
    it.each(fixtures)("%s", (filePath) => {
      try {
        testFixture(filePath)
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    })
  })

  describe("sortie/ld_airbattle", () => {
    const fixtures = findBattleDetailFixturesInDir("sortie/ld_airbattle")
    expect(fixtures.length).toBeGreaterThan(0)
    it.each(fixtures)("%s", (filePath) => {
      try {
        testFixture(filePath)
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    })
  })

  describe("features/friendly_info", () => {
    const fixtures = findBattleDetailFixturesInDir("features/friendly_info")
    expect(fixtures.length).toBeGreaterThan(0)
    it.each(fixtures)("%s", (filePath) => {
      try {
        testFixture(filePath, { expectFriend: true })
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    })
  })

  describe("features/air_base_attack", () => {
    const fixtures = findBattleDetailFixturesInDir("features/air_base_attack")
    expect(fixtures.length).toBeGreaterThan(0)
    it.each(fixtures)("%s", (filePath) => {
      try {
        testFixture(filePath, { expectLandBase: true })
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    })
  })

  describe("features/injection_kouku", () => {
    const fixtures = findBattleDetailFixturesInDir("features/injection_kouku")
    expect(fixtures.length).toBeGreaterThan(0)
    it.each(fixtures)("%s", (filePath) => {
      try {
        testFixture(filePath, { expectAssault: true })
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    })
  })
})
