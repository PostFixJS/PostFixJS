const Lexer = require('../../Lexer')
const Interpreter = require('../../Interpreter')

function execute (code) {
  const interpreter = new Interpreter()
  const lexer = new Lexer()
  lexer.put(code)
  interpreter.runToCompletion(lexer.getTokens())
  return interpreter
}

module.exports = {
  execute
}
