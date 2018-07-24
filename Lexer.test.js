import test from 'ava'
import Lexer from './Lexer'

test('The lexer Lexer.parses PostFix code', t => {
  const tokens = Lexer.parse('2 21 multiply')
  t.deepEqual(tokens[0], {
    token: '2',
    tokenType: 'INTEGER',
    line: 0,
    col: 0
  })
})

test('The lexer handles comments', t => {
  let tokens = Lexer.parse('# this is a comment')
  t.is(tokens.length, 0)

  tokens = Lexer.parse('42 # this is a comment')
  t.deepEqual(tokens, [{
    token: '42',
    tokenType: 'INTEGER',
    line: 0,
    col: 0
  }])
})

test('The lexer gets the line after multiline comments right', t => {
  const tokens = Lexer.parse(`
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
  const tokens = Lexer.parse('object .property')
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
  const tokens = Lexer.parse('"hello \\"world\\""')
  t.deepEqual(tokens, [{
    token: '"hello \\"world\\""',
    tokenType: 'STRING',
    col: 0,
    line: 0
  }])
})

test('Brackets are self-delimiting tokens', t => {
  t.deepEqual(Lexer.parse('[42]'), [{
    token: '[',
    tokenType: 'ARR_START',
    col: 0,
    line: 0
  }, {
    token: '42',
    tokenType: 'INTEGER',
    col: 1,
    line: 0
  }, {
    token: ']',
    tokenType: 'ARR_END',
    col: 3,
    line: 0
  }])

  t.deepEqual(Lexer.parse('( 42)'), [{
    token: '(',
    tokenType: 'PARAM_LIST_START',
    col: 0,
    line: 0
  }, {
    token: '42',
    tokenType: 'INTEGER',
    col: 2,
    line: 0
  }, {
    token: ')',
    tokenType: 'PARAM_LIST_END',
    col: 4,
    line: 0
  }])

  t.deepEqual(Lexer.parse('{42 }'), [{
    token: '{',
    tokenType: 'EXEARR_START',
    col: 0,
    line: 0
  }, {
    token: '42',
    tokenType: 'INTEGER',
    col: 1,
    line: 0
  }, {
    token: '}',
    tokenType: 'EXEARR_END',
    col: 4,
    line: 0
  }])
})

test('The lexer parses scientific notation', (t) => {
  t.deepEqual(Lexer.parse('7e-8'), [{
    token: '7e-8',
    tokenType: 'FLOAT',
    col: 0,
    line: 0
  }])

  t.deepEqual(Lexer.parse('7e+8'), [{
    token: '7e+8',
    tokenType: 'INTEGER',
    col: 0,
    line: 0
  }])

  t.deepEqual(Lexer.parse('7e8'), [{
    token: '7e8',
    tokenType: 'INTEGER',
    col: 0,
    line: 0
  }])
})
