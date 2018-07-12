const Lexer = require('./Lexer')

const lexer = new Lexer()
process.stdin.resume()
process.stdin.on('data', (buf) => lexer.put(buf.toString()))
process.stdin.on('end', () => {
  for (const token of lexer.getTokens()) {
    console.log(token)
  }
})
