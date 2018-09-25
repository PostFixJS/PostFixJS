const ExeArr = require('./ExeArr')
const Err = require('./Err')
const InvalidStackAccessError = require('../InvalidStackAccessError')
const BreakError = require('../BreakError')

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
    interpreter._dictStack.pushDict(this.dict)
    if (this.params != null) {
      yield * this.params.bind(interpreter)
    }
    const stackHeight = interpreter._stack.forbidPop()
    let nextToken
    try {
      for (const obj of this.items) {
        yield obj.origin
        nextToken = obj.origin
        if (obj instanceof ExeArr) {
          interpreter._stack.push(obj)
        } else {
          yield * interpreter.executeObj(obj, { handleErrors: false })
        }
      }
    } catch (e) {
      if (e instanceof InvalidStackAccessError) {
        throw new Err('Inside :Lam the stack may not be accessed beyond the height it had when the :Lam was invoked', nextToken)
      } else if (e instanceof BreakError) {
        // break was used outside of a loop
        throw new Err('break can only be used in a loop', nextToken)
      } else {
        throw e
      }
    }
    interpreter._stack.allowPop(stackHeight)
    interpreter._dictStack.popDict()
    const returnCount = interpreter._stack.count - stackHeight
    if (this.params != null) {
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
