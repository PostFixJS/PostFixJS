const types = require('../types')

module.exports.if = {
  name: 'if',
  *execute (interpreter) {
    let thenPart = interpreter._stack.pop()
    let elsePart = null
    if (interpreter._stack.peek() instanceof types.ExeArr) {
      elsePart = thenPart
      thenPart = interpreter._stack.pop()
    }
    const condition = interpreter._stack.pop()

    if (condition.value) {
      yield* interpreter.executeObj(thenPart)
    } else if (elsePart != null) {
      yield* interpreter.executeObj(elsePart)
    }
  }
}

module.exports.cond = {
  name: 'cond',
  *execute (interpreter, token) {
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

      yield* interpreter.executeObj(cond)
      const result = interpreter._stack.pop()
      if (result instanceof types.Bool) {
        if (result.value) {
          yield* interpreter.executeObj(action)
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
  *execute (interpreter, token) {
    const body = interpreter._stack.pop()
    if (!(body instanceof types.ExeArr)) {
      throw new types.Err(`loop expects an :ExeArr but got ${body.getTypeName()}`, token)
    }
    try {
      while (true) {
        yield* interpreter.executeObj(body)
      }
    } catch (e) {
      if (e !== 'break') {
        throw e
      }
    }
  }
}

module.exports.for = {
  name: 'for',
  *execute (interpreter, token) {
    const body = interpreter._stack.pop()
    if (!(body instanceof types.ExeArr)) {
      throw new types.Err(`for expects an :ExeArr but got ${body.getTypeName()}`, token)
    }
    if (interpreter._stack.peek() instanceof types.Int) {
      const upper = interpreter._stack.pop()
      const lower = interpreter._stack.pop()
      if (lower instanceof types.Int) {
        try {
          let i
          for (i = lower.value; i < upper.value; i++) {
            interpreter._stack.push(new types.Int(i))
            yield* interpreter.executeObj(body)
          }
        } catch (e) {
          if (e !== 'break') {
            throw e
          }
        }
      } else {
        throw new types.Err(`for expects lower bound to be an :Int but got ${lower.getTypeName()} instead`, token)
      }
    } else {
      const arr = interpreter._stack.pop()
      if (arr instanceof types.Arr) {
        try {
          for (const item of arr.items) {
            interpreter._stack.push(item)
            yield* interpreter.executeObj(body)
          }
        } catch (e) {
          if (e !== 'break') {
            throw e
          }
        }
      } else if (arr instanceof types.Str) {
        try {
          for (const char of arr.value.split('')) {
            interpreter._stack.push(new types.Str(char))
            yield* interpreter.executeObj(body)
          }
        } catch (e) {
          if (e !== 'break') {
            throw e
          }
        }
      } else {
        throw new types.Err(`for can only iterate over :Str and :Arr but got ${arr.getTypeName()}`, token)
      }
    }
  }
}

module.exports.fori = {
  name: 'fori',
  *execute (interpreter, token) {
    const body = interpreter._stack.pop()
    if (!(body instanceof types.ExeArr)) {
      throw new types.Err(`fori expects an :ExeArr but got ${body.getTypeName()}`, token)
    }
    const arr = interpreter._stack.pop()
    if (arr instanceof types.Arr) {
      try {
        let i
        for (i = 0; i < arr.items.length; i++) {
          interpreter._stack.push(arr.items[i])
          interpreter._stack.push(new types.Int(i))
          yield* interpreter.executeObj(body)
        }
      } catch (e) {
        if (e !== 'break') {
          throw e
        }
      }
    } else if (arr instanceof types.Str) {
      try {
        const chars = arr.value.split('')
        let i
        for (i = 0; i < chars.length; i++) {
          interpreter._stack.push(new types.Str(chars[i]))
          interpreter._stack.push(new types.Int(i))
          yield* interpreter.executeObj(body)
        }
      } catch (e) {
        if (e !== 'break') {
          throw e
        }
      }
    } else {
      throw new types.Err(`fori can only iterate over :Str and :Arr but got ${arr.getTypeName()}`, token)
    }
  }
}

module.exports.break = {
  name: 'break',
  execute () {
    throw 'break'
  }
}

module.exports.breakif = {
  name: 'breakif',
  execute (interpreter, token) {
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
