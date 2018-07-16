const types = require('./types')

class Interpreter {
  constructor () {
    this._builtIns = {}
    this._stack = new Stack()
    this._dictStack = new DictStack()
    this._openExeArrs = 0

    this.registerBuiltIn({
      name: '!',
      execute: (interpreter, token) => {
        const obj = interpreter._stack.pop()
        const sym = token.tokenType === 'DEFINITION'
          ? token.token.substr(0, token.token.length - 1)
          : interpreter._stack.pop().name
        interpreter._dictStack.put(sym, obj)
      }
    })

    this.registerBuiltIns(require('./operators/stack'))
    this.registerBuiltIns(require('./operators/math'))
    this.registerBuiltIns(require('./operators/logical'))

    this.registerBuiltIn({
      name: 'trim',
      execute: (interpreter) => {
        interpreter._stack.push(new types.Str(interpreter._stack.popString().value.trim()))
      }
    })
    this.registerBuiltIn({
      name: 'println',
      execute: (interpreter) => {
        console.log(interpreter._stack.pop().value)
      }
    })
  }

  registerBuiltIn (builtIn) {
    if (this._builtIns[builtIn.name] != null) {
      console.warn(`Replacing already registered built-in ${builtIn.name}`)
    }
    this._builtIns[builtIn.name] = builtIn
  }

  registerBuiltIns (builtIns) {
    if (Array.isArray(builtIns)) {
      for (const builtIn of builtIns) {
        this.registerBuiltIn(builtIn)
      }
    } else {
      // object
      this.registerBuiltIns(Object.values(builtIns))
    }
  }

  execute (token) {
    if (token.tokenType === 'REFERENCE') {
      const builtIn = this._builtIns[token.token]
      if (builtIn != null) {
        // this is an optimization; don't create an intermediate Obj instance
        // if it is executed right away
        if (this._openExeArrs > 0) {
          const operation = new types.Op(builtIn, token)
          this._stack.push(operation)
        } else {
          builtIn.execute(this, token)
        }
      } else {
        // this is an optimization; don't create an intermediate Ref instance
        // if it is executed right away
        if (this._openExeArrs > 0) {
          const ref = types.Ref.fromToken(token)
          this._stack.push(ref)
        } else {
          const value = this._dictStack.get(token.token)
          if (!value) {
            console.error(`Could not find ${token.token} in the dictionary`)
          } else {
            value.execute(this, token)
          }
        }
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
        case 'DEFINITION':
          obj = new types.Op(this._builtIns['!'], token)
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

  peek (i = 0) {
    return this._stack[this._stack.length - 1 - i]
  }

  clear () {
    this._stack = []
  }

  _assertType (obj, ...expectedTypes) {
    if (!expectedTypes.some((t) => obj instanceof types[t])) {
      this.push({
        type: 'Err',
        value: `Expected ${expectedTypes.join(' or ')} but got ${obj.constructor.name}`,
        origin: obj.origin
      })
      return false
    }
    return obj
  }
}

class DictStack {
  constructor () {
    this._dict = {}
  }

  put (key, value) {
    this._dict[key] = value
  }

  get (key) {
    return this._dict[key]
  }
}

module.exports = Interpreter
