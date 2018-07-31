const Err = require('./Err')
const Obj = require('./Obj')

class Ref extends Obj {
  constructor (name) {
    super()
    this.name = name
  }

  * execute (interpreter) {
    const value = interpreter._dictStack.get(this.name)
    if (!value) {
      throw new Err(`Could not find ${this.name} in the dictionary`, this.origin)
    } else {
      const result = value.execute(interpreter)
      if (result != null && result[Symbol.iterator]) {
        yield * result
      }
    }
  }

  toString () {
    return this.name
  }

  static fromToken (token) {
    const ref = new Ref(token.token)
    ref.origin = token
    return ref
  }
}

module.exports = Ref
