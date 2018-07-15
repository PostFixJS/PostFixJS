const Obj = require('./Obj')

class Num extends Obj {
  constructor (value) {
    super()
    this.value = value
  }

  toString () {
    return `${this.value}`
  }
}

module.exports = Num
