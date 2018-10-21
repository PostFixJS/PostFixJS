const types = require('./types')
const InvalidStackAccessError = require('./InvalidStackAccessError')
const BreakError = require('./BreakError')
const TailCallException = require('./TailCallException')
const Stack = require('./Stack')
const DictStack = require('./DictStack')
const createCancellationToken = require('./util/cancellationToken')
const Lexer = require('./Lexer')
const { popOperand } = require('./typeCheck')

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

        if (token.tokenType === 'DEFINITION') {
          const name = token.token.substr(0, token.token.length - 1)
          if (Lexer.getTokenType(name) !== 'REFERENCE') {
            throw new types.Err(`Invalid variable name "${name}"`, token)
          }
          if (interpreter._builtIns[name]) {
            throw new types.Err(`Cannot redefine built-in operator ${name}`, token)
          }
          interpreter._dictStack.put(name, obj)
        } else {
          const sym = popOperand(interpreter, { type: 'Sym', index: 1 }, token)
          if (interpreter._builtIns[sym.name]) {
            throw new types.Err(`Cannot redefine built-in operator ${sym.name}`, token)
          }
          interpreter._dictStack.put(sym.name, obj)
        }
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
    this.registerBuiltIns(require('./operators/test'))
    this.registerBuiltIns(require('./operators/time'))
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

  setTestReporter (reporter) {
    this._testReporter = reporter
  }

  get testReporter () {
    return this._testReporter
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
    isTail = false
  } = {}) {
    if (this._openExeArrs > 0 && !(obj instanceof types.Marker && (obj.type === 'ExeArrOpen' || obj.type === 'ExeArrClose'))) {
      this._stack.push(obj)
    } else if (this._openParamLists > 0 && !(obj instanceof types.Marker && (obj.type === 'ParamsOpen' || obj.type === 'ParamsClose'))) {
      this._stack.push(obj)
    } else {
      try {
        const result = obj.execute(this, { isTail })
        if (result != null && result[Symbol.iterator]) {
          yield * result
        }
      } catch (e) {
        if (!(e instanceof BreakError || e instanceof TailCallException) && handleErrors) {
          this._handleExecutionError(e, obj.origin)
        } else {
          throw e
        }
      }
    }
  }

  /**
   * Create an Iterator that will execute the given tokens.
   * @param {Iterable} tokens Tokens to execute
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

  /**
   * Create an Iterator that will execute the given object.
   * @param {Obj} obj Object to execute
   */
  * _runObj (obj) {
    try {
      yield * this.executeObj(obj)
    } catch (e) {
      this._handleExecutionError(e, obj.origin)
    }
  }

  _handleExecutionError (e, token) {
    if (e instanceof InvalidStackAccessError) {
      if (this._stack.count === 0) {
        throw new types.Err('The stack is empty', token)
      } else {
        throw new types.Err('Stack access is out of range', token)
      }
    } else if (e instanceof BreakError) {
      throw new types.Err(`${e.operator} can only be used in a loop`, token)
    } else if (e instanceof TailCallException) {
      throw new types.Err('tailcall can only be used in a function', token)
    } else {
      throw e
    }
  }

  _startRunStepper (stepper) {
    const { token, cancel } = createCancellationToken()

    // this holds a cancel function for the Promise the interpreter waits for
    // so that it can be cancelled when the execution is cancelled
    const cancelPromise = { cancel: null }
    token.onCancel(() => {
      if (cancelPromise.cancel != null) {
        cancelPromise.cancel()
      }
    })

    let resolveRun, rejectRun
    const promise = new Promise((resolve, reject) => {
      resolveRun = resolve
      rejectRun = reject
    })
    const step = async () => {
      let promiseResult
      while (true) {
        try {
          const { done, value } = stepper.next(promiseResult)
          promiseResult = undefined
          if (value && value.promise) {
            cancelPromise.cancel = value.cancel
            try {
              promiseResult = await value.promise
              cancelPromise.cancel = null
              if (token.cancelled) {
                rejectRun(new Error('Cancelled'))
                return { value, done: true }
              }
            } catch (e) {
              cancelPromise.cancel = null
              if (!token.cancelled) {
                rejectRun(e)
                return { value, done: true }
              }
            }
          } else if (done) {
            resolveRun()
            return { value, done }
          } else if (token.cancelled) {
            rejectRun(new Error('Cancelled'))
            return { value, done: true }
          } else {
            return { value, done }
          }
        } catch (e) {
          rejectRun(e)
        }
      }
    }

    return {
      cancel,
      promise,
      step
    }
  }

  /**
   * Start executing the given tokens. Execution is continued by calling the `step`
   * function of the returned object.
   * @param {Iterable} tokens Tokens
   * @return A promise for the whole execution, a cancel function and a step function that iterates over the tokens that are executed
   */
  startRun (tokens) {
    return this._startRunStepper(this._run(tokens))
  }

  /**
   * Start executing the given object. Execution is continued by calling the `step`
   * function of the returned object.
   * @param {Iterable} tokens Tokens
   * @return A promise for the whole execution, a cancel function and a step function that iterates over the tokens that are executed
   */
  startRunObj (obj) {
    return this._startRunStepper(this._runObj(obj))
  }

  _runStepper (stepper) {
    const { token, cancel } = createCancellationToken()

    // this holds a cancel function for the Promise the interpreter waits for
    // so that it can be cancelled when the execution is cancelled
    const cancelPromise = { cancel: null }
    token.onCancel(() => {
      if (cancelPromise.cancel != null) {
        cancelPromise.cancel()
      }
    })

    return {
      cancel,
      promise: new Promise((resolve, reject) => {
        token.onCancel(() => reject(new Error('cancelled')))
        const continueExecution = async () => {
          let isDone = false
          let promiseResult
          while (!isDone) {
            try {
              const { done, value } = stepper.next(promiseResult)
              promiseResult = undefined
              if (value && value.promise) {
                cancelPromise.cancel = value.cancel
                promiseResult = await value.promise
                cancelPromise.cancel = null
                if (token.cancelled) {
                  reject(new Error('Cancelled'))
                  return
                }
              } else if (done) {
                isDone = true
                resolve()
                return
              } else if (token.cancelled) {
                reject(new Error('Cancelled'))
                return
              }
            } catch (e) {
              cancelPromise.cancel = null
              reject(e)
              return
            }
          }
        }
        continueExecution()
      })
    }
  }

  /**
   * Run all tokens.
   * @param {Iterable} tokens Tokens to execute
   */
  run (tokens) {
    return this._runStepper(this._run(tokens))
  }

  /**
   * Run a single object.
   * @param {Obj} obj Object to execute
   */
  runObj (obj) {
    return this._runStepper(this._runObj(obj))
  }

  /**
   * Reset the interpreter (i.e. clear the stack and the dictionary stack and reset internal state).
   */
  reset () {
    this._stack.clear()
    this._dictStack.clear()
    this._openExeArrs = 0
    this._openParamLists = 0
  }

  /**
   * Get a copy of this interpreter with the same state (dictionary stack, stack and built-ins).
   * @return {Interpreter} Copy of this interpreter
   */
  copy () {
    const interpreter = new Interpreter()
    interpreter._builtIns = this._builtIns
    interpreter._testReporter = this._testReporter
    // TODO copy objects if needed (or add reference counting later)
    interpreter._stack._stack = this._stack._stack.slice()
    interpreter._stack._minStackHeight = this._stack._minStackHeight.slice()
    interpreter._dictStack._dict = this._dictStack.copyDict()
    interpreter._dictStack._stack = [interpreter._dictStack._dict]
    interpreter._openExeArrs = this._openExeArrs
    interpreter._openParamLists = this._openParamLists
    return interpreter
  }
}

module.exports = Interpreter
