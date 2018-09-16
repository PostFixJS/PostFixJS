const Obj = require('./Obj')

class Sym extends Obj {
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
