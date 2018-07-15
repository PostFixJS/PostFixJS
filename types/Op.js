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

  execute (interpreter) {
    this._impl.execute(interpreter, this.origin)
  }

  toString () {
    return this._impl.name
  }
}

module.exports = Op
