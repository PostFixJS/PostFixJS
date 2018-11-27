const Obj = require('./Obj')

/**
 * A boolean, which can be either true or false.
 */
class Bool extends Obj {
  /**
   * Create a new boolean. Booleans are immutable, so `Bool.valueOf` should be preferred if no origin token information is available or required.
   * @param {boolean} value Value of this boolean
   */
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

  /**
   * Create a boolean from the given token.
   * @param {Token} token PostFix token
   * @returns {Bool} A boolean that corresponds to the given token, with origin information
   */
  static fromToken (token) {
    const bool = new Bool(token.token === 'true')
    bool.origin = token
    return bool
  }

  /**
   * Get a Bool instance from the given JavaScript boolean. This returns one of two constants to improve performance.
   * @param {boolean} value JavaScript boolean
   * @returns {Bool} PostFix boolean with the same value
   */
  static valueOf (value) {
    return value ? Bool.true : Bool.false
  }
}

/**
 * Constant value of true, can be used to reduce creation new Bool instances.
 */
Bool.true = new Bool(true)

/**
 * Constant value of false, can be used to reduce creation new Bool instances.
 */
Bool.false = new Bool(false)

module.exports = Bool
