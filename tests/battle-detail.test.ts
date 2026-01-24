import { describe, it, expect } from "vitest"

import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"

import { Battle, Simulator, Rank, BattleRankMap, StageType } from "../index"

function readJsonGz(filePath: string): unknown {
  const buf = fs.readFileSync(filePath)
  const json = zlib.gunzipSync(buf).toString("utf8")
  return JSON.parse(json) as unknown
}

function findBattleDetailFixtures(): string[] {
  const inRepoDir = path.resolve(__dirname, "fixtures", "battle-detail")
  if (!fs.existsSync(inRepoDir)) return []

  const out: string[] = []
  const stack = [inRepoDir]
  while (stack.length) {
    const dir = stack.pop()!
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name)
      const st = fs.statSync(p)
      if (st.isDirectory()) stack.push(p)
      else if (name.endsWith(".json.gz")) out.push(p)
    }
  }
  out.sort()
  return out
}

function findBattleDetailFixturesInDir(relativeDir: string): string[] {
  const baseDir = path.resolve(__dirname, "fixtures", "battle-detail")
  const dir = path.resolve(baseDir, relativeDir)
  if (!dir.startsWith(baseDir) || !fs.existsSync(dir)) return []

  const out: string[] = []
  const stack = [dir]
  while (stack.length) {
    const d = stack.pop()!
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name)
      const st = fs.statSync(p)
      if (st.isDirectory()) stack.push(p)
      else if (name.endsWith(".json.gz")) out.push(p)
    }
  }
  out.sort()
  return out
}


function assertHpInvariant(sim: any) {
  const fleets = [sim.mainFleet, sim.escortFleet, sim.enemyFleet, sim.enemyEscort, sim.friendFleet]
  for (const fleet of fleets) {
    if (!Array.isArray(fleet)) continue
    for (const ship of fleet) {
      if (ship == null) continue
      expect(Number.isFinite(ship.maxHP)).toBe(true)
      expect(Number.isFinite(ship.nowHP)).toBe(true)
      // If this fails, it's a real bug: HP underflow/overflow indicates
      // incorrect damage application or incorrect initial HP parsing.
      expect(ship.maxHP).toBeGreaterThanOrEqual(0)
      expect(ship.nowHP).toBeGreaterThanOrEqual(0)
      expect(ship.nowHP).toBeLessThanOrEqual(ship.maxHP)
    }
  }
}

function assertStageInvariant(sim: any) {
  const validStageTypes = new Set(Object.values(StageType))
  for (const stage of sim.stages || []) {
    if (stage == null) continue
    expect(validStageTypes.has(stage.type)).toBe(true)

    const attacks = stage.attacks
    if (!Array.isArray(attacks)) continue
    for (const atk of attacks) {
      if (atk == null) continue
      if (Array.isArray(atk.damage)) {
        for (const d of atk.damage) {
          expect(Number.isFinite(d)).toBe(true)
          expect(d).toBeGreaterThanOrEqual(0)
        }
      }
      if (Array.isArray(atk.hit) && Array.isArray(atk.damage)) {
        expect(atk.hit.length).toBe(atk.damage.length)
      }
      if (atk.fromHP != null) expect(Number.isFinite(atk.fromHP)).toBe(true)
      if (atk.toHP != null) expect(Number.isFinite(atk.toHP)).toBe(true)
    }
  }
}

function hasPacketKey(battle: any, key: string): boolean {
  return Array.isArray(battle.packet) && battle.packet.some((p: any) => p && Object.prototype.hasOwnProperty.call(p, key))
}

function findResultPacket(battle: any): any {
  if (!Array.isArray(battle.packet)) return null
  return battle.packet.findLast((p: any) =>
    p &&
    (p.poi_path === "/kcsapi/api_req_sortie/battleresult" ||
      p.poi_path === "/kcsapi/api_req_combined_battle/battleresult" ||
      p.poi_path === "/kcsapi/api_req_practice/battle_result"),
  )
}

function assertResultInvariant(sim: any, battle: any) {
  const resultPacket = findResultPacket(battle)
  const result = sim.result
  expect(result).toBeTruthy()

  const rank = result.rank
  expect(Object.values(Rank).includes(rank)).toBe(true)

  // If we have a battleresult packet with a win rank, the simulator should agree.
  if (resultPacket && resultPacket.api_win_rank != null) {
    let expected = BattleRankMap[resultPacket.api_win_rank]
    if (expected === Rank.S) {
      const initHPSum = [].concat(sim.mainFleet, sim.escortFleet || []).reduce((x: number, s: any) => x + (s ? s.initHP : 0), 0)
      const nowHPSum = [].concat(sim.mainFleet, sim.escortFleet || []).reduce((x: number, s: any) => x + (s ? s.nowHP : 0), 0)
      if (nowHPSum >= initHPSum) expected = Rank.SS
    }
    expect(rank).toBe(expected)
  }

  // MVP indices are 0-based in Result; -1 means unknown/missing.
  if (Array.isArray(result.mvp)) {
    const [m1, m2] = result.mvp
    if (m1 != null) expect(m1).toBeLessThanOrEqual(5)
    if (m2 != null) expect(m2).toBeLessThanOrEqual(5)
    if (m1 != null) expect(m1).toBeGreaterThanOrEqual(-1)
    if (m2 != null) expect(m2).toBeGreaterThanOrEqual(-1)
  }
}

describe("battle-detail fixtures", () => {
  it("bulk/recent: invariants hold", () => {
    const fixtures = findBattleDetailFixturesInDir("bulk/recent")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const filePath of fixtures) {
      const json = readJsonGz(filePath)
      const battle = new Battle(json as any)
      const simMaybe = Simulator.auto(battle, { usePoiAPI: false }) as any
      expect(simMaybe).toBeTruthy()
      const sim = simMaybe as any

      try {
        expect(Array.isArray(sim.stages)).toBe(true)
        assertHpInvariant(sim)
        assertStageInvariant(sim)
        assertResultInvariant(sim, battle)
        if (hasPacketKey(battle as any, "api_formation")) {
          expect(sim.stages.some((s: any) => s && s.type === StageType.Engagement)).toBe(true)
        }
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    }
  })

  it("combined/each_battle+ec_midnight_battle: invariants hold", () => {
    const fixtures = findBattleDetailFixturesInDir("combined/each_battle+ec_midnight_battle")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const filePath of fixtures) {
      const json = readJsonGz(filePath)
      const battle = new Battle(json as any)
      const simMaybe = Simulator.auto(battle, { usePoiAPI: false }) as any
      expect(simMaybe).toBeTruthy()
      const sim = simMaybe as any

      try {
        expect(Array.isArray(sim.stages)).toBe(true)
        assertHpInvariant(sim)
        assertStageInvariant(sim)
        assertResultInvariant(sim, battle)
        expect(sim.stages.some((s: any) => s && s.type === StageType.Engagement)).toBe(true)
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    }
  })

  it("combined/midnight_battle: invariants hold", () => {
    const fixtures = findBattleDetailFixturesInDir("combined/midnight_battle")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const filePath of fixtures) {
      const json = readJsonGz(filePath)
      const battle = new Battle(json as any)
      const simMaybe = Simulator.auto(battle, { usePoiAPI: false }) as any
      expect(simMaybe).toBeTruthy()
      const sim = simMaybe as any

      try {
        expect(Array.isArray(sim.stages)).toBe(true)
        assertHpInvariant(sim)
        assertStageInvariant(sim)
        assertResultInvariant(sim, battle)
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    }
  })

  it("sortie/ld_airbattle: invariants hold", () => {
    const fixtures = findBattleDetailFixturesInDir("sortie/ld_airbattle")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const filePath of fixtures) {
      const json = readJsonGz(filePath)
      const battle = new Battle(json as any)
      const simMaybe = Simulator.auto(battle, { usePoiAPI: false }) as any
      expect(simMaybe).toBeTruthy()
      const sim = simMaybe as any

      try {
        expect(Array.isArray(sim.stages)).toBe(true)
        assertHpInvariant(sim)
        assertStageInvariant(sim)
        assertResultInvariant(sim, battle)
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    }
  })

  it("features/friendly_info: invariants hold", () => {
    const fixtures = findBattleDetailFixturesInDir("features/friendly_info")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const filePath of fixtures) {
      const json = readJsonGz(filePath)
      const battle = new Battle(json as any)
      const simMaybe = Simulator.auto(battle, { usePoiAPI: false }) as any
      expect(simMaybe).toBeTruthy()
      const sim = simMaybe as any

      try {
        expect(Array.isArray(sim.stages)).toBe(true)
        assertHpInvariant(sim)
        assertStageInvariant(sim)
        assertResultInvariant(sim, battle)
        expect(Array.isArray(sim.friendFleet)).toBe(true)
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    }
  })

  it("features/air_base_attack: invariants hold", () => {
    const fixtures = findBattleDetailFixturesInDir("features/air_base_attack")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const filePath of fixtures) {
      const json = readJsonGz(filePath)
      const battle = new Battle(json as any)
      const simMaybe = Simulator.auto(battle, { usePoiAPI: false }) as any
      expect(simMaybe).toBeTruthy()
      const sim = simMaybe as any

      try {
        expect(Array.isArray(sim.stages)).toBe(true)
        assertHpInvariant(sim)
        assertStageInvariant(sim)
        assertResultInvariant(sim, battle)
        expect(sim.stages.some((s: any) => s && s.type === StageType.LandBase)).toBe(true)
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    }
  })

  it("features/injection_kouku: invariants hold", () => {
    const fixtures = findBattleDetailFixturesInDir("features/injection_kouku")
    expect(fixtures.length).toBeGreaterThan(0)
    for (const filePath of fixtures) {
      const json = readJsonGz(filePath)
      const battle = new Battle(json as any)
      const simMaybe = Simulator.auto(battle, { usePoiAPI: false }) as any
      expect(simMaybe).toBeTruthy()
      const sim = simMaybe as any

      try {
        expect(Array.isArray(sim.stages)).toBe(true)
        assertHpInvariant(sim)
        assertStageInvariant(sim)
        assertResultInvariant(sim, battle)
        expect(sim.stages.some((s: any) => s && s.type === StageType.Aerial && s.subtype === StageType.Assault)).toBe(true)
      } catch (e) {
        throw new Error(`fixture failed: ${filePath}\n${String(e)}`)
      }
    }
  })
})
