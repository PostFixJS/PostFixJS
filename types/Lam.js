const ExeArr = require('./ExeArr')
const Err = require('./Err')

class Lam extends ExeArr {
  *execute (interpreter) {
    interpreter._dictStack.pushDict(this.dict)
    if (this.params != null) {
      this.params.bind(interpreter)
    }
    const stackHeight = interpreter._stack.forbidPop()
    let nextToken
    try {
      for (const token of super.execute(interpreter)) {
        yield token
        nextToken = token
      }
    } catch (e) {
      if (e === 'STACK_CORRUPTED') {
        throw new Err('Inside :Lam the stack may not be accessed beyond the height it had when the :Lam was invoked', nextToken)
      }
      throw e
    }
    interpreter._stack.allowPop(stackHeight)
    interpreter._dictStack.popDict()
    const returnCount = interpreter._stack.count - stackHeight
    if (this.params != null) {
      this.params.checkReturns(interpreter, returnCount)
    }
  }

  isAssignableTo (type) {
    return type === this.getTypeName() || type === ':ExeArr'
  }

  toString () {
    return `${super.toString()} lam`
  }
}

module.exports = Lam
