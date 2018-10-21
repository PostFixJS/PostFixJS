const Err = require('./Err')
const Obj = require('./Obj')
const Lam = require('./Lam')
const TailCallException = require('../TailCallException')

class Ref extends Obj {
  constructor (name) {
    super()
    this.name = name
  }

  * execute (interpreter, { isTail = false } = {}) {
    const value = interpreter._dictStack.get(this.name)
    if (!value) {
      throw new Err(`Could not find ${this.name} in the dictionary`, this.origin)
    } else {
      if (isTail && value instanceof Lam) {
        throw new TailCallException(value)
      }
      const result = value.execute(interpreter)
      if (result != null && result[Symbol.iterator]) {
        yield * result
      }
    }
  }

  getTypeName () {
    return ':Ref'
  }

  toString () {
    return this.name
  }

  _copyImpl () {
    // Refs are immutable
    if (this.origin) {
      return new Ref(this.name)
    } else {
      return this
    }
  }

  static fromToken (token) {
    const ref = new Ref(token.token)
    ref.origin = token
    return ref
  }
}

module.exports = Ref
