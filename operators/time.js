const types = require('../types')
const createCancellationToken = require('../util/cancellationToken')

module.exports.time = {
  name: 'time',
  execute (interpreter) {
    interpreter._stack.push(new types.Int(Date.now()))
  }
}

module.exports.sleep = {
  name: 'sleep',
  * execute (interpreter) {
    // TODO type check
    const duration = interpreter._stack.pop().value

    const { token, cancel } = createCancellationToken()
    yield {
      cancel,
      promise: new Promise((resolve) => {
        const timeoutId = setTimeout(() => resolve, duration)
        token.onCancel(() => clearTimeout(timeoutId))
      })
    }
  }
}
