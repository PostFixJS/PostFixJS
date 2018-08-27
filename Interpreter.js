const types = require('./types')
const InvalidStackAccessError = require('./InvalidStackAccessError')

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
    this.registerBuiltIns(require('./operators/datadef'))
    this.registerBuiltIns(require('./operators/logical'))
    this.registerBuiltIns(require('./operators/math'))
    this.registerBuiltIns(require('./operators/random'))
    this.registerBuiltIns(require('./operators/stack'))
    this.registerBuiltIns(require('./operators/string'))
    this.registerBuiltIns(require('./operators/types'))
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
        if (builtIn.name && builtIn.execute) {
          this.registerBuiltIn(builtIn)
        }
      }
    } else {
      // object
      this.registerBuiltIns(Object.values(builtIns))
    }
  }

  getBuiltIn (name) {
    return this._builtIns[name]
  }

  /**
   * Execute the given token.
   * This is implemented as an Iterator because this is a natural way to suspend execution
   * in JavaScript. The iterator will yield every token before it is executed, flattening
   * nested execution (e.g. executing the token of the `if` operator will yield multiple times).
   * @param {object} token Token to execute
   */
  * _execute (token) {
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
          try {
            const result = builtIn.execute(this, token)
            if (result != null && result[Symbol.iterator]) {
              yield * result
            }
          } catch (e) {
            this._handleExecutionError(e, token)
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
            try {
              const result = value.execute(this)
              if (result != null && result[Symbol.iterator]) {
                yield * result
              }
            } catch (e) {
              this._handleExecutionError(e, token)
            }
          } else {
            throw new types.Err(`Could not find ${token.token} in the dictionary`, token)
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
        case 'NIL':
          obj = types.Nil.fromToken(token)
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
        yield * this.executeObj(obj)
      } else {
        // This should never happen
        throw new types.Err(`Unknown token type ${token.tokenType} at line ${token.line}:${token.col}, this is most likely a bug in PostFix`, token)
      }
    }
  }

  * executeObj (obj, {
    handleErrors = true,
    forwardBreak = false
  } = {}) {
    if (this._openExeArrs > 0 && !(obj instanceof types.Marker && (obj.type === 'ExeArrOpen' || obj.type === 'ExeArrClose'))) {
      this._stack.push(obj)
    } else if (this._openParamLists > 0 && !(obj instanceof types.Marker && (obj.type === 'ParamsOpen' || obj.type === 'ParamsClose'))) {
      this._stack.push(obj)
    } else {
      try {
        const result = obj.execute(this)
        if (result != null && result[Symbol.iterator]) {
          yield * result
        }
      } catch (e) {
        if (forwardBreak && e === 'break') {
          throw e
        } else if (handleErrors) {
          this._handleExecutionError(e, obj.origin)
        } else {
          throw e
        }
      }
    }
  }

  /**
   * Create an Iterator that will execute the given tokens.
   * @param {Iterable} tokens Tokens
   */
  * _run (tokens) {
    for (const token of tokens) {
      try {
        yield * this._execute(token)
      } catch (e) {
        this._handleExecutionError(e, token)
      }
    }
  }

  _handleExecutionError (e, token) {
    if (e instanceof InvalidStackAccessError) {
      if (this._stack.count === 0) {
        throw new types.Err('The stack is empty', token)
      } else {
        throw new types.Err('Stack access is out of range', token)
      }
    } else if (e === 'break') {
      // do nothing
    } else {
      throw e
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
   * @param {Iterable} tokens Tokens to execute
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
    this._minStackHeight = []
  }

  push (obj) {
    this._stack.push(obj)
  }

  pop () {
    const minStackHeight = this._minStackHeight[this._minStackHeight.length - 1] || 0
    if (this._stack.length <= minStackHeight) {
      throw new InvalidStackAccessError()
    }
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
    const minStackHeight = this._minStackHeight[this._minStackHeight.length - 1] || 0
    if (this._stack.length - i <= minStackHeight) {
      throw new InvalidStackAccessError()
    }
    return this._stack[this._stack.length - 1 - i]
  }

  clear () {
    this._stack = []
    this._minStackHeight = []
  }

  get count () {
    return this._stack.length
  }

  /**
   * The number of items on the stack that the program can modify.
   * Inside of lambda functions, this may be smaller than the stack count.
   */
  get accessibleCount () {
    if (this._minStackHeight.length === 0) {
      return this.count
    } else {
      return this.count - this._minStackHeight[this._minStackHeight.length - 1]
    }
  }

  /**
   * Get the stack. The first element is the bottom-most element.
   * @returns {Obj[]} The stack
   */
  getElements () {
    return this._stack
  }

  _assertType (obj, ...expectedTypes) {
    if (!expectedTypes.some((t) => obj instanceof types[t])) {
      throw new types.Err(`Expected ${expectedTypes.join(' or ')} but got ${obj.getTypeName()}`, obj.origin)
    }
    return obj
  }

  /**
   * Throw if the stack height gets below the current height.
   * @returns The current stack height
   */
  forbidPop () {
    this._minStackHeight.push(this.count)
    return this.count
  }

  /**
   * Don't throw if the stack height gets below the given height.
   * This reverts forbidPop.
   */
  allowPop (height) {
    const i = this._minStackHeight.lastIndexOf(height)
    if (i >= 0) {
      this._minStackHeight.splice(i, 1)
    }
  }
}

class DictStack {
  constructor () {
    this._dict = {}
    this._stack = [this._dict]
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
    this._stack = [this._dict]
  }

  /**
   * Get the dictionary stack. The first element is the bottom-most dict.
   * @return {object[]} The dictionary stack
   */
  getDicts () {
    return this._stack
  }
}

module.exports = Interpreter
