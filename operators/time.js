const types = require('../types')

module.exports.time = {
  name: 'time',
  execute (interpreter) {
    interpreter._stack.push(new types.Int(Date.now()))
  }
}
