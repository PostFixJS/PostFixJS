const Obj = require('./Obj')

/**
 * The nil type, which is used to represent the abscence of a value.
 */
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

  /**
   * Create a nil instance from the given token.
   * @param {Token} token PostFix token
   * @returns {Nil} Nil instance with origin information from the given token
   */
  static fromToken (token) {
    const bool = new Nil()
    bool.origin = token
    return bool
  }
}

/**
 * Constant value of nil, can be used to reduce creation new Nil instances.
 */
Nil.nil = new Nil()

module.exports = Nil
