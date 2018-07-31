const Arr = require('./Arr')

class ExeArr extends Arr {
  * execute (interpreter) {
    for (const obj of this.items) {
      yield obj.origin
      if (obj instanceof ExeArr) {
        interpreter._stack.push(obj)
      } else {
        yield * interpreter.executeObj(obj)
      }
    }
  }

  toString () {
    return `{ ${this.items.map((item) => item.toString()).join(', ')} }`
  }
}

module.exports = ExeArr
