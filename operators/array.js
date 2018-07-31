const types = require('../types')

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
  }
  return false
}
