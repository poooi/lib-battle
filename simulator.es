
import _ from 'lodash'
import {Stage, StageType, Attack, AttackType, HitType, Ship, ShipOwner} from './models'

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

function damageShip(ship, damage) {
  let fromHP = ship.nowHP
  ship.nowHP  -= damage
  ship.lostHP += damage
  let item   = useItem(ship)
  ship.useItem = item
  let toHP   = ship.nowHP
  // `ship.*` is updated in place
  return {fromHP, toHP, item}
}

function simulateAerialAttack(ships, edam, ebak_flag, erai_flag, ecl_flag) {
  if (!(ships != null && edam != null)) {
    return []
  }
  const list = []
  for (let [i, damage] of edam.entries()) {
    if ((damage < 0) || (ebak_flag[i] <= 0 && erai_flag[i] <= 0))
      continue
    damage = Math.floor(damage)
    let toShip = ships[i - 1]
    let hit = (ecl_flag[i] === 1 ? HitType.Critical : (damage > 0 ? HitType.Hit : HitType.Miss))
    let {fromHP, toHP, item} = damageShip(toShip, damage)
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
function simulateTorpedoAttack(fleet, targetFleet, targetEscort, api_eydam, api_erai, api_ecl) {
  if (!(targetFleet != null && api_eydam != null)) {
    return []
  }
  const list = []
  for (let [i, target] of api_erai.entries()) {
    if (target <= 0) continue
    let toShip
    if (1 <= target && target <= 6)
      toShip = targetFleet[target - 1]
    if (7 <= target && target <= 12)
      toShip = targetEscort[target - 7]
    let damage = Math.floor(api_eydam[i])
    let hit = (api_ecl[i] === 2 ? HitType.Critical : (api_ecl[i] === 1 ? HitType.Hit : HitType.Miss))
    let {fromHP, toHP, item} = damageShip(toShip, damage)
    list.push(new Attack({
      type    : AttackType.Normal,
      fromShip: fleet[i - 1],
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

function simulateTorpedo(fleet, enemyFleet, enemyEscort, raigeki, subtype) {
  if (!(raigeki != null)) {
    return
  }
  let attacks = []
  if (raigeki.api_frai != null)
    attacks = attacks.concat(simulateTorpedoAttack(fleet, enemyFleet, enemyEscort, raigeki.api_fydam, raigeki.api_frai, raigeki.api_fcl))
  if (raigeki.api_erai != null)
    attacks = attacks.concat(simulateTorpedoAttack(enemyFleet, fleet, null, raigeki.api_eydam, raigeki.api_erai, raigeki.api_ecl))
  return new Stage({
    type: StageType.Torpedo,
    attacks: attacks,
    subtype: subtype,
  })
}

function simulateShelling(fleet, enemyFleet, enemyEscort, hougeki, subtype) {
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
      toShip   = fleet[df]
    } else {
      fromShip = fleet[at]
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
    let {fromHP, toHP, item} = damageShip(toShip, damageTotal)
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

function simulateNight(fleet, enemyFleet, hougeki, packet) {
  let stage = simulateShelling(fleet, enemyFleet, null, hougeki, StageType.Night)
  stage.api = _.pick(packet, 'api_touch_plane', 'api_flare_pos')
  return stage
}

function simulateSupport(enemyShip, support, flag) {
  if (!(support != null && flag != null)) {
    return
  }
  if (flag === 1) {
    const kouku = support.api_support_airatack
    let attacks = []
    if (kouku.api_stage3 != null) {
      let st3 = kouku.api_stage3
      attacks = attacks.concat(simulateAerialAttack(enemyShip, st3.api_edam, st3.api_ebak_flag, st3.api_erai_flag, st3.api_ecl_flag))
    }
    return new Stage({
      type: StageType.Support,
      subtype: SupportTypeMap[flag],
      attacks: attacks,
      kouku: kouku,
    })
  }
  if (flag === 2 || flag === 3) {
    const hourai = support.api_support_hourai
    let attacks = []
    for (let [i, damage] of hourai.api_damage.entries()) {
      if (!(1 <= i && i <= 6)) continue
      damage = Math.floor(damage)
      const cl = hourai.api_cl_list[i]
      let hit = (cl === 2 ? HitType.Critical : (cl === 1 ? HitType.Hit : HitType.Miss))
      let toShip = enemyShip[i - 1]
      let {fromHP, toHP, item} = damageShip(toShip, damage)
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
    this.mainFleet    = this.initFleet(fleet.main, 0)
    this.escortFleet  = this.initFleet(fleet.escort, 6)
    this.supportFleet = this.initFleet(fleet.support)
    this.enemyFleet   = null  // Assign at first packet
    this.enemyEscort  = null  // ^
    this.landBaseAirCorps = fleet.LBAC

    // When no using poi API:
    //   enemyShip.raw == null
    this.usePoiAPI = opts.usePoiAPI
  }

  initFleet(rawFleet, intl=0) {
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

  initEnemy(intl=0, api_ship_ke, api_eSlot, api_maxhps, api_nowhps, api_ship_lv) {
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
      this.enemyFleet = this.initEnemy(0, packet.api_ship_ke, packet.api_eSlot, packet.api_maxhps, packet.api_nowhps, packet.api_ship_lv)
      this.enemyEscort = this.initEnemy(6, packet.api_ship_ke_combined, packet.api_eSlot_combined, packet.api_maxhps_combined, packet.api_nowhps_combined, packet.api_ship_lv_combined)
    }
    // HACK: Only enemy carrier task force now.
    const enemyType = (path.includes('ec_') ? 1 : 0)

    const {fleetType, mainFleet, escortFleet, enemyFleet, enemyEscort} = this
    let stages = []

    if (['/kcsapi/api_req_sortie/battle',
         '/kcsapi/api_req_practice/battle',
         '/kcsapi/api_req_sortie/airbattle',
         '/kcsapi/api_req_sortie/ld_airbattle',
         '/kcsapi/api_req_combined_battle/battle',
         '/kcsapi/api_req_combined_battle/battle_water',
         '/kcsapi/api_req_combined_battle/airbattle',
         '/kcsapi/api_req_combined_battle/ld_airbattle',
         '/kcsapi/api_req_combined_battle/ec_battle',
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
      stages.push(simulateSupport(enemyFleet, packet.api_support_info, packet.api_support_flag))

      // Normal Fleet
      if (fleetType === 0) {
        if (enemyType === 0) {
          // Opening Anti-Sub
          stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_opening_taisen, StageType.Opening))
          // Opening Torpedo Salvo
          stages.push(simulateTorpedo(mainFleet, enemyFleet, enemyEscort, packet.api_opening_atack, StageType.Opening))
          // Shelling (Main), 1st
          stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki1, null))
          // Shelling (Main), 2nd
          stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki2, null))
          // Closing Torpedo Salvo
          stages.push(simulateTorpedo(mainFleet, enemyFleet, enemyEscort, packet.api_raigeki))
        }
        if (enemyType === 1) {
          // Opening Anti-Sub
          stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_opening_taisen, StageType.Opening))
          // Opening Torpedo Salvo
          stages.push(simulateTorpedo(mainFleet, enemyFleet, enemyEscort, packet.api_opening_atack, StageType.Opening))
          // Shelling (Escort)
          stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki1, null))
          // Closing Torpedo Salvo
          stages.push(simulateTorpedo(mainFleet, enemyFleet, enemyEscort, packet.api_raigeki))
          // Shelling (Any), 1st
          stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki2, null))
          // Shelling (Any), 2nd
          stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki3, null))
        }
      }

      // Surface Task Force, 水上打撃部隊
      if (fleetType === 2) {
        // Opening Anti-Sub
        stages.push(simulateShelling(escortFleet, enemyFleet, enemyEscort, packet.api_opening_taisen, StageType.Opening))
        // Opening Torpedo Salvo
        stages.push(simulateTorpedo(escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack, StageType.Opening))
        // Shelling (Main), 1st
        stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki1, StageType.Main))
        // Shelling (Main), 2nd
        stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki2, StageType.Main))
        // Shelling (Escort)
        stages.push(simulateShelling(escortFleet, enemyFleet, enemyEscort, packet.api_hougeki3, StageType.Escort))
        // Closing Torpedo Salvo
        stages.push(simulateTorpedo(escortFleet, enemyFleet, enemyEscort, packet.api_raigeki))
      }

      // Carrier Task Force, 空母機動部隊
      // Transport Escort, 輸送護衛部隊
      if (fleetType === 1 || fleetType === 3) {
        // Opening Anti-Sub
        stages.push(simulateShelling(escortFleet, enemyFleet, enemyEscort, packet.api_opening_taisen, StageType.Opening))
        // Opening Torpedo Salvo
        stages.push(simulateTorpedo(escortFleet, enemyFleet, enemyEscort, packet.api_opening_atack, StageType.Opening))
        // Shelling (Escort)
        stages.push(simulateShelling(escortFleet, enemyFleet, enemyEscort, packet.api_hougeki1, StageType.Escort))
        // Closing Torpedo Salvo
        stages.push(simulateTorpedo(escortFleet, enemyFleet, enemyEscort, packet.api_raigeki))
        // Shelling (Main), 1st
        stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki2, StageType.Main))
        // Shelling (Main), 2nd
        stages.push(simulateShelling(mainFleet, enemyFleet, enemyEscort, packet.api_hougeki3, StageType.Main))
      }
    }

    if (['/kcsapi/api_req_battle_midnight/battle',
         '/kcsapi/api_req_practice/midnight_battle',
         '/kcsapi/api_req_battle_midnight/sp_midnight',
         '/kcsapi/api_req_combined_battle/midnight_battle',
         '/kcsapi/api_req_combined_battle/sp_midnight',
         '/kcsapi/api_req_combined_battle/ec_midnight_battle',
       ].includes(path)) {

      // TODO: We need better solution
      // HACK: Add Engagement Stage to sp_midnight battle.
      if (path.includes('sp_midnight')) {
        stages.push(getEngagementStage(packet))
      }

      if (fleetType === 0) {
        if (enemyType === 0) {
          stages.push(simulateNight(mainFleet, enemyFleet, packet.api_hougeki, packet))
        }
        if (enemyType === 1) {
          if (packet.api_active_deck[1] === 1) {
            stages.push(simulateNight(mainFleet, enemyFleet, packet.api_hougeki, packet))
          }
          if (packet.api_active_deck[1] === 2) {
            stages.push(simulateNight(mainFleet, enemyEscort, packet.api_hougeki, packet))
          }
        }
      } else {
        stages.push(simulateNight(escortFleet, enemyFleet, packet.api_hougeki, packet))
      }
    }

    return stages
  }
}

export default Simulator2
