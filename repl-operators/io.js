module.exports.println = {
  name: 'println',
  execute (interpreter) {
    console.log(interpreter._stack.pop().value)
  }
}
