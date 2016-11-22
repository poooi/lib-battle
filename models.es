
export class Stage {
  constructor(opts) {
    this.type    = opts.type      // StageType
    this.subtype = opts.subtype
    this.attacks = opts.attacks   // [Attack, ...]
    this.kouku   = opts.kouku     // Raw API data `api_kouku`
    this.api     = opts.api       // Engagement: Picked raw data
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
  Opening: "Opening", // Torpedo, opening torpedo salvo
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

export class Result {
  constructor(opts) {
    this.rank    = opts.rank  // 'A', 'B'...
    this.mvp     = opts.mvp   // [0..5, 0..5], MVP index of mainFleet & escortFleet.
    this.getShip = opts.getShip  // id of store.const.$
    this.getItem = opts.getItem  // ^^
  }
}


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
  Normal : "Normal",
  Boss   : "Boss",
  Pratice: "Pratice",
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
