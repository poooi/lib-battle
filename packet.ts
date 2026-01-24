export const BattleType = {
  Normal: "Normal",
  Boss: "Boss",
  Practice: "Pratice",
} as const

export type BattleType = (typeof BattleType)[keyof typeof BattleType]

// Historically some captures/fixtures type `map` as `number[]`.
// Keep the canonical tuple but accept the wider shape.
export type BattleMap = [number, number, number] | number[]

export interface FleetOptions {
  type?: number
  main?: unknown
  escort?: unknown
  support?: unknown
  LBAC?: unknown
}

export class Fleet {
  type: number | undefined
  main: unknown
  escort: unknown
  support: unknown
  LBAC: unknown

  constructor(opts: FleetOptions = {}) {
    this.type = opts.type // api_port/port.api_combined_flag
    this.main = opts.main // api_get_member/deck[].api_ship (Extended)
    this.escort = opts.escort // ^^
    this.support = opts.support // ^^
    this.LBAC = opts.LBAC // api_get_member/base_air_corps (Extended)
  }
}

export interface BattleOptions {
  version?: string
  type?: BattleType
  map?: BattleMap
  desc?: unknown
  time?: number
  fleet?: Fleet
  packet?: unknown[]
}

export class Battle {
  version: string
  type: BattleType | undefined
  map: BattleMap | undefined
  desc: unknown
  time: number | undefined
  fleet: Fleet | undefined
  packet: unknown[] | undefined

  constructor(opts: BattleOptions = {}) {
    this.version = opts.version ? opts.version : "2.1"
    this.type = opts.type // BattleType
    this.map = opts.map // [int, int, int] : 2-3-1
    this.desc = opts.desc // Description
    this.time = opts.time // Seconds since epoch time. Must be same as the first packet.
    this.fleet = opts.fleet // [api_port/port.api_ship[], ...] (Extended)
    this.packet = opts.packet // [Packet, ...] : Order by time
  }
}
