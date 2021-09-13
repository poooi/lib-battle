
export class Stage {
  constructor(opts) {
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
  Nelson_Touch: "Nelson",       // ネルソンタッチ
  Nagato_Punch: "Nagato",       // 一斉射かッ…胸が熱いな！
  Mutsu_Splash:  "Mutsu",       // 長門、いい？ いくわよ！ 主砲一斉射ッ！
  Colorado_Fire: "Colorado",    // 	Colorado戦隊、全力斉射！各個目標に砲撃開始！一気に殲滅する、Fire!!
  Kongo_Class_Kaini_C_Charge: "Kongo_Class_Kaini_C",
  Carrier_CI:           "CVCI", // 空母カットイン
  Primary_Secondary_CI: "PSCI", // カットイン(主砲/副砲)
  Primary_Radar_CI    : "PRCI", // カットイン(主砲/電探)
  Primary_AP_CI       : "PACI", // カットイン(主砲/徹甲)
  Primary_Primary_CI  : "PrCI", // カットイン(主砲/主砲)
  Primary_Torpedo_CI  : "PTCI", // カットイン(主砲/魚雷)
  Torpedo_Torpedo_CI  : "TTCI", // カットイン(魚雷/魚雷)
}

export const MultiTargetAttackType = new Set([
  AttackType.Nelson_Touch,
  AttackType.Nagato_Punch,
  AttackType.Mutsu_Splash,
  AttackType.Colorado_Fire,
  AttackType.Kongo_Class_Kaini_C_Charge,
  AttackType.Laser,
])

export const MultiTargetAttackOrder = {
  [AttackType.Nelson_Touch]: [0, 2, 4],
  [AttackType.Nagato_Punch]: [0, 0, 1],
  [AttackType.Mutsu_Splash]: [0, 0, 1],
  [AttackType.Colorado_Fire]: [0, 1, 2],
  [AttackType.Kongo_Class_Kaini_C_Charge]: [0, 1],
  [AttackType.Laser]: [0, 0, 0],
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
}

export class AerialInfo {
  constructor(opts) {
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
}

export class EngagementInfo {
  constructor(opts) {
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
    this.weakened = this.weakened  // api_boss_damaged, api_xal01, ...
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
  Vanguard: "Vanguard",
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
}
// api_stage1.api_disp_seiku => ~
export const AirControlMap = {
  0: AirControl.Parity,
  1: AirControl.Supremacy,
  2: AirControl.Superiority,
  3: AirControl.Denial,
  4: AirControl.Incapability,
}
// api_search[] => ~
export const DetectionMap = {
  1: Detection.Success,
  2: Detection.SuccessNR,
  3: Detection.FailureNR,
  4: Detection.Failure,
  5: Detection.SuccessNP,
  6: Detection.FailureNP,
}
// api_formation[0,1] => ~
export const FormationMap = {
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
export const EngagementMap = {
  1: Engagement.Parallel,
  2: Engagement.Headon,
  3: Engagement.TAdvantage,
  4: Engagement.TDisadvantage,
}
// api_support_flag => ~
export const SupportTypeMap = {
  1: StageType.Aerial,
  2: StageType.Shelling,
  3: StageType.Torpedo,
}
// api_win_rank => ~
export const BattleRankMap = {
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

function useItem(ship) {
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

function damageShip(fromShip, toShip, damage) {
  if (fromShip != null) {
    fromShip.damage += damage
  }
  let fromHP = toShip.nowHP
  toShip.nowHP  -= damage
  toShip.lostHP += damage
  let item   = useItem(toShip)
  if (item) {
    toShip.useItem = item
  }
  let toHP   = toShip.nowHP
  // `toShip.*` is updated in place
  return {fromHP, toHP, item}
}

function preventNullObject(o) {
  // Prevent returning Object with all properties null.
  let isNull = true
  for (const k of Object.keys(o)) {
    isNull = isNull && o[k] == null
  }
  return isNull ? null : o
}

function generateAerialInfo(kouku, mainFleet, escortFleet) {
  if (!(kouku != null))
    return

  const stage1 = kouku.api_stage1
  const stage2 = kouku.api_stage2
  const o = new AerialInfo({})
  let fPlaneLost = 0, ePlaneLost = 0

  // Stage 1
  if (stage1 != null) {
    const contact = stage1.api_touch_plane || [-1, -1]
    o.control  = AirControlMap[stage1.api_disp_seiku]
    o.fContact = contact[0] > 0 ? contact[0] : null
    o.eContact = contact[1] > 0 ? contact[1] : null
    o.fPlaneInit1 = stage1.api_f_count
    o.fPlaneNow1  = stage1.api_f_count - stage1.api_f_lostcount
    o.ePlaneInit1 = stage1.api_e_count
    o.ePlaneNow1  = stage1.api_e_count - stage1.api_e_lostcount
    fPlaneLost += stage1.api_f_lostcount
    ePlaneLost += stage1.api_e_lostcount
  }
  // Stage 2
  if (stage2 != null) {
    const airfire = kouku.api_stage2.api_air_fire
    if (airfire != null) {
      let ship = null, idx = airfire.api_idx
      const mainFleetRange = mainFleet.length
      if (0 <= idx && idx <= mainFleetRange)  ship = mainFleet[idx]
      if (mainFleetRange <= idx) ship = escortFleet[idx - mainFleetRange]
      o.aaciKind = airfire.api_kind
      o.aaciShip = ship
      o.aaciItems = airfire.api_use_items
    }
    o.fPlaneInit2 = stage2.api_f_count
    o.fPlaneNow2  = stage2.api_f_count - stage2.api_f_lostcount
    o.ePlaneInit2 = stage2.api_e_count
    o.ePlaneNow2  = stage2.api_e_count - stage2.api_e_lostcount
    fPlaneLost += stage2.api_f_lostcount
    ePlaneLost += stage2.api_e_lostcount
  }
  // Summary
  // We assume stage2 won't exist without stage1
  if (stage1 != null) {
    o.fPlaneInit = stage1.api_f_count
    o.fPlaneNow  = stage1.api_f_count - fPlaneLost
    o.ePlaneInit = stage1.api_e_count
    o.ePlaneNow  = stage1.api_e_count - ePlaneLost
  }

  return preventNullObject(o)
}

function generateEngagementInfo(packet, oursFleet, emenyFleet, opts={}) {
  if (!(packet != null))
    return
  opts = {...{engagement: false, night: false}, ...opts}

  const o = new EngagementInfo({})

  if (opts.engagement) {
    // Battle Engagement
    const {api_formation, api_search} = packet
    if (api_formation != null) {
      o.engagement = EngagementMap[api_formation[2]]
      o.fFormation = FormationMap[api_formation[0]]
      o.eFormation = FormationMap[api_formation[1]]
    }
    if (api_search != null) {
      o.fDetection = DetectionMap[api_search[0]]
      o.eDetection = DetectionMap[api_search[1]]
    }
    // Weaken mechanism
    const {api_boss_damaged, api_xal01} = packet
    o.weakened = [api_boss_damaged, api_xal01].find(x => x != null)
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
      o.fFlare   =  oursFleet[api_flare_pos[0] - 1]
      o.eFlare   = emenyFleet[api_flare_pos[1] - 1]
    }
  }

  return preventNullObject(o)
}

function simulateAerialAttack(fleet, edam, ebak_flag, erai_flag, ecl_flag) {
  if (!(fleet != null && edam != null)) {
    return []
  }
  const list = []
  for (let [i, damage] of edam.entries()) {
    if ((damage < 0) || (ebak_flag[i] <= 0 && erai_flag[i] <= 0))
      continue
    damage = Math.floor(damage)
    let toShip = fleet[i]
    let hit = (ecl_flag[i] === 1 ? HitType.Critical : (damage > 0 ? HitType.Hit : HitType.Miss))
    let {fromHP, toHP, item} = damageShip(null, toShip, damage)
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

function simulateAerial(mainFleet, escortFleet, enemyFleet, enemyEscort, kouku, assault=false) {
  if (!(kouku != null)) {
    return
  }
  let attacks = []
  if (kouku.api_stage3 != null) {
    const st3 = kouku.api_stage3
    attacks = attacks.concat(simulateAerialAttack(enemyFleet, st3.api_edam, st3.api_ebak_flag, st3.api_erai_flag, st3.api_ecl_flag))
    attacks = attacks.concat(simulateAerialAttack(mainFleet, st3.api_fdam, st3.api_fbak_flag, st3.api_frai_flag, st3.api_fcl_flag))
  }
  if (kouku.api_stage3_combined != null) {
    const st3 = kouku.api_stage3_combined
    attacks = attacks.concat(simulateAerialAttack(enemyEscort, st3.api_edam, st3.api_ebak_flag, st3.api_erai_flag, st3.api_ecl_flag))
    attacks = attacks.concat(simulateAerialAttack(escortFleet, st3.api_fdam, st3.api_fbak_flag, st3.api_frai_flag, st3.api_fcl_flag))
  }
  let aerial = generateAerialInfo(kouku, mainFleet, escortFleet)
  return new Stage({
    type   : StageType.Aerial,
    subtype: assault ? StageType.Assault : null,
    attacks: attacks,
    aerial : aerial,
    kouku  : kouku,
  })
}

function simulateTorpedoAttack(mainFleet, escortFleet, enemyFleet, enemyEscort, eydam, erai, ecl) {
  if (!(enemyFleet != null && eydam != null)) {
    return []
  }
  const list = []
  for (let [i, t] of erai.entries()) {
    let fromShip, toShip
    const mainFleetRange = mainFleet.length
    const enemyFleetRange = enemyFleet.length
    if (i < 0 || t < 0) continue
    if (i < mainFleetRange) fromShip = mainFleet[i]
    else        fromShip = escortFleet[i - mainFleetRange]
    if (t < enemyFleetRange) toShip = enemyFleet[t]
    else        toShip = enemyEscort[t - enemyFleetRange]
    let damage = Math.floor(eydam[i])
    let hit = (ecl[i] === 2 ? HitType.Critical : (ecl[i] === 1 ? HitType.Hit : HitType.Miss))
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

function simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, raigeki, subtype) {
  if (!(raigeki != null)) {
    return
  }
  let attacks = []
  if (raigeki.api_frai != null)
    attacks = attacks.concat(simulateTorpedoAttack(mainFleet, escortFleet, enemyFleet, enemyEscort,
      raigeki.api_fydam, raigeki.api_frai, raigeki.api_fcl))
  if (raigeki.api_erai != null)
    attacks = attacks.concat(simulateTorpedoAttack(enemyFleet, enemyEscort, mainFleet, escortFleet,
      raigeki.api_eydam, raigeki.api_erai, raigeki.api_ecl))
  return new Stage({
    type: StageType.Torpedo,
    attacks: attacks,
    subtype: subtype,
  })
}

function simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, hougeki, subtype) {
  if (!(hougeki != null)) {
    return
  }
  const isNight = (subtype == StageType.Night)
  const list = []
  const mainFleetRange = mainFleet.length
  const enemyFleetRange = enemyFleet.length
  for (let [i, attacker] of (hougeki.api_at_list || []).entries()) {
    if (attacker === -1) continue
    let attackType = isNight ? NightAttackTypeMap[hougeki.api_sp_list[i]] : DayAttackTypeMap[hougeki.api_at_type[i]]
    let at = attacker
    if (!MultiTargetAttackType.has(attackType)) {
      let df, fromEnemy  // Declare ahead
      df = hougeki.api_df_list[i][0] // Defender
      if (hougeki.api_at_eflag != null) {
        fromEnemy = hougeki.api_at_eflag[i] === 1
      } else {
        fromEnemy = df < mainFleetRange
        if (at >= mainFleetRange) at -= mainFleetRange
        if (df >= mainFleetRange) df -= mainFleetRange
      }
      let fromShip, toShip
      if (fromEnemy) {
        fromShip = at < enemyFleetRange ? enemyFleet[at] : enemyEscort[at - enemyFleetRange]
        toShip   = df < mainFleetRange ? mainFleet[df]  : escortFleet[df - mainFleetRange]
      } else {
        fromShip = at < mainFleetRange ? mainFleet[at]  : escortFleet[at - mainFleetRange]
        toShip   = df < enemyFleetRange ? enemyFleet[df] : enemyEscort[df - enemyFleetRange]
      }

      let damage = []
      let damageTotal = 0
      for (let dmg of hougeki.api_damage[i]) {
        if (dmg < 0) dmg = 0
        dmg = Math.floor(dmg)
        damage.push(dmg)
        damageTotal += dmg
      }
      let hit = []
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
        let df, fromEnemy  // Declare ahead
        df = hougeki.api_df_list[i][j] // Defender
        let at = attacker + order[j] // Attacker
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
        let fromShip, toShip
        if (fromEnemy) {
          fromShip = at < enemyFleetRange ? enemyFleet[at] : enemyEscort[at - enemyFleetRange]
          toShip   = df < mainFleetRange ? mainFleet[df]  : escortFleet[df - mainFleetRange]
        } else {
          fromShip = at < mainFleetRange ? mainFleet[at]  : escortFleet[at - mainFleetRange]
          toShip   = df < enemyFleetRange ? enemyFleet[df] : enemyEscort[df - enemyFleetRange]
        }

        let damage = []
        let dmg = hougeki.api_damage[i][j]
        if (dmg < 0) dmg = 0
        dmg = Math.floor(dmg)
        damage.push(dmg)
        let hit = []
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

function simulateNight(fleetType, mainFleet, escortFleet, enemyType, enemyFleet, enemyEscort, hougeki, packet) {
  const stage = simulateShelling(mainFleet, escortFleet, enemyFleet, enemyEscort, hougeki, StageType.Night)
  if (stage) {
    let _oursFleet  = fleetType === 0 ? mainFleet  : escortFleet
    let _enemyFleet = enemyType === 0 ? enemyFleet : enemyEscort
    if (packet.api_active_deck != null) {
      if (packet.api_active_deck[0] === 1) {
        _oursFleet = mainFleet
      }
      if (packet.api_active_deck[0] === 2) {
        _oursFleet = escortFleet
      }
      if (packet.api_active_deck[1] === 1) {
        _enemyFleet = enemyFleet
      }
      if (packet.api_active_deck[1] === 2) {
        _enemyFleet = enemyEscort
      }
    }
    stage.engagement = generateEngagementInfo(packet, _oursFleet, _enemyFleet, {night: true})
  }
  return stage
}

function simulateSupport(enemyFleet, enemyEscort, support, flag) {
  if (!(support != null && flag != null)) {
    return
  }
  if (flag === 1 || flag === 4) {
    const kouku = support.api_support_airatack
    const st3 = kouku.api_stage3
    let fleet = [].concat(enemyFleet, enemyEscort || [])
    let attacks = simulateAerialAttack(fleet, st3.api_edam, st3.api_ebak_flag, st3.api_erai_flag, st3.api_ecl_flag)
    let aerial = generateAerialInfo(kouku, null, null)
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
    let attacks = []
    const enemyFleetRange = enemyFleet.length
    for (let [i, damage] of hourai.api_damage.entries()) {
      let toShip
      if (0 <= i && i < enemyFleetRange)
        toShip = enemyFleet[i]
      if (enemyFleetRange <= i && enemyEscort) // TANAKA: api_damage.length = 7 with 6 ships
        toShip = enemyEscort[i - enemyFleetRange]
      if (toShip == null)
        continue
      damage = Math.floor(damage)
      let cl = hourai.api_cl_list[i]
      let hit = (cl === 2 ? HitType.Critical : (cl === 1 ? HitType.Hit : HitType.Miss))
      // No showing Miss attack on support stage.
      if (hit === HitType.Miss)
        continue
      let {fromHP, toHP, item} = damageShip(null, toShip, damage)
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
}

function simulateLandBase(enemyFleet, enemyEscort, kouku, assault=false) {
  let stage = simulateAerial(null, null, enemyFleet, enemyEscort, kouku)
  if (stage != null) {
    stage.type = StageType.LandBase
    stage.subtype = assault ? StageType.Assault : null
  }
  return stage
}

function simulateBattleRank(mainFleet, escortFleet, enemyFleet, enemyEscort) {
  // https://github.com/andanteyk/ElectronicObserver/blob/master/ElectronicObserver/Other/Information/kcmemo.md#%E6%88%A6%E9%97%98%E5%8B%9D%E5%88%A9%E5%88%A4%E5%AE%9A
  function calStatus(fleet) {
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
  const ours  = calStatus([].concat(mainFleet,  escortFleet))
  const enemy = calStatus([].concat(enemyFleet, enemyEscort))

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

function simulateAirRaidBattleRank(mainFleet, escortFleet) {
  // https://github.com/andanteyk/ElectronicObserver/blob/master/ElectronicObserver/Other/Information/kcmemo.md#%E9%95%B7%E8%B7%9D%E9%9B%A2%E7%A9%BA%E8%A5%B2%E6%88%A6%E3%81%A7%E3%81%AE%E5%8B%9D%E5%88%A9%E5%88%A4%E5%AE%9A
  let initHPSum = [].concat(mainFleet, escortFleet || []).reduce((x, s) => x + (s ? s.initHP : 0), 0)
  let nowHPSum  = [].concat(mainFleet, escortFleet || []).reduce((x, s) => x + (s ? s.nowHP  : 0),  0)
  let rate = (initHPSum - nowHPSum) / initHPSum * 100

  if (rate <= 0) return Rank.SS
  if (rate < 10) return Rank.A
  if (rate < 20) return Rank.B
  if (rate < 50) return Rank.C
  if (rate < 80) return Rank.D
  // else
  return Rank.E
}

function simulateFleetMVP(fleet) {
  if (fleet == null) fleet = []
  let m = -1, mvp = null
  for (const [i, ship] of fleet.entries()) {
    if (ship == null)
      continue
    if (mvp == null || ship.damage > mvp.damage) {
      m = i
      mvp = ship
    }
  }
  return m
}

function simulateFleetNightMVP(stages) {
  // Damage sum: Only escort fleet
  let sum = Array(6).fill(0)
  for (const stage of stages) {
    if (!(stage != null && stage.attacks != null))
      continue
    if (!(stage.type === StageType.Shelling && stage.subtype === StageType.Night))
      continue
    for (const attack of stage.attacks) {
      const {fromShip: ship, damage} = attack
      if (ship == null || ship.owner != ShipOwner.Ours)
        continue
      const {pos} = ship
      if (6 <= pos && pos <= 11)
        sum[pos - 7] += damage.reduce((x, y) => x + y, 0)
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

function getEngagementStage(packet) {
  // This function is usable for day combat only.
  const engagement = generateEngagementInfo(packet, null, null, {engagement: true})
  return engagement == null ? null : new Stage({
    type: StageType.Engagement,
    engagement: engagement,
  })
}


class Simulator2 {
  constructor(fleet, opts={}) {
    // When no using poi API:
    //   enemyShip.raw == null
    this.usePoiAPI = opts.usePoiAPI

    this.fleetType    = fleet.type || 0
    this.mainFleet    = this._initFleet(fleet.main, 0)
    this.escortFleet  = this._initFleet(fleet.escort, 6)
    this.supportFleet = this._initFleet(fleet.support)
    this.landBaseAirCorps = fleet.LBAC
    this.enemyFleet   = null  // Assign at first packet
    this.enemyEscort  = null  // ^
    this.friendFleet  = null // NPC Friend fleet support

    // Stage
    this.stages  = []
    this._result = null
    this._isAirRaid = false
    this._isEngaged = false
    this._isNightOnlyMVP = false
  }

  static auto(battle, opts) {
    if (battle == null)
      return
    let s = new Simulator2(battle.fleet, opts)
    for (const packet of battle.packet)
      s.simulate(packet)
    return s
  }

  _initFleet(rawFleet, intl=0) {
    if (!(rawFleet != null)) return
    let fleet = []
    for (let [i, rawShip] of rawFleet.entries()) {
      if (rawShip != null) {
        let slots = rawShip.poi_slot.concat(rawShip.poi_slot_ex)
        let baseParam, finalParam
        if (this.usePoiAPI) {
          const kyouka = rawShip.api_kyouka
          const $ship = window.$ships[rawShip.api_ship_id]
          if (typeof $ship != 'undefined') {
            baseParam =[
              $ship.api_houg[0] + kyouka[0],
              $ship.api_raig[0] + kyouka[1],
              $ship.api_tyku[0] + kyouka[2],
              $ship.api_souk[0] + kyouka[3],
            ]
          }
          finalParam = [
            rawShip.api_karyoku[0],
            rawShip.api_raisou[0],
            rawShip.api_taiku[0],
            rawShip.api_soukou[0],
          ]
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

  _initEnemy(intl=0, api_ship_ke, api_eSlot, api_e_maxhps, api_e_nowhps, api_ship_lv, api_param=[], owner=ShipOwner.Enemy) {
    if (!(api_ship_ke != null)) return
    let fleet = []
    const range = [...new Array(api_ship_ke.length).keys()]
    for (const i of range) {
      let id    = api_ship_ke[i]
      let slots = api_eSlot[i] || []
      let ship, raw, baseParam, finalParam
      if (typeof id === "number" && id > 0) {
        if (this.usePoiAPI) {
          raw = {
            api_ship_id: id,
            api_lv: api_ship_lv[i],
            poi_slot: slots.map(id => window.$slotitems[id]),
          }
          baseParam = api_param[i] || [0, 0, 0, 0]
          finalParam = slots.reduce((bonus, id) => {
            const item = window.$slotitems[id] || {}
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

  simulate(packet) {
    if (packet == null) return
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

  prepare(packet, path) {
    const { fleetType, enemyFleet } = this
    if (enemyFleet == null) {
      this.enemyFleet = this._initEnemy(0, packet.api_ship_ke, packet.api_eSlot, packet.api_e_maxhps, packet.api_e_nowhps, packet.api_ship_lv, packet.api_eParam)
      if (packet.api_ship_ke)
        this.enemyEscort = this._initEnemy(packet.api_ship_ke.length, packet.api_ship_ke_combined, packet.api_eSlot_combined, packet.api_e_maxhps_combined, packet.api_e_nowhps_combined, packet.api_ship_lv_combined, packet.api_eParam_combined)
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
      )
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

  assert(packet, path) {
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

  prcsDay(packet, path) {
    const { fleetType, mainFleet, escortFleet, enemyType, enemyFleet, enemyEscort } = this
    const { stages } = this

    // Land base air attack (assault)
    stages.push(simulateLandBase(enemyFleet, enemyEscort, packet.api_air_base_injection, true))
    // Aerial Combat (assault)
    stages.push(simulateAerial(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_injection_kouku, true))
    // Land base air attack
    for (const api_kouku of packet.api_air_base_attack || [])
      stages.push(simulateLandBase(enemyFleet, enemyEscort, api_kouku))
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
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
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
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
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
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
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
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
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
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
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
        stages.push(simulateTorpedo(mainFleet, escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack,
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

  prcsNight(packet, path) {
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

  prcsResult(packet, path) {
    const { mainFleet, escortFleet } = this
    let rank = BattleRankMap[packet.api_win_rank]
    if (rank === Rank.S) {
      const initHPSum = [].concat(mainFleet, escortFleet || []).reduce((x, s) => x + (s ? s.initHP : 0), 0)
      const nowHPSum  = [].concat(mainFleet, escortFleet || []).reduce((x, s) => x + (s ? s.nowHP  : 0), 0)
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
    const mvp = this._isNightOnlyMVP
      ? [0, simulateFleetNightMVP(this.stages)]
      : [simulateFleetMVP(this.mainFleet), simulateFleetMVP(this.escortFleet)]

    return new Result({rank, mvp})
  }
}

export default Simulator2
