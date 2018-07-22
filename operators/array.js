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