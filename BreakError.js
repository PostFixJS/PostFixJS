/**
 * Error that is thrown to break out of loops with the break or breakif operator.
 */
class BreakError extends Error {
  constructor (operator) {
    super(operator)
    this.operator = operator
  }
}

module.exports = BreakError
