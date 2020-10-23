const { format } = require('./impl/format')
const types = require('../types')
const { popOperand, popOperands } = require('../typeCheck')

module.exports.trim = {
  name: 'trim',
  execute (interpreter, token) {
    const str = popOperand(interpreter, { type: 'Str' }, token)
    interpreter._stack.push(new types.Str(str.value.trim()))
  }
}

module.exports.lowerCase = {
  name: 'lower-case',
  execute (interpreter, token) {
    const str = popOperand(interpreter, { type: 'Str' }, token)
    interpreter._stack.push(new types.Str(str.value.toLowerCase()))
  }
}

module.exports.upperCase = {
  name: 'upper-case',
  execute (interpreter, token) {
    const str = popOperand(interpreter, { type: 'Str' }, token)
    interpreter._stack.push(new types.Str(str.value.toUpperCase()))
  }
}

module.exports.strToChars = {
  name: 'str->chars',
  execute (interpreter, token) {
    const str = popOperand(interpreter, { type: 'Str' }, token)
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
    const chars = popOperand(interpreter, { type: 'Arr' }, token)
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
  execute (interpreter, token) {
    const char = popOperand(interpreter, { type: 'Int' }, token)
    interpreter._stack.push(new types.Str(String.fromCharCode(char)))
  }
}

module.exports.split = {
  name: 'split',
  execute (interpreter, token) {
    const [str, regexStr] = popOperands(interpreter, [
      { type: 'Str', name: 'string' },
      { type: 'Str', name: 'regex' }
    ], token)
    const regex = new RegExp(regexStr.value)
    interpreter._stack.push(new types.Arr(str.value.split(regex).map((part) => new types.Str(part))))
  }
}

module.exports.replaceFirst = {
  name: 'replace-first',
  execute (interpreter, token) {
    const [str, regexStr, replaceWith] = popOperands(interpreter, [
      { type: 'Str', name: 'string' },
      { type: 'Str', name: 'regex' },
      { type: 'Str', name: 'replaceWith' }
    ], token)
    const regex = new RegExp(regexStr.value)
    interpreter._stack.push(new types.Str(str.value.replace(regex, replaceWith.value)))
  }
}

module.exports.replaceAll = {
  name: 'replace-all',
  execute (interpreter, token) {
    const [str, regexStr, replaceWith] = popOperands(interpreter, [
      { type: 'Str', name: 'string' },
      { type: 'Str', name: 'regex' },
      { type: 'Str', name: 'replaceWith' }
    ], token)
    const regex = new RegExp(regexStr.value, 'g')
    interpreter._stack.push(new types.Str(str.value.replace(regex, replaceWith.value)))
  }
}

module.exports.format = {
  name: 'format',
  execute (interpreter, token) {
    const [formatStr, params] = popOperands(interpreter, [
      { type: 'Str', name: 'formatStr' },
      { type: 'Arr', name: 'params' }
    ], token)
    interpreter._stack.push(new types.Str(format(formatStr.value, params, token)))
  }
}
