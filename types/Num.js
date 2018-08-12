const Obj = require('./Obj')

class Num extends Obj {
  constructor (value) {
    super()
    this.value = value
  }

  isAssignableTo (type) {
    return type === this.getTypeName() || type === ':Num'
  }

  getTypeName () {
    return ':Num'
  }

  toString () {
    return `${this.value}`
  }
}

module.exports = Num
