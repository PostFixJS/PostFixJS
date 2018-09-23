const types = require('../types')
const createCancellationToken = require('../util/cancellationToken')
const { popOperand } = require('../typeCheck')

module.exports.time = {
  name: 'time',
  execute (interpreter) {
    interpreter._stack.push(new types.Int(Date.now()))
  }
}

module.exports.sleep = {
  name: 'sleep',
  * execute (interpreter, token) {
    const duration = popOperand(interpreter, { type: 'Int' }, token)

    const { token: cancelToken, cancel } = createCancellationToken()
    yield {
      cancel,
      promise: new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, duration)
        cancelToken.onCancel(() => clearTimeout(timeoutId))
      })
    }
  }
}
