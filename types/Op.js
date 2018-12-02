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

  /**
   * Execute this operation.
   * @param {Interpreter} interpreter PostFix interpreter instance
   * @param {object} options Execution options
   * @param {bool} options.isTail Whether or not this operation is in a tail position; used for tail call optimization
   * @param {Token} options.callerToken Token that called this op, used for throwing better errors
   */
  * execute (interpreter, { isTail = false, callerToken } = {}) {
    const result = this._impl.execute(interpreter, callerToken || this.origin, { isTail })
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
    // Ops are immutable, no copy needed (unless there is origin information)
    if (this.origin) {
      return new Op(this._impl)
    } else {
      return this
    }
  }
}

module.exports = Op
