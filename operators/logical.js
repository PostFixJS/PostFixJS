const types = require('../types')
const { popOperand } = require('../typeCheck')

module.exports.and = {
  name: 'and',
  * execute (interpreter, token) {
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
    } else if (a instanceof types.Bool) {
      const b = interpreter._stack.pop()
      if (b instanceof types.Bool) {
        interpreter._stack.push(types.Bool.valueOf(a.value && b.value))
      } else {
        throw new types.Err(`Expected two boolean values (:Bool) or an array (:Arr) of boolean values but got ${a.getTypeName()} and ${b.getTypeName()} instead`, token)
      }
    } else {
      throw new types.Err(`Expected two boolean values (:Bool) or an array (:Arr) of boolean values but got ${a.getTypeName()} instead`, token)
    }
  }
}

module.exports.or = {
  name: 'or',
  * execute (interpreter, token) {
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
    } else if (a instanceof types.Bool) {
      const b = interpreter._stack.pop()
      if (b instanceof types.Bool) {
        interpreter._stack.push(types.Bool.valueOf(a.value || b.value))
      } else {
        throw new types.Err(`Expected two boolean values (:Bool) or an array (:Arr) of boolean values but got ${a.getTypeName()} and ${b.getTypeName()} instead`, token)
      }
    } else {
      throw new types.Err(`Expected two boolean values (:Bool) or an array (:Arr) of boolean values but got ${a.getTypeName()} instead`, token)
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
