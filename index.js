const Lexer = require('./Lexer')
const Interpreter = require('./Interpreter')

const lexer = new Lexer()
const interpreter = new Interpreter()

process.stdin.resume()
process.stdin.on('data', (buf) => lexer.put(buf.toString()))
process.stdin.on('end', () => {
  for (const token of lexer.getTokens()) {
    // console.log(token)
    interpreter.execute(token)
  }
  console.log(interpreter._stack._stack.map(({ value }) => value).join(', '))
})
