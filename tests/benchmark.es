
import fs from 'fs'
import { Simulator } from '../index'

function simulate(battle) {
  let simulator = new Simulator(battle.fleet)
  let stages = []
  for (let packet of battle.packet)
    stages = stages.concat(simulator.simulate(packet))
  return {simulator, stages}
}

(function test() {
  const N = 100000
  const battle = JSON.parse(fs.readFileSync('v2+carrier+support+aerial+night.json', 'utf8'))
  const ST = Date.now()
  for(let i = 0; i < N; i++) {
    simulate(battle)
  }
  const ET = Date.now()
  console.log('time', N, ET - ST, 1000 * (ET - ST) / N)
})()
