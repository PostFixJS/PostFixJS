/**
 * Dictionary stack used by the interpreter to store dictionaries.
 * There is always one dictionary active at a time. A new dictionary is added
 * when a lambda function (Lam) is being executed.
 */
class DictStack {
  /**
   * Create a new, empty dictionary stack.
   */
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

  /**
   * Put a value into the active dictionary, overwrite an existing value.
   * @param {string} key Name of the dictionary entry
   * @param {Obj} value Value
   */
  put (key, value) {
    if (this._dict[key]) {
      this._dict[key].refs--
    }
    this._dict[key] = value
    value.refs++
  }

  /**
   * Get a value from the active dictionary.
   * @param {string} key Name of the dictionary entry
   * @returns {Obj} Dictionary entry or null if not found
   */
  get (key) {
    return this._dict[key]
  }

  /**
   * Push a dictionary on the dictionary stack and use it as active dictionary.
   * @param {object} dict Dictionary object
   */
  pushDict (dict) {
    this._stack.push(dict)
    this._dict = dict
  }

  /**
   * Pop the topmost dictionary from the dictionary stack and use the next one as active dictionary.
   */
  popDict () {
    this._stack.pop()
    this._dict = this._stack[this._stack.length - 1]
  }

  /**
   * Copy the active dictionary and return it.
   * @returns {object} Copy of the dictionary object
   */
  copyDict () {
    for (const obj of Object.values(this._dict)) {
      obj.refs++
    }
    return Object.assign({}, this._dict)
  }

  /**
   * Clear the dictionary stack and create a new empty active dictionary.
   */
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
