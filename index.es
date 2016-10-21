
const EventEmitter = require('events')

const Models = require('./models')
const PacketManager = require('./packet')
const Simulator = require('./simulator')

/***
  emit: battle, result, reset
*/
class Battle extends EventEmitter {
  constructor() {
    this.id = null
    this.battle = null
    this.simulator = null
    this.stages = null

    PacketManager.addListener('battle', this.handleBattle)
    PacketManager.addListener('result', this.handleResult)
    PacketManager.addListener('reset', this.handleResult)
  }

  handleBattle = async (battle, packet) => {
    if (this.id !== null && this.id !== battle.time) {
      await this.handleReset()
      throw new Error('Missing battle result. Force reset.')
    }
    // New battle
    if (this.id === null) {
      this.id = battle.time
      this.battle = battle
      this.simulator = new Simulator(battle.fleet)
      this.stages = this.simulator.simulate(packet)
      // WARNING: Unstable API
      this.emit('battle', this.simulator, this.stages)
    }
    // Previous battle
    else {
      this.stages = this.stages.concat(this.simulator.simulate(packet))
      // WARNING: Unstable API
      this.emit('battle', this.simulator, this.stages)
    }
  }

  handleResult = async (battle) => {
    if (this.id !== null && this.id !== battle.time) {
      await this.handleReset()
      throw new Error('Missing battle result. Force reset.')
    }
    // DISCUSS: Need to run simulation again to avoid possible bug?
    this.id = null
    // WARNING: Unstable API
    this.emit('result', this.simulator, this.stages)
  }

  handleReset = async () => {
    this.id = null
    this.emit('reset')
  }
}