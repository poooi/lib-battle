import { describe, it, expect } from "vitest"

import { Simulator, Battle } from "../index"

import battleJson from "./v2+carrier+support+aerial+night.json"

describe("smoke", () => {
  it("simulates a captured battle without throwing", () => {
    const battle = new Battle(battleJson)
    expect(() => Simulator.auto(battle, { usePoiAPI: false })).not.toThrow()
  })
})
