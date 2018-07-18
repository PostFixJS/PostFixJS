const Obj = require('./Obj')

class Err extends Obj {
  constructor (message, origin) {
    super()
    this.message = message
    this.origin = origin
  }

  toString () {
    return `Err(${this.origin.line + 1}:${this.origin.col + 1}, ${this.message})`
  }
}

module.exports = Err
