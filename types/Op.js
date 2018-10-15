const Obj = require('./Obj')

/**
 * A built-in operation (e.g. dup or *).
 */
class Op extends Obj {
  constructor (impl, origin) {
    super()
    this._impl = impl
    this.origin = origin
  }

  * execute (interpreter, { isTail }) {
    const result = this._impl.execute(interpreter, this.origin, { isTail })
    if (result != null && result[Symbol.iterator]) {
      yield * result
    }
  }

  getTypeName () {
    return ':Op'
  }

  toString () {
    if (this.origin && this.origin.tokenType === 'DEFINITION') {
      return this.origin.token
    }
    return this._impl.name
  }

  _copyImpl () {
    // Ops are immutable
    if (this.origin) {
      return new Op(this._impl)
    } else {
      return this
    }
  }
}

module.exports = Op
