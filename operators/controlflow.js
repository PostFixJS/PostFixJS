const types = require('../types')

module.exports.if = {
  name: 'if',
  execute: (interpreter) => {
    let thenPart = interpreter._stack.pop()
    let elsePart = null
    if (interpreter._stack.peek() instanceof types.ExeArr) {
      elsePart = thenPart
      thenPart = interpreter._stack.pop()
    }
    const condition = interpreter._stack.pop()

    if (condition.value) {
      thenPart.execute(interpreter, thenPart.origin)
    } else if (elsePart != null) {
      elsePart.execute(interpreter, elsePart.origin)
    }
  }
}
