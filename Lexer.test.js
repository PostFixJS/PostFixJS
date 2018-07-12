import test from 'ava'
import Lexer from './Lexer'

const tokenize = (code) => {
  const lexer = new Lexer()
  lexer.put(code)
  return Array.from(lexer.getTokens())
}

test('The lexer tokenizes PostFix code', t => {
  const tokens = tokenize('2 21 multiply')
  t.deepEqual(tokens[0], {
    token: '2',
    line: 0,
    col: 0
  })
})

test('The lexer gets the line after multiline comments right', t => {
  const tokens = tokenize(`
#<
This multi-line comment should be ignored
>#
test`)
  t.deepEqual(tokens, [{
    token: 'test',
    line: 4,
    col: 0
  }])
})

test('The lexer handles escaped quotes properly', t => {
  const tokens = tokenize('"hello \\"world\\""')
  t.deepEqual(tokens, [{
    token: '"hello \\"world\\""',
    col: 0,
    line: 0
  }])
})
