const Obj = require('./Obj')

class Arr extends Obj {
  /**
   * Create a new array and increase the reference counter of all children.
   * @param {Obj[]} items Array items
   */
  constructor (items) {
    super()
    this.items = items
    for (const item of items) {
      item.refs++
    }
  }

  getTypeName () {
    return ':Arr'
  }

  toString () {
    return `[ ${this.items.map((item) => item.toString()).join(' ')} ]`
  }

  _copyImpl () {
    return new Arr([...this.items])
  }
}

module.exports = Arr
