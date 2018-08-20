const types = require('../../types')

function isEqual (a, b) {
  if (a === b) {
    return true
  } else if (a instanceof types.Arr && b instanceof types.Arr) {
    if (a.items.length === b.items.length) {
      for (let i = 0; i < a.items.length; i++) {
        if (!isEqual(a.items[i], b.items[i])) {
          return false
        }
      }
      return true
    }
  } else if (a instanceof types.Num && b instanceof types.Num) {
    return a.value === b.value
  } else if (a instanceof types.Str && b instanceof types.Str) {
    return a.value === b.value
  } else if (a instanceof types.Bool && b instanceof types.Bool) {
    return a.value === b.value
  } else if (a instanceof types.Sym && b instanceof types.Sym) {
    return a.name === b.name
  } else if (a instanceof types.Nil && b instanceof types.Nil) {
    return true
  }
  return false
}

function isApproxEqual (a, b, tolerance) {
  if (a instanceof types.Arr && b instanceof types.Arr) {
    if (a === b) {
      return true
    }
    if (a.items.length === b.items.length) {
      for (let i = 0; i < a.items.length; i++) {
        if (!isApproxEqual(a.items[i], b.items[i])) {
          return false
        }
      }
      return true
    }
  } else if (a instanceof types.Num && b instanceof types.Num) {
    return Math.abs(a.value - b.value) <= tolerance
  }
  return isEqual(a, b)
}

function getComparableValues (interpreter, token) {
  const b = interpreter._stack.pop()
  const a = interpreter._stack.pop()

  if (a instanceof types.Num && b instanceof types.Num) {
    return { a: a.value, b: b.value }
  } else if (a instanceof types.Str && b instanceof types.Str) {
    return { a: a.value.localeCompare(b.value), b: 0 }
  } else {
    throw new types.Err(`Can only compare :Str with :Str or :Num with :Num but got ${a.getTypeName()} and ${b.getTypeName()}`, token)
  }
}

module.exports.isEqual = isEqual
module.exports.isApproxEqual = isApproxEqual
module.exports.getComparableValues = getComparableValues
