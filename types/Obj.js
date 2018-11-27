class Obj {
  constructor () {
    this.refs = 0
  }

  /**
   * Execute this object, i.e. put it on the stack. Some types have a different behavior.
   * @param {Obj} interpreter PostFix interpreter instance
   */
  execute (interpreter) {
    interpreter._stack.push(this)
  }

  /**
   * Get the type name of this object.
   * @returns {string} The type name of this object, e.g. :Obj
   */
  getTypeName () {
    return `:Obj`
  }

  /**
   * Check if this type can be assigned to the given type.
   * @param {string} type Another type name
   * @returns {boolean} True if this type can be assigned to the given type, false otherwise
   */
  isAssignableTo (type) {
    return type === ':Obj' || type === this.getTypeName()
  }

  /**
   * Copy this Obj if there are references to it.
   * Otherwise, just return this object.
   */
  copy () {
    if (this.refs === 0) {
      return this
    } else {
      return this._copyImpl()
    }
  }

  /**
   * Create a copy of this object.
   * @returns A copy of this object
   */
  _copyImpl () {
    // this is implemented by child classes
  }
}

module.exports = Obj
