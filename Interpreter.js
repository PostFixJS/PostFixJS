class Interpreter {
  constructor () {
    this._builtIns = {}
    this._stack = new Stack()
    this._openExeArrs = 0

    // TODO Built-ins need to be Objs, too
    this.registerBuiltIn('*', {
      execute: (interpreter, token) => {
        interpreter._stack.push({
          type: 'Flt',
          value: interpreter._stack.popNumber().value * interpreter._stack.popNumber().value
        })
      }
    })
    this.registerBuiltIn('+', {
      execute: (interpreter, token) => {
        const a = interpreter._stack.pop()
        const b = interpreter._stack.pop()
        interpreter._stack._assertType(a, 'Int', 'Flt', 'Str')
        interpreter._stack._assertType(b, 'Int', 'Flt', 'Str')

        let type
        if (a.type === 'Str' || b.type === 'Str') {
          type = 'Str'
        } else if (a.type === 'Flt' || b.type === 'Flt') {
          type = 'Flt'
        } else {
          type = 'Int'
        }

        interpreter._stack.push({
          type,
          value: b.value + a.value
        })
      }
    })
    this.registerBuiltIn('trim', {
      execute: (interpreter) => {
        interpreter._stack.push({
          type: 'Str',
          value: interpreter._stack.popString().value.trim()
        })
      }
    })
    this.registerBuiltIn('println', {
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
    if (token.tokenType === 'REFERENCE') {
      const builtIn = this._builtIns[token.token]
      if (builtIn != null) {
        // TODO only push if inside ExeArr
        builtIn.execute(this, token)
      }
    } else {
      // TODO handle remaining token types and references
      switch (token.tokenType) {
        case 'FLOAT':
          this._stack.push({
            type: 'Flt',
            value: parseFloat(token.token),
            origin: token
          })
          break
        case 'INTEGER':
          this._stack.push({
            type: 'Int',
            value: parseInt(token.token),
            origin: token
          })
          break
        case 'BOOLEAN':
          this._stack.push({
            type: 'Bool',
            value: token.token === 'true',
            origin: token
          })
          break
        case 'STRING':
          this._stack.push({
            type: 'Str',
            value: token.token.substr(1, token.token.length - 2),
            origin: token
          })
          break
        case 'EXEARR_START':
          this._stack.push({
            type: 'ExeArrOpen',
            origin: token
          })
          this._openExeArrs++
          break
        case 'EXEARR_END':
          // TODO
          break
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

  popNumber () {
    return this._assertType(this.pop(), 'Flt', 'Int')
  }

  popString () {
    return this._assertType(this.pop(), 'Str')
  }

  _assertType (obj, ...types) {
    if (types.indexOf(obj.type) < 0) {
      this.push({
        type: 'Err',
        value: `Expected ${types.join(' or ')} but got ${obj.type}`,
        origin: obj.origin
      })
    }
    return obj
  }
}

module.exports = Interpreter
