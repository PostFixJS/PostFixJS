const Obj = require('./Obj')

class Nil extends Obj {
  getTypeName () {
    return ':Nil'
  }

  toString () {
    return 'nil'
  }

  static fromToken (token) {
    const bool = new Nil()
    bool.origin = token
    return bool
  }
}

module.exports = Nil
