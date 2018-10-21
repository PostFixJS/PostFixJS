class DictStack {
  constructor () {
    this._dict = {}
    this._stack = [this._dict]
  }

  /**
   * Get the number of dictionaries on this dictionary stack.
   */
  get count () {
    return this._stack.length
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
    this._stack.push(dict)
    this._dict = dict
  }

  popDict () {
    this._stack.pop()
    this._dict = this._stack[this._stack.length - 1]
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
