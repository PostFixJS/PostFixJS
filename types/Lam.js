const ExeArr = require('./ExeArr')

class Lam extends ExeArr {
  execute (interpreter) {
    interpreter._dictStack.pushDict(this.dict)
    super.execute(interpreter)
    interpreter._dictStack.popDict()
  }

  toString () {
    return `${super.toString()} lam`
  }
}

module.exports = Lam
