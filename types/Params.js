const Obj = require('./Obj')
const Sym = require('./Sym')
const Err = require('./Err')

class Params extends Obj {
  constructor (params, returns, origin) {
    super()
    this.origin = origin
    this.params = params
    this.returns = returns
  }

  static fromParamList (rawParams, origin) {
    const types = require('./') // Params is a circular dependency; this wouldn't be required with es6 imports

    let rightArrowPosition = rawParams.findIndex((p) => p instanceof types.Marker && p.type === 'RightArrow')
    if (rightArrowPosition < 0) {
      rightArrowPosition = rawParams.length
    }

    const params = []
    const returns = rawParams.slice(rightArrowPosition + 1)

    for (let i = 0; i < rightArrowPosition; i++) {
      const o = rawParams[i]
      if (!((o instanceof types.Ref) || (o instanceof types.Sym))) {
        throw new Err(`Found ${o.getTypeName()} in the parameter list, but it may only contain variable names and type names.`, origin)
      }
      if (i === 0 && o instanceof types.Sym) {
        throw new Err(`Found type name at the beginning of the parameter list but expected to find a variable name at the first position.`, origin)
      }
      if (i > 0 && o instanceof types.Sym && !(rawParams[i - 1] instanceof types.Ref)) {
        throw new Err(`Found two type names in a row in the parameter list but expected a type name to follow a variable name.`, origin)
      }

      if (o instanceof types.Ref) {
        params.push({ ref: o })
      }
      if (o instanceof types.Sym) {
        params[params.length - 1].type = o
      }
    }

    for (const r of returns) {
      if (!(r instanceof Sym)) {
        throw new Err(`Found ${r.getTypeName()} in the return list, but it may only contain type names (e.g. :Int or :Flt).`, origin)
      }
    }

    return new Params(params, returns, origin)
  }

  * bind (interpreter) {
    for (let i = this.params.length - 1; i >= 0; i--) {
      const { ref, type } = this.params[i]
      const value = interpreter._stack.pop()
      if (type != null && !value.isAssignableTo(type.toString())) {
        const typeChecker = interpreter._dictStack.get(`${type.name.toLowerCase()}?`)
        if (typeChecker) {
          interpreter._stack.push(value)
          yield * interpreter.executeObj(typeChecker)
          const typeMatches = interpreter._stack.pop()
          if (typeMatches.value !== true) {
            throw new Err(`Expected ${type.toString()} but got incompatible type ${value.getTypeName()} for parameter ${ref.name}`, ref.origin)
          }
        } else {
          throw new Err(`Expected ${type.toString()} but got incompatible type ${value.getTypeName()} for parameter ${ref.name}`, ref.origin)
        }
      }
      interpreter._dictStack.put(ref.name, value)
    }
  }

  * checkReturns (interpreter, returnCount) {
    if (returnCount !== this.returns.length) {
      if (returnCount >= 0) {
        throw new Err(`Expected fun to return ${this.returns.length} values but it returned ${returnCount} values`, this.origin)
      } else {
        throw new Err(`Expected fun to return ${this.returns.length} values but it even dropped ${-returnCount} values from the stack`, this.origin)
      }
    }
    for (let i = 0; i < this.returns.length; i++) {
      const expectedType = this.returns[i].toString()
      const actual = interpreter._stack.peek(this.returns.length - i - 1)
      if (!actual.isAssignableTo(expectedType)) {
        const typeChecker = interpreter._dictStack.get(`${this.returns[i].name.toLowerCase()}?`)
        if (typeChecker) {
          interpreter._stack.push(actual)
          yield * interpreter.executeObj(typeChecker)
          const typeMatches = interpreter._stack.pop()
          if (typeMatches.value !== true) {
            throw new Err(`Expected return value ${i + 1} to be of type ${expectedType} but got incompatible type ${actual.getTypeName()}`, this.origin)
          }
        } else {
          throw new Err(`Expected return value ${i + 1} to be of type ${expectedType} but got incompatible type ${actual.getTypeName()}`, this.origin)
        }
      }
    }
  }

  getTypeName () {
    return ':Params'
  }

  toString () {
    const params = this.params
      .map(({ ref, type }) => `${ref.toString()}${type ? ` ${type.toString()}` : ''}`)
      .join(', ')
    const returns = this.returns.map((r) => r.toString()).join(', ')

    if (returns.length > 0) {
      return `(${params.length > 0 ? ` ${params}` : ''} -> ${returns} )`
    } else {
      return `(${params.length > 0 ? ` ${params}` : ''})`
    }
  }

  _copyImpl () {
    // Params are immutable
    if (this.origin) {
      return new Params(this.params, this.returns)
    } else {
      return this
    }
  }
}

module.exports = Params
