const Num = require('./Num')

class Int extends Num {
  getTypeName () {
    return ':Int'
  }

  _copyImpl () {
    return new Int(this.value)
  }

  static fromToken (token) {
    const int = new Int(parseInt(token.token))
    int.origin = token
    return int
  }
}

module.exports = Int
