const types = require('../../types')
const { isEqual } = require('./compare')

function keyGet (array, key, defaultValue) {
  for (let i = 0; i < array.items.length - 1; i++) {
    if (isEqual(key, array.items[i])) {
      return array.items[i + 1]
    }
  }
  return defaultValue
}

function keySet (array, key, value) {
  for (let i = 0; i < array.items.length - 1; i++) {
    if (isEqual(key, array.items[i])) {
      const newArr = array.copy()
      newArr.items[i + 1] = value
      return newArr
    }
  }
  const newArr = array.copy()
  newArr.items.push(key, value)
  return newArr
}

function arraySet (array, index, value, token) {
  if (index.value >= 0 && index.value < array.items.length) {
    const newArr = array.copy()
    newArr.items[index.value | 0] = value
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
