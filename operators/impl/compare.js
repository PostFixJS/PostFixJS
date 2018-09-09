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

function compare (a, b, token) {
  // This compare implementation is ported from the lt/gt methods
  // of the original PostFix implementation.
  // :Num, :Num -> compare values
  // :Str, :Str -> compare values
  // :Bool, :Bool -> true > false
  // :Arr, :Arr -> weird case that is not ported yet and might be dropped
  // all other cases -> cannot compare
  // To make this consistent with isEqual above, :Sym, :Sym is added, which compares the name

  if (a instanceof types.Num && b instanceof types.Num) {
    return a.value - b.value
  } else if (a instanceof types.Str && b instanceof types.Str) {
    return a.value.localeCompare(b.value)
  } else if (a instanceof types.Bool && b instanceof types.Bool) {
    if (a.value === b.value) return 0
    return a ? 1 : -1 // true > false
  } else if (a instanceof types.Sym) {
    return a.name.localeCompare(b.name)
  } else {
    throw new types.Err(`Cannot compare ${a.getTypeName()} and ${b.getTypeName()}`, token)
  }
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

module.exports.compare = compare
module.exports.isEqual = isEqual
module.exports.isApproxEqual = isApproxEqual
