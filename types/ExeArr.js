const Arr = require('./Arr')

class ExeArr extends Arr {
  toString () {
    return `{ ${this.items.map((item) => item.toString()).join(', ')} }`
  }
}

module.exports = ExeArr
