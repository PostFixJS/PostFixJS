const Lexer = require('../../Lexer')
const Interpreter = require('../../Interpreter')

/**
 * Execute the given code and return the resulting stack and dictionary stack.
 * @param {string} code Code to execute
 * @returns {object} Object that contains the stack and dictStack
 */
function execute (code) {
  const interpreter = new Interpreter()
  interpreter.runToCompletion(Lexer.parse(code))
  return {
    stack: interpreter._stack,
    dictStack: interpreter._dictStack
  }
}

/**
 * Create a function that checks if the message of a given error matches a string.
 * @param {string} expectedMessage Expected error message
 * @returns {function} Function that checks if the message of the error object matches the expected message
 */
function checkErrorMessage (expectedMessage) {
  return (err) => {
    return err.message === expectedMessage
  }
}

module.exports = {
  checkErrorMessage,
  execute
}
