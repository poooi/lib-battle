import type { APISlotItem } from "kcsapi/api_get_member/require_info/response"
import type { APIGetMemberShip2Response } from "kcsapi/api_get_member/ship2/response"
import type { APIAirBase, APIPlaneInfo } from "kcsapi/api_get_member/mapinfo/response"

export type RawSlotItem = APISlotItem

export interface RawFleetShip extends APIGetMemberShip2Response {
  poi_slot?: Array<RawSlotItem | null>
  poi_slot_ex?: Array<RawSlotItem | null>
}

export interface RawPlane extends APIPlaneInfo {
  poi_slot?: RawSlotItem | null
}

export interface RawLBAC extends Omit<APIAirBase, "api_plane_info"> {
  api_plane_info: Array<RawPlane | null>
}

export const BattleType = {
  Normal: "Normal",
  Boss: "Boss",
  // NOTE: The value "Pratice" is intentionally misspelled to match historical fixtures/API. Do not change.
  Practice: "Pratice",
} as const

export type BattleType = (typeof BattleType)[keyof typeof BattleType]

// Historically some captures/fixtures type `map` as `number[]`.
// Keep the canonical tuple but accept the wider shape.
export type BattleMap = [number, number, number] | number[]

export interface FleetOptions {
  type?: number
  main?: Array<RawFleetShip | null>
  escort?: Array<RawFleetShip | null>
  support?: Array<RawFleetShip | null>
  LBAC?: RawLBAC[]
}

export class Fleet {
  type: number | undefined
  main: Array<RawFleetShip | null>
  escort: Array<RawFleetShip | null>
  support: Array<RawFleetShip | null>
  LBAC?: RawLBAC[]

  constructor(opts: FleetOptions = {}) {
    this.type = opts.type // api_port/port.api_combined_flag
    this.main = opts.main ?? [] // api_get_member/deck[].api_ship (Extended)
    this.escort = opts.escort ?? [] // ^^
    this.support = opts.support ?? [] // ^^
    this.LBAC = opts.LBAC // api_get_member/base_air_corps (Extended)
  }
}

export interface BattleOptions {
  version?: string
  type?: BattleType
  map?: BattleMap
  desc?: string | null
  time?: number
  fleet?: Fleet
  packet?: unknown[]
}

export class Battle {
  version: string
  type: BattleType | undefined
  map: BattleMap | undefined
  desc: string | null | undefined
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
