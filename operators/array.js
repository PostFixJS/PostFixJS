const types = require('../types')
const { nextInt } = require('./impl/random')
const { isEqual } = require('./impl/compare')

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
        if (index.value >= 0 && index.value < obj.items.length) {
          const newArr = new types.Arr([...obj.items])
          newArr.items[index.value] = value
          interpreter._stack.push(newArr)
        } else {
          throw new types.Err(`Index is out of range (index is ${index.value} but the :Arr has length ${obj.items.length})`, token)
        }
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

    for (let i = 0; i < array.items.length - 1; i++) {
      if (isEqual(key, array.items[i])) {
        interpreter._stack.push(array.items[i + 1])
        return
      }
    }
    interpreter._stack.push(defaultValue)
  }
}

module.exports.keySet = {
  name: 'key-set',
  execute (interpreter, token) {
    const value = interpreter._stack.pop()
    const key = interpreter._stack.pop()
    const array = interpreter._stack.pop()

    for (let i = 0; i < array.items.length - 1; i++) {
      if (isEqual(key, array.items[i])) {
        const newArr = new types.Arr([...array.items])
        newArr.items[i + 1] = value
        interpreter._stack.push(newArr)
        return
      }
    }
    interpreter._stack.push(new types.Arr([...array.items, key, value]))
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
      throw new types.Err(`remove-at expects :Arr or :Str as first argument but got ${array.getTypeName()} instead`)
    }
  }
}
