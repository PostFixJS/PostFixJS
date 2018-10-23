const InvalidStackAccessError = require('./InvalidStackAccessError')

class Stack {
  constructor () {
    this._stack = []
    this._minStackHeight = []
    this._currentMinStackHeight = 0
  }

  push (obj) {
    obj.refs++
    this._stack.push(obj)
  }

  pop () {
    if (this._stack.length <= this._currentMinStackHeight) {
      throw new InvalidStackAccessError()
    }
    const top = this._stack.pop()
    top.refs--
    return top
  }

  /**
   * Pop from the stack until the given function returns `true` for the popped element and return all elements.
   * @param {function} condition Condition function
   * @returns Popped elements, in the order they were popped
   */
  popUntil (condition) {
    const values = []
    let value
    do {
      value = this.pop()
      values.push(value)
    } while (!condition(value))
    return values.reverse()
  }

  peek (i = 0) {
    const minStackHeight = this._currentMinStackHeight
    if (this._stack.length - i <= minStackHeight) {
      throw new InvalidStackAccessError()
    }
    return this._stack[this._stack.length - 1 - i]
  }

  clear () {
    for (const obj of this._stack) {
      obj.refs--
    }
    this._stack = []
    this._minStackHeight = []
    this._currentMinStackHeight = 0
  }

  get count () {
    return this._stack.length
  }

  /**
   * The number of items on the stack that the program can modify.
   * Inside of lambda functions, this may be smaller than the stack count.
   */
  get accessibleCount () {
    return this.count - this._currentMinStackHeight
  }

  /**
   * Get the stack. The first element is the bottom-most element.
   * @returns {Obj[]} The stack
   */
  getElements () {
    return this._stack
  }

  /**
   * Throw if the stack height gets below the current height.
   * @returns The current stack height
   */
  forbidPop () {
    this._minStackHeight.push(this.count)
    this._currentMinStackHeight = this.count
    return this.count
  }

  /**
   * Don't throw if the stack height gets below the given height.
   * This reverts forbidPop.
   */
  allowPop (height) {
    const i = this._minStackHeight.lastIndexOf(height)
    if (i >= 0) {
      this._minStackHeight.splice(i, 1)
      this._currentMinStackHeight = this._minStackHeight[this._minStackHeight.length - 1] || 0
    }
  }

  /**
   * Create a copy of this stack.
   */
  copy () {
    const copy = new Stack()
    copy._stack = this._stack.slice()
    copy._minStackHeight = this._minStackHeight.slice()
    copy._currentMinStackHeight = this._currentMinStackHeight
  }
}

module.exports = Stack
