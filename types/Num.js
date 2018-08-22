const Obj = require('./Obj')

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
