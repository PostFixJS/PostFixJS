const Num = require('./Num')

class Int extends Num {
  getTypeName () {
    return ':Int'
  }

  static fromToken (token) {
    const int = new Int(parseInt(token.token))
    int.origin = token
    return int
  }
}

module.exports = Int
