const types = require('../../types')
const { isEqual } = require('./compare')

/**
 * Get a value by its key in a PostFix array.
 * @param {Arr} array PostFix array
 * @param {Obj} key Key
 * @param {Obj} defaultValue Default value that is returned if the key is not found
 * @returns {Obj} Value of the key or the default value if the key is not found
 */
function keyGet (array, key, defaultValue) {
  for (let i = 0; i < array.items.length - 1; i++) {
    if (isEqual(key, array.items[i])) {
      return array.items[i + 1]
    }
  }
  return defaultValue
}

/**
 * Insert a value for a key in a PostFix array. If the key already exists, the value is replaced.
 * @param {Arr} array PostFix array
 * @param {Obj} key Key
 * @param {Obj} value Value
 * @returns {Arr} A new array with the value set
 */
function keySet (array, key, value) {
  for (let i = 0; i < array.items.length - 1; i++) {
    if (isEqual(key, array.items[i])) {
      const newArr = array.copy()
      newArr.items[i + 1] = value
      value.refs++
      return newArr
    }
  }
  const newArr = array.copy()
  newArr.items.push(key, value)
  return newArr
}

/**
 * Set a value in a PostFix array.
 * @param {Arr} array PostFix array
 * @param {Num} index Index (rounded down if not an integer)
 * @param {Obj} value Value
 * @param {Token} token PostFix token used for error messages
 * @returns {Arr} A new array with the value set
 * @throws {Err} Throws an error if the index is out of range
 */
function arraySet (array, index, value, token) {
  if (index.value >= 0 && index.value < array.items.length) {
    const newArr = array.copy()
    newArr.items[index.value | 0] = value
    value.refs++
    return newArr
  } else {
    throw new types.Err(`Index is out of range (index is ${index.value} but the :Arr has length ${array.items.length})`, token)
  }
}

module.exports = {
  keyGet,
  keySet,
  arraySet
}
