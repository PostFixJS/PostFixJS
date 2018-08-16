const types = require('../types')

module.exports.trim = {
  name: 'trim',
  execute (interpreter) {
    interpreter._stack.push(new types.Str(interpreter._stack.popString().value.trim()))
  }
}

module.exports.lowerCase = {
  name: 'lower-case',
  execute (interpreter) {
    interpreter._stack.push(new types.Str(interpreter._stack.popString().value.toLowerCase()))
  }
}

module.exports.upperCase = {
  name: 'upper-case',
  execute (interpreter) {
    interpreter._stack.push(new types.Str(interpreter._stack.popString().value.toUpperCase()))
  }
}

module.exports.strToChars = {
  name: 'str->chars',
  execute (interpreter) {
    const str = interpreter._stack.popString()
    const charCodes = []
    for (let i = 0; i < str.value.length; i++) {
      charCodes.push(new types.Int(str.value.charCodeAt(i)))
    }
    interpreter._stack.push(new types.Arr(charCodes))
  }
}

module.exports.charsToStr = {
  name: 'chars->str',
  execute (interpreter, token) {
    const chars = interpreter._stack.pop()
    if (!(chars instanceof types.Arr)) {
      throw new types.Err(`chars->str expects an :Arr with :Int values but got ${chars.getTypeName()} instead`, token)
    }

    let str = ''
    for (const char of chars.items) {
      if (!(char instanceof types.Int)) {
        throw new types.Err(`chars->str expects an :Arr with :Int values but the :Arr contains an item of type ${char.getTypeName()}`)
      }
      str += String.fromCharCode(char.value)
    }

    interpreter._stack.push(new types.Str(str))
  }
}

module.exports.charToStr = {
  name: 'char->str',
  execute (interpreter) {
    interpreter._stack.push(new types.Str(String.fromCharCode(interpreter._stack.pop().value)))
  }
}

module.exports.split = {
  name: 'split',
  execute (interpreter) {
    const regex = new RegExp(interpreter._stack.popString().value)
    const str = interpreter._stack.popString().value
    interpreter._stack.push(new types.Arr(str.split(regex).map((part) => new types.Str(part))))
  }
}

module.exports.replaceFirst = {
  name: 'replace-first',
  execute (interpreter) {
    const replaceWith = interpreter._stack.popString().value
    const regex = new RegExp(interpreter._stack.popString().value)
    const str = interpreter._stack.popString().value
    interpreter._stack.push(new types.Str(str.replace(regex, replaceWith)))
  }
}

module.exports.replaceAll = {
  name: 'replace-all',
  execute (interpreter) {
    const replaceWith = interpreter._stack.popString().value
    const regex = new RegExp(interpreter._stack.popString().value, 'g')
    const str = interpreter._stack.popString().value
    interpreter._stack.push(new types.Str(str.replace(regex, replaceWith)))
  }
}
