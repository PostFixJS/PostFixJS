const Obj = require('./Obj')

class Arr extends Obj {
  constructor (items) {
    super()
    this.items = items
  }

  getTypeName () {
    return ':Arr'
  }

  toString () {
    return `[ ${this.items.map((item) => item.toString()).join(', ')} ]`
  }
}

module.exports = Arr
