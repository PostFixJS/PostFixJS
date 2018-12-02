/**
 * Error that is thrown to break out of loops with the break or breakif operator.
 */
class BreakError extends Error {
  /**
   * Create a new break error.
   * @param {Obj} operator Operator that caused the break
   */
  constructor (operator) {
    super(operator)
    this.operator = operator
  }
}

module.exports = BreakError
