const read = require('read')
const Lexer = require('./Lexer')
const Interpreter = require('./Interpreter')

const lexer = new Lexer()
const interpreter = new Interpreter()
interpreter.registerBuiltIns(require('./repl-operators/io'))
interpreter.setTestReporter(require('./repl-operators/testReporter'))

if (process.argv[process.argv.length - 1] === '--') {
  process.stdin.resume()
  process.stdin.on('data', (buf) => lexer.put(buf.toString()))
  process.stdin.on('end', async () => {
    try {
      await interpreter.run(lexer.getTokens()).promise
    } catch (e) {
      console.error(e.toString())
    }
    console.log(interpreter._stack._stack.map(obj => obj.toString()).join(', '))
  })
} else {
  repl()
}

async function repl () {
  while (true) {
    try {
      const input = await new Promise((resolve, reject) => {
        read({ prompt: '>' }, (err, input) => {
          if (err) {
            reject(err)
          } else {
            resolve(input)
          }
        })
      })
      lexer.put(input + '\n')
      try {
        await interpreter.run(lexer.getTokens()).promise
      } catch (e) {
        console.error(e.toString())
      }
      console.log(interpreter._stack._stack.map(obj => obj.toString()).join(', '))
    } catch (e) {
      console.log('')
      return
    }
  }
}
