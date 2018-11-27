let passed = 0
let failed = 0

/**
 * Report a test result. This increments that statistics counter and prints to the console.
 * @param {bool} passed Whether or not the test passed
 * @param {string} type Test type
 * @param {Array} params Test parameters (actual value, expected value, optional tolerance)
 * @param {Token} token Token of the test function
 */
function report (passed, type, params, token) {
  if (passed) {
    passed++
    console.log(`Line ${token.line + 1}: Test passed`)
  } else {
    failed++
    process.exitCode = -1
  
    if (type === 'test=') {
      const [ actual, expected ] = params
      console.log(`Line ${token.line + 1}: Test failed, expected value to equal ${expected.toString()} but got ${actual.toString()}`)
    } else if (type === 'test!=') {
      const [ actual, expected ] = params
      console.log(`Line ${token.line + 1}: Test failed, expected value not to equal ${expected.toString()} but got ${actual.toString()}`)
    } else if (type === 'test~=') {
      const [ actual, expected, tolerance ] = params
      console.log(`Line ${token.line + 1}: Test failed, expected value to equal ${expected.toString()} (within a tolerance of ±${tolerance.toString()}) but got ${actual.toString()}`)
    } else if (type === 'test!~=') {
      const [ actual, expected, tolerance ] = params
      console.log(`Line ${token.line + 1}: Test failed, expected value not to equal ${expected.toString()} (within a tolerance of ±${tolerance.toString()}) but got ${actual.toString()}`)
    }
  }
}

/**
 * Print the number of passed and failed tests to the console and reset the counters.
 */
function showStats () {
  const tests = passed + failed
  if (tests > 0) {
    if (failed === 0) {
      if (passed === 1) {
        console.log('The test passed')
      } else {
        console.log(`All ${tests} tests passed`)
      }
    } else {
      if (tests === 1) {
        console.log(`The test failed`)
      } else {
        console.log(`${failed} of ${tests} tests failed`)
      }
    }
    reset()
  }
}

/**
 * Reset the passed and failed test counters.
 */
function reset () {
  passed = 0
  failed = 0
}

module.exports = {
  report,
  showStats,
  reset
}
