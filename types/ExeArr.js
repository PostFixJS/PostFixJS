const Arr = require('./Arr')

/**
 * An executable array. This behaves like a normal array but its content is not executed immediately.
 */
class ExeArr extends Arr {
  /**
   * Execute this executable array.
   * @param {Interpreter} interpreter PostFix interpreter instance
   * @param {object} options Execution options
   * @param {bool} options.isTail Whether or not this executable array is in a tail position; used for tail call optimization
   */
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
