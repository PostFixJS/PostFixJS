const types = require('../types')
const { nextInt } = require('./impl/random')
const { isEqual, compare } = require('./impl/compare')
const { popOperand, popOperands, checkOperands } = require('../typeCheck')
const { keyGet, keySet, arraySet } = require('./impl/array')

module.exports.length = {
  name: 'length',
  execute (interpreter, token) {
    const obj = popOperand(interpreter, { type: ['Arr', 'Str'] }, token)
    if (obj instanceof types.Arr) {
      interpreter._stack.push(new types.Int(obj.items.length))
    } else if (obj instanceof types.Str) {
      interpreter._stack.push(new types.Int(obj.value.length))
    }
  }
}

module.exports.get = {
  name: 'get',
  execute (interpreter, token) {
    const [ obj, index ] = popOperands(interpreter, [
      { type: ['Arr', 'Str'] },
      { type: 'Obj' }
    ], token)

    if (obj instanceof types.Arr) {
      if (index instanceof types.Num) {
        if (index.value >= 0 && index.value < obj.items.length) {
          interpreter._stack.push(obj.items[index.value | 0])
        } else {
          throw new types.Err(`Index is out of range (index is ${index.value} but the :Arr has length ${obj.items.length})`, token)
        }
      } else {
        interpreter._stack.push(keyGet(obj, index, types.Nil.nil))
      }
    } else if (obj instanceof types.Str) {
      if (index instanceof types.Num) {
        if (index.value >= 0 && index.value < obj.value.length) {
          interpreter._stack.push(new types.Str(obj.value[index.value | 0]))
        } else {
          throw new types.Err(`Index is out of range (index is ${index.value} but the :Str has length ${obj.value.length})`, token)
        }
      } else {
        throw new types.Err(`Expected an :Int as index for strings but got ${index.getTypeName()} instead`, token)
      }
    }
  }
}

module.exports.set = {
  name: 'set',
  execute (interpreter, token) {
    const [ obj, index, value ] = popOperands(interpreter, [
      { name: 'array', type: ['Arr', 'Str'] },
      { name: 'index', type: 'Int' },
      {}
    ], token)

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
    }
  }
}

module.exports.keyGet = {
  name: 'key-get',
  execute (interpreter, token) {
    const [ array, key, defaultValue ] = popOperands(interpreter, [
      { name: 'array', type: 'Arr' },
      { name: 'key' },
      { name: 'defaultValue' }
    ], token)

    interpreter._stack.push(keyGet(array, key, defaultValue))
  }
}

module.exports.keySet = {
  name: 'key-set',
  execute (interpreter, token) {
    const [ array, key, value ] = popOperands(interpreter, [
      { name: 'array', type: 'Arr' },
      { name: 'key' },
      { name: 'value' }
    ], token)

    interpreter._stack.push(keySet(array, key, value))
  }
}

module.exports.update = {
  name: 'key-update',
  * execute (interpreter, token) {
    const [ array, key, defaultValue, updater ] = popOperands(interpreter, [
      { name: 'array', type: 'Arr' },
      { name: 'key' },
      { name: 'defaultValue' },
      { name: 'updater', type: 'ExeArr' }
    ], token)

    interpreter._stack.push(keyGet(array, key, defaultValue))
    yield * interpreter.executeObj(updater)
    const newValue = interpreter._stack.pop()
    interpreter._stack.push(keySet(array, key, newValue))
  }
}

module.exports.pathSet = {
  name: 'path-set',
  execute (interpreter, token) {
    const [ array, path, value ] = popOperands(interpreter, [
      { name: 'array', type: 'Arr' },
      { name: 'path', type: 'Arr' },
      { name: 'value' }
    ], token)

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
    const [ array, path, value ] = popOperands(interpreter, [
      { name: 'array', type: 'Arr' },
      { name: 'path', type: 'Arr' },
      { name: 'value' }
    ], token)

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
    const [ array, path, defaultValue, updater ] = popOperands(interpreter, [
      { name: 'array', type: 'Arr' },
      { name: 'path', type: 'Arr' },
      { name: 'defaultValue' },
      { name: 'updater', type: 'ExeArr' }
    ], token)

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
    const arr = popOperand(interpreter, { type: 'Arr' }, token).copy()

    // Fisher-Yates shuffle as seen in Knuth's The Art of Computer Programming
    for (let i = 0; i < arr.items.length; i++) {
      const rnd = nextInt(arr.items.length - i) + i
      const tmp = arr.items[i]
      arr.items[i] = arr.items[rnd]
      arr.items[rnd] = tmp
    }

    interpreter._stack.push(arr)
  }
}

module.exports.reverse = {
  name: 'reverse',
  execute (interpreter, token) {
    const arr = popOperand(interpreter, { type: ['Arr', 'Str'] }, token)

    if (arr instanceof types.Arr) {
      const newArr = arr.copy()
      newArr.items.reverse()
      interpreter._stack.push(newArr)
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
  execute (interpreter, token) {
    const [ array, value ] = popOperands(interpreter, [
      { name: 'array', type: 'Arr' },
      { name: 'value' }
    ], token)

    const newArr = array.copy()
    newArr.items.push(value)
    interpreter._stack.push(newArr)
  }
}

module.exports.remove = {
  name: 'remove',
  execute (interpreter, token) {
    const [ array, value ] = popOperands(interpreter, [
      { name: 'array', type: 'Arr' },
      { name: 'value' }
    ], token)

    const removeIndex = array.items.findIndex((obj) => isEqual(obj, value))
    if (removeIndex >= 0) {
      const newArray = array.copy()
      newArray.items.splice(removeIndex, 1)
      interpreter._stack.push(newArray)
    } else {
      interpreter._stack.push(array)
    }
  }
}

module.exports.removeAt = {
  name: 'remove-at',
  execute (interpreter, token) {
    const [ array, index ] = popOperands(interpreter, [
      { name: 'array', type: ['Arr', 'Str'] },
      { name: 'index', type: 'Int' }
    ], token)

    if (array instanceof types.Str) {
      if (index.value < 0 || index.value >= array.value.length) {
        throw new types.Err(`The index ${index.value} is not in the string (range 0 to ${array.value.length - 1})`, token)
      }
      interpreter._stack.push(new types.Str(array.value.substring(0, index.value) + array.value.substr(index.value + 1)))
    } else if (array instanceof types.Arr) {
      if (index.value < 0 || index.value >= array.items.length) {
        throw new types.Err(`The index ${index.value} is not in the array (range 0 to ${array.items.length - 1})`, token)
      }
      const newArrray = array.copy()
      newArrray.items.splice(index.value, 1)
      interpreter._stack.push(newArrray)
    }
  }
}

module.exports.find = {
  name: 'find',
  execute (interpreter, token) {
    const [ arrOrStr, value ] = popOperands(interpreter, [
      { type: ['Arr', 'Str'] },
      { name: 'value' }
    ], token)

    if (arrOrStr instanceof types.Arr) {
      const index = arrOrStr.items.findIndex((obj) => isEqual(obj, value))
      interpreter._stack.push(index >= 0 ? new types.Int(index) : new types.Nil())
    } else if (arrOrStr instanceof types.Str) {
      const index = arrOrStr.value.indexOf(value instanceof types.Str ? value.value : value.toString())
      interpreter._stack.push(index >= 0 ? new types.Int(index) : new types.Nil())
    }
  }
}

module.exports.findFrom = {
  name: 'find-from',
  execute (interpreter, token) {
    const [ arrOrStr, value, startIndex ] = popOperands(interpreter, [
      { type: ['Arr', 'Str'] },
      { name: 'value' },
      { name: 'startAt', type: 'Int' }
    ], token)

    if (arrOrStr instanceof types.Arr) {
      const index = arrOrStr.items.findIndex((obj, i) => i >= startIndex.value && isEqual(obj, value))
      interpreter._stack.push(index >= 0 ? new types.Int(index) : new types.Nil())
    } else if (arrOrStr instanceof types.Str) {
      const index = arrOrStr.value.indexOf(value instanceof types.Str ? value.value : value.toString(), startIndex.value)
      interpreter._stack.push(index >= 0 ? new types.Int(index) : new types.Nil())
    }
  }
}

module.exports.contains = {
  name: 'contains',
  execute (interpreter, token) {
    const [ arrOrStr, value ] = popOperands(interpreter, [
      { type: ['Arr', 'Str'] },
      { name: 'value' }
    ], token)

    if (arrOrStr instanceof types.Arr) {
      interpreter._stack.push(new types.Bool(arrOrStr.items.some((obj) => isEqual(obj, value))))
    } else if (arrOrStr instanceof types.Str) {
      interpreter._stack.push(new types.Bool(arrOrStr.value.includes(value instanceof types.Str ? value.value : value.toString())))
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
      checkOperands([
        { value: arrOrStr, type: ['Arr', 'Str'] },
        { value: start, type: 'Int', name: 'start' }
      ], token)
    } else {
      arrOrStr = interpreter._stack.pop()
      checkOperands([
        { value: arrOrStr, type: ['Arr', 'Str'] },
        { value: start, type: 'Int', name: 'start' },
        { value: end, type: 'Int', name: 'end' }
      ], token)
    }

    if (arrOrStr instanceof types.Arr) {
      interpreter._stack.push(new types.Arr(arrOrStr.items.slice(start.value, end != null ? end.value : undefined)))
    } else if (arrOrStr instanceof types.Str) {
      interpreter._stack.push(new types.Str(arrOrStr.value.substring(start.value, end != null ? end.value : undefined)))
    }
  }
}

module.exports.insert = {
  name: 'insert',
  execute (interpreter, token) {
    const [ arrOrStr, index, obj ] = popOperands(interpreter, [
      { name: 'array', type: ['Arr', 'Str'] },
      { name: 'index', type: 'Int' },
      { name: 'value' }
    ], token)

    if (arrOrStr instanceof types.Arr) {
      if (index.value >= 0 && index.value <= arrOrStr.items.length) {
        const newArr = arrOrStr.copy()
        newArr.items.splice(index, 0, obj)
        interpreter._stack.push(newArr)
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
    }
  }
}

module.exports.array = {
  name: 'array',
  * execute (interpreter, token) {
    const [ length, initializer ] = popOperands(interpreter, [
      { name: 'length', type: 'Int' },
      { name: 'initializer' }
    ], token)

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
        arr.push(initializer)
      }
      interpreter._stack.push(new types.Arr(arr))
    }
  }
}

module.exports.sort = {
  name: 'sort',
  execute (interpreter, token) {
    const array = popOperand(interpreter, { type: 'Arr' }, token).copy()
    const sortedArray = array.copy()
    sortedArray.items.sort((a, b) => compare(a, b, token))
    interpreter._stack.push(sortedArray)
  }
}
