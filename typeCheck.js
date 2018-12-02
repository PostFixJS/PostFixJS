const types = require('./types')

/**
 * Pop the topmost element from the stack and check its type.
 * @param {Interpreter} interpreter PostFix interpreter
 * @param {object} operand Operand (name, type, description)
 * @param {Token} token Token to throw errors at
 * @returns {Obj} The topmost element from the stack
 * @throws {Err} Throws if the type doesn't match or if the stack is empty
 */
function popOperand (interpreter, operand, token) {
  const value = interpreter._stack.pop()
  checkOperand(value, operand, token)
  return value
}

/**
 * Pop the topmost elements from the stack and check their types.
 * @param {Interpreter} interpreter PostFix interpreter
 * @param {object[]} operands Operands (name, type, description)
 * @param {Token} token Token to throw errors at
 * @returns {Obj[]} The topmost elements from the stack
 * @throws {Err} Throws if the type doesn't match or if the stack is empty
 */
function popOperands (interpreter, operands, token) {
  if (interpreter._stack.accessibleCount < operands.length) {
    throw new types.Err(`Expected ${operands.length} operands but only got ${interpreter._stack.accessibleCount}`, token)
  }

  const values = new Array(operands.length)
  for (let i = operands.length - 1; i >= 0; i--) {
    const operand = operands[i]
    const value = interpreter._stack.pop()
    if (operand.type != null && !checkType(value, operand.type)) {
      const { name, type } = operand
      if (name) {
        throw new types.Err(`Expected operand ${i + 1} (${name}) to be ${typeToStr(type)} but got ${value.getTypeName()} instead`, token)
      } else {
        throw new types.Err(`Expected operand ${i + 1} to be ${typeToStr(type)} but got ${value.getTypeName()} instead`, token)
      }
    }
    values[i] = value
  }

  return values
}

/**
 * Check the type of an operand.
 * @param {Obj} value Value of the operand
 * @param {object} operand Operand (name, type, description)
 * @param {Token} token Token to throw errors at
 * @throws {Err} Throws if the type doesn't match or if the stack is empty
 */
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

/**
 * Check the types of multiple operands.
 * @param {object} operand Operands (name, type, description and value)
 * @param {Token} token Token to throw errors at
 * @throws {Err} Throws if the type doesn't match or if the stack is empty
 */
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

/**
 * Check if a value is of a given PostFix type.
 * @param {Obj} value PostFix object
 * @param {object|object[]} types PostFix types to check for
 * @returns True if the value is an instance of any of the given types, false otherwise
 */
function checkType (value, type) {
  if (Array.isArray(type)) {
    return type.some((t) => value instanceof types[t])
  } else {
    return value instanceof types[type]
  }
}

/**
 * Convert type names to a string.
 * @param {string|string[]} type PostFix type names, without colon
 * @returns A string representing the given type names, joined with 'or'
 */
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
