const Arr = require('./Arr')

class ExeArr extends Arr {
  * execute (interpreter, { isTail = false } = {}) {
    const lastChild = this.items[this.items.length - 1]
    for (const obj of this.items) {
      yield obj.origin
      if (obj instanceof ExeArr) {
        interpreter._stack.push(obj)
      } else {
        yield * interpreter.executeObj(obj, { isTail: isTail && obj === lastChild })
      }
    }
  }

  getTypeName () {
    return ':ExeArr'
  }

  toString () {
    return `{ ${this.items.map((item) => item.toString()).join(' ')} }`
  }

  _copyImpl () {
    return new ExeArr([...this.items])
  }
}

module.exports = ExeArr
