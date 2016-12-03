
import PacketManager from './packet'
import Simulator from './simulator'

// Compatibility: Export Models
import {Battle, BattleType, Fleet} from './packet'
import {Stage, StageType, Attack, AttackType, HitType, Ship, ShipOwner, Result, Rank} from './simulator'
const Models = {
  Battle, BattleType, Fleet,
  Stage, StageType, Attack, AttackType, HitType, Ship, ShipOwner, Result, Rank,
}

export {Models, PacketManager, Simulator}
