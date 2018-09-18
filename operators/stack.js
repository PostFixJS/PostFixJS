const types = require('../types')
const { popOperand } = require('../typeCheck')

module.exports.swap = {
  name: 'swap',
  execute (interpreter) {
    const a = interpreter._stack.pop()
    const b = interpreter._stack.pop()
    interpreter._stack.push(a)
    interpreter._stack.push(b)
  }
}

module.exports.pop = {
  name: 'pop',
  execute (interpreter) {
    interpreter._stack.pop()
  }
}

module.exports.dup = {
  name: 'dup',
  execute (interpreter) {
    const obj = interpreter._stack.pop()
    interpreter._stack.push(obj)
    interpreter._stack.push(obj)
  }
}

module.exports.copy = {
  name: 'copy',
  execute (interpreter, token) {
    const i = popOperand(interpreter, { type: 'Int' }, token)
    interpreter._stack.push(interpreter._stack.peek(i))
  }
}

module.exports.clear = {
  name: 'clear',
  execute (interpreter) {
    interpreter._stack.clear()
  }
}

module.exports.stackCount = {
  name: 'stack-count',
  execute (interpreter) {
    interpreter._stack.push(new types.Int(interpreter._stack.accessibleCount))
  }
}
