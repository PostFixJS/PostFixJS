const types = require('./types')

class Interpreter {
  constructor () {
    this._builtIns = {}
    this._stack = new Stack()
    this._dictStack = new DictStack()
    this._openExeArrs = 0
    this._openParamLists = 0

    this.registerBuiltIn({
      name: '!',
      execute (interpreter, token) {
        const obj = interpreter._stack.pop()
        const sym = token.tokenType === 'DEFINITION'
          ? token.token.substr(0, token.token.length - 1)
          : interpreter._stack.pop().name
        interpreter._dictStack.put(sym, obj)
      }
    })

    this.registerBuiltIns(require('./operators/array'))
    this.registerBuiltIns(require('./operators/compare'))
    this.registerBuiltIns(require('./operators/controlflow'))
    this.registerBuiltIns(require('./operators/core'))
    this.registerBuiltIns(require('./operators/logical'))
    this.registerBuiltIns(require('./operators/math'))
    this.registerBuiltIns(require('./operators/stack'))

    this.registerBuiltIn({
      name: 'trim',
      execute (interpreter) {
        interpreter._stack.push(new types.Str(interpreter._stack.popString().value.trim()))
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

  /**
   * Execute the given token.
   * This is implemented as an Iterator because this is a natural way to suspend execution
   * in JavaScript. The iterator will yield every token before it is executed, flattening 
   * nested execution (e.g. executing the token of the `if` operator will yield multiple times).
   * @param {object} token Token to execute
   */
  *_execute (token) {
    yield token

    if (token.tokenType === 'REFERENCE') {
      const builtIn = this._builtIns[token.token]
      if (builtIn != null) {
        // this is an optimization; don't create an intermediate Obj instance
        // if it is executed right away
        if (this._openExeArrs > 0) {
          const operation = new types.Op(builtIn, token)
          this._stack.push(operation)
        } else {
          const result = builtIn.execute(this, token)
          if (result != null && result[Symbol.iterator]) {
            yield* result
          }
        }
      } else {
        // this is an optimization; don't create an intermediate Ref instance
        // if it is executed right away
        if (this._openExeArrs > 0 || this._openParamLists > 0) {
          const ref = types.Ref.fromToken(token)
          this._stack.push(ref)
        } else {
          const value = this._dictStack.get(token.token)
          if (value) {
            const result = value.execute(this)
            if (result != null && result[Symbol.iterator]) {
              yield* result
            }
          } else {
            console.error(`Could not find ${token.token} in the dictionary`)
          }
        }
      }
    } else {
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
        case 'RIGHT_ARROW':
          obj = types.Marker.fromToken(token)
          break
        case 'PARAM_LIST_START':
          obj = types.Marker.fromToken(token)
          this._openParamLists++
          break
        case 'PARAM_LIST_END':
          obj = types.Marker.fromToken(token)
          this._openParamLists--
          break
        case 'DEFINITION':
          obj = new types.Op(this._builtIns['!'], token)
          break
      }

      if (obj) {
        if (this._openExeArrs > 0 && !(obj instanceof types.Marker && (obj.type === 'ExeArrOpen' || obj.type === 'ExeArrClose'))) {
          this._stack.push(obj)
        } else {
          const result = obj.execute(this)
          if (result != null && result[Symbol.iterator]) {
            yield* result
          }
        }
      } else {
        console.error(`Unknown token type ${token.tokenType} at line ${token.line}:${token.col}`)
      }
    }
  }

  *executeObj (obj) {
    const result = obj.execute(this)
    if (result != null && result[Symbol.iterator]) {
      yield* result
    }
  }

  /**
   * Create an Iterator that will execute the given tokens.
   * @param {Iterable} tokens Tokens
   */
  *_run (tokens) {
    for (const token of tokens) {
      yield* this._execute(token)
    }
  }

  /**
   * Initialize the interpreter to execute the given tokens.
   * Continue execution by calling `step()`.
   * @param {Iterable} tokens Tokens
   */
  startRun (tokens) {
    this._stepper = this._run(tokens)
  }

  /**
   * Continue execution until the next token.
   * @returns object An object with a done and value property, value will be the next token
   */
  step () {
    const next = this._stepper.next()
    if (next.done) {
      this._stepper = null
    }
    return next
  }

  /**
   * Run all tokens.
   * Breakpoints won't work in this mode.
   * @param {Iterable} tokens 
   */
  runToCompletion (tokens) {
    Array.from(this._run(tokens))
  }

  /**
   * Reset the interpreter (i.e. clear the stack and the dictionary stack).
   */
  reset () {
    this._stack.clear()
    this._dictStack.clear()
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

  get count () {
    return this._stack.length
  }

  _assertType (obj, ...expectedTypes) {
    if (!expectedTypes.some((t) => obj instanceof types[t])) {
      this.push(new types.Err(`Expected ${expectedTypes.join(' or ')} but got ${obj.getTypeName()}`, obj.origin))
      return false
    }
    return obj
  }
}

class DictStack {
  constructor () {
    this._dict = {}
    this._stack = []
  }

  put (key, value) {
    this._dict[key] = value
  }

  get (key) {
    return this._dict[key]
  }

  pushDict (dict) {
    this._stack.push(this._dict)
    this._dict = dict
  }

  popDict () {
    this._dict = this._stack.pop()
  }

  copyDict () {
    return Object.assign({}, this._dict)
  }

  clear () {
    this._dict = {}
    this._stack = []
  }
}

module.exports = Interpreter
