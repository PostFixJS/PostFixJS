const Obj = require('./Obj')

/**
 * A PostFix error.
 */
class Err extends Obj {
  /**
   * Create a new error.
   * @param {string} message Error message
   * @param {Token} origin Token that caused the error
   */
  constructor (message, origin) {
    super()
    this.message = message
    this.origin = origin
  }

  getTypeName () {
    return ':Err'
  }

  toString () {
    if (this.origin) {
      return `Err(${this.origin.line + 1}:${this.origin.col + 1}, ${this.message})`
    } else {
      return `Err(${this.message})`
    }
  }
}

module.exports = Err
