const types = require('../types')
const { checkOperands, popOperand, popOperands } = require('../typeCheck')

module.exports.plus = {
  name: '+',
  execute (interpreter, token) {
    const [a, b] = popOperands(interpreter, [
      { type: ['Num', 'Str', 'Arr'] },
      { type: ['Num', 'Str', 'Arr'] }
    ], token)

    if (a instanceof types.Str && b instanceof types.Str) {
      interpreter._stack.push(new types.Str(a.value + b.value))
    } else if (a instanceof types.Arr && b instanceof types.Arr) {
      interpreter._stack.push(new types.Arr([...a.items, ...b.items]))
    } else if (a instanceof types.Num && b instanceof types.Num) {
      if (a instanceof types.Flt || b instanceof types.Flt) {
        interpreter._stack.push(new types.Flt(b.value + a.value))
      } else {
        interpreter._stack.push(new types.Int(b.value + a.value))
      }
    } else {
      throw new types.Err(`+ can only add numbers and concatenate strings or arrays, but got ${a.getTypeName()} and ${b.getTypeName()}`, token)
    }
  }
}

module.exports.minus = {
  name: '-',
  execute (interpreter, token) {
    const [a, b] = popOperands(interpreter, [
      { type: ['Int', 'Flt'] },
      { type: ['Int', 'Flt'] }
    ], token)

    if (a instanceof types.Flt || b instanceof types.Flt) {
      interpreter._stack.push(new types.Flt(a.value - b.value))
    } else {
      interpreter._stack.push(new types.Int(a.value - b.value))
    }
  }
}

module.exports.multiply = {
  name: '*',
  execute (interpreter, token) {
    const [a, b] = popOperands(interpreter, [
      { type: ['Int', 'Flt'] },
      { type: ['Int', 'Flt'] }
    ], token)

    if (a instanceof types.Flt || b instanceof types.Flt) {
      interpreter._stack.push(new types.Flt(a.value * b.value))
    } else {
      interpreter._stack.push(new types.Int(a.value * b.value))
    }
  }
}

module.exports.divide = {
  name: '/',
  execute (interpreter, token) {
    const [a, b] = popOperands(interpreter, [
      { type: ['Int', 'Flt'] },
      { type: ['Int', 'Flt'] }
    ], token)

    interpreter._stack.push(new types.Flt(a.value / b.value))
  }
}

module.exports.intDivide = {
  name: 'i/',
  execute (interpreter, token) {
    const [a, b] = popOperands(interpreter, [
      { type: ['Int', 'Flt'] },
      { type: ['Int', 'Flt'] }
    ], token)

    interpreter._stack.push(new types.Int(Math.floor(a.value / b.value)))
  }
}

module.exports.mod = {
  name: 'mod',
  execute (interpreter, token) {
    const b = interpreter._stack.pop()
    const a = interpreter._stack.pop()
    checkOperands([
      { value: a, type: ['Int', 'Flt'] },
      { value: b, type: ['Int', 'Flt'] }
    ], token)

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
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Int(Math.sign(value.value)))
  }
}

module.exports.abs = {
  name: 'abs',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    if (value instanceof types.Int) {
      interpreter._stack.push(new types.Int(Math.abs(value.value)))
    } else { // value instanceof types.Flt
      interpreter._stack.push(new types.Flt(Math.abs(value.value)))
    }
  }
}

module.exports.min = {
  name: 'min',
  execute (interpreter, token) {
    const a = interpreter._stack.pop()
    const b = interpreter._stack.pop()
    checkOperands([
      { value: a, type: ['Int', 'Flt'] },
      { value: b, type: ['Int', 'Flt'] }
    ], token)

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
  execute (interpreter, token) {
    const a = interpreter._stack.pop()
    const b = interpreter._stack.pop()
    checkOperands([
      { value: a, type: ['Int', 'Flt'] },
      { value: b, type: ['Int', 'Flt'] }
    ], token)

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
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.sin(value.value)))
  }
}

module.exports.asin = {
  name: 'asin',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.asin(value.value)))
  }
}

module.exports.cos = {
  name: 'cos',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.cos(value.value)))
  }
}

module.exports.acos = {
  name: 'acos',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.acos(value.value)))
  }
}

module.exports.tan = {
  name: 'tan',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.tan(value.value)))
  }
}

module.exports.atan = {
  name: 'atan',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.atan(value.value)))
  }
}

module.exports.atan2 = {
  name: 'atan2',
  execute (interpreter, token) {
    const y = interpreter._stack.pop()
    const x = interpreter._stack.pop()
    checkOperands([
      { value: x, type: ['Int', 'Flt'] },
      { value: y, type: ['Int', 'Flt'] }
    ], token)

    interpreter._stack.push(new types.Flt(Math.atan2(x.value, y.value)))
  }
}

module.exports.ceil = {
  name: 'ceil',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Int(Math.ceil(value.value)))
  }
}

module.exports.floor = {
  name: 'floor',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Int(Math.floor(value.value)))
  }
}

module.exports.sqrt = {
  name: 'sqrt',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.sqrt(value.value)))
  }
}

module.exports.exp = {
  name: 'exp',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.exp(value.value)))
  }
}

module.exports.pow = {
  name: 'pow',
  execute (interpreter, token) {
    const exponent = interpreter._stack.pop()
    const base = interpreter._stack.pop()
    checkOperands([
      { value: base, name: 'base', type: ['Int', 'Flt'] },
      { value: exponent, name: 'exponent', type: ['Int', 'Flt'] }
    ], token)

    interpreter._stack.push(new types.Flt(Math.pow(base, exponent)))
  }
}

module.exports.ln = {
  name: 'ln',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Flt(Math.log(value.value)))
  }
}

module.exports.log = {
  name: 'log',
  execute (interpreter, token) {
    const b = interpreter._stack.pop()
    const x = interpreter._stack.pop()
    checkOperands([
      { value: x, type: ['Int', 'Flt'] },
      { value: b, type: ['Int', 'Flt'] }
    ], token)

    interpreter._stack.push(new types.Flt(Math.log(x.value) / Math.log(b.value)))
  }
}

module.exports.round = {
  name: 'round',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Int', 'Flt'] }, token)
    interpreter._stack.push(new types.Int(Math.round(value.value)))
  }
}
