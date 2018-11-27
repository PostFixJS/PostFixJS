const Obj = require('./Obj')

/**
 * A number, either an integer or a float. This class is not meant to be constructed directly, use `Flt` or `Int` instead.
 */
class Num extends Obj {
  constructor (value) {
    super()
    this.value = value
  }

  isAssignableTo (type) {
    return type === ':Obj' || type === ':Num' || type === this.getTypeName()
  }

  getTypeName () {
    return ':Num'
  }

  toString () {
    return `${this.value}`
  }
}

module.exports = Num
