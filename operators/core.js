const types = require('../types')

module.exports.err = {
  name: 'err',
  execute (interpreter, token) {
    throw new types.Err(interpreter._stack.pop().value, token)
  }
}

module.exports.exec = {
  name: 'exec',
  * execute (interpreter) {
    yield * interpreter.executeObj(interpreter._stack.pop())
  }
}

module.exports.fun = {
  name: 'fun',
  execute (interpreter) {
    const body = interpreter._stack.pop()
    let params = null
    if (interpreter._stack.peek() instanceof types.Params) {
      params = interpreter._stack.pop()
    }
    const name = interpreter._stack.pop()

    const closure = new types.Lam(body.items, params, {})
    closure.setDict(Object.assign(interpreter._dictStack.copyDict(), {
      [name.name]: closure
    }))
    interpreter._dictStack.put(name.name, closure)
  }
}

module.exports.lam = {
  name: 'lam',
  execute (interpreter) {
    const body = interpreter._stack.pop()
    let params = null
    if (interpreter._stack.peek() instanceof types.Params) {
      params = interpreter._stack.pop()
    }

    const closure = new types.Lam(body.items, params, interpreter._dictStack.copyDict())
    interpreter._stack.push(closure)
  }
}

module.exports.updateLam = {
  name: 'update-lam',
  execute (interpreter, token) {
    const functions = interpreter._stack.pop()
    if (functions instanceof types.Arr) {
      for (let functionName of functions.items) {
        if (!(functionName instanceof types.Sym)) {
          throw new types.Err(`update-lam expects an :Arr that contains function symbols (:Sym), but the array contains a ${functions.getTypeName()} instead`, token)
        }
        const fn = interpreter._dictStack.get(functionName.name)
        if (fn == null) {
          throw new types.Err(`update-lam was called for the unknown function ${functionName.toString()}`, token)
        }
        if (!(fn instanceof types.Lam)) {
          throw new types.Err(`update-lam cannot update ${functionName.toString()} because it is not a function`, token)
        }

        fn.setDict(interpreter._dictStack.copyDict())
      }
    } else {
      throw new types.Err(`update-lam expects an :Arr that contains function symbols (:Sym), but got ${functions.getTypeName()} instead`, token)
    }
  }
}

module.exports.popv = {
  name: 'popv',
  * execute (interpreter, token) {
    const params = interpreter._stack.pop()
    if (params instanceof types.Params) {
      yield * params.bind(interpreter)
    } else {
      throw new types.Err(`popv expected :Params but got ${params.getTypeName()}`, token)
    }
  }
}

module.exports.vref = {
  name: 'vref',
  execute (interpreter, token) {
    const sym = interpreter._stack.pop()
    if (sym instanceof types.Sym) {
      const ref = interpreter._dictStack.get(sym.name)
      if (ref) {
        interpreter._stack.push(ref)
      } else {
        throw new types.Err(`Could not find ${sym.name} in the dictionary`, token)
      }
    } else {
      throw new types.Err(`vref expected :Sym but got ${sym.getTypeName()}`, token)
    }
  }
}

module.exports.isEmpty = {
  name: 'empty?',
  execute (interpreter) {
    const obj = interpreter._stack.pop()
    if (obj instanceof types.Arr) {
      interpreter._stack.push(new types.Bool(obj.items.length === 0))
    } else if (obj instanceof types.Nil) {
      interpreter._stack.push(new types.Bool(true))
    } else {
      interpreter._stack.push(new types.Bool(false))
    }
  }
}
