
import PacketManager from './packet'
import Simulator from './simulator'

// Compatibility: Export Models
import * as M1 from './packet'
import * as M2 from './simulator'
const Models = {...M1, ...M2}

export {Models, PacketManager, Simulator}
