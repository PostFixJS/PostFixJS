const { isEqual, isApproxEqual } = require('./impl/compare')
const { popOperands } = require('../typeCheck')

module.exports.testEqual = {
  name: 'test=',
  execute (interpreter, token) {
    const [ actual, expected ] = popOperands(interpreter, [
      { name: 'actual' },
      { name: 'expected' }
    ], token)
    const reporter = interpreter.testReporter
    reporter.report(isEqual(actual, expected), 'test=', [actual, expected], token)
  }
}

module.exports.testNotEqual = {
  name: 'test!=',
  execute (interpreter, token) {
    const [ actual, expected ] = popOperands(interpreter, [
      { name: 'actual' },
      { name: 'notExpected' }
    ], token)
    const reporter = interpreter.testReporter
    reporter.report(!isEqual(actual, expected), 'test!=', [actual, expected], token)
  }
}

module.exports.testApproxEqual = {
  name: 'test~=',
  execute (interpreter, token) {
    const [ actual, expected, tolerance ] = popOperands(interpreter, [
      { name: 'actual' },
      { name: 'expected' },
      { name: 'tolerance', type: 'Num' }
    ], token)
    const reporter = interpreter.testReporter
    reporter.report(isApproxEqual(actual, expected, tolerance), 'test~=', [actual, expected, tolerance], token)
  }
}

module.exports.testNotApproxEqual = {
  name: 'test!~=',
  execute (interpreter, token) {
    const [ actual, expected, tolerance ] = popOperands(interpreter, [
      { name: 'actual' },
      { name: 'expected' },
      { name: 'tolerance', type: 'Num' }
    ], token)
    const reporter = interpreter.testReporter
    reporter.report(!isApproxEqual(actual, expected, tolerance), 'test!~=', [actual, expected, tolerance], token)
  }
}

module.exports.testStats = {
  name: 'test-stats',
  execute (interpreter) {
    interpreter.testReporter.showStats()
  }
}
