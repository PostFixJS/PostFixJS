const Obj = require('./Obj')

class Ref extends Obj {
  constructor (name) {
    super()
    this.name = name
  }

  execute (interpreter) {
    const value = interpreter._dictStack.get(this.name)
    if (!value) {
      console.error(`Could not find ${this.name} in the dictionary`)
    } else {
      value.execute(interpreter)
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
