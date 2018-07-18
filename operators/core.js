const types = require('../types')

module.exports.err = {
    name: 'err',
    execute: (interpreter, token) => {
        interpreter._stack.push(new types.Err(interpreter._stack.pop().value, token))
    }
}

module.exports.exec = {
    name: 'exec',
    execute: (interpreter) => {
        interpreter._stack.pop().execute(interpreter)
    }
}
