const { format } = require('../operators/impl/format')
const types = require('../types')

module.exports.print = {
  name: 'print',
  execute (interpreter) {
    process.stdout.write(`${interpreter._stack.pop().value}`)
  }
}

module.exports.println = {
  name: 'println',
  execute (interpreter) {
    process.stdout.write(`${interpreter._stack.pop().value}\n`)
  }
}

module.exports.printf = {
  name: 'printf',
  execute (interpreter, token) {
    const params = interpreter._stack.pop()
    if (!(params instanceof types.Arr)) {
      throw new types.Err(`printf expects an :Arr with parameters as second argument but got ${params.getTypeName()} instead`, token)
    }
    const formatStr = interpreter._stack.popString().value
    process.stdout.write(format(formatStr, params))
  }
}

module.exports.printfln = {
  name: 'printfln',
  execute (interpreter, token) {
    const params = interpreter._stack.pop()
    if (!(params instanceof types.Arr)) {
      throw new types.Err(`printfln expects an :Arr with parameters as second argument but got ${params.getTypeName()} instead`, token)
    }
    const formatStr = interpreter._stack.popString().value
    process.stdout.write(`${format(formatStr, params)}\n`)
  }
}
