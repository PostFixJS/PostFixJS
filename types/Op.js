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

  * execute (interpreter) {
    const result = this._impl.execute(interpreter, this.origin)
    if (result != null && result[Symbol.iterator]) {
      yield * result
    }
  }

  toString () {
    if (this.origin.tokenType === 'DEFINITION') {
      return this.origin.token
    }
    return this._impl.name
  }
}

module.exports = Op
