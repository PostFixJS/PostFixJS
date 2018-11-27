const Num = require('./Num')

/**
 * An integer, i.e. an integer JavaScript number. Since JavaScript only supports IEEE 754 numbers, the range is -(2^53-1) to 2^53-1.
 * @see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
 * @see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_SAFE_INTEGER
 */
class Int extends Num {
  getTypeName () {
    return ':Int'
  }

  _copyImpl () {
    return new Int(this.value)
  }

  /**
   * Create a new integer instance from the given token.
   * @param {Token} token PostFix token, must be an integer in base 10
   * @returns {Int} Int instance with the value from the token
   */
  static fromToken (token) {
    // this uses parseFloat because parseInt doesn't support strings like 2e5 and PostFix only supports base 10 anyway
    const int = new Int(parseFloat(token.token))
    int.origin = token
    return int
  }
}

module.exports = Int
