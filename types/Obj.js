class Obj {
  constructor () {
    this.refs = 0
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
   * Copy this Obj if there are references to it.
   * Otherwise, just return this object.
   */
  copy () {
    // return this._copyImpl()
    if (this.refs === 0) {
      return this
    } else {
      return this._copyImpl()
    }
  }
}

module.exports = Obj
