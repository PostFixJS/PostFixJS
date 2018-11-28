const Obj = require('./Obj')

/**
 * A string. This is implemented as a JavaScript string, i.e. it uses UTF-16 and is "limited" to 2^53-1 characters length.
 * @see https://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types-string-type
 */
class Str extends Obj {
  constructor (value) {
    super()
    this.value = value
  }

  getTypeName () {
    return ':Str'
  }

  toString () {
    return `"${this.value}"`
  }

  _copyImpl () {
    return new Str(this.value)
  }

  /**
   * Create a string instance from the given token.
   * The following escape characters are supported: \", \n, \r, \t and \\
   * @param {Token} token PostFix string token
   * @returns {Str} Str instance with the value from the token, with origin information
   */
  static fromToken (token) {
    const str = new Str(
      token.token.substr(1, token.token.length - 2)
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
    )
    str.origin = token
    return str
  }
}

module.exports = Str
