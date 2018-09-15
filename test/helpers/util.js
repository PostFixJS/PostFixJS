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
 * Execute the given code and return the resulting stack and dictionary stack.
 * This is useful to test things that may result in an infinite loop.
 * @param {string} code Code to execute
 * @param {number} timeout Execution timeout, in milliseconds
 * @returns {object} Promise of an object that contains the stack and dictStack
 */
function executeTimeout (code, timeout = 1000) {
  let cancel = false
  const timeoutTimer = setTimeout(() => {
    cancel = true
  }, timeout)
  const done = new Promise((resolve, reject) => {
    setImmediate(() => {
      const interpreter = new Interpreter()
      const stepper = interpreter.startRun(Lexer.parse(code))
      const continueExecution = () => {
        const { done } = stepper.next()
        if (done) {
          clearTimeout(timeoutTimer)
          resolve(interpreter)
        } else if (cancel) {
          clearTimeout(timeoutTimer)
          reject(new Error(`Execution timed out after ${timeout} ms`))
        } else {
          setImmediate(continueExecution)
        }
      }
      continueExecution()
    })
  })
  return done.then((interpreter) => ({
    stack: interpreter._stack,
    dictStack: interpreter._dictStack
  }))
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
  execute,
  executeTimeout
}
