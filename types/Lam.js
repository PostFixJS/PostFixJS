const ExeArr = require('./ExeArr')
const Err = require('./Err')
const InvalidStackAccessError = require('../InvalidStackAccessError')
const BreakError = require('../BreakError')
const TailCallException = require('../TailCallException')

class Lam extends ExeArr {
  /**
   * Create a new lambda function (executable array with parameters and dictionary).
   * @param {Obj[]} items Function body
   * @param {Params} params Parameters and return values
   * @param {object} dict Copy of the dictionary
   */
  constructor (items, params, dict) {
    super(items)
    this.params = params
    this.dict = dict
    this.dict['recur'] = this
  }

  /**
   * Update the dictionary of this lambda function.
   * @param {object} dict Copy of the new dictionary
   */
  setDict (dict) {
    this.dict = dict
    this.dict['recur'] = this
  }

  * execute (interpreter) {
    interpreter._dictStack.pushDict(Object.assign({}, this.dict))
    let stackHeight
    let nextToken

    try {
      let tailcall = this
      while (tailcall != null) {
        if (tailcall.params != null) {
          yield * tailcall.params.bind(interpreter)
          if (stackHeight != null) interpreter._stack.allowPop(stackHeight)
          stackHeight = interpreter._stack.forbidPop()
        }

        tailcall = null
        try {
          for (const obj of this.items) {
            yield obj.origin
            nextToken = obj.origin
            if (obj instanceof ExeArr) {
              interpreter._stack.push(obj)
            } else {
              yield * interpreter.executeObj(obj, { handleErrors: false, isTail: obj === this.items[this.items.length - 1] })
            }
          }
        } catch (e) {
          if (e instanceof TailCallException) {
            tailcall = e.call
            if (e.call !== this) { // if the tail call calls this function (recursion), the previous dict can be used again
              interpreter._dictStack.popDict()
              interpreter._dictStack.pushDict(Object.assign({}, tailcall.dict))
            }
          } else {
            throw e
          }
        }
      }
    } catch (e) {
      if (e instanceof InvalidStackAccessError) {
        throw new Err('Stack underflow in function or lambda expression', nextToken)
      } else if (e instanceof BreakError) {
        // break was used outside of a loop
        throw new Err(`${e.operator} can only be used in a loop`, nextToken)
      } else {
        throw e
      }
    }
    interpreter._dictStack.popDict()
    if (this.params != null) {
      interpreter._stack.allowPop(stackHeight)
      const returnCount = interpreter._stack.count - stackHeight
      yield * this.params.checkReturns(interpreter, returnCount)
    }
  }

  isAssignableTo (type) {
    return type === ':Obj' || type === ':ExeArr' || type === this.getTypeName()
  }

  getTypeName () {
    return ':Lam'
  }

  toString () {
    return `${super.toString()} lam`
  }

  _copyImpl () {
    return new Lam(
      [...this.items],
      this.params.copy(),
      Object.assign({}, this.dict)
    )
  }
}

module.exports = Lam
