class Obj {
  execute (interpreter) {
    interpreter._stack.push(this)
  }

  getTypeName () {
    return `:Obj`
  }

  isAssignableTo (type) {
    return type === ':Obj' || type === this.getTypeName()
  }
}

module.exports = Obj
