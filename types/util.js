const Arr = require('./Arr')
const Bool = require('./Bool')
const Sym = require('./Sym')

/**
 * Check if the given type name is a built-in type.
 * @param {string|Sym} type Symbol or type name, e.g. :Int or :Square
 * @returns {boolean} True if the type is built-in, false otherwise
 */
function isBuiltInType (type) {
  if (type instanceof Sym) {
    type = type.toString()
  }
  return [':Arr', ':Bool', ':Err', ':ExeArr', ':Flt', ':Int', ':Lam', ':Marker', ':Nil', ':Num', ':Obj', ':Op', ':Params', ':Ref', ':Str', ':Sym'].includes(type)
}

/**
 * Check if the given object is an instance of a datadef'ed type.
 * @param {Obj} obj Object
 * @returns The name of the type or false if the object is not a datadef type instance
 */
function getDatadefType (obj) {
  if (obj instanceof Arr &&
    obj.items.length >= 2 &&
    obj.items[0] instanceof Sym &&
    obj.items[0].name === 'datadef' &&
    obj.items[1] instanceof Sym) {
    return obj.items[1].name
  }
  return false
}

/**
 * Get the datadef type if the object is a datadef instance or the built-in type name otherwise.
 * @param {Obj} obj Object
 * @returns Type name
 */
function getTypeNameWithDatadef (obj) {
  const datadefType = getDatadefType(obj)
  if (datadefType) {
    return `:${datadefType}`
  }
  return obj.getTypeName()
}

/**
 * Check if the given object matches a type, evaluating type checking functions of datadefs, if needed.
 * @param {Sym} expectedType Expected type
 * @param {Obj} actual Object to check the type of
 * @param {Interpreter} interpreter Interpreter instance for running type checking functions
 * @returns {boolean|'unexpected'|'unknown'} True if the type matches, 'unexpected' if the type doesn't match and 'unknown' if the expected type is unknown (i.e. not built-in and no type checking function is available in the current dictionary)
 */
function * checkType (expectedType, actual, interpreter) {
  if (actual.isAssignableTo(expectedType.toString())) {
    return true
  }

  const typeChecker = interpreter._dictStack.get(`${expectedType.name.toLowerCase()}?`)
  if (typeChecker) {
    interpreter._stack.push(actual)
    yield * interpreter.executeObj(typeChecker)
    const typeMatches = interpreter._stack.pop()
    if (!(typeMatches instanceof Bool) || typeMatches.value !== true) {
      return 'unexpected'
    }
    return true
  } else if (isBuiltInType(expectedType.toString())) {
    return 'unexpected'
  } else {
    return 'unknown'
  }
}

module.exports = {
  isBuiltInType,
  getDatadefType,
  getTypeNameWithDatadef,
  checkType
}
