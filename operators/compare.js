const types = require('../types')
const { isEqual, isApproxEqual, compare } = require('./impl/compare')
const { popOperands } = require('../typeCheck')

function compareTop (interpreter, token) {
  const b = interpreter._stack.pop()
  const a = interpreter._stack.pop()
  return compare(a, b, token)
}

module.exports.lessThan = {
  name: '<',
  execute (interpreter, token) {
    interpreter._stack.push(new types.Bool(compareTop(interpreter, token) < 0))
  }
}

module.exports.lessThanOrEqual = {
  name: '<=',
  execute (interpreter, token) {
    interpreter._stack.push(new types.Bool(compareTop(interpreter, token) <= 0))
  }
}

module.exports.greaterThan = {
  name: '>',
  execute (interpreter, token) {
    interpreter._stack.push(new types.Bool(compareTop(interpreter, token) > 0))
  }
}

module.exports.greaterThanOrEqual = {
  name: '>=',
  execute (interpreter, token) {
    interpreter._stack.push(new types.Bool(compareTop(interpreter, token) >= 0))
  }
}

module.exports.equal = {
  name: '=',
  execute (interpreter) {
    const a = interpreter._stack.pop()
    const b = interpreter._stack.pop()
    interpreter._stack.push(new types.Bool(isEqual(a, b)))
  }
}

module.exports.notEqual = {
  name: '!=',
  execute (interpreter) {
    const a = interpreter._stack.pop()
    const b = interpreter._stack.pop()
    interpreter._stack.push(new types.Bool(!isEqual(a, b)))
  }
}

module.exports.approxEqual = {
  name: '~=',
  execute (interpreter, token) {
    const [ a, b, tolerance ] = popOperands(interpreter, [
      { name: 'a' },
      { name: 'b' },
      { name: 'tolerance', type: 'Num' }
    ], token)
    interpreter._stack.push(new types.Bool(isApproxEqual(a, b, tolerance.value)))
  }
}

module.exports.notApproxEqual = {
  name: '!~=',
  execute (interpreter, token) {
    const [ a, b, tolerance ] = popOperands(interpreter, [
      { name: 'a' },
      { name: 'b' },
      { name: 'tolerance', type: 'Num' }
    ], token)
    interpreter._stack.push(new types.Bool(!isApproxEqual(a, b, tolerance.value)))
  }
}
