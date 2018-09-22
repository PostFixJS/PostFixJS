class DictStack {
  constructor () {
    this._dict = {}
    this._stack = [this._dict]
  }

  put (key, value) {
    if (this._dict[key]) {
      this._dict[key].refs--
    }
    this._dict[key] = value
    value.refs++
  }

  get (key) {
    return this._dict[key]
  }

  pushDict (dict) {
    this._stack.push(this._dict)
    this._dict = dict
  }

  popDict () {
    this._dict = this._stack.pop()
  }

  copyDict () {
    for (const obj of Object.values(this._dict)) {
      obj.refs++
    }
    return Object.assign({}, this._dict)
  }

  clear () {
    this._dict = {}
    this._stack = [this._dict]
  }

  /**
   * Get the dictionary stack. The first element is the bottom-most dict.
   * @return {object[]} The dictionary stack
   */
  getDicts () {
    return this._stack
  }
}

module.exports = DictStack
