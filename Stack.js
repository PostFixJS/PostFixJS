const InvalidStackAccessError = require('./InvalidStackAccessError')

/**
 * A stack.
 */
class Stack {
  constructor () {
    this._stack = []
    this._minStackHeight = []
    this._currentMinStackHeight = 0
  }

  /**
   * Push an object on the stack. This increases the reference counter.
   * @param {Obj} obj Object
   */
  push (obj) {
    obj.refs++
    this._stack.push(obj)
  }

  /**
   * Pop an object from the stack. This decreases the reference counter.
   * @returns {Obj} Topmost object from the stack
   * @throws {InvalidStackAccessError} If the stack is empty or if the next element can't be accessed by the current lambda function
   */
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

  /**
   * Get the i-th element from top from the stack, without removing it.
   * @param {number} i Index, from top, of the element to return
   * @returns {Obj} i-th element from top
   * @throws {InvalidStackAccessError} If i is out of range or if the element can't be accessed by the current lambda function
   */
  peek (i = 0) {
    const minStackHeight = this._currentMinStackHeight
    if (this._stack.length - i <= minStackHeight) {
      throw new InvalidStackAccessError()
    }
    return this._stack[this._stack.length - 1 - i]
  }

  /**
   * Clear the stack. This decreases all reference counters.
   */
  clear () {
    for (const obj of this._stack) {
      obj.refs--
    }
    this._stack = []
    this._minStackHeight = []
    this._currentMinStackHeight = 0
  }

  /**
   * Get the current stack size.
   */
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
   * @param height {number} Height limit to remove
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
   * @returns {Stack} A copy of this stack
   */
  copy () {
    const copy = new Stack()
    copy._stack = this._stack.slice()
    copy._minStackHeight = this._minStackHeight.slice()
    copy._currentMinStackHeight = this._currentMinStackHeight
    return copy
  }
}

module.exports = Stack
