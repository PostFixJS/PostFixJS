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

module.exports.loop = {
  name: 'loop',
  execute: (interpreter, token) => {
    const body = interpreter._stack.pop()
    if (!(body instanceof types.ExeArr)) {
      throw new types.Err(`loop expects an :ExeArr but got ${body.getTypeName()}`, token)
    }
    try {
      while (true) {
        interpreter.executeObj(body)
      }
    } catch (e) {
      if (e !== 'break') {
        throw e
      }
    }
  }
}

module.exports.break = {
  name: 'break',
  execute: () => {
    throw 'break'
  }
}

module.exports.breakif = {
  name: 'breakif',
  execute: (interpreter, token) => {
    const cond = interpreter._stack.pop()
    if (cond instanceof types.Bool) {
      if (cond.value) {
        throw 'break'
      }
    } else {
      throw new types.Err(`breakif expects a :Bool but got ${body.getTypeName()}`, token)
    }
  }
}
