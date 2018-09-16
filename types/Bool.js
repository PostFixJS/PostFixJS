const Obj = require('./Obj')

class Bool extends Obj {
  constructor (value) {
    super()
    this.value = value
  }

  getTypeName () {
    return ':Bool'
  }

  toString () {
    return this.value ? 'true' : 'false'
  }

  copy () {
    return this.value ? Bool.true : Bool.false
  }

  static fromToken (token) {
    const bool = new Bool(token.token === 'true')
    bool.origin = token
    return bool
  }
}

Bool.true = new Bool(true)
Bool.false = new Bool(false)

module.exports = Bool
