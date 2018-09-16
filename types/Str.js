const Obj = require('./Obj')

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

  static fromToken (token) {
    const str = new Str(
      token.token.substr(1, token.token.length - 2)
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
    )
    str.origin = token
    return str
  }
}

module.exports = Str
