const Num = require('./Num')

class Flt extends Num {
  getTypeName () {
    return ':Flt'
  }

  static fromToken (token) {
    const flt = new Flt(parseFloat(token.token))
    flt.origin = token
    return flt
  }
}

module.exports = Flt
