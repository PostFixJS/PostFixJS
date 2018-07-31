const Lexer = require('./Lexer')
const Interpreter = require('./Interpreter')

const lexer = new Lexer()
const interpreter = new Interpreter()
interpreter.registerBuiltIns(require('./repl-operators/io'))

if (process.argv[process.argv.length - 1] === '--') {
  process.stdin.resume()
  process.stdin.on('data', (buf) => lexer.put(buf.toString()))
  process.stdin.on('end', () => {
    try {
      for (const token of lexer.getTokens()) {
        interpreter.execute(token)
      }
    } catch (e) {
      console.error(e.toString())
    }
    console.log(interpreter._stack._stack.map(obj => obj.toString()).join(', '))
  })
} else {
  const read = require("read")
  function repl () {
    read({ prompt: '>' }, (err, input) => {
      if (!err) {
        lexer.put(input + '\n')
        try {
          interpreter.runToCompletion(lexer.getTokens())
        } catch (e) {
          console.error(e.toString())
        }
        console.log(interpreter._stack._stack.map(obj => obj.toString()).join(', '))
        repl()
      } else {
        console.log('')
      }
    })
  }
  repl()
}
