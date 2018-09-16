const Num = require('./Num')

class Flt extends Num {
  getTypeName () {
    return ':Flt'
  }

  _copyImpl () {
    return new Flt(this.value)
  }

  static fromToken (token) {
    const flt = new Flt(parseFloat(token.token))
    flt.origin = token
    return flt
  }
}

module.exports = Flt
