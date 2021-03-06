const types = require('../../types')

/**
 * Check if two PostFix objects are equal.
 * @param {Obj} a A PostFix object
 * @param {Obj} b Another PostFix object
 * @returns {boolean} True if the two values are equal, false otherwise
 */
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

/**
 * Compare two PostFix values.
 * @param {Obj} a A PostFix object
 * @param {Obj} b Another PostFix object
 * @param {Token} token Token used for throwing error messages
 * @returns {number} A positive number if a > b, a negative number if b < a or 0 if a == b
 * @throws {Err} Throws an error if the objects cannot be compared
 */
function compare (a, b, token) {
  // This compare implementation is ported from the lt/gt methods
  // of the original PostFix implementation.
  // :Num, :Num -> compare values
  // :Str, :Str -> compare values
  // :Bool, :Bool -> true > false
  // :Arr, :Arr -> compare first min(a.length, b.length) items, if one is not equal, use that; otherwise compare the array lengths
  // all other cases -> cannot compare
  // To make this consistent with isEqual above, :Sym, :Sym is added, which compares the name

  if (a instanceof types.Num && b instanceof types.Num) {
    return a.value - b.value
  } else if (a instanceof types.Str && b instanceof types.Str) {
    return a.value.localeCompare(b.value)
  } else if (a instanceof types.Bool && b instanceof types.Bool) {
    if (a.value === b.value) return 0
    return a.value ? 1 : -1 // true > false
  } else if (a instanceof types.Sym && b instanceof types.Sym) {
    return a.name.localeCompare(b.name)
  } else if (a instanceof types.Nil && b instanceof types.Nil) {
    return !isEqual(a, b) | 0
  } else if (a instanceof types.Arr && b instanceof types.Arr) {
    const n = Math.min(a.items.length, b.items.length)
    for (let i = 0; i < n; i++) {
      try {
        const cmp = compare(a.items[i], b.items[i])
        if (cmp !== 0) {
          return cmp
        }
      } catch (e) {
        throw new types.Err(`Cannot compare ${a.items[i].getTypeName()} and ${b.items[i].getTypeName()} at index ${i}`, token)
      }
    }
    return a.items.length - b.items.length
  } else {
    throw new types.Err(`Cannot compare ${a.getTypeName()} and ${b.getTypeName()}`, token)
  }
}

/**
 * Check if two PostFix objects are approximately equal. Two numbers are considered approximately equal iff the difference is less than or equal to the tolerance. All other types are checked for equality.
 * @param {Obj} a A PostFix object
 * @param {Obj} b Another PostFix object
 * @param {number} tolerance Tolerance used when comparing numbers
 * @returns {boolean} True if the two values are equal, false otherwise
 */
function isApproxEqual (a, b, tolerance) {
  if (a instanceof types.Arr && b instanceof types.Arr) {
    if (a === b) {
      return true
    }
    if (a.items.length === b.items.length) {
      for (let i = 0; i < a.items.length; i++) {
        if (!isApproxEqual(a.items[i], b.items[i], tolerance)) {
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
