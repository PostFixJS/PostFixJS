const types = require('../types')

module.exports.and = {
  name: 'and',
  execute (interpreter) {
    const a = interpreter._stack.pop()
    if (a instanceof types.Arr) {
      for (const item of a.items) {
        interpreter.executeObj(item)
        const result = interpreter._stack.pop()
        if (!(result instanceof types.Bool && result.value)) {
          interpreter._stack.push(new types.Bool(false))
          return
        }
      }
      interpreter._stack.push(new types.Bool(true))
    } else {
      const b = interpreter._stack.pop()
      interpreter._stack.push(new types.Bool(a.value && b.value))
    }
  }
}

module.exports.or = {
  name: 'or',
  execute (interpreter) {
    const a = interpreter._stack.pop()
    if (a instanceof types.Arr) {
      for (const item of a.items) {
        interpreter.executeObj(item)
        const result = interpreter._stack.pop()
        if (result instanceof types.Bool && result.value) {
          interpreter._stack.push(new types.Bool(true))
          return
        }
      }
      interpreter._stack.push(new types.Bool(false))
    } else {
      const b = interpreter._stack.pop()
      interpreter._stack.push(new types.Bool(a.value || b.value))
    }
  }
}

module.exports.not = {
  name: 'not',
  execute (interpreter) {
    const a = interpreter._stack.pop()
    interpreter._stack.push(new types.Bool(!a.value))
  }
}
