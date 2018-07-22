const ExeArr = require('./ExeArr')
const Err = require('./Err')

class Lam extends ExeArr {
  *execute (interpreter) {
    interpreter._dictStack.pushDict(this.dict)
    if (this.params != null) {
      this.params.bind(interpreter)
    }
    const stackHeight = interpreter._stack.count
    yield* super.execute(interpreter)
    interpreter._dictStack.popDict()
    const returnCount = interpreter._stack.count - stackHeight
    this.params.checkReturns(interpreter, returnCount)
  }

  toString () {
    return `${super.toString()} lam`
  }
}

module.exports = Lam
