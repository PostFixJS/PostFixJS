const types = require('./types')

function popOperand (interpreter, operand, token) {
  const value = interpreter._stack.pop()
  checkOperand(value, operand, token)
  return value
}

function popOperands (interpreter, operands, token) {
  if (interpreter._stack.accessibleCount < operands.length) {
    throw new types.Err(`Expected ${operands.length} operands but only got ${interpreter._stack.accessibleCount}`, token)
  }

  const values = []
  let i
  for (i = operands.length - 1; i >= 0; i--) {
    const operand = operands[i]
    values.push(Object.assign({ value: interpreter._stack.pop() }, operand))
  }
  values.reverse()
  checkOperands(values, token)
  return values.map(({ value }) => value)
}

function checkOperand (value, operand, token) {
  if (!checkType(value, operand.type)) {
    const { name, type, index } = operand
    if (name) {
      throw new types.Err(`Expected operand ${index || 1} (${name}) to be ${typeToStr(type)} but got ${value.getTypeName()} instead`, token)
    } else {
      throw new types.Err(`Expected operand ${index || 1} to be ${typeToStr(type)} but got ${value.getTypeName()} instead`, token)
    }
  }
}

function checkOperands (operands, token) {
  let i
  for (i = 0; i < operands.length; i++) {
    const operand = operands[i]
    if (operand.type != null && !checkType(operand.value, operand.type)) {
      const { name, value, type } = operand
      if (name) {
        throw new types.Err(`Expected operand ${i + 1} (${name}) to be ${typeToStr(type)} but got ${value.getTypeName()} instead`, token)
      } else {
        throw new types.Err(`Expected operand ${i + 1} to be ${typeToStr(type)} but got ${value.getTypeName()} instead`, token)
      }
    }
  }
}

function checkType (value, type) {
  if (Array.isArray(type)) {
    return type.some((t) => value instanceof types[t])
  } else {
    return value instanceof types[type]
  }
}

function typeToStr (type) {
  if (Array.isArray(type)) {
    return type.map(typeToStr).join(' or ')
  } else {
    return `:${type}`
  }
}

module.exports = {
  popOperand,
  popOperands,
  checkOperand,
  checkOperands
}
