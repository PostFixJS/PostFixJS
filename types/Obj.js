class Obj {
  execute (interpreter) {
    interpreter._stack.push(this)
  }
}

module.exports = Obj
