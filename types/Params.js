const Obj = require('./Obj')

class Params extends Obj {
  constructor (params) {
    super()
    this.params = params
  }

  toString () {
    return `( ${this.params.map((param) => param.toString()).join(', ')} )`
  }
}

module.exports = Params
