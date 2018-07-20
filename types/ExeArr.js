const Arr = require('./Arr')

class ExeArr extends Arr {
  execute (interpreter) {
    for (const obj of this.items) {
      if (obj instanceof ExeArr) {
        interpreter._stack.push(obj)
      } else {
        obj.execute(interpreter)
      }
    }
  }

  toString () {
    return `{ ${this.items.map((item) => item.toString()).join(', ')} }`
  }
}

module.exports = ExeArr
