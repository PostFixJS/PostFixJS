module.exports.print = {
  name: 'print',
  execute (interpreter) {
    process.stdout.write(`${interpreter._stack.pop().value}`)
  }
}

module.exports.println = {
  name: 'println',
  execute (interpreter) {
    process.stdout.write(`${interpreter._stack.pop().value}\n`)
  }
}
