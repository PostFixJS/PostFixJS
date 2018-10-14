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

module.exports = {
  isBuiltInType
}
