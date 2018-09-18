const { format } = require('../operators/impl/format')
const { popOperand, popOperands } = require('../typeCheck')

module.exports.print = {
  name: 'print',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Num', 'Bool', 'Str'] }, token)
    process.stdout.write(`${value.value}`)
  }
}

module.exports.println = {
  name: 'println',
  execute (interpreter, token) {
    const value = popOperand(interpreter, { type: ['Num', 'Bool', 'Str'] }, token)
    process.stdout.write(value.value + '\n')
  }
}

module.exports.printf = {
  name: 'printf',
  execute (interpreter, token) {
    const [ formatStr, params ] = popOperands(interpreter, [
      { name: 'formatStr', type: 'Str' },
      { name: 'params', type: 'Arr' }
    ], token)
    process.stdout.write(format(formatStr.value, params))
  }
}

module.exports.printfln = {
  name: 'printfln',
  execute (interpreter, token) {
    const [ formatStr, params ] = popOperands(interpreter, [
      { name: 'formatStr', type: 'Str' },
      { name: 'params', type: 'Arr' }
    ], token)
    process.stdout.write(`${format(formatStr.value, params)}\n`)
  }
}

module.exports.debugger = {
  name: 'debugger',
  execute () {
    // no-op to make programs from the Web IDE compatible
  }
}
