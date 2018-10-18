const Arr = require('./Arr')

class ExeArr extends Arr {
  * execute (interpreter, { isTail = false } = {}) {
    for (const obj of this.items) {
      yield obj.origin
      if (obj instanceof ExeArr) {
        interpreter._stack.push(obj)
      } else {
        yield * interpreter.executeObj(obj, { isTail: isTail && obj === this.items[this.items.length - 1] })
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
