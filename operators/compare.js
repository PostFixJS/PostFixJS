const types = require('../types')
const { isEqual, isApproxEqual, getComparableValues } = require('./impl/compare')

module.exports.lessThan = {
  name: '<',
  execute (interpreter, token) {
    const { a, b } = getComparableValues(interpreter, token)
    interpreter._stack.push(new types.Bool(a < b))
  }
}

module.exports.lessThanOrEqual = {
  name: '<=',
  execute (interpreter, token) {
    const { a, b } = getComparableValues(interpreter, token)
    interpreter._stack.push(new types.Bool(a <= b))
  }
}

module.exports.greaterThan = {
  name: '>',
  execute (interpreter, token) {
    const { a, b } = getComparableValues(interpreter, token)
    interpreter._stack.push(new types.Bool(a > b))
  }
}

module.exports.greaterThanOrEqual = {
  name: '>=',
  execute (interpreter, token) {
    const { a, b } = getComparableValues(interpreter, token)
    interpreter._stack.push(new types.Bool(a >= b))
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
  execute (interpreter) {
    const tolerance = interpreter._stack.popNumber()
    const a = interpreter._stack.pop()
    const b = interpreter._stack.pop()
    interpreter._stack.push(new types.Bool(isApproxEqual(a, b, tolerance.value)))
  }
}

module.exports.notApproxEqual = {
  name: '!~=',
  execute (interpreter) {
    const tolerance = interpreter._stack.popNumber()
    const a = interpreter._stack.pop()
    const b = interpreter._stack.pop()
    interpreter._stack.push(new types.Bool(!isApproxEqual(a, b, tolerance.value)))
  }
}
