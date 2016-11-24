
import _ from 'lodash'
import {Stage, StageType, Attack, AttackType, HitType, Ship, ShipOwner, Result} from './models'

// 特殊砲撃: 0=通常, 1=レーザー攻撃, 2=連撃, 3=カットイン(主砲/副砲), 4=カットイン(主砲/電探), 5=カットイン(主砲/徹甲), 6=カットイン(主砲/主砲)
const DayAttackTypeMap = {
  0: AttackType.Normal,
  1: AttackType.Laser,
  2: AttackType.Double,
  3: AttackType.Primary_Secondary_CI,
  4: AttackType.Primary_Radar_CI,
  5: AttackType.Primary_AP_CI,
  6: AttackType.Primary_Primary_CI,
}

// 夜戦攻撃: 0=通常攻撃, 1=連撃, 2=カットイン(主砲/魚雷), 3=カットイン(魚雷/魚雷), 4=カットイン(主砲/副砲), 5=カットイン(主砲/主砲)
const NightAttackTypeMap = {
  0: AttackType.Normal,
  1: AttackType.Double,
  2: AttackType.Primary_Torpedo_CI,
  3: AttackType.Torpedo_Torpedo_CI,
  4: AttackType.Primary_Secondary_CI,
  5: AttackType.Primary_Primary_CI,
}

const SupportTypeMap = {
  1: StageType.Aerial,
  2: StageType.Shelling,
  3: StageType.Torpedo,
}

const HalfSunkNumber = [  // 7~12 is guessed.
  0, 1, 1, 2, 2, 3, 4, 4, 5, 6, 7, 7, 8
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
  toShip.useItem = item
  let toHP   = toShip.nowHP
  // `toShip.*` is updated in place
  return {fromHP, toHP, item}
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
    let toShip = fleet[i - 1]
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

function simulateAerial(mainFleet, escortFleet, enemyFleet, enemyEscort, kouku) {
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
  return new Stage({
    type: StageType.Aerial,
    attacks: attacks,
    kouku: kouku,
  })
}

// TODO: torpedo from main & escort fleet
function simulateTorpedoAttack(mainFleet, escortFleet, enemyFleet, enemyEscort, api_eydam, api_erai, api_ecl) {
  if (!(enemyFleet != null && api_eydam != null)) {
    return []
  }
  const list = []
  for (let [i, t] of api_erai.entries()) {
    let fromShip, toShip
    if (i <= 0 || t <= 0) continue
    if (i <= 6) fromShip = mainFleet[i - 1]
    else        fromShip = escortFleet[i - 7]
    if (t <= 6) toShip = enemyFleet[t - 1]
    else        toShip = enemyEscort[t - 7]
    let damage = Math.floor(api_eydam[i])
    let hit = (api_ecl[i] === 2 ? HitType.Critical : (api_ecl[i] === 1 ? HitType.Hit : HitType.Miss))
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
  for (let [i, at] of hougeki.api_at_list.entries()) {
    if (at === -1) continue
    let df, fromEnemy  // Declare ahead
    at =  at - 1                        // Attacker
    df = hougeki.api_df_list[i][0] - 1  // Defender
    if (hougeki.api_at_eflag != null) {
      fromEnemy = hougeki.api_at_eflag[i] === 1
    } else {
      fromEnemy = df < 6
      if (at >= 6) at -= 6
      if (df >= 6) df -= 6
    }
    let fromShip, toShip
    if (fromEnemy) {
      fromShip = at < 6 ? enemyFleet[at] : enemyEscort[at - 6]
      toShip   = df < 6 ? mainFleet[df]  : escortFleet[df - 6]
    } else {
      fromShip = at < 6 ? mainFleet[at]  : escortFleet[at - 6]
      toShip   = df < 6 ? enemyFleet[df] : enemyEscort[df - 6]
    }

    let attackType = isNight ? NightAttackTypeMap[hougeki.api_sp_list[i]] : DayAttackTypeMap[hougeki.api_at_type[i]]
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
  }
  return new Stage({
    type: StageType.Shelling,
    attacks: list,
    subtype: subtype,
  })
}

function simulateNight(fleetType, mainFleet, escortFleet, enemyType, enemyFleet, enemyEscort, hougeki, packet) {
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
  let stage = simulateShelling(_oursFleet, null, _enemyFleet, null, hougeki, StageType.Night)
  stage.api = _.pick(packet, 'api_touch_plane', 'api_flare_pos')
  return stage
}

function simulateSupport(enemyFleet, enemyEscort, support, flag) {
  if (!(support != null && flag != null)) {
    return
  }
  if (flag === 1) {
    let stage = simulateAerial(null, null, enemyFleet, enemyEscort, support.api_support_airatack)
    return new Stage({
      ...stage,
      type: StageType.Support,
      subtype: SupportTypeMap[flag],
    })
  }
  if (flag === 2 || flag === 3) {
    const hourai = support.api_support_hourai
    let attacks = []
    for (let [i, damage] of hourai.api_damage.entries()) {
      let toShip
      if (1 <= i && i <= 6)
        toShip = enemyFleet[i - 1]
      if (7 <= i && i <= 12)
        toShip = enemyEscort[i - 7]
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

function simulateLandBase(enemyFleet, enemyEscort, kouku) {
  let stage = simulateAerial(null, null, enemyFleet, enemyEscort, kouku)
  stage.type = StageType.LandBase
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
      if (ship.pos === 1) {
        flagshipSunk     = (nowHP <= 0)
        flagshipCritical = (nowHP * 4 <= maxHP)
      }
    }
    return {
      num: shipNum,
      sunk: sunkNum,
      rate: Math.floor(lostHP / totalHP * 100),
      flagshipSunk, flagshipCritical,
    }
  }
  const ours  = calStatus([].concat(mainFleet,  escortFleet))
  const enemy = calStatus([].concat(enemyFleet, enemyEscort))

  if (ours.sunk === 0) {
    if (enemy.sunk === enemy.num) {
      if (ours.rate <= 0)
        return 'SS'
      else
        return 'S'
    }
    if (enemy.num > 1 && enemy.sunk >= HalfSunkNumber[enemy.num]) {
      return 'A'
    }
  }
  if (enemy.flagshipSunk && ours.sunk < enemy.sunk) {
    return 'B'
  }
  if (ours.num === 1 && ours.flagshipCritical) {
    return 'D'
  }
  if (2 * enemy.rate > 5 * ours.rate) {
    return 'B'
  }
  if (9 * enemy.rate > 10 * ours.rate) {
    return 'C'
  }
  if (ours.sunk > 0 && (ours.num - ours.sunk) === 1) {
    return 'E'
  }
  return 'D'
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
      if (7 <= pos && pos <= 12)
        sum[pos - 7] += damage.reduce((x, y) => x + y, 0)
      else
        console.warn("Non-escort fleet ship attack in night stage", ship, attack)
    }
  }
  // MVP index: m = main fleet, e = escort fleet
  let m = 0
  for (const i of _.range(0,6))
    if (sum[i] > m)
      m = i
  return m
}

function getEngagementStage(packet) {
  let picks = _.pick(packet, 'api_search', 'api_formation')
  picks.gimmick = [packet.api_boss_damaged, packet.api_xal01].find(x => x != null)
  return new Stage({
    type: StageType.Engagement,
    api: picks,
  })
}

class Simulator2 {
  constructor(fleet, opts={}) {
    this.fleetType    = fleet.type || 0
    this.mainFleet    = this._initFleet(fleet.main, 0)
    this.escortFleet  = this._initFleet(fleet.escort, 6)
    this.supportFleet = this._initFleet(fleet.support)
    this.landBaseAirCorps = fleet.LBAC
    this.enemyFleet   = null  // Assign at first packet
    this.enemyEscort  = null  // ^

    // When no using poi API:
    //   enemyShip.raw == null
    this.usePoiAPI = opts.usePoiAPI

    // Stage
    this.stages  = []
    this._result = null
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
        fleet.push(new Ship({
          id   : rawShip.api_ship_id,
          owner: ShipOwner.Ours,
          pos  : intl + i + 1,
          maxHP: rawShip.api_maxhp,
          nowHP: rawShip.api_nowhp,
          items: slots.map(slot => slot != null ? slot.api_slotitem_id : null),
          raw  : rawShip,
        }))
      } else {
        fleet.push(null)
      }
    }
    return fleet
  }

  _initEnemy(intl=0, api_ship_ke, api_eSlot, api_maxhps, api_nowhps, api_ship_lv) {
    if (!(api_ship_ke != null)) return
    let fleet = []
    for (const i of _.range(1, 7)) {
      let id    = api_ship_ke[i]
      let slots = api_eSlot[i - 1] || []
      let ship, raw
      if (typeof id === "number" && id > 0) {
        if (this.usePoiAPI)
          raw = {
            api_ship_id: id,
            api_lv: api_ship_lv[i],
            poi_slot: slots.map(id => window.$slotitems[id]),
          }
        ship = new Ship({
          id   : id,
          owner: ShipOwner.Enemy,
          pos  : intl + i,
          maxHP: api_maxhps[i + 6],
          nowHP: api_nowhps[i + 6],
          items: [],  // We dont care
          raw  : raw,
        })
      }
      fleet.push(ship)
    }
    return fleet
  }

  simulate(packet) {
    if (packet == null) return
    const path = packet.poi_path

    if (this.enemyFleet == null) {
      this.enemyFleet = this._initEnemy(0, packet.api_ship_ke, packet.api_eSlot, packet.api_maxhps, packet.api_nowhps, packet.api_ship_lv)
      this.enemyEscort = this._initEnemy(6, packet.api_ship_ke_combined, packet.api_eSlot_combined, packet.api_maxhps_combined, packet.api_nowhps_combined, packet.api_ship_lv_combined)
    }
    // HACK: Only enemy carrier task force now.
    const enemyType = (path.includes('ec_') || path.includes('each_')) ? 1 : 0

    const {fleetType, mainFleet, escortFleet, enemyFleet, enemyEscort} = this
    const {stages} = this

    if (['/kcsapi/api_req_practice/battle',
         '/kcsapi/api_req_sortie/battle',
         '/kcsapi/api_req_sortie/airbattle',
         '/kcsapi/api_req_sortie/ld_airbattle',
         '/kcsapi/api_req_combined_battle/battle',
         '/kcsapi/api_req_combined_battle/battle_water',
         '/kcsapi/api_req_combined_battle/airbattle',
         '/kcsapi/api_req_combined_battle/ld_airbattle',
         '/kcsapi/api_req_combined_battle/ec_battle',
         '/kcsapi/api_req_combined_battle/each_battle',
        ].includes(path)) {

      // Engagement
      stages.push(getEngagementStage(packet))
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
          stages.push(simulateShelling(mainFleet, null, enemyFleet, null, packet.api_opening_taisen,
            StageType.Opening))
          // Opening Torpedo Salvo
          stages.push(simulateTorpedo(mainFleet, null, enemyFleet, null, packet.api_opening_atack,
            StageType.Opening))
          // Shelling (Main), 1st
          stages.push(simulateShelling(mainFleet, null, enemyFleet, null, packet.api_hougeki1))
          // Shelling (Main), 2nd
          stages.push(simulateShelling(mainFleet, null, enemyFleet, null, packet.api_hougeki2))
          // Closing Torpedo Salvo
          stages.push(simulateTorpedo(mainFleet, null, enemyFleet, null, packet.api_raigeki))
        }
        if (enemyType === 1) {
          // Opening Anti-Sub
          stages.push(simulateShelling(mainFleet, null, enemyFleet, enemyEscort, packet.api_opening_taisen,
            StageType.Opening))
          // Opening Torpedo Salvo
          stages.push(simulateTorpedo(mainFleet, null, enemyFleet, enemyEscort, packet.api_opening_atack,
            StageType.Opening))
          // Shelling (Escort)
          stages.push(simulateShelling(mainFleet, null, enemyFleet, enemyEscort, packet.api_hougeki1))
          // Closing Torpedo Salvo
          stages.push(simulateTorpedo(mainFleet, null, enemyFleet, enemyEscort, packet.api_raigeki))
          // Shelling (Any), 1st
          stages.push(simulateShelling(mainFleet, null, enemyFleet, enemyEscort, packet.api_hougeki2))
          // Shelling (Any), 2nd
          stages.push(simulateShelling(mainFleet, null, enemyFleet, enemyEscort, packet.api_hougeki3))
        }
      }

      // Surface Task Force, 水上打撃部隊
      if (fleetType === 2) {
        if (enemyType === 0) {
          // Opening Anti-Sub
          stages.push(simulateShelling(escortFleet, null, enemyFleet, null, packet.api_opening_taisen,
            StageType.Opening))
          // Opening Torpedo Salvo
          stages.push(simulateTorpedo(escortFleet, null, enemyFleet, null, packet.api_opening_atack,
            StageType.Opening))
          // Shelling (Main), 1st
          stages.push(simulateShelling(mainFleet, null, enemyFleet, null, packet.api_hougeki1,
            StageType.Main))
          // Shelling (Main), 2nd
          stages.push(simulateShelling(mainFleet, null, enemyFleet, null, packet.api_hougeki2,
            StageType.Main))
          // Shelling (Escort)
          stages.push(simulateShelling(escortFleet, null, enemyFleet, null, packet.api_hougeki3,
            StageType.Escort))
          // Closing Torpedo Salvo
          stages.push(simulateTorpedo(escortFleet, null, enemyFleet, null, packet.api_raigeki))
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
          stages.push(simulateShelling(escortFleet, null, enemyFleet, null, packet.api_opening_taisen,
            StageType.Opening))
          // Opening Torpedo Salvo
          stages.push(simulateTorpedo(escortFleet, null, enemyFleet, null, packet.api_opening_atack,
            StageType.Opening))
          // Shelling (Escort)
          stages.push(simulateShelling(escortFleet, null, enemyFleet, null, packet.api_hougeki1,
            StageType.Escort))
          // Closing Torpedo Salvo
          stages.push(simulateTorpedo(escortFleet, null, enemyFleet, null, packet.api_raigeki))
          // Shelling (Main), 1st
          stages.push(simulateShelling(mainFleet, null, enemyFleet, null, packet.api_hougeki2,
            StageType.Main))
          // Shelling (Main), 2nd
          stages.push(simulateShelling(mainFleet, null, enemyFleet, null, packet.api_hougeki3,
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

    if (['/kcsapi/api_req_practice/midnight_battle',
         '/kcsapi/api_req_battle_midnight/battle',
         '/kcsapi/api_req_battle_midnight/sp_midnight',
         '/kcsapi/api_req_combined_battle/midnight_battle',
         '/kcsapi/api_req_combined_battle/sp_midnight',
         '/kcsapi/api_req_combined_battle/ec_midnight_battle',
        ].includes(path)) {

      // MVP rule is special for combined fleet. It may be a kancolle bug.
      if (['/kcsapi/api_req_combined_battle/midnight_battle',
           '/kcsapi/api_req_combined_battle/ec_midnight_battle',
          ].includes(path)) {
        this._isNightOnlyMVP = true
      }

      // HACK: Add Engagement Stage to sp_midnight battle.
      // TODO: We need better solution
      if (path.includes('sp_midnight')) {
        stages.push(getEngagementStage(packet))
      }

      // Night Combat
      stages.push(simulateNight(fleetType, mainFleet, escortFleet, enemyType, enemyFleet, enemyEscort, packet.api_hougeki, packet))
    }

    if (['/kcsapi/api_req_practice/battle_result',
         '/kcsapi/api_req_sortie/battleresult',
         '/kcsapi/api_req_combined_battle/battleresult',
        ].includes(path)) {
      this._result = new Result({
        rank: packet.api_win_rank,
        mvp : [(packet.api_mvp || 0) - 1, (packet.api_mvp_combined || 0) - 1],
        getShip: (packet.api_get_ship || {}).api_ship_id,
        getItem: (packet.api_get_useitem || {}).api_useitem_id,
      })
    }
  }

  get result() {
    if (this._result != null)
      return this._result

    const rank = simulateBattleRank(
      this.mainFleet, this.escortFleet, this.enemyFleet, this.enemyEscort)
    const mvp = this._isNightOnlyMVP ?
      [0, simulateFleetNightMVP(this.stages)] :
      [simulateFleetMVP(this.mainFleet), simulateFleetMVP(this.escortFleet)]

    return new Result({rank, mvp})
  }
}

export default Simulator2
