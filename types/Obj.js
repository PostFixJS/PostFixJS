class Obj {
  constructor () {
    this.refs = 1
  }

  execute (interpreter) {
    interpreter._stack.push(this)
  }

  getTypeName () {
    return `:Obj`
  }

  isAssignableTo (type) {
    return type === ':Obj' || type === this.getTypeName()
  }

  /**
   * Copy this Obj if there are multiple references to it.
   * Otherwise, just return this object.
   */
  copy () {
    return this._copyImpl()

    // TODO
    // if (this.refs <= 1) {
    //   return this
    // } else {
    //   return this._copyImpl()
    // }
  }
}

module.exports = Obj
