const types = require('../types')
const { nextInt } = require('./impl/random')
const { isEqual, compare } = require('./impl/compare')

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
      // TODO copy items if needed
      const newArr = new types.Arr([...array.items])
      newArr.items[i + 1] = value
      return newArr
    }
  }
  return new types.Arr([...array.items, key, value])
}

function arraySet (array, index, value, token) {
  if (index.value >= 0 && index.value < array.items.length) {
    const newArr = new types.Arr([...array.items])
    newArr.items[index.value] = value
    return newArr
  } else {
    throw new types.Err(`Index is out of range (index is ${index.value} but the :Arr has length ${array.items.length})`, token)
  }
}

module.exports.length = {
  name: 'length',
  execute (interpreter, token) {
    const obj = interpreter._stack.pop()
    if (obj instanceof types.Arr) {
      interpreter._stack.push(new types.Int(obj.items.length))
    } else if (obj instanceof types.Str) {
      interpreter._stack.push(new types.Int(obj.value.length))
    } else {
      throw new types.Err(`length expects :Arr or :Str but got ${obj.getTypeName()} instead`, token)
    }
  }
}

module.exports.get = {
  name: 'get',
  execute (interpreter, token) {
    const index = interpreter._stack.pop()
    const obj = interpreter._stack.pop()

    if (index instanceof types.Int) {
      if (obj instanceof types.Arr) {
        if (index.value >= 0 && index.value < obj.items.length) {
          interpreter._stack.push(obj.items[index.value])
        } else {
          throw new types.Err(`Index is out of range (index is ${index.value} but the :Arr has length ${obj.items.length})`, token)
        }
      } else if (obj instanceof types.Str) {
        if (index.value >= 0 && index.value < obj.value.length) {
          interpreter._stack.push(new types.Str(obj.value[index.value]))
        } else {
          throw new types.Err(`Index is out of range (index is ${index.value} but the :Str has length ${obj.value.length})`, token)
        }
      } else {
        throw new types.Err(`get expects the first argument to be :Arr or :Str but got ${obj.getTypeName()} instead`, token)
      }
    } else {
      throw new types.Err(`get expects the second argument to be an :Int but got ${index.getTypeName()} instead`, token)
    }
  }
}

module.exports.set = {
  name: 'set',
  execute (interpreter, token) {
    const value = interpreter._stack.pop()
    const index = interpreter._stack.pop()
    const obj = interpreter._stack.pop()

    if (index instanceof types.Int) {
      if (obj instanceof types.Arr) {
        interpreter._stack.push(arraySet(obj, index, value, token))
      } else if (obj instanceof types.Str) {
        if (index.value >= 0 && index.value < obj.value.length) {
          if (value instanceof types.Str) {
            if (value.value.length === 1) {
              const newStr = new types.Str(`${obj.value.substr(0, index.value)}${value.value}${obj.value.substr(index.value + 1)}`)
              interpreter._stack.push(newStr)
            } else {
              throw new types.Err(`When setting an index of a :Str, the value must be a :Str with a single character, but got :Str with length ${value.value.length} instead`, token)
            }
          } else {
            throw new types.Err(`When setting an index of a :Str, the value must be a :Str with a single character, but got ${obj.getTypeName()} instead`, token)
          }
        } else {
          throw new types.Err(`Index is out of range (index is ${index.value} but the :Str has length ${obj.value.length})`, token)
        }
      } else {
        throw new types.Err(`set expects the first argument to be :Arr or :Str but got ${obj.getTypeName()} instead`, token)
      }
    } else {
      throw new types.Err(`set expects the second argument to be an :Int but got ${index.getTypeName()} instead`, token)
    }
  }
}

module.exports.keyGet = {
  name: 'key-get',
  execute (interpreter, token) {
    const defaultValue = interpreter._stack.pop()
    const key = interpreter._stack.pop()
    const array = interpreter._stack.pop()
    // TODO type checks

    interpreter._stack.push(keyGet(array, key, defaultValue))
  }
}

module.exports.keySet = {
  name: 'key-set',
  execute (interpreter, token) {
    const value = interpreter._stack.pop()
    const key = interpreter._stack.pop()
    const array = interpreter._stack.pop()
    // TODO type checks

    interpreter._stack.push(keySet(array, key, value))
  }
}

module.exports.update = {
  name: 'key-update',
  * execute (interpreter, token) {
    const updater = interpreter._stack.pop()
    const defaultValue = interpreter._stack.pop()
    const key = interpreter._stack.pop()
    const array = interpreter._stack.pop()
    // TODO check types

    interpreter._stack.push(keyGet(array, key, defaultValue))
    yield * interpreter.executeObj(updater)
    const newValue = interpreter._stack.pop()
    interpreter._stack.push(keySet(array, key, newValue))
  }
}

module.exports.pathSet = {
  name: 'path-set',
  execute (interpreter, token) {
    const value = interpreter._stack.pop()
    const path = interpreter._stack.pop()
    const array = interpreter._stack.pop()
    // TODO type checks

    let currentArray = array
    const pathArrays = [array]

    for (let i = 0; i < path.items.length - 1; i++) {
      const index = path.items[i]
      if (!(index instanceof types.Int)) {
        throw new types.Err(`Expected index to be :Int but got ${index.getTypeName()} instead`, token)
      }
      if (currentArray instanceof types.Arr) {
        currentArray = currentArray.items[index.value]
        pathArrays.push(currentArray)
      } else if (currentArray != null) {
        throw new types.Err(`key-set expects :Arr at index ${index.value} but got ${currentArray.getTypeName()} instead`, token)
      } else {
        throw new types.Err('key-set expects :Arr but the path did not lead to an :Arr', token)
      }
    }

    if (currentArray instanceof types.Arr) {
      currentArray = arraySet(pathArrays.pop(), path.items[path.items.length - 1], value)
      for (let i = pathArrays.length - 1; i >= 0; i--) {
        currentArray = arraySet(pathArrays[i], path.items[i], currentArray, token)
      }
      interpreter._stack.push(currentArray)
    } else if (currentArray != null) {
      throw new types.Err(`key-set expects :Arr but got ${currentArray.getTypeName()} instead`, token)
    } else {
      throw new types.Err('key-set expects :Arr but the path did not lead to an :Arr', token)
    }
  }
}

module.exports.pathKeySet = {
  name: 'path-key-set',
  * execute (interpreter, token) {
    const value = interpreter._stack.pop()
    const path = interpreter._stack.pop()
    const array = interpreter._stack.pop()
    // TODO type checks

    let currentArray = array
    const pathArrays = [array]

    for (let i = 0; i < path.items.length - 1; i++) {
      const index = path.items[i]
      if (currentArray instanceof types.Arr) {
        currentArray = keyGet(currentArray, index, null)
        if (currentArray == null) {
          currentArray = new types.Arr([])
        }
        pathArrays.push(currentArray)
      } else {
        currentArray = new types.Arr([])
        pathArrays.push(currentArray)
      }
    }

    currentArray = keySet(pathArrays.pop(), path.items[path.items.length - 1], value)
    for (let i = pathArrays.length - 1; i >= 0; i--) {
      currentArray = keySet(pathArrays[i], path.items[i], currentArray, token)
    }
    interpreter._stack.push(currentArray)
  }
}

module.exports.pathUpdate = {
  name: 'path-update',
  * execute (interpreter, token) {
    const updater = interpreter._stack.pop()
    const defaultValue = interpreter._stack.pop()
    const path = interpreter._stack.pop()
    const array = interpreter._stack.pop()
    // TODO type checks

    let currentArray = array
    const pathArrays = [array]

    for (let i = 0; i < path.items.length - 1; i++) {
      const index = path.items[i]
      if (currentArray instanceof types.Arr) {
        currentArray = keyGet(currentArray, index, null)
        if (currentArray == null) {
          currentArray = new types.Arr([])
        }
        pathArrays.push(currentArray)
      } else {
        currentArray = new types.Arr([])
        pathArrays.push(currentArray)
      }
    }

    interpreter._stack.push(keyGet(currentArray, path.items[path.items.length - 1], defaultValue))
    yield * interpreter.executeObj(updater)
    const value = interpreter._stack.pop()

    currentArray = keySet(pathArrays.pop(), path.items[path.items.length - 1], value)
    for (let i = pathArrays.length - 1; i >= 0; i--) {
      currentArray = keySet(pathArrays[i], path.items[i], currentArray, token)
    }
    interpreter._stack.push(currentArray)
  }
}

module.exports.shuffle = {
  name: 'shuffle',
  execute (interpreter, token) {
    const arr = interpreter._stack.pop()
    if (!(arr instanceof types.Arr)) {
      throw new types.Err(`shuffle expects an :Arr but got ${arr.getTypeName()} instead`, token)
    }
    const items = arr.items.slice()

    // Fisher-Yates shuffle as seen in Knuth's The Art of Computer Programming
    for (let i = 0; i < arr.items.length; i++) {
      const rnd = nextInt(items.length - i) + i
      const tmp = items[i]
      items[i] = items[rnd]
      items[rnd] = tmp
    }

    interpreter._stack.push(new types.Arr(items))
  }
}

module.exports.reverse = {
  name: 'reverse',
  execute (interpreter, token) {
    const arr = interpreter._stack.pop()
    if (arr instanceof types.Arr) {
      // TODO copy the items, if needed
      interpreter._stack.push(new types.Arr(arr.items.reverse()))
    } else if (arr instanceof types.Str) {
      let newStr = ''
      for (var i = arr.value.length - 1; i >= 0; i--) {
        newStr += arr.value[i]
      }
      interpreter._stack.push(new types.Str(newStr))
    } else {
      throw new types.Err(`reverse expects an :Arr or :Str but got ${arr.getTypeName()} instead`, token)
    }
  }
}

module.exports.append = {
  name: 'append',
  execute (interpreter) {
    const value = interpreter._stack.pop()
    const array = interpreter._stack.pop()
    // TODO copy the items, if needed
    interpreter._stack.push(new types.Arr([...array.items, value]))
  }
}

module.exports.remove = {
  name: 'remove',
  execute (interpreter) {
    const value = interpreter._stack.pop()
    const array = interpreter._stack.pop()

    const removeIndex = array.items.findIndex((obj) => isEqual(obj, value))
    if (removeIndex >= 0) {
      const newItems = array.items.slice()
      newItems.splice(removeIndex, 1)
      // TODO copy the items, if needed
      interpreter._stack.push(new types.Arr(newItems))
    } else {
      interpreter._stack.push(array)
    }
  }
}

module.exports.removeAt = {
  name: 'remove-at',
  execute (interpreter, token) {
    const index = interpreter._stack.pop()
    if (!(index instanceof types.Int)) {
      throw new types.Err(`remove-at expects an index (:Int) as second argument but got ${index.getTypeName()} instead`)
    }
    const array = interpreter._stack.pop()

    if (array instanceof types.Str) {
      if (index.value < 0 || index.value >= array.value.length) {
        throw new types.Err(`The index ${index.value} is not in the string (range 0 to ${array.value.length - 1})`, token)
      }
      interpreter._stack.push(new types.Str(array.value.substring(0, index.value) + array.value.substr(index.value + 1)))
    } else if (array instanceof types.Arr) {
      if (index.value < 0 || index.value >= array.items.length) {
        throw new types.Err(`The index ${index.value} is not in the array (range 0 to ${array.items.length - 1})`, token)
      }
      const newItems = array.items.slice()
      newItems.splice(index.value, 1)
      // TODO copy the items, if needed
      interpreter._stack.push(new types.Arr(newItems))
    } else {
      throw new types.Err(`remove-at expects :Arr or :Str as first argument but got ${array.getTypeName()} instead`, token)
    }
  }
}

module.exports.find = {
  name: 'find',
  execute (interpreter, token) {
    const value = interpreter._stack.pop()
    const arrOrStr = interpreter._stack.pop()
    if (arrOrStr instanceof types.Arr) {
      const index = arrOrStr.items.findIndex((obj) => isEqual(obj, value))
      interpreter._stack.push(index >= 0 ? new types.Int(index) : new types.Nil())
    } else if (arrOrStr instanceof types.Str) {
      const index = arrOrStr.value.indexOf(value instanceof types.Str ? value.value : value.toString())
      interpreter._stack.push(index >= 0 ? new types.Int(index) : new types.Nil())
    } else {
      throw new types.Err(`find expects :Arr or :Str as first argument but got ${arrOrStr.getTypeName()} instead`, token)
    }
  }
}

module.exports.findFrom = {
  name: 'find-from',
  execute (interpreter, token) {
    const startIndex = interpreter._stack.pop()
    if (!(startIndex instanceof types.Int)) {
      throw new types.Err(`find-from expects :Int as start index but got ${startIndex.getTypeName()} instead`, token)
    }
    const value = interpreter._stack.pop()
    const arrOrStr = interpreter._stack.pop()
    if (arrOrStr instanceof types.Arr) {
      const index = arrOrStr.items.findIndex((obj, i) => i >= startIndex.value && isEqual(obj, value))
      interpreter._stack.push(index >= 0 ? new types.Int(index) : new types.Nil())
    } else if (arrOrStr instanceof types.Str) {
      const index = arrOrStr.value.indexOf(value instanceof types.Str ? value.value : value.toString(), startIndex.value)
      interpreter._stack.push(index >= 0 ? new types.Int(index) : new types.Nil())
    } else {
      throw new types.Err(`find-from expects :Arr or :Str as first argument but got ${arrOrStr.getTypeName()} instead`, token)
    }
  }
}

module.exports.contains = {
  name: 'contains',
  execute (interpreter, token) {
    const value = interpreter._stack.pop()
    const arrOrStr = interpreter._stack.pop()
    if (arrOrStr instanceof types.Arr) {
      interpreter._stack.push(new types.Bool(arrOrStr.items.some((obj) => isEqual(obj, value))))
    } else if (arrOrStr instanceof types.Str) {
      interpreter._stack.push(new types.Bool(arrOrStr.value.includes(value instanceof types.Str ? value.value : value.toString())))
    } else {
      throw new types.Err(`contains expects :Arr or :Str as first argument but got ${arrOrStr.getTypeName()} instead`, token)
    }
  }
}

module.exports.slice = {
  name: 'slice',
  execute (interpreter, token) {
    let start
    let end
    let arrOrStr

    end = interpreter._stack.pop()
    start = interpreter._stack.pop()
    if (start instanceof types.Arr || start instanceof types.Str) {
      arrOrStr = start
      start = end
      end = null
    } else {
      arrOrStr = interpreter._stack.pop()
    }

    if (!(start instanceof types.Int)) {
      throw new types.Err(`slice expects :Int as second argument but got ${start.getTypeName()} instead`, token)
    }
    if (end != null && !(end instanceof types.Int)) {
      throw new types.Err(`slice expects :Int as third argument but got ${end.getTypeName()} instead`, token)
    }

    if (arrOrStr instanceof types.Arr) {
      // TODO copy the items, if needed
      interpreter._stack.push(new types.Arr(arrOrStr.items.slice(start.value, end != null ? end.value : undefined)))
    } else if (arrOrStr instanceof types.Str) {
      interpreter._stack.push(new types.Str(arrOrStr.value.substring(start.value, end != null ? end.value : undefined)))
    } else {
      throw new types.Err(`slice expects :Arr or :Str as first argument but got ${arrOrStr.getTypeName()} instead`, token)
    }
  }
}

module.exports.insert = {
  name: 'insert',
  execute (interpreter, token) {
    const obj = interpreter._stack.pop()
    const index = interpreter._stack.pop()
    const arrOrStr = interpreter._stack.pop()

    if (!(index instanceof types.Int)) {
      throw new types.Err(`insert expects :Int as index (second argument) but got ${index.getTypeName()} instead`, token)
    }

    if (arrOrStr instanceof types.Arr) {
      // TODO copy the items, if needed
      if (index.value >= 0 && index.value <= arrOrStr.items.length) {
        interpreter._stack.push(new types.Arr([
          ...arrOrStr.items.slice(0, index),
          obj,
          ...arrOrStr.items.slice(index)
        ]))
      } else {
        throw new types.Err(`Index ${index.value} is out of range from 0 to ${arrOrStr.items.length}`, token)
      }
    } else if (arrOrStr instanceof types.Str) {
      if (!(obj instanceof types.Int)) {
        throw new types.Err(`insert expects a character (:Int) to insert into the string but got ${obj.getTypeName()} instead`, token)
      }
      if (index.value >= 0 && index.value <= arrOrStr.value.length) {
        interpreter._stack.push(new types.Str(`${arrOrStr.value.substr(0, index.value)}${String.fromCharCode(obj.value)}${arrOrStr.value.substr(index)}`))
      } else {
        throw new types.Err(`Index ${index.value} is out of range from 0 to ${arrOrStr.value.length}`, token)
      }
    } else {
      throw new types.Err(`insert expects :Arr or :Str as first argument but got ${arrOrStr.getTypeName()} instead`, token)
    }
  }
}

module.exports.array = {
  name: 'array',
  * execute (interpreter, token) {
    const initializer = interpreter._stack.pop()
    const length = interpreter._stack.pop()

    if (!(length instanceof types.Int)) {
      throw new types.Err(`array expects :Int as length (first argument) but got ${length.getTypeName()} instead`, token)
    }

    if (initializer instanceof types.ExeArr) {
      const arr = []
      for (let i = 0; i < length.value; i++) {
        interpreter._stack.push(new types.Int(i))
        yield * interpreter.executeObj(initializer)
        arr.push(interpreter._stack.pop())
      }
      interpreter._stack.push(new types.Arr(arr))
    } else {
      const arr = []
      for (let i = 0; i < length.value; i++) {
        // TODO copy the value, if needed
        arr.push(initializer)
      }
      interpreter._stack.push(new types.Arr(arr))
    }
  }
}

module.exports.sort = {
  name: 'sort',
  execute (interpreter, token) {
    const array = interpreter._stack.pop()
    if (!(array instanceof types.Arr)) {
      throw new types.Err(`sort expects an :Arr to sort but got ${array.getTypeName()} instead`, token)
    }

    const sortedArray = array.items.slice() // TODO copy the items if needed
    sortedArray.sort((a, b) => compare(a, b, token))
    interpreter._stack.push(new types.Arr(sortedArray))
  }
}
