const Arr = require('./Arr')

class ExeArr extends Arr {
  execute (interpreter) {
    for (const obj of this.items) {
      obj.execute(interpreter)
    }
  }

  toString () {
    return `{ ${this.items.map((item) => item.toString()).join(', ')} }`
  }
}

module.exports = ExeArr
