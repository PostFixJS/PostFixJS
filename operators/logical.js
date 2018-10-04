const types = require('../types')
const { popOperand } = require('../typeCheck')

module.exports.and = {
  name: 'and',
  * execute (interpreter) {
    // TODO proper error messages for wrong parameters
    const a = interpreter._stack.pop()
    if (a instanceof types.Arr) {
      for (const item of a.items) {
        yield * interpreter.executeObj(item)
        const result = interpreter._stack.pop()
        if (!(result instanceof types.Bool && result.value)) {
          interpreter._stack.push(types.Bool.false)
          return
        }
      }
      interpreter._stack.push(types.Bool.true)
    } else {
      const b = interpreter._stack.pop()
      interpreter._stack.push(types.Bool.valueOf(a.value && b.value))
    }
  }
}

module.exports.or = {
  name: 'or',
  * execute (interpreter) {
    // TODO proper error messages for wrong parameters
    const a = interpreter._stack.pop()
    if (a instanceof types.Arr) {
      for (const item of a.items) {
        yield * interpreter.executeObj(item)
        const result = interpreter._stack.pop()
        if (result instanceof types.Bool && result.value) {
          interpreter._stack.push(types.Bool.true)
          return
        }
      }
      interpreter._stack.push(types.Bool.false)
    } else {
      const b = interpreter._stack.pop()
      interpreter._stack.push(types.Bool.valueOf(a.value || b.value))
    }
  }
}

module.exports.not = {
  name: 'not',
  execute (interpreter, token) {
    const a = popOperand(interpreter, { type: 'Bool' }, token)
    interpreter._stack.push(types.Bool.valueOf(!a.value))
  }
}
