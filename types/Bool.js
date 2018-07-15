const Obj = require('./Obj')

class Bool extends Obj {
  constructor (value) {
    super()
    this.value = value
  }

  toString () {
    return this.value ? 'true' : 'false'
  }

  static fromToken (token) {
    const bool = new Bool(token.token === 'true')
    bool.origin = token
    return bool
  }
}

module.exports = Bool
