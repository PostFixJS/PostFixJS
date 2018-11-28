const Obj = require('./Obj')

/**
 * A symbol, can be used to name things or like enums.
 */
class Sym extends Obj {
  /**
   * Create a new symbol.
   * @param {string} name Name of the symbol
   */
  constructor (name) {
    super()
    this.name = name
  }

  getTypeName () {
    return ':Sym'
  }

  toString () {
    return `:${this.name}`
  }

  _copyImpl () {
    // Symbols are immutable
    if (this.origin) {
      return new Sym(this.name)
    } else {
      return this
    }
  }

  /**
   * Create a symbol from the given token.
   * @param {Token} token PostFix symbol token
   * @returns {Sym} Symbol instance with origin information
   */
  static fromToken (token) {
    const name = token.token.indexOf(':') === 0
      ? token.token.substr(1)
      : token.token.substr(0, token.token.length - 1)
    const sym = new Sym(name)
    sym.origin = token
    return sym
  }
}

module.exports = Sym
