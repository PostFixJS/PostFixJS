const ExeArr = require('./ExeArr')

class Lam extends ExeArr {
  execute (interpreter) {
    interpreter._dictStack.pushDict(this.dict)
    if (this.params != null) {
      this.params.bind(interpreter)
    }
    super.execute(interpreter)
    interpreter._dictStack.popDict()
  }

  toString () {
    return `${super.toString()} lam`
  }
}

module.exports = Lam
