class Obj {
  execute (interpreter) {
    interpreter._stack.push(this)
  }

  getTypeName () {
    return `:${this.constructor.name}`
  }

  isAssignableTo (type) {
    return type === this.getTypeName()
  }
}

module.exports = Obj
