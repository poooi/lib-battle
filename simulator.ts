type Param4 = [number, number, number, number]

function toParam4(v: number[] | undefined): Param4 {
  return [v?.[0] ?? 0, v?.[1] ?? 0, v?.[2] ?? 0, v?.[3] ?? 0]
}

function param4(a = 0, b = 0, c = 0, d = 0): Param4 {
  return [a, b, c, d]
}

import type { Battle, Fleet } from "./packet"

import type {
  APIHougeki1Class as PracticeHougeki,
  APIInjectionKouku as PracticeInjectionKouku,
  APIKouku as PracticeKouku,
  APIOpeningAtackClass as PracticeOpeningAttack,
} from "kcsapi/api_req_practice/battle/response"

import type {
  APIAirBaseAttack as SortieBattleAirBaseAttack,
  APIHougeki1Class as SortieBattleHougeki,
  APIInjectionKouku as SortieBattleInjectionKouku,
  APIKouku as SortieBattleKouku,
  APIOpeningAtackClass as SortieBattleOpeningAttack,
} from "kcsapi/api_req_sortie/battle/response"

import type { APIKouku as SortieAirbattleKouku } from "kcsapi/api_req_sortie/airbattle/response"

import type {
  APIAirBaseAttack as LdAirbattleAirBaseAttack,
  APIKouku as LdAirbattleKouku,
} from "kcsapi/api_req_sortie/ld_airbattle/response"

import type {
  APIHougeki1 as LdShootingHougeki,
} from "kcsapi/api_req_sortie/ld_shooting/response"

import type {
  APIHougeki1Class as CombinedBattleHougeki,
  APIInjectionKouku as CombinedBattleInjectionKouku,
  APIKouku as CombinedBattleKouku,
  APIRaigekiClass as CombinedBattleRaigeki,
} from "kcsapi/api_req_combined_battle/battle/response"

import type {
  API as EcBattleRaigeki,
  APIHougeki as EcBattleHougeki,
  APIKouku as EcBattleKouku,
  APIAirBaseAttack as EcBattleAirBaseAttack,
} from "kcsapi/api_req_combined_battle/ec_battle/response"

import type {
  APIHougeki as MidnightHougeki,
} from "kcsapi/api_req_battle_midnight/battle/response"

import type {
  APIReqCombinedBattleEcMidnightBattleResponseAPIHougeki as EcMidnightHougeki,
  APIFriendlyBattle,
  APIFriendlyInfo,
} from "kcsapi/api_req_combined_battle/ec_midnight_battle/response"

type SimulatorOptions = {
  usePoiAPI?: boolean
}

type RawSlotItem = { api_slotitem_id: number }

type RawFleetShip = {
  api_ship_id: number
  api_maxhp: number
  api_nowhp: number
  poi_slot: Array<RawSlotItem | null>
  poi_slot_ex?: Array<RawSlotItem | null>

  // poi-only ship stats (present in fixtures)
  api_kyouka: number[]
  api_karyoku: number[]
  api_raisou: number[]
  api_taiku: number[]
  api_soukou: number[]
}

type Obj = Record<string, unknown>

function isRecord(v: unknown): v is Obj {
  return typeof v === "object" && v !== null
}

function isRawFleetShip(ship: unknown): ship is RawFleetShip {
  if (!isRecord(ship)) return false
  const s = ship
  return (
    typeof s.api_ship_id === "number" &&
    typeof s.api_maxhp === "number" &&
    typeof s.api_nowhp === "number" &&
    Array.isArray(s.poi_slot)
  )
}

type BattlePacket = {
  poi_path: string
  poi_time?: number

  api_ship_ke?: number[]
  api_ship_ke_combined?: number[]
  api_ship_lv?: number[]
  api_ship_lv_combined?: number[]

  api_eSlot?: number[][]
  api_eSlot_combined?: number[][]
  api_eParam?: number[][]
  api_eParam_combined?: number[][]

  // newer captures
  api_e_maxhps?: number[]
  api_e_nowhps?: number[]
  api_e_maxhps_combined?: number[]
  api_e_nowhps_combined?: number[]

  // older captures
  api_maxhps?: number[]
  api_nowhps?: number[]
  api_maxhps_combined?: number[]
  api_nowhps_combined?: number[]

  api_midnight_flag?: number
  api_formation?: number[]
  api_search?: number[]
  api_flare_pos?: number[]
  api_touch_plane?: Array<number | string>
  api_active_deck?: number[]
  api_stage_flag?: number[]
  api_stage_flag2?: number[]
  api_opening_flag?: number
  api_opening_taisen_flag?: number
  api_support_flag?: number
  api_hourai_flag?: number[]

  api_kouku?: ApiKouku
  api_kouku2?: ApiKouku
  api_injection_kouku?: ApiInjectionKouku
  api_air_base_attack?: ApiAirBaseAttack[] | null

  // present on some combined/night-to-day flows
  api_air_base_injection?: ApiAirBaseAttack | null
  api_friendly_kouku?: ApiKouku

  api_opening_taisen?: ApiHougeki | null
  api_opening_atack?: ApiOpeningAttack | null
  api_hougeki?: ApiNightHougeki
  api_hougeki1?: ApiHougeki | null
  api_hougeki2?: ApiHougeki | null
  api_hougeki3?: ApiHougeki | null
  api_raigeki?: ApiRaigeki | null

  api_friendly_info?: APIFriendlyInfo
  api_friendly_battle?: APIFriendlyBattle

  // night-to-day
  api_n_support_info?: ApiSupportInfoLike | null
  api_n_support_flag?: number
  api_n_hougeki1?: ApiHougeki | null
  api_n_hougeki2?: ApiHougeki | null

  api_support_info?: ApiSupportInfoLike | null

  api_win_rank?: string
  api_mvp?: number
  api_mvp_combined?: number
  api_get_ship?: { api_ship_id?: number }
  api_get_useitem?: { api_useitem_id?: number }

  // event weaken / smoke
  api_boss_damaged?: number
  api_xal01?: number
  api_smoke_type?: number
}

type ApiAirBaseAttack =
  | SortieBattleAirBaseAttack
  | LdAirbattleAirBaseAttack
  | EcBattleAirBaseAttack

type ApiInjectionKouku = PracticeInjectionKouku | SortieBattleInjectionKouku | CombinedBattleInjectionKouku

type ApiKouku =
  | PracticeKouku
  | SortieBattleKouku
  | SortieAirbattleKouku
  | LdAirbattleKouku
  | CombinedBattleKouku
  | EcBattleKouku

type ApiOpeningAttack = PracticeOpeningAttack | SortieBattleOpeningAttack | CombinedBattleRaigeki | EcBattleRaigeki

type ApiRaigeki = PracticeOpeningAttack | SortieBattleOpeningAttack | CombinedBattleRaigeki | EcBattleRaigeki

type ApiHougeki = PracticeHougeki | SortieBattleHougeki | CombinedBattleHougeki | EcBattleHougeki | LdShootingHougeki

type ApiNightHougeki = MidnightHougeki | EcMidnightHougeki

type ApiOpeningRaigeki = ApiRaigeki & {
  api_frai_list_items?: number[][]
  api_fydam_list_items?: number[][]
  api_fcl_list_items?: number[][]
  api_erai_list_items?: number[][]
  api_eydam_list_items?: number[][]
  api_ecl_list_items?: number[][]
}

// Some endpoints are missing/incorrect in kcsapi (notably night-to-day support).
// Keep the surface small and narrow at usage sites.
type ApiSupportInfoLike = {
  api_support_airatack?: { api_stage3?: AerialStage3Like | null } | null
  api_support_hourai?: { api_damage?: number[]; api_cl_list?: number[] } | null
}

function isBattlePacket(packet: unknown): packet is BattlePacket {
  return (
    isRecord(packet) &&
    "poi_path" in packet &&
    typeof packet.poi_path === "string"
  )
}

type EngagementInfoOptions2 = {
  engagement?: boolean
  night?: boolean
}

type ShipArray = Array<Ship | null>
type ShipArrayish = ShipArray | null | undefined

type ShipDb = NonNullable<Window["$ships"]>
type SlotItemDb = NonNullable<Window["$slotitems"]>

function getShipDb(): ShipDb {
  return window.$ships ?? {}
}

function getSlotItemDb(): SlotItemDb {
  return window.$slotitems ?? {}
}

export interface StageOptions {
  type: StageType
  subtype?: StageType | null
  attacks?: Attack[]
  aerial?: AerialInfo | null
  engagement?: EngagementInfo | null
  kouku?: unknown
}

export class Stage {
  type: StageType
  subtype: StageType | null | undefined
  attacks: Attack[] | undefined
  aerial: AerialInfo | null | undefined
  engagement: EngagementInfo | null | undefined
  kouku: unknown

  constructor(opts: StageOptions) {
    this.type    = opts.type      // StageType
    this.subtype = opts.subtype
    this.attacks = opts.attacks   // [Attack, ...]
    this.aerial  = opts.aerial    // AerialInfo
    this.engagement = opts.engagement  // EngagementInfo
    this.kouku   = opts.kouku     // Raw API data `api_kouku` (Deprecated)
  }
}

export const StageType = {
  // Primary Type
  Aerial    : "Aerial",     // Aerial Combat
  Torpedo   : "Torpedo",    // Torpedo Salvo
  Shelling  : "Shelling",   // Shelling
  Support   : "Support",    // Support Fleet (Expedition)
  LandBase  : "LandBase",   // Land Base Aerial Support
  Engagement: "Engagement", // [SP] Engagement Information

  // Sub Type
  Main   : "Main",    // Shelling, main fleet
  Escort : "Escort",  // Shelling, escort fleet
  Night  : "Night",   // Shelling, night combat
  Opening: "Opening", // Torpedo,  opening torpedo salvo
                      // Shelling, opening anti-sub
  Assault: "Assault", // Aerial & LandBase, Jet Air Assault
} as const

export type StageType = (typeof StageType)[keyof typeof StageType]

export interface AttackOptions {
  type: AttackType
  fromShip?: Ship | null
  toShip?: Ship | null
  damage?: number[]
  hit?: HitType[]
  fromHP?: number
  toHP?: number
  useItem?: number | null
}

export class Attack {
  type: AttackType
  fromShip: Ship | null | undefined
  toShip: Ship | null | undefined
  damage: number[] | undefined
  hit: HitType[] | undefined
  fromHP: number | undefined
  toHP: number | undefined
  useItem: number | null | undefined

  constructor(opts: AttackOptions) {
    this.type     = opts.type      // AttackType
    this.fromShip = opts.fromShip  // Ship
    this.toShip   = opts.toShip    // Ship

    this.damage  = opts.damage   // [int, ...]
    this.hit     = opts.hit      // [HitType, ...]
    this.fromHP  = opts.fromHP   // HP before attack.
    this.toHP    = opts.toHP     // HP after attack.
    this.useItem = opts.useItem  // int, $slotitem[] OR null
  }
}

export const AttackType = {
  Normal: "Normal",             // 通常攻撃
  Laser : "Laser",              // レーザー攻撃
  Double: "Double",             // 連撃
  Nelson_Touch: "Nelson",       // ネルソンタッチ
  Nagato_Punch: "Nagato",       // 一斉射かッ…胸が熱いな！
  Mutsu_Splash:  "Mutsu",       // 長門、いい？ いくわよ！ 主砲一斉射ッ！
  Colorado_Fire: "Colorado",    // 	Colorado戦隊、全力斉射！各個目標に砲撃開始！一気に殲滅する、Fire!!
  Kongo_Class_Kaini_C_Charge: "Kongo_Class_Kaini_C",
  Yamato_Attack_Double: "Yamato_Double",
  Yamato_Attack_Triple: "Yamato_Triple",
  Baguette_Charge: "Baguette_Charge",
  QE_Touch: "QE_Touch",
  Submarine_Special_Attack_2_3: "Submarine_Special_Attack_2_3",
  Submarine_Special_Attack_3_4: "Submarine_Special_Attack_3_4",
  Submarine_Special_Attack_2_4: "Submarine_Special_Attack_2_4",
  Zuiun_Night_Attack: "Zuiyun_Night_Attack",
  Type_4_LC_Special_Attack: "Type_4_LC_Special_Attack",
  Carrier_CI:           "CVCI", // 空母カットイン
  Primary_Secondary_CI: "PSCI", // カットイン(主砲/副砲)
  Primary_Radar_CI    : "PRCI", // カットイン(主砲/電探)
  Primary_AP_CI       : "PACI", // カットイン(主砲/徹甲)
  Primary_Primary_CI  : "PrCI", // カットイン(主砲/主砲)
  Primary_Torpedo_CI  : "PTCI", // カットイン(主砲/魚雷)
  Torpedo_Torpedo_CI  : "TTCI", // カットイン(魚雷/魚雷)
} as const

export type AttackType = (typeof AttackType)[keyof typeof AttackType]

export const MultiTargetAttackType: ReadonlySet<AttackType> = new Set([
  AttackType.Nelson_Touch,
  AttackType.Nagato_Punch,
  AttackType.Mutsu_Splash,
  AttackType.Colorado_Fire,
  AttackType.Kongo_Class_Kaini_C_Charge,
  AttackType.Yamato_Attack_Double,
  AttackType.Yamato_Attack_Triple,
  AttackType.Baguette_Charge,
  AttackType.QE_Touch,
  AttackType.Submarine_Special_Attack_2_3,
  AttackType.Submarine_Special_Attack_3_4,
  AttackType.Submarine_Special_Attack_2_4,
  AttackType.Zuiun_Night_Attack,
  AttackType.Laser,
  AttackType.Type_4_LC_Special_Attack,
])

export const MultiTargetAttackOrder: Partial<Record<AttackType, readonly number[]>> = {
  [AttackType.Nelson_Touch]: [0, 2, 4],
  [AttackType.Nagato_Punch]: [0, 0, 1],
  [AttackType.Mutsu_Splash]: [0, 0, 1],
  [AttackType.Colorado_Fire]: [0, 1, 2],
  [AttackType.Kongo_Class_Kaini_C_Charge]: [0, 1],
  [AttackType.Yamato_Attack_Double]: [0, 0, 1],
  [AttackType.Yamato_Attack_Triple]: [0, 1, 2],
  [AttackType.Baguette_Charge]: [0, 0, 1],
  [AttackType.QE_Touch]: [0, 0, 1],
  [AttackType.Submarine_Special_Attack_2_3]: [1, 1, 2, 2],
  [AttackType.Submarine_Special_Attack_3_4]: [2, 2, 3, 3],
  [AttackType.Submarine_Special_Attack_2_4]: [1, 1, 3, 3],
  [AttackType.Zuiun_Night_Attack]: [0, 0],
  [AttackType.Laser]: [0, 0, 0],
  [AttackType.Type_4_LC_Special_Attack]: [0, 0, 0, 0, 0, 0],
}

export const HitType = {
  Miss    : 0,
  Hit     : 1,
  Critical: 2,
} as const

export type HitType = (typeof HitType)[keyof typeof HitType]

export interface ShipOptions {
  id: number
  owner: ShipOwner
  pos: number
  maxHP: number
  nowHP: number
  lostHP?: number
  damage?: number
  items?: ReadonlyArray<number | null> | null
  useItem?: number | null
  baseParam?: Param4
  finalParam?: Param4
  raw?: unknown
}

export class Ship {
  id: number
  owner: ShipOwner
  pos: number
  maxHP: number
  nowHP: number
  initHP: number
  lostHP: number
  damage: number
  items: ReadonlyArray<number | null> | null | undefined
  useItem: number | null
  baseParam: Param4 | undefined
  finalParam: Param4 | undefined
  raw: unknown

  constructor(opts: ShipOptions) {
    this.id    = opts.id    // int, $ships
    this.owner = opts.owner // ShipOwner
    this.pos   = opts.pos   // int, Position in fleet

    this.maxHP      = opts.maxHP
    this.nowHP      = opts.nowHP
    this.initHP     = opts.nowHP
    this.lostHP     = opts.lostHP || 0
    this.damage     = opts.damage || 0  // Damage from this to others
    this.items      = opts.items
    this.useItem    = opts.useItem || null
    this.baseParam  = opts.baseParam
    this.finalParam = opts.finalParam
    // parameter = [FRP, TORP, AA, AMOR]
    // if !usePoiAPI, baseParam and finalParam are undefined

    this.raw = opts.raw
  }
}

export const ShipOwner = {
  Ours : "Ours",
  Enemy: "Enemy",
  Friend: "Friend",
} as const

export type ShipOwner = (typeof ShipOwner)[keyof typeof ShipOwner]

export interface AerialInfoOptions {
  fPlaneInit?: number
  fPlaneNow?: number
  ePlaneInit?: number
  ePlaneNow?: number
  control?: AirControl
  fContact?: number | null
  eContact?: number | null
  fPlaneInit1?: number
  fPlaneNow1?: number
  ePlaneInit1?: number
  ePlaneNow1?: number
  aaciKind?: number
  aaciShip?: Ship | null
  aaciItems?: number[]
  fPlaneInit2?: number
  fPlaneNow2?: number
  ePlaneInit2?: number
  ePlaneNow2?: number
}

export class AerialInfo {
  fPlaneInit: number | undefined
  fPlaneNow: number | undefined
  ePlaneInit: number | undefined
  ePlaneNow: number | undefined
  control: AirControl | undefined
  fContact: number | null | undefined
  eContact: number | null | undefined
  fPlaneInit1: number | undefined
  fPlaneNow1: number | undefined
  ePlaneInit1: number | undefined
  ePlaneNow1: number | undefined
  aaciKind: number | undefined
  aaciShip: Ship | null | undefined
  aaciItems: number[] | undefined
  fPlaneInit2: number | undefined
  fPlaneNow2: number | undefined
  ePlaneInit2: number | undefined
  ePlaneNow2: number | undefined

  constructor(opts: AerialInfoOptions = {}) {
    this.fPlaneInit  = opts.fPlaneInit   // Init plane count of entire aerial combat (Ours)
    this.fPlaneNow   = opts.fPlaneNow    // Now  plane count of entire aerial combat (Ours)
    this.ePlaneInit  = opts.ePlaneInit   // ^^ (Enemy)
    this.ePlaneNow   = opts.ePlaneNow    // ^^ (Enemy)
    // Stage 1
    this.control     = opts.control      // AirControl
    this.fContact    = opts.fContact     // api_kouku.api_stage1.api_touch_plane[0]
    this.eContact    = opts.eContact     // api_kouku.api_stage1.api_touch_plane[1]
    this.fPlaneInit1 = opts.fPlaneInit1  // Init plane count of stage 1
    this.fPlaneNow1  = opts.fPlaneNow1   // Now  plane count of stage 1
    this.ePlaneInit1 = opts.ePlaneInit1  // ^^
    this.ePlaneNow1  = opts.ePlaneNow1   // ^^
    // Stage 2
    this.aaciKind    = opts.aaciKind     // api_kouku.api_stage2.api_air_fire.api_kind
    this.aaciShip    = opts.aaciShip     // api_kouku.api_stage2.api_air_fire.api_idx => Ship
    this.aaciItems   = opts.aaciItems    // api_kouku.api_stage2.api_air_fire.api_use_items
    this.fPlaneInit2 = opts.fPlaneInit2  // Init plane count of stage 2
    this.fPlaneNow2  = opts.fPlaneNow2   // Now  plane count of stage 2
    this.ePlaneInit2 = opts.ePlaneInit2  // ^^
    this.ePlaneNow2  = opts.ePlaneNow2   // ^^
  }
}

export const AirControl = {
  Supremacy   : "Air Supremacy",
  Superiority : "Air Superiority",
  Parity      : "Air Parity",
  Denial      : "Air Denial",
  Incapability: "Air Incapability",
} as const

export type AirControl = (typeof AirControl)[keyof typeof AirControl]

export interface EngagementInfoOptions {
  engagement?: Engagement
  fFormation?: Formation
  eFormation?: Formation
  fDetection?: Detection
  eDetection?: Detection
  fContact?: number | null
  eContact?: number | null
  fFlare?: Ship | null
  eFlare?: Ship | null
  weakened?: number
  smokeType?: number
}

export class EngagementInfo {
  engagement: Engagement | undefined
  fFormation: Formation | undefined
  eFormation: Formation | undefined
  fDetection: Detection | undefined
  eDetection: Detection | undefined
  fContact: number | null | undefined
  eContact: number | null | undefined
  fFlare: Ship | null | undefined
  eFlare: Ship | null | undefined
  weakened: number | undefined
  smokeType: number | undefined

  constructor(opts: EngagementInfoOptions = {}) {
    this.engagement = opts.engagement  // api_formation[2] => Engagement
    this.fFormation = opts.fFormation  // api_formation[0] => Formation
    this.eFormation = opts.eFormation  // api_formation[1] => Formation
    this.fDetection = opts.fDetection  // api_search[0]    => Detection
    this.eDetection = opts.eDetection  // api_search[1]    => Detection
    // Night Combat
    this.fContact = opts.fContact  // api_touch_plane[0]
    this.eContact = opts.eContact  // api_touch_plane[1]
    this.fFlare   = opts.fFlare    // api_flare_pos[0] => Ship
    this.eFlare   = opts.eFlare    // api_flare_pos[1] => Ship
    // Weaken Mechanism (Event Map)
    this.weakened = opts.weakened  // api_boss_damaged, api_xal01, ...
    this.smokeType = opts.smokeType // api_smoke_type
  }
}

export const Engagement = {
  Parallel     : "Parallel Engagement",
  Headon       : "Head-on Engagement",
  TAdvantage   : "Crossing the T (Advantage)",
  TDisadvantage: "Crossing the T (Disadvantage)",
} as const

export type Engagement = (typeof Engagement)[keyof typeof Engagement]

export const Formation = {
  Ahead  : "Line Ahead",
  Double : "Double Line",
  Diamond: "Diamond",
  Echelon: "Echelon",
  Abreast: "Line Abreast",
  Vanguard: "Vanguard",
  CruisingAntiSub: "Cruising Formation 1 (anti-sub)",
  CruisingForward: "Cruising Formation 2 (forward)",
  CruisingDiamond: "Cruising Formation 3 (diamond)",
  CruisingBattle : "Cruising Formation 4 (battle)",
} as const

export type Formation = (typeof Formation)[keyof typeof Formation]

export const Detection = {
  Success  : "Success",
  Failure  : "Failure",
  SuccessNR: "Success (not return)",
  FailureNR: "Failure (not return)",
  SuccessNP: "Success (without plane)",
  FailureNP: "Failure (without plane)",
} as const

export type Detection = (typeof Detection)[keyof typeof Detection]

export interface ResultOptions {
  rank?: Rank
  mvp?: [number, number]
  getShip?: number
  getItem?: number
}

export class Result {
  rank: Rank | undefined
  mvp: [number, number] | undefined
  getShip: number | undefined
  getItem: number | undefined

  constructor(opts: ResultOptions = {}) {
    this.rank    = opts.rank     // 'A', 'B'...
    this.mvp     = opts.mvp      // [0..5, 0..5], MVP index of mainFleet & escortFleet.
    this.getShip = opts.getShip  // id of store.const.$
    this.getItem = opts.getItem  // ^^
  }
}

export const Rank = {
  SS: 'SS',
  S : 'S',
  A : 'A',
  B : 'B',
  C : 'C',
  D : 'D',
  E : 'E',
} as const

export type Rank = (typeof Rank)[keyof typeof Rank]

/**
 * NOTICE
 * Constants below are considered non-public API.
**/
// api_hougeki.api_at_type[] => ~
export const DayAttackTypeMap = {
  0: AttackType.Normal,
  1: AttackType.Laser,
  2: AttackType.Double,
  3: AttackType.Primary_Secondary_CI,
  4: AttackType.Primary_Radar_CI,
  5: AttackType.Primary_AP_CI,
  6: AttackType.Primary_Primary_CI,
  7: AttackType.Carrier_CI,
  100: AttackType.Nelson_Touch,
  101: AttackType.Nagato_Punch,
  102: AttackType.Mutsu_Splash,
  103: AttackType.Colorado_Fire,
  105: AttackType.Baguette_Charge,
  106: AttackType.QE_Touch,
  300: AttackType.Submarine_Special_Attack_2_3,
  301: AttackType.Submarine_Special_Attack_3_4,
  302: AttackType.Submarine_Special_Attack_2_4,
  400: AttackType.Yamato_Attack_Triple,
  401: AttackType.Yamato_Attack_Double,
  1000: AttackType.Type_4_LC_Special_Attack,
}
// api_hougeki.api_sp_list => ~
export const NightAttackTypeMap = {
  0: AttackType.Normal,
  1: AttackType.Double,
  2: AttackType.Primary_Torpedo_CI,
  3: AttackType.Torpedo_Torpedo_CI,
  4: AttackType.Primary_Secondary_CI,
  5: AttackType.Primary_Primary_CI,
  100: AttackType.Nelson_Touch,
  101: AttackType.Nagato_Punch,
  102: AttackType.Mutsu_Splash,
  103: AttackType.Colorado_Fire,
  104: AttackType.Kongo_Class_Kaini_C_Charge,
  105: AttackType.Baguette_Charge,
  106: AttackType.QE_Touch,
  200: AttackType.Zuiun_Night_Attack,
  300: AttackType.Submarine_Special_Attack_2_3,
  301: AttackType.Submarine_Special_Attack_3_4,
  302: AttackType.Submarine_Special_Attack_2_4,
  400: AttackType.Yamato_Attack_Triple,
  401: AttackType.Yamato_Attack_Double,
  1000: AttackType.Type_4_LC_Special_Attack,
}
// api_stage1.api_disp_seiku => ~
export const AirControlMap: Record<number, AirControl> = {
  0: AirControl.Parity,
  1: AirControl.Supremacy,
  2: AirControl.Superiority,
  3: AirControl.Denial,
  4: AirControl.Incapability,
}
// api_search[] => ~
export const DetectionMap: Record<number, Detection> = {
  1: Detection.Success,
  2: Detection.SuccessNR,
  3: Detection.FailureNR,
  4: Detection.Failure,
  5: Detection.SuccessNP,
  6: Detection.FailureNP,
}
// api_formation[0,1] => ~
export const FormationMap: Record<number, Formation> = {
  1: Formation.Ahead,
  2: Formation.Double,
  3: Formation.Diamond,
  4: Formation.Echelon,
  5: Formation.Abreast,
  6: Formation.Vanguard,
  11: Formation.CruisingAntiSub,
  12: Formation.CruisingForward,
  13: Formation.CruisingDiamond,
  14: Formation.CruisingBattle,
}
// api_formation[2] => ~
export const EngagementMap: Record<number, Engagement> = {
  1: Engagement.Parallel,
  2: Engagement.Headon,
  3: Engagement.TAdvantage,
  4: Engagement.TDisadvantage,
}
// api_support_flag => ~
export const SupportTypeMap: Record<number, StageType> = {
  1: StageType.Aerial,
  2: StageType.Shelling,
  3: StageType.Torpedo,
}
// api_win_rank => ~
export const BattleRankMap: Record<string, Rank> = {
  'SS': Rank.SS,
  'S': Rank.S,
  'A': Rank.A,
  'B': Rank.B,
  'C': Rank.C,
  'D': Rank.D,
  'E': Rank.E,
}

const HalfSunkNumber = [  // 7~12 is guessed.
  0, 1, 1, 2, 2, 3, 4, 4, 5, 6, 7, 7, 8,
]

function useItem(ship: Ship): number | null {
  if (ship.owner === ShipOwner.Ours && ship.nowHP <= 0 && ship.items != null)
    for (const itemId of ship.items) {
      // 応急修理要員
      if (itemId === 42) {
        ship.nowHP = Math.floor(ship.maxHP / 5)
        return itemId
      }
      // 応急修理女神
      if (itemId === 43) {
        ship.nowHP = ship.maxHP
        return itemId
      }
    }
  return null
}

function damageShip(fromShip: Ship | null, toShip: Ship | null, damage: number) {
  if (toShip == null) {
    // Some legacy records contain invalid target indices.
    return {fromHP: 0, toHP: 0, item: null}
  }
  if (fromShip != null) {
    fromShip.damage += damage
  }
  let fromHP = toShip.nowHP
  toShip.nowHP  -= damage
  if (toShip.nowHP < 0) toShip.nowHP = 0
  toShip.lostHP += damage
  let item   = useItem(toShip)
  if (item) {
    toShip.useItem = item
  }
  let toHP   = toShip.nowHP
  // `toShip.*` is updated in place
  return {fromHP, toHP, item}
}

function preventNullObject<T extends object>(o: T): T | null {
  // Prevent returning Object with all properties null.
  let isNull = true
  for (const k of Object.keys(o)) {
    isNull = isNull && (o as Obj)[k] == null
  }
  return isNull ? null : o
}

type AerialStage1Like = {
  api_disp_seiku?: number
  api_f_count?: number
  api_f_lostcount?: number
  api_e_count?: number
  api_e_lostcount?: number
  api_touch_plane?: number[]
}

type AerialStage2Like = {
  api_f_count?: number
  api_f_lostcount?: number
  api_e_count?: number
  api_e_lostcount?: number
  api_air_fire?: {
    api_idx: number
    api_kind: number
    api_use_items: number[]
  }
}

type AerialStage3Like = {
  api_ebak_flag: number[]
  api_ecl_flag: number[]
  api_edam: number[]
  api_erai_flag: number[]
  api_fbak_flag?: number[] | null
  api_fcl_flag?: number[] | null
  api_fdam?: number[] | null
  api_frai_flag?: number[] | null
}

type AerialStage3Carrier = {
  api_stage3?: AerialStage3Like | null
  api_stage3_combined?: AerialStage3Like | null
}

function generateAerialInfo(
  kouku:
    | ApiKouku
    | ApiInjectionKouku
    | ApiAirBaseAttack
    | { api_stage1?: unknown; api_stage2?: unknown }
    | { api_stage1?: unknown; api_stage2?: unknown; api_stage3?: unknown }
    | null
    | undefined,
  mainFleet: ShipArray | null | undefined,
  escortFleet: ShipArray | null | undefined,
): AerialInfo | null {
  if (kouku == null)
    return null

  const mainFleetShips = mainFleet ?? []
  const escortFleetShips = escortFleet ?? []

  const stage1 = ("api_stage1" in kouku ? (kouku as { api_stage1?: AerialStage1Like | null }).api_stage1 : null) ?? null
  const stage2 = ("api_stage2" in kouku ? (kouku as { api_stage2?: AerialStage2Like | null }).api_stage2 : null) ?? null
  const o = new AerialInfo({})
  let fPlaneLost = 0, ePlaneLost = 0

  // Stage 1
  if (stage1 != null) {
    const contact = stage1.api_touch_plane || [-1, -1]
    if (typeof stage1.api_disp_seiku === "number") {
      o.control = AirControlMap[stage1.api_disp_seiku as keyof typeof AirControlMap]
    }
    o.fContact = typeof contact[0] === "number" && contact[0] > 0 ? contact[0] : null
    o.eContact = typeof contact[1] === "number" && contact[1] > 0 ? contact[1] : null

    const fCount = stage1.api_f_count ?? 0
    const fLost = stage1.api_f_lostcount ?? 0
    const eCount = stage1.api_e_count ?? 0
    const eLost = stage1.api_e_lostcount ?? 0
    o.fPlaneInit1 = fCount
    o.fPlaneNow1  = fCount - fLost
    o.ePlaneInit1 = eCount
    o.ePlaneNow1  = eCount - eLost
    fPlaneLost += fLost
    ePlaneLost += eLost
  }
  // Stage 2
  if (stage2 != null) {
    const airfire = stage2.api_air_fire
    if (airfire != null) {
      let ship = null, idx = airfire.api_idx
      const mainFleetRange = mainFleetShips.length
      if (0 <= idx && idx <= mainFleetRange) ship = mainFleetShips[idx] ?? null
      if (mainFleetRange <= idx) ship = escortFleetShips[idx - mainFleetRange] ?? null
      o.aaciKind = airfire.api_kind
      o.aaciShip = ship
      o.aaciItems = airfire.api_use_items
    }
    const fCount = stage2.api_f_count ?? 0
    const fLost = stage2.api_f_lostcount ?? 0
    const eCount = stage2.api_e_count ?? 0
    const eLost = stage2.api_e_lostcount ?? 0
    o.fPlaneInit2 = fCount
    o.fPlaneNow2  = fCount - fLost
    o.ePlaneInit2 = eCount
    o.ePlaneNow2  = eCount - eLost
    fPlaneLost += fLost
    ePlaneLost += eLost
  }
  // Summary
  // We assume stage2 won't exist without stage1
  if (stage1 != null) {
    const fCount = stage1.api_f_count ?? 0
    const eCount = stage1.api_e_count ?? 0
    o.fPlaneInit = fCount
    o.fPlaneNow  = fCount - fPlaneLost
    o.ePlaneInit = eCount
    o.ePlaneNow  = eCount - ePlaneLost
  }

  return preventNullObject(o)
}

function generateEngagementInfo(
  packet: BattlePacket | null | undefined,
  oursFleet: ShipArrayish,
  emenyFleet: ShipArrayish,
  opts: EngagementInfoOptions2 = {},
): EngagementInfo | null {
  if (!(packet != null))
    return null
  const ourFleetShips = oursFleet ?? []
  const enemyFleetShips = emenyFleet ?? []
  opts = {...{engagement: false, night: false}, ...opts}

  const o = new EngagementInfo({})

  if (opts.engagement) {
    // Battle Engagement
    const {api_formation, api_search} = packet
    if (api_formation != null) {
      const engagementKey = api_formation[2]
      const fFormationKey = api_formation[0]
      const eFormationKey = api_formation[1]
      if (typeof engagementKey === "number") o.engagement = EngagementMap[engagementKey]
      if (typeof fFormationKey === "number") o.fFormation = FormationMap[fFormationKey]
      if (typeof eFormationKey === "number") o.eFormation = FormationMap[eFormationKey]
    }
    if (api_search != null) {
      const fDetectionKey = api_search[0]
      const eDetectionKey = api_search[1]
      if (typeof fDetectionKey === "number") o.fDetection = DetectionMap[fDetectionKey]
      if (typeof eDetectionKey === "number") o.eDetection = DetectionMap[eDetectionKey]
    }
    // Weaken mechanism
    const {api_boss_damaged, api_xal01} = packet
    o.weakened = [api_boss_damaged, api_xal01].find((x) => x != null)
    // Carry over smoke_type
    const {api_smoke_type} = packet
    // old records doesn't have this key, unifying to 0.
    o.smokeType = api_smoke_type || 0
  }
  if (opts.night) {
    // Night combat
    const {api_touch_plane, api_flare_pos} = packet
    if (api_touch_plane != null) {
      // KANCOLLE BUG: api-touch_plane elements is string
      const plane = api_touch_plane.map(x => Number(x))
      o.fContact = plane[0] > 0 ? plane[0] : null
      o.eContact = plane[1] > 0 ? plane[1] : null
    }
    if (api_flare_pos != null) {
      o.fFlare   =  ourFleetShips[api_flare_pos[0]]
      o.eFlare   =  enemyFleetShips[api_flare_pos[1]]
    }
  }

  return preventNullObject(o)
}

function simulateAerialAttack(
  fleet: ShipArrayish,
  edam: number[] | null | undefined,
  ebak_flag: number[] | null | undefined,
  erai_flag: number[] | null | undefined,
  ecl_flag: number[] | null | undefined,
): Attack[] {
  const targetFleetShips = fleet ?? []
  const dam = edam ?? []
  const bak = ebak_flag ?? []
  const rai = erai_flag ?? []
  const cl = ecl_flag ?? []

  const list: Attack[] = []
  for (let [i, damage] of dam.entries()) {
    if ((damage < 0) || ((bak[i] ?? 0) <= 0 && (rai[i] ?? 0) <= 0))
      continue
    damage = Math.floor(damage)
    const toShip = targetFleetShips[i] ?? null
    const hit = (cl[i] === 1 ? HitType.Critical : (damage > 0 ? HitType.Hit : HitType.Miss))
    const {fromHP, toHP, item} = damageShip(null, toShip, damage)
    list.push(new Attack({
      type    : AttackType.Normal,
      toShip  : toShip,
      damage  : [damage],
      hit     : [hit],
      fromHP  : fromHP,
      toHP    : toHP,
      useItem : item,
    }))
  }
  return list
}

function simulateAerial(
  mainFleet: ShipArrayish,
  escortFleet: ShipArrayish,
  enemyFleet: ShipArrayish,
  enemyEscort: ShipArrayish,
  kouku:
    | ApiKouku
    | ApiInjectionKouku
    | ApiAirBaseAttack
    | AerialStage3Carrier
    | null
    | undefined,
  assault=false,
): Stage | null {
  if (kouku == null)
    return null

  const mainFleetShips = mainFleet ?? []
  const escortFleetShips = escortFleet ?? []
  const enemyMainShips = enemyFleet ?? []
  const enemyEscortShips = enemyEscort ?? []

  const carrier = kouku as AerialStage3Carrier
  const stage3 = carrier.api_stage3 ?? null
  const stage3Combined = carrier.api_stage3_combined ?? null

  let attacks: Attack[] = []
  if (stage3 != null) {
    attacks = attacks.concat(simulateAerialAttack(enemyMainShips, stage3.api_edam, stage3.api_ebak_flag, stage3.api_erai_flag, stage3.api_ecl_flag))
    attacks = attacks.concat(simulateAerialAttack(mainFleetShips, stage3.api_fdam, stage3.api_fbak_flag, stage3.api_frai_flag, stage3.api_fcl_flag))
  }
  if (stage3Combined != null) {
    attacks = attacks.concat(simulateAerialAttack(enemyEscortShips, stage3Combined.api_edam, stage3Combined.api_ebak_flag, stage3Combined.api_erai_flag, stage3Combined.api_ecl_flag))
    attacks = attacks.concat(simulateAerialAttack(escortFleetShips, stage3Combined.api_fdam, stage3Combined.api_fbak_flag, stage3Combined.api_frai_flag, stage3Combined.api_fcl_flag))
  }

  const aerial = generateAerialInfo(kouku, mainFleetShips, escortFleetShips)
  return new Stage({
    type   : StageType.Aerial,
    subtype: assault ? StageType.Assault : null,
    attacks: attacks,
    aerial : aerial,
    kouku  : kouku,
  })
}

function simulateTorpedoAttack(
  mainFleet: ShipArrayish,
  escortFleet: ShipArrayish,
  enemyFleet: ShipArrayish,
  enemyEscort: ShipArrayish,
  eydam: number[] | null | undefined,
  erai: number[] | null | undefined,
  ecl: number[] | null | undefined,
): Attack[] {
  const mainFleetShips = mainFleet ?? []
  const escortFleetShips = escortFleet ?? []
  const enemyMainShips = enemyFleet ?? []
  const enemyEscortShips = enemyEscort ?? []
  const dam = eydam ?? []
  const rai = erai ?? []
  const cl = ecl ?? []

  const list: Attack[] = []
  for (let [i, t] of rai.entries()) {
    let fromShip: Ship | null | undefined
    let toShip: Ship | null | undefined
    const mainFleetRange = mainFleetShips.length
    const enemyFleetRange = enemyMainShips.length
    if (i < 0 || t < 0) continue
    if (dam[i] == null || cl[i] == null) continue
    if (i < mainFleetRange) {
      fromShip = mainFleetShips[i]
    } else {
      fromShip = escortFleetShips[i - mainFleetRange]
    }
    if (fromShip == null) continue
    if (t < enemyFleetRange) {
      toShip = enemyMainShips[t]
    } else {
      toShip = enemyEscortShips[t - enemyFleetRange]
    }
    if (toShip == null) continue
    const damage = Math.floor(dam[i])
    const hit = (cl[i] === 2 ? HitType.Critical : (cl[i] === 1 ? HitType.Hit : HitType.Miss))
    let {fromHP, toHP, item} = damageShip(fromShip, toShip, damage)
    list.push(new Attack({
      type    : AttackType.Normal,
      fromShip: fromShip,
      toShip  : toShip,
      damage  : [damage],
      hit     : [hit],
      fromHP  : fromHP,
      toHP    : toHP,
      useItem : item,
    }))
  }
  return list
}

function simulateOpeningTorpedoAttack(
  mainFleet: ShipArrayish,
  escortFleet: ShipArrayish,
  enemyFleet: ShipArrayish,
  enemyEscort: ShipArrayish,
  eydamList: number[][] | null | undefined,
  eraiList: number[][] | null | undefined,
  eclList: number[][] | null | undefined,
): Attack[] {
  const mainFleetShips = mainFleet ?? []
  const escortFleetShips = escortFleet ?? []
  const enemyMainShips = enemyFleet ?? []
  const enemyEscortShips = enemyEscort ?? []
  const dam = eydamList ?? []
  const rai = eraiList ?? []
  const cl = eclList ?? []

  const list: Attack[] = []
  for (let [i, tList] of rai.entries()) {
    let fromShip: Ship | null | undefined
    let toShip: Ship | null | undefined
    const mainFleetRange = mainFleetShips.length
    const enemyFleetRange = enemyMainShips.length
    if (i < 0 || tList == null) continue
    if (i < mainFleetRange) fromShip = mainFleetShips[i]
    else fromShip = escortFleetShips[i - mainFleetRange]
    if (fromShip == null) continue
    for (let [j, t] of tList.entries()) {
      if (t < 0) continue
      if (t < enemyFleetRange) toShip = enemyMainShips[t]
      else toShip = enemyEscortShips[t - enemyFleetRange]
      if (toShip == null) continue
      const damage = Math.floor(dam[i]?.[j] ?? 0)
      const hit = (cl[i]?.[j] === 2 ? HitType.Critical : (cl[i]?.[j] === 1 ? HitType.Hit : HitType.Miss))
      let {fromHP, toHP, item} = damageShip(fromShip, toShip, damage)
      list.push(new Attack({
        type    : AttackType.Normal,
        fromShip: fromShip,
        toShip  : toShip,
        damage  : [damage],
        hit     : [hit],
        fromHP  : fromHP,
        toHP    : toHP,
        useItem : item,
      }))
    }
  }
  return list
}

function simulateTorpedo(
  mainFleet: Array<Ship | null> | null | undefined,
  escortFleet: Array<Ship | null> | null | undefined,
  enemyFleet: Array<Ship | null> | null | undefined,
  enemyEscort: Array<Ship | null> | null | undefined,
  raigeki: ApiRaigeki | null | undefined,
  subtype?: StageType,
): Stage | null {
  if (!(raigeki != null)) {
    return null
  }
  let attacks: Attack[] = []
  if (raigeki.api_frai != null)
    attacks = attacks.concat(simulateTorpedoAttack(mainFleet, escortFleet, enemyFleet, enemyEscort,
      (raigeki.api_fydam != null ? raigeki.api_fydam : raigeki.api_fdam), raigeki.api_frai, raigeki.api_fcl))
  if (raigeki.api_erai != null)
    attacks = attacks.concat(simulateTorpedoAttack(enemyFleet, enemyEscort, mainFleet, escortFleet,
      (raigeki.api_eydam != null ? raigeki.api_eydam : raigeki.api_edam), raigeki.api_erai, raigeki.api_ecl))
  return new Stage({
    type: StageType.Torpedo,
    attacks: attacks,
    subtype: subtype,
  })
}

function simulateOpeningTorpedo(
  mainFleet: Array<Ship | null> | null | undefined,
  escortFleet: Array<Ship | null> | null | undefined,
  enemyFleet: Array<Ship | null> | null | undefined,
  enemyEscort: Array<Ship | null> | null | undefined,
  raigeki: ApiOpeningRaigeki | null | undefined,
  subtype?: StageType,
): Stage | null {
  if (!(raigeki != null)) {
    return null
  }
  if (raigeki.api_frai != null) {
    // Backward compatibility
    return simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, raigeki, subtype)
  }
  let attacks: Attack[] = []
  if (raigeki.api_frai_list_items != null)
    attacks = attacks.concat(simulateOpeningTorpedoAttack(mainFleet, escortFleet, enemyFleet, enemyEscort,
      raigeki.api_fydam_list_items, raigeki.api_frai_list_items, raigeki.api_fcl_list_items))
  if (raigeki.api_erai_list_items != null)
    attacks = attacks.concat(simulateOpeningTorpedoAttack(enemyFleet, enemyEscort, mainFleet, escortFleet,
      raigeki.api_eydam_list_items, raigeki.api_erai_list_items, raigeki.api_ecl_list_items))
  return new Stage({
    type: StageType.Torpedo,
    attacks: attacks,
    subtype: subtype,
  })
}

function simulateShelling(
  mainFleet: ShipArrayish,
  escortFleet: ShipArrayish,
  enemyFleet: ShipArrayish,
  enemyEscort: ShipArrayish,
  hougeki: ApiHougeki | ApiNightHougeki | null | undefined,
  subtype?: StageType,
): Stage | null {
  if (!(hougeki != null)) {
    return null
  }
  const mainFleetShips = mainFleet ?? []
  const escortFleetShips = escortFleet ?? []
  const enemyMainShips = enemyFleet ?? []
  const enemyEscortShips = enemyEscort ?? []
  const isNight = subtype === StageType.Night
  const list: Attack[] = []
  const mainFleetRange = mainFleetShips.length
  const enemyFleetRange = enemyMainShips.length
  for (let [i, attacker] of (hougeki.api_at_list || []).entries()) {
    if (attacker === -1) continue
    const spList = (hougeki as { api_sp_list?: number[] }).api_sp_list
    const atType = (hougeki as { api_at_type?: number[] }).api_at_type
    const spKey = spList?.[i] ?? 0
    const atKey = atType?.[i] ?? 0
    let attackType: AttackType = isNight
      ? (NightAttackTypeMap[spKey as keyof typeof NightAttackTypeMap] ?? AttackType.Normal)
      : (DayAttackTypeMap[atKey as keyof typeof DayAttackTypeMap] ?? AttackType.Normal)
    let at = attacker
    if (!MultiTargetAttackType.has(attackType)) {
      let df = hougeki.api_df_list[i][0] // Defender
      let fromEnemy: boolean
      if (hougeki.api_at_eflag != null) {
        fromEnemy = hougeki.api_at_eflag[i] === 1
      } else {
        fromEnemy = df < mainFleetRange
        if (at >= mainFleetRange) at -= mainFleetRange
        if (df >= mainFleetRange) df -= mainFleetRange
      }
      let fromShip: Ship | null | undefined
      let toShip: Ship | null | undefined
      if (fromEnemy) {
        fromShip = at < enemyFleetRange ? enemyMainShips[at] : enemyEscortShips[at - enemyFleetRange]
        toShip   = df < mainFleetRange ? mainFleetShips[df]  : escortFleetShips[df - mainFleetRange]
      } else {
        fromShip = at < mainFleetRange ? mainFleetShips[at]  : escortFleetShips[at - mainFleetRange]
        toShip   = df < enemyFleetRange ? enemyMainShips[df] : enemyEscortShips[df - enemyFleetRange]
      }

      let damage = []
      let damageTotal = 0
      for (let dmg of hougeki.api_damage[i]) {
        if (dmg < 0) dmg = 0
        dmg = Math.floor(dmg)
        damage.push(dmg)
        damageTotal += dmg
      }
      let hit: HitType[] = []
      for (const cl of hougeki.api_cl_list[i])
        hit.push(cl === 2 ? HitType.Critical : (cl === 1 ? HitType.Hit : HitType.Miss))
      let {fromHP, toHP, item} = damageShip(fromShip, toShip, damageTotal)
      list.push(new Attack({
        type    : attackType,
        fromShip: fromShip,
        toShip  : toShip,
        damage  : damage,
        hit     : hit,
        fromHP  : fromHP,
        toHP    : toHP,
        useItem : item,
      }))
    } else {
      const order = MultiTargetAttackOrder[attackType] || []
      for (let j = 0; j < hougeki.api_df_list[i].length; j++) {
        let df = hougeki.api_df_list[i][j] // Defender
        let fromEnemy: boolean
        let at = attacker + (order[j] || 0) // Attacker
        // Tanaka bug: in combined night battle the sp attack could have wrong attacker index
        if (isNight && escortFleet && escortFleet.length && at < mainFleetRange) {
          at += mainFleetRange
        }
        if (hougeki.api_at_eflag != null) {
          fromEnemy = hougeki.api_at_eflag[i] === 1
        } else {
          fromEnemy = df < mainFleetRange
          if (at >= mainFleetRange) at -= mainFleetRange
          if (df >= mainFleetRange) df -= mainFleetRange
        }
        let fromShip: Ship | null | undefined
        let toShip: Ship | null | undefined
        if (fromEnemy) {
          fromShip = at < enemyFleetRange ? enemyMainShips[at] : enemyEscortShips[at - enemyFleetRange]
          toShip   = df < mainFleetRange ? mainFleetShips[df]  : escortFleetShips[df - mainFleetRange]
        } else {
          fromShip = at < mainFleetRange ? mainFleetShips[at]  : escortFleetShips[at - mainFleetRange]
          toShip   = df < enemyFleetRange ? enemyMainShips[df] : enemyEscortShips[df - enemyFleetRange]
        }

        let damage = []
        let dmg = hougeki.api_damage[i][j]
        if (dmg < 0) dmg = 0
        dmg = Math.floor(dmg)
        damage.push(dmg)
        let hit: HitType[] = []
        let cl = hougeki.api_cl_list[i][j]
        hit.push(cl === 2 ? HitType.Critical : (cl === 1 ? HitType.Hit : HitType.Miss))
        let {fromHP, toHP, item} = damageShip(fromShip, toShip, dmg)
        list.push(new Attack({
          type    : attackType,
          fromShip: fromShip,
          toShip  : toShip,
          damage  : damage,
          hit     : hit,
          fromHP  : fromHP,
          toHP    : toHP,
          useItem : item,
        }))
      }
    }
  }
  return new Stage({
    type: StageType.Shelling,
    attacks: list,
    subtype: subtype,
  })
}

function simulateNight(
  fleetType: number,
  mainFleet: ShipArrayish,
  escortFleet: ShipArrayish,
  enemyType: number,
  enemyFleet: ShipArrayish,
  enemyEscort: ShipArrayish,
  hougeki: ApiNightHougeki | null | undefined,
  packet: BattlePacket,
): Stage | null {
  const stage = simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, hougeki, StageType.Night)
  if (stage) {
    let _oursFleet  = fleetType === 0 ? (mainFleet || [])  : (escortFleet || [])
    let _enemyFleet = enemyType === 0 ? (enemyFleet || []) : (enemyEscort || [])
    if (packet.api_active_deck != null) {
      if (packet.api_active_deck[0] === 1) {
        _oursFleet = mainFleet || []
      }
      if (packet.api_active_deck[0] === 2) {
        _oursFleet = escortFleet || []
      }
      if (packet.api_active_deck[1] === 1) {
        _enemyFleet = enemyFleet || []
      }
      if (packet.api_active_deck[1] === 2) {
        _enemyFleet = enemyEscort || []
      }
    }
    stage.engagement = generateEngagementInfo(packet, _oursFleet, _enemyFleet, {night: true})
  }
  return stage
}

function simulateSupport(
  enemyFleet: ShipArrayish,
  enemyEscort: ShipArrayish,
  support: ApiSupportInfoLike | null | undefined,
  flag: number | null | undefined,
): Stage | null {
  if (!(support != null && flag != null))
    return null

  const enemyMainShips = enemyFleet ?? []
  const enemyEscortShips = enemyEscort ?? []
  if (flag === 1 || flag === 4) {
    const kouku = support.api_support_airatack
    if (kouku == null || typeof kouku !== "object")
      return null
    const st3 = kouku.api_stage3 ?? null
    if (st3 == null)
      return null

    const supportTargetShips = [...enemyMainShips, ...enemyEscortShips]
    const attacks = simulateAerialAttack(
      supportTargetShips,
      st3.api_edam,
      st3.api_ebak_flag,
      st3.api_erai_flag,
      st3.api_ecl_flag,
    )
    const aerial = generateAerialInfo(kouku, null, null)
    return new Stage({
      type   : StageType.Support,
      subtype: SupportTypeMap[flag],
      attacks: attacks,
      aerial : aerial,
      kouku  : kouku,
    })
  }

  if (flag === 2 || flag === 3) {
    const hourai = support.api_support_hourai
    if (hourai == null || typeof hourai !== "object")
      return null
    const api_damage = hourai.api_damage ?? []
    const api_cl_list = hourai.api_cl_list ?? []

    const attacks: Attack[] = []
    const enemyFleetRange = enemyMainShips.length
    for (let [i, damage] of api_damage.entries()) {
      let toShip: Ship | null | undefined
      if (0 <= i && i < enemyFleetRange)
        toShip = enemyMainShips[i]
      if (enemyFleetRange <= i) // TANAKA: api_damage.length = 7 with 6 ships
        toShip = enemyEscortShips[i - enemyFleetRange]
      if (toShip == null)
        continue
      damage = Math.floor(damage)
      const cl = api_cl_list[i]
      const hit = (cl === 2 ? HitType.Critical : (cl === 1 ? HitType.Hit : HitType.Miss))
      // No showing Miss attack on support stage.
      if (hit === HitType.Miss)
        continue
      const {fromHP, toHP, item} = damageShip(null, toShip, damage)
      attacks.push(new Attack({
        type   : AttackType.Normal,
        toShip : toShip,
        damage : [damage],
        hit    : [hit],
        fromHP : fromHP,
        toHP   : toHP,
        useItem: item,
      }))
    }
    return new Stage({
      type: StageType.Support,
      subtype: SupportTypeMap[flag],
      attacks: attacks,
    })
  }

  return null
}

function simulateLandBase(
  enemyFleet: ShipArrayish,
  enemyEscort: ShipArrayish,
  kouku: ApiAirBaseAttack | null | undefined,
  assault=false,
): Stage | null {
  let stage = simulateAerial(null, null, enemyFleet, enemyEscort, kouku)
  if (stage != null) {
    stage.type = StageType.LandBase
    stage.subtype = assault ? StageType.Assault : null
  }
  return stage
}

function simulateBattleRank(
  mainFleet: ShipArrayish,
  escortFleet: ShipArrayish,
  enemyFleet: ShipArrayish,
  enemyEscort: ShipArrayish,
): Rank {
  // https://github.com/andanteyk/ElectronicObserver/blob/master/ElectronicObserver/Other/Information/kcmemo.md#%E6%88%A6%E9%97%98%E5%8B%9D%E5%88%A9%E5%88%A4%E5%AE%9A
  function calStatus(fleet: ShipArray) {
    let shipNum = 0, sunkNum = 0, totalHP = 0, lostHP = 0
    let flagshipSunk = false, flagshipCritical  = false
    for (const ship of fleet) {
      if (ship == null) continue
      let {initHP, nowHP, maxHP} = ship
      if (nowHP < 0) nowHP = 0
      shipNum += 1
      sunkNum += (nowHP <= 0) ? 1 : 0
      totalHP += initHP
      lostHP  += (initHP - nowHP)
      if (ship.pos === 0) {
        flagshipSunk     = (nowHP <= 0)
        flagshipCritical = (nowHP * 4 <= maxHP)
      }
    }
    return {
      num: shipNum,
      sunk: sunkNum,
      rate: Math.floor(lostHP / totalHP * 100),
      lostHP, flagshipSunk, flagshipCritical,
    }
  }
  const ours  = calStatus([...(mainFleet ?? []),  ...(escortFleet ?? [])])
  const enemy = calStatus([...(enemyFleet ?? []), ...(enemyEscort ?? [])])

  if (ours.sunk === 0) {
    if (enemy.sunk === enemy.num) {
      if (ours.lostHP <= 0)
        return Rank.SS
      else
        return Rank.S
    }
    if (enemy.num > 1 && enemy.sunk >= HalfSunkNumber[enemy.num]) {
      return Rank.A
    }
  }
  if (enemy.flagshipSunk && ours.sunk < enemy.sunk) {
    return Rank.B
  }
  if (ours.num === 1 && ours.flagshipCritical) {
    return Rank.D
  }
  if (2 * enemy.rate > 5 * ours.rate) {
    return Rank.B
  }
  if (10 * enemy.rate > 9 * ours.rate) {
    return Rank.C
  }
  if (ours.sunk > 0 && (ours.num - ours.sunk) === 1) {
    return Rank.E
  }
  return Rank.D
}

function simulateAirRaidBattleRank(mainFleet: ShipArrayish, escortFleet: ShipArrayish): Rank {
  // https://github.com/andanteyk/ElectronicObserver/blob/master/ElectronicObserver/Other/Information/kcmemo.md#%E9%95%B7%E8%B7%9D%E9%9B%A2%E7%A9%BA%E8%A5%B2%E6%88%A6%E3%81%A7%E3%81%AE%E5%8B%9D%E5%88%A9%E5%88%A4%E5%AE%9A
  const mainFleetShips = mainFleet ?? []
  const escortFleetShips = escortFleet ?? []
  const initHPSum = [...mainFleetShips, ...escortFleetShips].reduce((x, s) => x + (s ? s.initHP : 0), 0)
  const nowHPSum  = [...mainFleetShips, ...escortFleetShips].reduce((x, s) => x + (s ? s.nowHP  : 0),  0)
  let rate = (initHPSum - nowHPSum) / initHPSum * 100

  if (rate <= 0) return Rank.SS
  if (rate < 10) return Rank.A
  if (rate < 20) return Rank.B
  if (rate < 50) return Rank.C
  if (rate < 80) return Rank.D
  // else
  return Rank.E
}

function simulateFleetMVP(fleet: ShipArrayish): number {
  const fleetShips = fleet ?? []
  let m = -1, mvp = null
  for (const [i, ship] of fleetShips.entries()) {
    if (ship == null)
      continue
    if (mvp == null || ship.damage > mvp.damage) {
      m = i
      mvp = ship
    }
  }
  return m
}

function simulateFleetNightMVP(stages: Array<Stage | null> | null | undefined): number {
  const ss = stages ?? []
  // Damage sum: Only escort fleet
  let sum = Array(6).fill(0)
  for (const stage of ss) {
    if (!(stage != null && stage.attacks != null))
      continue
    if (!(stage.type === StageType.Shelling && stage.subtype === StageType.Night))
      continue
    for (const attack of stage.attacks) {
      const {fromShip: ship, damage} = attack
      if (ship == null || ship.owner !== ShipOwner.Ours)
        continue
      const {pos} = ship
      if (6 <= pos && pos <= 11)
        sum[pos - 7] += (damage ?? []).reduce((x: number, y: number) => x + y, 0)
      else
        console.warn("Non-escort fleet ship attack in night stage", ship, attack)
    }
  }
  let m = 0  // MVP index
  for (const [i, damage] of sum.entries()) {
    if (damage > sum[m]) {
      m = i
    }
  }
  return m
}

function getEngagementStage(packet: BattlePacket | null | undefined): Stage | null {
  // This function is usable for day combat only.
  const engagement = generateEngagementInfo(packet, [], [], {engagement: true})
  return engagement == null ? null : new Stage({
    type: StageType.Engagement,
    engagement: engagement,
  })
}


class Simulator2 {
  usePoiAPI: boolean | undefined
  fleetType: number
  mainFleet: Array<Ship | null> | undefined
  escortFleet: Array<Ship | null> | undefined
  supportFleet: Array<Ship | null> | undefined
  landBaseAirCorps: unknown
  enemyFleet: Array<Ship | null> | null
  enemyEscort: Array<Ship | null> | null
  friendFleet: Array<Ship | null> | null
  enemyType: number
  stages: Array<Stage | null>
  _result: Result | null
  _isAirRaid: boolean
  _isEngaged: boolean
  _isNightOnlyMVP: boolean

  constructor(fleet: Fleet, opts: SimulatorOptions = {}) {
    // When no using poi API:
    //   enemyShip.raw == null
    this.usePoiAPI = opts.usePoiAPI

    this.fleetType    = fleet.type || 0
    this.mainFleet    = this._initFleet(fleet.main as Array<RawFleetShip | null>, 0)
    this.escortFleet  = this._initFleet(fleet.escort as Array<RawFleetShip | null>, 6)
    this.supportFleet = this._initFleet(fleet.support as Array<RawFleetShip | null>)
    this.landBaseAirCorps = fleet.LBAC
    this.enemyFleet   = null  // Assign at first packet
    this.enemyEscort  = null  // ^
    this.friendFleet  = null // NPC Friend fleet support
    this.enemyType = 0

    // Stage
    this.stages  = []
    this._result = null
    this._isAirRaid = false
    this._isEngaged = false
    this._isNightOnlyMVP = false
  }

  static auto(battle: Battle | null | undefined, opts: SimulatorOptions) {
    if (battle == null)
      return
    if (battle.fleet == null || battle.packet == null)
      return
    let s = new Simulator2(battle.fleet, opts)
    for (const packet of battle.packet)
      s.simulate(packet)
    return s
  }

  _initFleet(rawFleet: Array<RawFleetShip | null> | null | undefined, intl=0) {
    if (!(rawFleet != null)) return
    const fleet: Array<Ship | null> = []
    for (let [i, rawShip] of rawFleet.entries()) {
      if (rawShip != null && isRawFleetShip(rawShip)) {
        const slots = rawShip.poi_slot.concat(rawShip.poi_slot_ex ?? [])
        let baseParam: Param4 | undefined
        let finalParam: Param4 | undefined
        if (this.usePoiAPI) {
          const kyouka = rawShip.api_kyouka
          const $ship = getShipDb()[rawShip.api_ship_id]
          if (typeof $ship !== "undefined") {
            baseParam = param4(
              $ship.api_houg[0] + (kyouka[0] ?? 0),
              $ship.api_raig[0] + (kyouka[1] ?? 0),
              $ship.api_tyku[0] + (kyouka[2] ?? 0),
              $ship.api_souk[0] + (kyouka[3] ?? 0),
            )
          }
          finalParam = param4(
            rawShip.api_karyoku[0],
            rawShip.api_raisou[0],
            rawShip.api_taiku[0],
            rawShip.api_soukou[0],
          )
        }
        fleet.push(new Ship({
          id        : rawShip.api_ship_id,
          owner     : ShipOwner.Ours,
          pos       : intl + i + 1,
          maxHP     : rawShip.api_maxhp,
          nowHP     : rawShip.api_nowhp,
          items     : slots.map(slot => slot != null ? slot.api_slotitem_id : null),
          baseParam : baseParam,
          finalParam: finalParam,
          raw       : rawShip,
        }))
      } else {
        fleet.push(null)
      }
    }
    return fleet
  }

  _initEnemy(
    intl=0,
    api_ship_ke: number[] | null | undefined,
    api_eSlot: number[][] | null | undefined,
    api_e_maxhps: number[] | null | undefined,
    api_e_nowhps: number[] | null | undefined,
    api_ship_lv: number[] | null | undefined,
    api_param: number[][] = [],
    owner: ShipOwner = ShipOwner.Enemy,
  ) {
    if (!(api_ship_ke != null)) return
    let fleet = []
    const range = [...new Array(api_ship_ke.length).keys()]
    for (const i of range) {
      let id    = api_ship_ke[i]
      let slots = (api_eSlot && api_eSlot[i]) || []
      let ship: Ship | null = null
      let raw: unknown
      let baseParam: Param4 | undefined
      let finalParam: Param4 | undefined
      if (typeof id === "number" && id > 0) {
        if (api_ship_lv == null) api_ship_lv = []
        if (api_e_maxhps == null) api_e_maxhps = []
        if (api_e_nowhps == null) api_e_nowhps = []
        if (this.usePoiAPI) {
          raw = {
            api_ship_id: id,
            api_lv: api_ship_lv[i],
            poi_slot: slots.map(id => getSlotItemDb()[id]),
          }
          baseParam = toParam4(api_param[i])
          finalParam = slots.reduce((bonus, id) => {
            const item = getSlotItemDb()[id] || {}
            return [
              bonus[0] + (item.api_houg || 0),
              bonus[1] + (item.api_raig || 0),
              bonus[2] + (item.api_tyku || 0),
              bonus[3] + (item.api_souk || 0),
            ]
          }, baseParam)
        }
        ship = new Ship({
          id        : id,
          owner     : owner,
          pos       : intl + i,
          maxHP     : api_e_maxhps[i],
          nowHP     : api_e_nowhps[i],
          items     : [],  // We dont care
          baseParam : baseParam,
          finalParam: finalParam,
          raw       : raw,
        })
      }
      fleet.push(ship)
    }
    return fleet
  }

  simulate(packet: unknown) {
    if (packet == null) return
    if (!isBattlePacket(packet)) return
    const path = packet.poi_path

    this.prepare(packet, path)
    this.assert(packet, path)

    // Engagement
    if (this._isEngaged === false) {
      this._isEngaged = true
      this.stages.push(getEngagementStage(packet))
    }
    // Day Battle
    if (['/kcsapi/api_req_practice/battle',
         '/kcsapi/api_req_sortie/battle',
         '/kcsapi/api_req_sortie/airbattle',
         '/kcsapi/api_req_sortie/ld_airbattle',
         '/kcsapi/api_req_sortie/ld_shooting',
         '/kcsapi/api_req_combined_battle/battle',
         '/kcsapi/api_req_combined_battle/battle_water',
         '/kcsapi/api_req_combined_battle/airbattle',
         '/kcsapi/api_req_combined_battle/ld_airbattle',
         '/kcsapi/api_req_combined_battle/ld_shooting',
         '/kcsapi/api_req_combined_battle/ec_battle',
         '/kcsapi/api_req_combined_battle/each_battle',
         '/kcsapi/api_req_combined_battle/each_battle_water',
    ].includes(path)) {
      this.prcsDay(packet, path)
    }
    // Night Battle
    if (['/kcsapi/api_req_practice/midnight_battle',
         '/kcsapi/api_req_battle_midnight/battle',
         '/kcsapi/api_req_battle_midnight/sp_midnight',
         '/kcsapi/api_req_combined_battle/midnight_battle',
         '/kcsapi/api_req_combined_battle/sp_midnight',
         '/kcsapi/api_req_combined_battle/ec_midnight_battle',
         '!COMPAT/midnight_battle',
    ].includes(path)) {
      this.prcsNight(packet, path)
    }
    // Night to Day
    if (['/kcsapi/api_req_combined_battle/ec_night_to_day'].includes(path)) {
      this.prcsNight(packet, path)
      this.prcsDay(packet, path)
    }
    // Battle Result
    if (['/kcsapi/api_req_practice/battle_result',
         '/kcsapi/api_req_sortie/battleresult',
         '/kcsapi/api_req_combined_battle/battleresult',
    ].includes(path)) {
      this.prcsResult(packet, path)
    }
  }

  prepare(packet: BattlePacket, path: string) {
    const { fleetType, enemyFleet } = this
    if (enemyFleet == null) {
      // Older records may not have api_e_* hp arrays; fall back to api_(max|now)hps.
      // The arrays include both fleets with 1-based indices (api_nowhps[1..]).
      const eMaxHps = packet.api_e_maxhps || packet.api_maxhps
      const eNowHps = packet.api_e_nowhps || packet.api_nowhps
      this.enemyFleet = this._initEnemy(0, packet.api_ship_ke, packet.api_eSlot, eMaxHps, eNowHps, packet.api_ship_lv, packet.api_eParam) ?? null
      if (packet.api_ship_ke) {
        const eMaxHpsCombined = packet.api_e_maxhps_combined || packet.api_maxhps_combined
        const eNowHpsCombined = packet.api_e_nowhps_combined || packet.api_nowhps_combined
        this.enemyEscort = this._initEnemy(
          packet.api_ship_ke.length,
          packet.api_ship_ke_combined,
          packet.api_eSlot_combined,
          eMaxHpsCombined,
          eNowHpsCombined,
          packet.api_ship_lv_combined,
          packet.api_eParam_combined,
        ) ?? null
      }
    }
    // HACK: Only enemy carrier task force now.
    this.enemyType = (path.includes('ec_') || path.includes('each_')) ? 1 : 0

    if (packet.api_friendly_info != null) {
      const info = packet.api_friendly_info
      this.friendFleet = this._initEnemy(
        0,
        info.api_ship_id,
        info.api_Slot,
        info.api_maxhps,
        info.api_nowhps,
        info.api_ship_lv,
        info.api_Param,
        ShipOwner.Friend,
      ) ?? null
    }

    // MVP rule is special for combined fleet. It may be a kancolle bug.
    if (['/kcsapi/api_req_combined_battle/midnight_battle',
    ].includes(path)) {
      if (fleetType === 1 || fleetType === 2 || fleetType === 3) {
        this._isNightOnlyMVP = true
      }
    }
    // Rank rule is special for ld_airbattle and ld_shooting (considered as raid).
    // FIXME: rename _isAirRaid to a more general name
    if ([
      '/kcsapi/api_req_sortie/ld_airbattle',
      '/kcsapi/api_req_sortie/ld_shooting',
      '/kcsapi/api_req_combined_battle/ld_airbattle',
      '/kcsapi/api_req_combined_battle/ld_shooting',
    ].includes(path)) {
      this._isAirRaid = true
    }
  }

  assert(_packet: BattlePacket, path: string) {
    const { fleetType } = this
    /** Assert fleet.type with API Path **/
    // Normal Fleet
    if (['/kcsapi/api_req_practice/battle',
         '/kcsapi/api_req_sortie/battle',
         '/kcsapi/api_req_sortie/airbattle',
         '/kcsapi/api_req_sortie/ld_airbattle',
         '/kcsapi/api_req_sortie/ld_shooting',
         '/kcsapi/api_req_combined_battle/ec_battle',
         '/kcsapi/api_req_practice/midnight_battle',
         '/kcsapi/api_req_battle_midnight/battle',
         '/kcsapi/api_req_battle_midnight/sp_midnight',
    ].includes(path)) {
      if (!(fleetType === 0)) {
        console.warn(`${path} expect fleet.type=0, but got ${fleetType}.`)
        this.fleetType = 0
      }
    }
    // Carrier Task Force & Transport Escort
    if (['/kcsapi/api_req_combined_battle/battle',
         '/kcsapi/api_req_combined_battle/each_battle',
    ].includes(path)) {
      if (!(fleetType === 1 || fleetType === 3)) {
        console.warn(`${path} expect fleet.type=1,3, but got ${fleetType}.`)
        // HACK: Currently CTF & TE act the same
        this.fleetType = 1
      }
    }
    // Surface Task Force
    if (['/kcsapi/api_req_combined_battle/battle_water',
         '/kcsapi/api_req_combined_battle/each_battle_water',
    ].includes(path)) {
      if (!(fleetType === 2)) {
        console.warn(`${path} expect fleet.type=2, but got ${fleetType}.`)
        this.fleetType = 2
      }
    }
    // Combined Fleet
    if (['/kcsapi/api_req_combined_battle/airbattle',
         '/kcsapi/api_req_combined_battle/ld_airbattle',
         '/kcsapi/api_req_combined_battle/ld_shooting',
         '/kcsapi/api_req_combined_battle/midnight_battle',
         '/kcsapi/api_req_combined_battle/sp_midnight',
    ].includes(path)) {
      if (!(fleetType === 1 || fleetType === 2 || fleetType === 3)) {
        console.warn(`${path} expect fleet.type=1,2,3, but got ${fleetType}.`)
        // We can't detemine fleet.type
      }
    }
    // Any
    if (['/kcsapi/api_req_combined_battle/ec_midnight_battle',
    ].includes(path)) {
      if (!(fleetType === 0 || fleetType === 1 || fleetType === 2 || fleetType === 3)) {
        console.warn(`${path} expect fleet.type=0,1,2,3, but got ${fleetType}.`)
        // We can't detemine fleet.type
      }
    }
  }

  prcsDay(packet: BattlePacket, path: string) {
    const { fleetType, mainFleet, escortFleet, enemyType, enemyFleet, enemyEscort, friendFleet } = this
    const { stages } = this

    // Land base air attack (assault)
    stages.push(simulateLandBase(enemyFleet, enemyEscort, packet.api_air_base_injection, true))
    // Aerial Combat (assault)
    stages.push(simulateAerial(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_injection_kouku, true))
    // Land base air attack
    for (const api_kouku of packet.api_air_base_attack || [])
      stages.push(simulateLandBase(enemyFleet, enemyEscort, api_kouku))
    // Arrial Combat (friendly)
    stages.push(simulateAerial(friendFleet, null, enemyFleet, enemyEscort, packet.api_friendly_kouku))
    // Aerial Combat
    stages.push(simulateAerial(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_kouku))
    // Aerial Combat 2nd
    stages.push(simulateAerial(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_kouku2))
    // Expedition Support Fire
    stages.push(simulateSupport(enemyFleet, enemyEscort, packet.api_support_info, packet.api_support_flag))

    // Normal Fleet
    if (fleetType === 0) {
      if (enemyType === 0) {
        // Opening Anti-Sub
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_taisen,
          StageType.Opening))
        // Opening Torpedo Salvo
        stages.push(simulateOpeningTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
          StageType.Opening))
        // Shelling (Main), 1st
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki1))
        // Shelling (Main), 2nd
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki2))
        // Closing Torpedo Salvo
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_raigeki))
      }
      if (enemyType === 1) {
        // Opening Anti-Sub
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_taisen,
          StageType.Opening))
        // Opening Torpedo Salvo
        stages.push(simulateOpeningTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
          StageType.Opening))
        // Shelling (Escort)
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki1))
        // Closing Torpedo Salvo
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_raigeki))
        // Shelling (Any), 1st
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki2))
        // Shelling (Any), 2nd
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki3))
      }
    }

    // Surface Task Force, 水上打撃部隊
    if (fleetType === 2) {
      if (enemyType === 0) {
        // Opening Anti-Sub
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_taisen,
          StageType.Opening))
        // Opening Torpedo Salvo
        stages.push(simulateOpeningTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
          StageType.Opening))
        // Shelling (Main), 1st
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki1,
          StageType.Main))
        // Shelling (Main), 2nd
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki2,
          StageType.Main))
        // Shelling (Escort)
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki3,
          StageType.Escort))
        // Closing Torpedo Salvo
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_raigeki))
      }
      if (enemyType === 1) {
        // Opening Anti-Sub
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_taisen,
          StageType.Opening))
        // Opening Torpedo Salvo
        stages.push(simulateOpeningTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
          StageType.Opening))
        // Shelling (Main), 1st
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki1,
          StageType.Main))
        // Shelling (Main), 2nd
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki2,
          StageType.Main))
        // Shelling (Escort)
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki3,
          StageType.Escort))
        // Closing Torpedo Salvo
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_raigeki))
      }
    }

    // Carrier Task Force, 空母機動部隊
    // Transport Escort, 輸送護衛部隊
    if (fleetType === 1 || fleetType === 3) {
      if (enemyType === 0) {
        // Opening Anti-Sub
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_taisen,
          StageType.Opening))
        // Opening Torpedo Salvo
        stages.push(simulateOpeningTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
          StageType.Opening))
        // Shelling (Escort)
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki1,
          StageType.Escort))
        // Closing Torpedo Salvo
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_raigeki))
        // Shelling (Main), 1st
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki2,
          StageType.Main))
        // Shelling (Main), 2nd
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki3,
          StageType.Main))
      }
      if (enemyType === 1) {
        // Opening Anti-Sub
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_taisen,
          StageType.Opening))
        // Opening Torpedo Salvo
        stages.push(simulateOpeningTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
          StageType.Opening))
        // Shelling (Main), 1st
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki1,
          StageType.Main))
        // Shelling (Escort)
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki2,
          StageType.Escort))
        // Closing Torpedo Salvo
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_raigeki))
        // Shelling (Main), 2nd
        stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_hougeki3,
          StageType.Main))
      }
    }
  }

  prcsNight(packet: BattlePacket, path: string) {
    const { stages, fleetType, mainFleet, escortFleet, friendFleet, enemyType, enemyFleet, enemyEscort } = this

    // Night to Day Support
    stages.push(simulateSupport(enemyFleet, enemyEscort, packet.api_n_support_info, packet.api_n_support_flag))
    // Night to Day Combat
    stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_n_hougeki1, StageType.Night))
    stages.push(simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_n_hougeki2, StageType.Night))

    // NPC Friend Support
    stages.push(simulateShelling(
      friendFleet,
      null,
      enemyFleet,
      enemyEscort,
      (packet.api_friendly_battle || {}).api_hougeki,
      StageType.Night,
    ))
    // Night Combat
    stages.push(simulateNight(fleetType, mainFleet, escortFleet, enemyType, enemyFleet, enemyEscort, packet.api_hougeki, packet))
  }

  prcsResult(packet: BattlePacket, _path: string) {
    const { mainFleet, escortFleet } = this
    const rankKey = packet.api_win_rank ?? 'D'
    let rank = BattleRankMap[rankKey]
    if (rank === Rank.S) {
      const mainFleetShips = mainFleet ?? []
      const escortFleetShips = escortFleet ?? []
      const initHPSum = [...mainFleetShips, ...escortFleetShips].reduce((x, s) => x + (s ? s.initHP : 0), 0)
      const nowHPSum  = [...mainFleetShips, ...escortFleetShips].reduce((x, s) => x + (s ? s.nowHP  : 0), 0)
      if (nowHPSum >= initHPSum)
        rank = Rank.SS
    }
    this._result = new Result({
      rank: rank,
      mvp : [(packet.api_mvp || 0) - 1, (packet.api_mvp_combined || 0) - 1],
      getShip: (packet.api_get_ship || {}).api_ship_id,
      getItem: (packet.api_get_useitem || {}).api_useitem_id,
    })
  }

  get result() {
    if (this._result != null)
      return this._result

    // Simulate battle result
    const rank = this._isAirRaid
      ? simulateAirRaidBattleRank(this.mainFleet, this.escortFleet)
      : simulateBattleRank(this.mainFleet, this.escortFleet, this.enemyFleet, this.enemyEscort)
    const mvp: [number, number] = this._isNightOnlyMVP
      ? [0, simulateFleetNightMVP(this.stages)]
      : [simulateFleetMVP(this.mainFleet), simulateFleetMVP(this.escortFleet)]

    return new Result({rank, mvp})
  }
}

export default Simulator2
