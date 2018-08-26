const Obj = require('./Obj')

class Err extends Obj {
  constructor (message, origin) {
    super()
    this.message = message
    this.origin = origin
  }

  getTypeName () {
    return ':Err'
  }

  toString () {
    if (this.origin) {
      return `Err(${this.origin.line + 1}:${this.origin.col + 1}, ${this.message})`
    } else {
      return `Err(${this.message})`
    }
  }
}

module.exports = Err
