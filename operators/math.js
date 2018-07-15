const types = require('../types')

module.exports.plus = {
  name: '+',
  execute: (interpreter) => {
    const a = interpreter._stack.pop()
    const b = interpreter._stack.pop()
    interpreter._stack._assertType(a, 'Int', 'Flt', 'Str')
    interpreter._stack._assertType(b, 'Int', 'Flt', 'Str')

    if (a instanceof types.Str || b instanceof types.Str) {
      interpreter._stack.push(new types.Str(b.value + a.value))
    } else if (a instanceof types.Flt || b instanceof types.Flt) {
      interpreter._stack.push(new types.Flt(b.value + a.value))
    } else {
      interpreter._stack.push(new types.Int(b.value + a.value))
    }
  }
}

module.exports.minus = {
  name: '-',
  execute: (interpreter) => {
    const b = interpreter._stack.popNumber()
    const a = interpreter._stack.popNumber()

    if (a instanceof types.Flt || b instanceof types.Flt) {
      interpreter._stack.push(new types.Flt(a.value - b.value))
    } else {
      interpreter._stack.push(new types.Int(a.value - b.value))
    }
  }
}

module.exports.multiply = {
  name: '*',
  execute: (interpreter) => {
    interpreter._stack.push(new types.Flt(interpreter._stack.popNumber().value * interpreter._stack.popNumber().value))
  }
}

module.exports.divide = {
  name: '/',
  execute: (interpreter) => {
    const b = interpreter._stack.popNumber()
    const a = interpreter._stack.popNumber()
    interpreter._stack.push(new types.Flt(a.value / b.value))
  }
}

module.exports.intDivide = {
  name: 'i/',
  execute: (interpreter) => {
    const b = interpreter._stack.popNumber()
    const a = interpreter._stack.popNumber()
    interpreter._stack.push(new types.Int(Math.floor(a.value / b.value)))
  }
}

module.exports.mod = {
  name: 'mod',
  execute: (interpreter) => {
    const b = interpreter._stack.popNumber()
    const a = interpreter._stack.popNumber()
    interpreter._stack.push(new types.Int(a.value % b.value))
  }
}
