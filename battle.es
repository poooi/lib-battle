
// Here is an example of using packet.es & simulator.es
// We suggest caller implement the controller itself.

const EventEmitter = require('events')
const PacketManager = require('./packet')
const Simulator = require('./simulator')

class BattleManager extends EventEmitter {
  constructor() {
    super()

    this.id = null
    this.battle = null
    this.simulator = null
    this.stages = null

    this.pm = new PacketManager()
    this.pm.addListener('battle', this.handleBattle)
    this.pm.addListener('result', this.handleResult)
    this.pm.addListener('reset', this.handleResult)
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
      this.emit('battle', this.simulator, this.stages)
    }
    // Previous battle
    else {
      this.stages = this.stages.concat(this.simulator.simulate(packet))
      this.emit('battle', this.simulator, this.stages)
    }
  }

  handleResult = async (battle, packet) => {
    if (this.id !== null && this.id !== battle.time) {
      await this.handleReset()
      throw new Error('Missing battle result. Force reset.')
    }
    // DISCUSS: Need to run simulation again to avoid possible bug?
    // const simulator = new Simulator(battle.fleet)
    // let stages = []
    // for (const packet of battle.packet) {
    //   stages = stages.concat(simulator.simulate(packet))
    // }
    this.id = null
    this.emit('result', this.simulator, this.stages)
  }

  handleReset = async () => {
    this.id = null
    this.emit('reset')
  }
}

export default BattleManager
