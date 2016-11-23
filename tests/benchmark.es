
import fs from 'fs'
import { Simulator } from '../index'

(function test() {
  const N = 100000
  const battle = JSON.parse(fs.readFileSync('v2+carrier+support+aerial+night.json', 'utf8'))
  const ST = Date.now()
  for(let i = 0; i < N; i++) {
    Simulator.auto(battle)
  }
  const ET = Date.now()
  console.log('time', N, ET - ST, 1000 * (ET - ST) / N)
})()
