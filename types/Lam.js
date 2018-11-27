const ExeArr = require('./ExeArr')
const Err = require('./Err')
const InvalidStackAccessError = require('../InvalidStackAccessError')
const BreakError = require('../BreakError')
const TailCallException = require('../TailCallException')

/**
 * A lambda function, i.e. an executable array with its own dictionary and an optional parameter list.
 */
class Lam extends ExeArr {
  /**
   * Create a new lambda function (executable array with parameters and dictionary).
   * @param {Obj[]} items Function body
   * @param {Params} params Parameters and return values (optional)
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

  /**
   * Execute this lambda function.
   * @param {Interpreter} interpreter PostFix Interpreter instance
   * @param {object} options Options
   * @param {Token} options.callerToken Token that called this function, used for throwing better errors
   */
  * execute (interpreter, { callerToken } = {}) {
    interpreter._dictStack.pushDict(Object.assign({}, this.dict))
    let stackHeight
    let nextToken
    let running

    try {
      let tailcall = this
      while (tailcall != null) {
        if (tailcall.params != null) {
          yield * tailcall.params.bind(interpreter, { callerToken })
          if (stackHeight == null) {
            stackHeight = interpreter._stack.forbidPop()
          }
        }

        running = tailcall
        tailcall = null
        try {
          const lastChild = running.items[running.items.length - 1]
          for (const obj of running.items) {
            yield obj.origin
            nextToken = obj.origin
            if (obj instanceof ExeArr) {
              interpreter._stack.push(obj)
            } else {
              yield * interpreter.executeObj(obj, { handleErrors: false, isTail: obj === lastChild })
            }
          }
        } catch (e) {
          if (e instanceof TailCallException) {
            tailcall = e.call
            // TODO in case of recursion, the dict doesn't need to be copied if no variables other than the parameters were set (they will be replaced anyway)
            interpreter._dictStack.popDict()
            interpreter._dictStack.pushDict(Object.assign({}, tailcall.dict))
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
