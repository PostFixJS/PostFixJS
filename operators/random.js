const seedrandom = require('seedrandom')
const types = require('../types')

let random = seedrandom(`${Date.now()}`)

module.exports.randFlt = {
  name: 'rand-flt',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(random.double()))
  }
}

module.exports.randInt = {
  name: 'rand-int',
  execute (interpreter, token) {
    const n = interpreter._stack.popNumber().value
    if (n <= 0) {
      throw new types.Err(`rand-int expected a positive upper bound but got ${n} instead`, token)
    }
    interpreter._stack.push(new types.Int(Math.floor(random.double() * n)))
  }
}

module.exports.randSeed = {
  name: 'rand-seed',
  execute (interpreter) {
    const seed = interpreter._stack.popNumber().value
    random = seedrandom(`${seed}`)
  }
}

module.exports.getRandom = () => random
