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
    // TODO this won't work once there are Obj classes that change state during execution
    const obj = interpreter._stack.pop()
    interpreter._stack.push(obj)
    interpreter._stack.push(obj)
  }
}

module.exports.copy = {
  name: 'copy',
  execute (interpreter) {
    // TODO this won't work once there are Obj classes that change state during execution
    const i = interpreter._stack.popNumber()
    interpreter._stack.push(interpreter._stack.peek(i))
  }
}

module.exports.clear = {
  name: 'clear',
  execute (interpreter) {
    interpreter._stack.clear()
  }
}
