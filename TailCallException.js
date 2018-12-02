/**
 * Exception that is thrown to handle tail calls.
 */
class TailCallException {
  /**
   * Create a new tail call exception.
   * @param {Obj} call Lambda function to be called
   */
  constructor (call) {
    this.call = call
  }
}

module.exports = TailCallException
