const Obj = require('./Obj')

class Nil extends Obj {
  getTypeName () {
    return ':Nil'
  }

  toString () {
    return 'nil'
  }

  _copyImpl () {
    return Nil.nil
  }

  static fromToken (token) {
    const bool = new Nil()
    bool.origin = token
    return bool
  }
}

Nil.nil = new Nil()

module.exports = Nil
