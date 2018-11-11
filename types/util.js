const Arr = require('./Arr')
const Sym = require('./Sym')

/**
 * Check if the given type name is a built-in type.
 * @param {string|Sym} type Symbol or type name, e.g. :Int or :Square
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
 * @return The name of the type or false if the object is not a datadef type instance
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
 * @return Type name
 */
function getTypeNameWithDatadef (obj) {
  const datadefType = getDatadefType(obj)
  if (datadefType) {
    return `:${datadefType}`
  }
  return obj.getTypeName()
}

module.exports = {
  isBuiltInType,
  getDatadefType,
  getTypeNameWithDatadef
}
