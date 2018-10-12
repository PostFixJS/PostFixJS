const Lexer = require('../../Lexer')
const Interpreter = require('../../Interpreter')

/**
 * Execute the given code and return the resulting stack and dictionary stack.
 * @param {string} code Code to execute
 * @param {object} t Test object from ava, required to make PostFix tests work with ava
 * @returns {object} Object that contains the stack and dictStack
 */
async function execute (code, t) {
  const interpreter = new Interpreter()
  let failed = false
  if (t) {
    interpreter.setTestReporter({
      report (passed, type, params, token) {
        if (!passed) {
          failed = true
          if (type === 'test=') {
            const [ actual, expected ] = params
            t.fail(`Line ${token.line + 1}: Test failed, expected value to equal ${expected.toString()} but got ${actual.toString()} in line ${token.line}`)
          } else if (type === 'test!=') {
            const [ actual, expected ] = params
            t.fail(`Line ${token.line + 1}: Test failed, expected value not to equal ${expected.toString()} but got ${actual.toString()} in line ${token.line}`)
          } else if (type === 'test~=') {
            const [ actual, expected, tolerance ] = params
            t.fail(`Line ${token.line + 1}: Test failed, expected value to equal ${expected.toString()} (within a tolerance of ±${tolerance.toString()}) but got ${actual.toString()} in line ${token.line}`)
          } else if (type === 'test!~=') {
            const [ actual, expected, tolerance ] = params
            t.fail(`Line ${token.line + 1}: Test failed, expected value not to equal ${expected.toString()} (within a tolerance of ±${tolerance.toString()}) but got ${actual.toString()} in line ${token.line}`)
          }
        }
      },
      showStats () { /* not needed for testing */ },
      reset () { /* not needed for testing */ }
    })
  }
  await interpreter.run(Lexer.parse(code)).promise
  if (t && !failed) {
    t.pass()
  }
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
async function executeTimeout (code, timeout = 1000) {
  const interpreter = new Interpreter()
  const { cancel, step } = interpreter.startRun(Lexer.parse(code))
  const timeoutId = setTimeout(cancel, timeout)
  let done = false
  while (!done) {
    done = (await step()).done
  }
  clearTimeout(timeoutId)
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

/**
 * Check if the given function throws.
 * @param {object} t Ava test object
 * @param {Function} fn Function that should throw
 * @param {Function} checkError Error message validator
 */
async function throwsErrorMessage (t, fn, checkError) {
  try {
    await fn()
    t.fail()
  } catch (e) {
    t.true(checkError(e))
  }
}

module.exports = {
  checkErrorMessage,
  execute,
  executeTimeout,
  throwsErrorMessage
}
