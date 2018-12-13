const types = require('../types')
const { popOperand, checkOperands, checkOperand } = require('../typeCheck')
const TailCallException = require('../TailCallException')

module.exports.err = {
  name: 'err',
  execute (interpreter, token) {
    const message = popOperand(interpreter, { type: 'Str' }, token)
    throw new types.Err(message.value, token)
  }
}

module.exports.exec = {
  name: 'exec',
  * execute (interpreter, token, { isTail = false } = {}) {
    const obj = interpreter._stack.pop()
    if (isTail && obj instanceof types.Lam) {
      throw new TailCallException(obj)
    } else {
      yield * interpreter.executeObj(obj)
    }
  }
}

module.exports.tailrec = {
  name: 'tailcall',
  execute (interpreter, token) {
    const sym = popOperand(interpreter, { type: 'Sym' }, token)
    const ref = interpreter._dictStack.get(sym.name)
    if (ref) {
      if (ref instanceof types.Lam) {
        throw new TailCallException(ref)
      } else {
        throw new types.Err(`Expected a function (:Lam) but got ${ref.getTypeName()}`, token)
      }
    } else {
      throw new types.Err(`Could not find ${sym.name} in the dictionary`, token)
    }
  }
}

module.exports.fun = {
  name: 'fun',
  execute (interpreter, token) {
    const body = interpreter._stack.pop()
    let params = null
    if (interpreter._stack.peek() instanceof types.Params) {
      params = interpreter._stack.pop()
    }
    const name = interpreter._stack.pop()

    if (params != null) {
      checkOperands([
        { name: 'name', value: name, type: 'Sym' },
        { name: 'params', value: params, type: 'Params' },
        { name: 'body', value: body, type: 'ExeArr' }
      ], token)
    } else {
      checkOperands([
        { name: 'name', value: name, type: 'Sym' },
        { name: 'body', value: body, type: 'ExeArr' }
      ], token)
    }

    if (interpreter._builtIns[name.name]) {
      throw new types.Err(`Cannot redefine built-in operator ${name.name}`, token)
    }

    const closure = new types.Lam(body.items, params, null)
    closure.setDict(Object.assign(interpreter._dictStack.copyDict(), {
      [name.name]: closure
    }))
    interpreter._dictStack.put(name.name, closure)
  }
}

module.exports.lam = {
  name: 'lam',
  execute (interpreter, token) {
    const body = interpreter._stack.pop()
    let params = null
    if (interpreter._stack.accessibleCount > 0 && interpreter._stack.peek() instanceof types.Params) {
      params = interpreter._stack.pop()
    }

    if (params != null) {
      checkOperands([
        { name: 'params', value: params, type: 'Params' },
        { name: 'body', value: body, type: 'ExeArr' }
      ], token)
    } else {
      checkOperand(body, { name: 'body', type: 'ExeArr' }, token)
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
    const params = popOperand(interpreter, { type: 'Params' }, token)
    yield * params.bind(interpreter)
  }
}

module.exports.vref = {
  name: 'vref',
  execute (interpreter, token) {
    const sym = popOperand(interpreter, { type: 'Sym' }, token)
    const ref = interpreter._dictStack.get(sym.name)
    if (ref) {
      interpreter._stack.push(ref)
    } else {
      throw new types.Err(`Could not find ${sym.name} in the dictionary`, token)
    }
  }
}

module.exports.isEmpty = {
  name: 'empty?',
  execute (interpreter) {
    const obj = interpreter._stack.pop()
    if (obj instanceof types.Arr) {
      interpreter._stack.push(types.Bool.valueOf(obj.items.length === 0))
    } else if (obj instanceof types.Nil) {
      interpreter._stack.push(types.Bool.true)
    } else {
      interpreter._stack.push(types.Bool.false)
    }
  }
}
