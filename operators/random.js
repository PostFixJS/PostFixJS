const types = require('../types')
const { popOperand } = require('../typeCheck')
const random = require('./impl/random')

module.exports.randFlt = {
  name: 'rand-flt',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(random.nextDouble()))
  }
}

module.exports.randInt = {
  name: 'rand-int',
  execute (interpreter, token) {
    const n = popOperand(interpreter, { type: 'Int' }, token)
    if (n <= 0) {
      throw new types.Err(`rand-int expected a positive upper bound but got ${n} instead`, token)
    }
    interpreter._stack.push(new types.Int(random.nextInt(n)))
  }
}

module.exports.randSeed = {
  name: 'rand-seed',
  execute (interpreter, token) {
    const seed = popOperand(interpreter, { type: 'Num' }, token)
    random.setSeed(seed.value)
  }
}
