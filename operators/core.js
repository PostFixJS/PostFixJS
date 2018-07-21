const types = require('../types')

module.exports.err = {
  name: 'err',
  execute: (interpreter, token) => {
    interpreter._stack.push(new types.Err(interpreter._stack.pop().value, token))
  }
}

module.exports.exec = {
  name: 'exec',
  execute: (interpreter) => {
    interpreter._stack.pop().execute(interpreter)
  }
}

module.exports.fun = {
  name: 'fun',
  execute: (interpreter) => {
    const body = interpreter._stack.pop()
    let params = null
    if (interpreter._stack.peek() instanceof types.Params) {
      params = interpreter._stack.pop()
    }
    const name = interpreter._stack.pop()

    const closure = new types.Lam(body.items)
    interpreter._dictStack.put(name.name, closure)
    closure.params = params
    closure.dict = interpreter._dictStack.copyDict()
    closure.dict['recur'] = closure
  }
}

module.exports.lam = {
  name: 'lam',
  execute: (interpreter) => {
    const body = interpreter._stack.pop()
    let params = null
    if (interpreter._stack.peek() instanceof types.Params) {
      params = interpreter._stack.pop()
    }

    const closure = new types.Lam(body.items)
    closure.params = params
    closure.dict = interpreter._dictStack.copyDict()
    closure.dict['recur'] = closure

    interpreter._stack.push(closure)
  }
}
