const types = require('../types')

module.exports.plus = {
  name: '+',
  execute (interpreter) {
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
  execute (interpreter) {
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
  execute (interpreter) {
    const b = interpreter._stack.popNumber()
    const a = interpreter._stack.popNumber()

    if (a instanceof types.Flt || b instanceof types.Flt) {
      interpreter._stack.push(new types.Flt(a.value * b.value))
    } else {
      interpreter._stack.push(new types.Int(a.value * b.value))
    }
  }
}

module.exports.divide = {
  name: '/',
  execute (interpreter) {
    const b = interpreter._stack.popNumber()
    const a = interpreter._stack.popNumber()
    interpreter._stack.push(new types.Flt(a.value / b.value))
  }
}

module.exports.intDivide = {
  name: 'i/',
  execute (interpreter) {
    const b = interpreter._stack.popNumber()
    const a = interpreter._stack.popNumber()
    interpreter._stack.push(new types.Int(Math.floor(a.value / b.value)))
  }
}

module.exports.mod = {
  name: 'mod',
  execute (interpreter) {
    const b = interpreter._stack.popNumber()
    const a = interpreter._stack.popNumber()
    interpreter._stack.push(new types.Int(a.value % b.value))
  }
}

module.exports.pi = {
  name: 'PI',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.PI))
  }
}

module.exports.sign = {
  name: 'sign',
  execute (interpreter) {
    interpreter._stack.push(new types.Int(Math.sign(interpreter._stack.popNumber().value)))
  }
}

module.exports.abs = {
  name: 'abs',
  execute (interpreter) {
    const value = interpreter._stack.popNumber()
    if (value instanceof types.Int) {
      interpreter._stack.push(new types.Int(-value.value))
    } else { // value instanceof types.Flt
      interpreter._stack.push(new types.Flt(-value.value))
    }
  }
}

module.exports.min = {
  name: 'min',
  execute (interpreter) {
    const a = interpreter._stack.popNumber()
    const b = interpreter._stack.popNumber()
    if (a.value <= b.value) {
      if (a instanceof types.Int) {
        interpreter._stack.push(new types.Int(a.value))
      } else { // a instanceof types.Flt
        interpreter._stack.push(new types.Flt(a.value))
      }
    } else {
      if (b instanceof types.Int) {
        interpreter._stack.push(new types.Int(b.value))
      } else { // b instanceof types.Flt
        interpreter._stack.push(new types.Flt(b.value))
      }
    }
  }
}

module.exports.max = {
  name: 'max',
  execute (interpreter) {
    const a = interpreter._stack.popNumber()
    const b = interpreter._stack.popNumber()
    if (a.value >= b.value) {
      if (a instanceof types.Int) {
        interpreter._stack.push(new types.Int(a.value))
      } else { // a instanceof types.Flt
        interpreter._stack.push(new types.Flt(a.value))
      }
    } else {
      if (b instanceof types.Int) {
        interpreter._stack.push(new types.Int(b.value))
      } else { // b instanceof types.Flt
        interpreter._stack.push(new types.Flt(b.value))
      }
    }
  }
}

module.exports.sin = {
  name: 'sin',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.sin(interpreter._stack.popNumber())))
  }
}

module.exports.asin = {
  name: 'asin',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.asin(interpreter._stack.popNumber())))
  }
}

module.exports.cos = {
  name: 'cos',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.cos(interpreter._stack.popNumber())))
  }
}

module.exports.acos = {
  name: 'acos',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.acos(interpreter._stack.popNumber())))
  }
}

module.exports.tan = {
  name: 'tan',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.tan(interpreter._stack.popNumber())))
  }
}

module.exports.atan = {
  name: 'atan',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.atan(interpreter._stack.popNumber())))
  }
}

module.exports.atan2 = {
  name: 'atan2',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.atan2(interpreter._stack.popNumber())))
  }
}

module.exports.ceil = {
  name: 'ceil',
  execute (interpreter) {
    interpreter._stack.push(new types.Int(Math.ceil(interpreter._stack.popNumber())))
  }
}

module.exports.floor = {
  name: 'floor',
  execute (interpreter) {
    interpreter._stack.push(new types.Int(Math.floor(interpreter._stack.popNumber())))
  }
}

module.exports.sqrt = {
  name: 'sqrt',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.sqrt(interpreter._stack.popNumber())))
  }
}

module.exports.exp = {
  name: 'exp',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.exp(interpreter._stack.popNumber())))
  }
}

module.exports.pow = {
  name: 'pow',
  execute (interpreter) {
    const exponent = interpreter._stack.popNumber()
    const base = interpreter._stack.popNumber()
    interpreter._stack.push(new types.Flt(Math.pow(base, exponent)))
  }
}

module.exports.ln = {
  name: 'ln',
  execute (interpreter) {
    interpreter._stack.push(new types.Flt(Math.log(interpreter._stack.popNumber())))
  }
}

module.exports.log = {
  name: 'log',
  execute (interpreter) {
    const b = interpreter._stack.popNumber()
    const x = interpreter._stack.popNumber()
    interpreter._stack.push(new types.Flt(Math.log(x) / Math.log(b)))
  }
}

module.exports.round = {
  name: 'round',
  execute (interpreter) {
    interpreter._stack.push(new types.Int(Math.round(interpreter._stack.popNumber())))
  }
}
