const Num = require('./Num')

/**
 * A float, i.e. a JavaScript number, which is almost a IEEE 754 number.
 */
class Flt extends Num {
  getTypeName () {
    return ':Flt'
  }

  _copyImpl () {
    return new Flt(this.value)
  }

  /**
   * Create a new float instance from the given token.
   * @param {Token} token PostFix token, can be anything that `parseFloat` can handle, e.g. 1.23 or even 3141e-3
   * @returns {Flt} Float instance with the value from the token
   */
  static fromToken (token) {
    const flt = new Flt(parseFloat(token.token))
    flt.origin = token
    return flt
  }
}

module.exports = Flt
