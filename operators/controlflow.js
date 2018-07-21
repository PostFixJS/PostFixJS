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
      interpreter.executeObj(thenPart)
    } else if (elsePart != null) {
      interpreter.executeObj(elsePart)
    }
  }
}

module.exports.cond = {
  name: 'cond',
  execute: (interpreter, token) => {
    const pairs = interpreter._stack.pop()
    if (!(pairs instanceof types.Arr)) {
      throw new types.Err(`cond expects an array (:Arr) with conditions followed by actions but got ${pairs.getTypeName()}`, token)
    }

    for (let i = 0; i < pairs.items.length; i += 2) {
      const cond = pairs.items[i]
      if (!(cond instanceof types.ExeArr)) {
        throw new types.Err(`cond expected a condition array (:ExeArr) but found ${cond.getTypeName()}`, cond.origin)
      }
      if (i >= pairs.length) {
        throw new types.Err('cond expected the condition array to be followed by an action array (:ExeArr) but it is missing', cond.origin)
      }
      const action = pairs.items[i + 1]
      if (!(action instanceof types.ExeArr)) {
        throw new types.Err(`cond expected an action array (:ExeArr) but found ${action.getTypeName()}`, action.origin)
      }

      interpreter.executeObj(cond)
      const result = interpreter._stack.pop()
      if (result instanceof types.Bool) {
        if (result.value) {
          interpreter.executeObj(action)
          break // break at first matching condition
        }
      } else {
        throw new types.Err(`cond expected the condition array to result in a :Bool, but got ${result.getTypeName()} instead`, cond.origin)
      }
    }
  }
}
