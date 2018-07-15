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
    tokenType: 'INTEGER',
    line: 0,
    col: 0
  })
})

test('The lexer handles comments', t => {
  let tokens = tokenize('# this is a comment')
  t.is(tokens.length, 0)

  tokens = tokenize('42 # this is a comment')
  t.deepEqual(tokens, [{
    token: '42',
    tokenType: 'INTEGER',
    line: 0,
    col: 0
  }])
})

test('The lexer gets the line after multiline comments right', t => {
  const tokens = tokenize(`
#<
This multi-line comment should be ignored
>#
test`)
  t.deepEqual(tokens, [{
    token: 'test',
    tokenType: 'REFERENCE',
    line: 4,
    col: 0
  }])
})

test('The lexer inserts a get token when using the . operator', t => {
  const tokens = tokenize('object .property')
  t.deepEqual(tokens, [{
    token: 'object',
    tokenType: 'REFERENCE',
    line: 0,
    col: 0
  }, {
    token: 'property',
    tokenType: 'REFERENCE',
    line: 0,
    col: 8
  }, {
    token: 'get',
    tokenType: 'REFERENCE',
    line: 0,
    col: 7,
    generated: true,
    generatedReason: 'DOT_SUGAR'
  }])
})

test('The lexer handles escaped quotes properly', t => {
  const tokens = tokenize('"hello \\"world\\""')
  t.deepEqual(tokens, [{
    token: '"hello \\"world\\""',
    tokenType: 'STRING',
    col: 0,
    line: 0
  }])
})
