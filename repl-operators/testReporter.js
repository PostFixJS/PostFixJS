let passed = 0
let failed = 0

function reportPassed (type, params, token) {
  passed++
  console.log(`Line ${token.line + 1}: Test passed`)
}

function reportFailed (type, params, token) {
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

function report (passed, type, params, token) {
  if (passed) {
    reportPassed(type, params, token)
  } else {
    reportFailed(type, params, token)
  }
}

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
  }
}

function reset () {
  passed = 0
  failed = 0
}

module.exports = {
  reportPassed,
  reportFailed,
  report,
  showStats,
  reset
}
