// Simulator
export class Stage {
  constructor(opts) {
    this.type    = opts.type      // StageType
    this.subtype = opts.subtype
    this.attacks = opts.attacks   // [Attack, ...]
    this.aerial  = opts.aerial    // AerialInfo
    this.engagement = opts.engagement  // EngagementInfo
    this.kouku   = opts.kouku     // Raw API data `api_kouku` (Deprecated)
    this.api     = opts.api       // Engagement: Picked raw data (Deprecated)
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
}

export class Attack {
  constructor(opts) {
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
  Primary_Secondary_CI: "PSCI", // カットイン(主砲/副砲)
  Primary_Radar_CI    : "PRCI", // カットイン(主砲/電探)
  Primary_AP_CI       : "PACI", // カットイン(主砲/徹甲)
  Primary_Primary_CI  : "PrCI", // カットイン(主砲/主砲)
  Primary_Torpedo_CI  : "PTCI", // カットイン(主砲/魚雷)
  Torpedo_Torpedo_CI  : "TTCI", // カットイン(魚雷/魚雷)
}

export const HitType = {
  Miss    : 0,
  Hit     : 1,
  Critical: 2,
}

export class Ship {
  constructor(opts) {
    this.id    = opts.id    // int, $ships
    this.owner = opts.owner // ShipOwner
    this.pos   = opts.pos   // int, Position in fleet

    this.maxHP   = opts.maxHP
    this.nowHP   = opts.nowHP
    this.initHP  = opts.nowHP
    this.lostHP  = opts.lostHP || 0
    this.damage  = opts.damage || 0  // Damage from this to others
    this.items   = opts.items
    this.useItem = opts.useItem || null

    this.raw = opts.raw
  }
}

export const ShipOwner = {
  Ours : "Ours",
  Enemy: "Enemy",
}

export class AerialInfo {
  constructor(opts) {
    this.fPlaneInit  = opts.fPlaneInit   // Init plane count of entire aerial combat
    this.fPlaneNow   = opts.fPlaneNow    // Now  plane count of entire aerial combat
    this.ePlaneInit  = opts.ePlaneInit   // ^^
    this.ePlaneNow   = opts.ePlaneNow    // ^^
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
  Incapability: "Air Incapability",
  Denial      : "Air Denial",
}

export class EngagementInfo {
  constructor(opts) {
    this.engagement = opts.engagement  // api_formation[2] => Engagement
    this.fFormation = opts.fFormation  // api_formation[0] => Formation
    this.eFormation = opts.eFormation  // api_formation[1] => Formation
    this.fDetection = opts.fDetection  // api_search[0]    => Detection
    this.eDetection = opts.eDetection  // api_search[1]    => Detection
    this.gimmick    = opts.gimmick     // api_boss_damaged || api_xal01 || null
    // Night Combat
    this.fContact = opts.fContact  // api_touch_plane[0]
    this.eContact = opts.eContact  // api_touch_plane[1]
    this.fFlare   = opts.fFlare    // api_flare_pos[0] => Ship
    this.eFlare   = opts.eFlare    // api_flare_pos[1] => Ship
  }
}

export const Engagement = {
  Parallel     : "Parallel Engagement",
  Headon       : "Head-on Engagement",
  TAdvantage   : "Crossing the T (Advantage)",
  TDisadvantage: "Crossing the T (Disadvantage)",
}

export const Formation = {
  Ahead  : "Line Ahead",
  Double : "Double Line",
  Diamond: "Diamond",
  Echelon: "Echelon",
  Abreast: "Line Abreast",
  CruisingAntiSub: "Cruising Formation 1 (anti-sub)",
  CruisingForward: "Cruising Formation 2 (forward)",
  CruisingDiamond: "Cruising Formation 3 (diamond)",
  CruisingBattle : "Cruising Formation 4 (battle)",
}

export const Detection = {
  Success  : "Success",
  Failure  : "Failure",
  SuccessNR: "Success (not return)",
  FailureNR: "Failure (not return)",
  SuccessNP: "Success (without plane)",
  FailureNP: "Failure (without plane)",
}

export class Result {
  constructor(opts) {
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
}

// PacketManager
export class Battle {
  constructor(opts) {
    this.version = "2.1"
    this.type    = opts.type    // BattleType
    this.map     = opts.map     // [int, int, int] : 2-3-1
    this.desc    = opts.desc    // Description
    this.time    = opts.time    // Seconds since epoch time. Must be same as the first packet.
    this.fleet   = opts.fleet   // [api_port/port.api_ship[], ...] (Extended)
    this.packet  = opts.packet  // [Packet, ...] : Order by time
  }
}

export const BattleType = {
  Normal  : "Normal",
  Boss    : "Boss",
  Practice: "Pratice",
}

export class Fleet {
  constructor(opts) {
    this.type    = opts.type     // api_port/port.api_combined_flag
    this.main    = opts.main     // api_get_member/deck[].api_ship (Extended)
    this.escort  = opts.escort   // ^^
    this.support = opts.support  // ^^
    this.LBAC    = opts.LBAC     // api_get_member/base_air_corps (Extended)
  }
}
