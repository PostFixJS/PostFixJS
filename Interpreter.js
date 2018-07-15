const types = require('./types')

class Interpreter {
  constructor () {
    this._builtIns = {}
    this._stack = new Stack()
    this._openExeArrs = 0

    // TODO Built-ins need to be Objs, too
    this.registerBuiltIn('*', {
      name: '*',
      execute: (interpreter) => {
        interpreter._stack.push(new types.Flt(interpreter._stack.popNumber().value * interpreter._stack.popNumber().value))
      }
    })
    this.registerBuiltIn('+', {
      name: '+',
      execute: (interpreter) => {
        const a = interpreter._stack.pop()
        const b = interpreter._stack.pop()
        interpreter._stack._assertType(a, 'Int', 'Flt', 'Str')
        interpreter._stack._assertType(b, 'Int', 'Flt', 'Str')

        let type
        if (a instanceof types.Str || b instanceof types.Str) {
          interpreter._stack.push(new types.Str(b.value + a.value))
        } else if (a instanceof types.Flt || b instanceof types.Flt) {
          interpreter._stack.push(new types.Flt(b.value + a.value))
        } else {
          interpreter._stack.push(new types.Int(b.value + a.value))
        }
      }
    })
    this.registerBuiltIn('trim', {
      name: 'trim',
      execute: (interpreter) => {
        interpreter._stack.push(new types.Str(interpreter._stack.popString().value.trim()))
      }
    })
    this.registerBuiltIn('println', {
      name: 'println',
      execute: (interpreter) => {
        console.log(interpreter._stack.pop().value)
      }
    })
  }

  registerBuiltIn (name, implementation) {
    if (this._builtIns[name] != null) {
      console.warn(`Replacing already registered built-in ${name}`)
    }
    this._builtIns[name] = implementation
  }

  execute (token) {
    // TODO handle DEFINITION tokens
    if (token.tokenType === 'REFERENCE') {
      const builtIn = this._builtIns[token.token]
      if (builtIn != null) {
        // this is an optimization; don't create an intermediate Obj instance
        // if it is executed right away
        if (this._openExeArrs > 0) {
          const operation = new types.Op(builtIn, token)
          operation.origin = token
          this._stack.push(operation)
        } else {
          builtIn.execute(this, token)
        }
      } else {
        // TODO this is an actual reference, handle it as such
      }
    } else {
      // TODO handle RIGHT_ARROW
      let obj
      switch (token.tokenType) {
        case 'FLOAT':
          obj = types.Flt.fromToken(token)
          break
        case 'INTEGER':
          obj = types.Int.fromToken(token)
          break
        case 'BOOLEAN':
          obj = types.Bool.fromToken(token)
          break
        case 'STRING':
          obj = types.Str.fromToken(token)
          break
        case 'SYMBOL':
          obj = types.Sym.fromToken(token)
          break
        case 'ARR_START':
        case 'ARR_END':
        case 'EXEARR_START':
        case 'EXEARR_END':
        case 'PARAM_LIST_START':
        case 'PARAM_LIST_END':
          obj = types.Marker.fromToken(token)
          break
      }

      if (obj) {
        if (this._openExeArrs > 0 && !(obj instanceof types.Marker && (obj.type === 'ExeArrOpen' || obj.type === 'ExeArrClose'))) {
          this._stack.push(obj)
        } else {
          obj.execute(this)
        }
      } else {
        console.error(`Unknown token type ${token.tokenType} at line ${token.line}:${token.col}`)
      }
    }
  }
}

class Stack {
  constructor () {
    this._stack = []
  }

  push (obj) {
    this._stack.push(obj)
  }

  pop () {
    return this._stack.pop()
  }

  /**
   * Pop from the stack until the given function returns `true` for the popped element and return all elements.
   * @param {function} condition Condition function
   * @returns Popped elements, in the order they were popped
   */
  popUntil (condition) {
    const values = []
    let value
    do {
      value = this.pop()
      values.push(value)
    } while (!condition(value))
    return values.reverse()
  }

  popNumber () {
    return this._assertType(this.pop(), 'Flt', 'Int')
  }

  popString () {
    return this._assertType(this.pop(), 'Str')
  }

  _assertType (obj, ...expectedTypes) {
    if (!expectedTypes.some((t) => obj instanceof types[t])) {
      this.push({
        type: 'Err',
        value: `Expected ${expectedTypes.join(' or ')} but got ${obj.constructor.name}`,
        origin: obj.origin
      })
    }
    return obj
  }
}

module.exports = Interpreter
