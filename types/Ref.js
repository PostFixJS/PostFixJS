const Err = require('./Err')
const Obj = require('./Obj')
const Lam = require('./Lam')
const TailCallException = require('../TailCallException')

/**
 * A reference to a dictionary entry. The reference only consists of the entry's name, it is looked up when it is executed.
 */
class Ref extends Obj {
  constructor (name) {
    super()
    this.name = name
  }

  /**
   * Execute the object this reference points to.
   * @param {Interpreter} interpreter PostFix interpreter instance
   * @param {object} options Execution options
   * @param {bool} options.isTail Whether or not this reference is in a tail position; used for tail call optimization
   * @throws {Err} Throws an error when the reference name cannot be found in the dictionary
   */
  * execute (interpreter, { isTail = false } = {}) {
    const value = interpreter._dictStack.get(this.name)
    if (!value) {
      throw new Err(`Could not find ${this.name} in the dictionary`, this.origin)
    } else {
      if (interpreter.options.enableProperTailCalls && isTail && value instanceof Lam) {
        throw new TailCallException(value)
      }
      const result = value.execute(interpreter, { callerToken: this.origin })
      if (result != null && result[Symbol.iterator]) {
        yield * result
      }
    }
  }

  getTypeName () {
    return ':Ref'
  }

  toString () {
    return this.name
  }

  _copyImpl () {
    // Refs are immutable
    if (this.origin) {
      return new Ref(this.name)
    } else {
      return this
    }
  }

  /**
   * Create a reference from the given token.
   * @param {Token} token PostFix token
   * @returns {Ref} Reference instance corresponding to the given token, with origin information
   */
  static fromToken (token) {
    const ref = new Ref(token.token)
    ref.origin = token
    return ref
  }
}

module.exports = Ref
