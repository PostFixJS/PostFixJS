class Obj {
  execute (interpreter) {
    interpreter._stack.push(this)
  }

  getTypeName () {
    return `:${this.constructor.name}`
  }  
}

module.exports = Obj
