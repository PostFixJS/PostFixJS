import test from 'ava'
import Lexer from './Lexer'

test('The lexer Lexer.parses PostFix code', t => {
  const tokens = Lexer.parse('2 21 multiply')
  t.deepEqual(tokens[0], {
    token: '2',
    tokenType: 'INTEGER',
    line: 0,
    col: 0,
    endLine: 0,
    endCol: 1
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
    col: 0,
    endLine: 0,
    endCol: 2
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
    col: 0,
    endLine: 4,
    endCol: 4
  }])
})

test('The lexer handles nested multiline comments correctly', t => {
  const tokens = Lexer.parse(`
  #< comment
  with multiple lines #< nested
  multiline comment >#
  # nested single line comment
  ># test`)
  t.deepEqual(tokens, [{
    token: 'test',
    tokenType: 'REFERENCE',
    line: 5,
    col: 5,
    endLine: 5,
    endCol: 9
  }])
})

test('The lexer inserts a get token when using the . operator', t => {
  const tokens = Lexer.parse('object .property')
  t.deepEqual(tokens, [{
    token: 'object',
    tokenType: 'REFERENCE',
    line: 0,
    col: 0,
    endLine: 0,
    endCol: 6
  }, {
    token: 'property',
    tokenType: 'REFERENCE',
    line: 0,
    col: 8,
    endLine: 0,
    endCol: 16
  }, {
    token: 'get',
    tokenType: 'REFERENCE',
    line: 0,
    col: 7,
    endLine: 0,
    endCol: 8,
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
    line: 0,
    endCol: 17,
    endLine: 0
  }])
})

test('Brackets are self-delimiting tokens', t => {
  t.deepEqual(Lexer.parse('[42]'), [{
    token: '[',
    tokenType: 'ARR_START',
    col: 0,
    line: 0,
    endCol: 1,
    endLine: 0
  }, {
    token: '42',
    tokenType: 'INTEGER',
    col: 1,
    line: 0,
    endCol: 3,
    endLine: 0
  }, {
    token: ']',
    tokenType: 'ARR_END',
    col: 3,
    line: 0,
    endCol: 4,
    endLine: 0
  }])

  t.deepEqual(Lexer.parse('( 42)'), [{
    token: '(',
    tokenType: 'PARAM_LIST_START',
    col: 0,
    line: 0,
    endCol: 1,
    endLine: 0
  }, {
    token: '42',
    tokenType: 'INTEGER',
    col: 2,
    line: 0,
    endCol: 4,
    endLine: 0
  }, {
    token: ')',
    tokenType: 'PARAM_LIST_END',
    col: 4,
    line: 0,
    endCol: 5,
    endLine: 0
  }])

  t.deepEqual(Lexer.parse('{42 }'), [{
    token: '{',
    tokenType: 'EXEARR_START',
    col: 0,
    line: 0,
    endCol: 1,
    endLine: 0
  }, {
    token: '42',
    tokenType: 'INTEGER',
    col: 1,
    line: 0,
    endCol: 3,
    endLine: 0
  }, {
    token: '}',
    tokenType: 'EXEARR_END',
    col: 4,
    line: 0,
    endCol: 5,
    endLine: 0
  }])
})

test('The lexer parses scientific notation', async (t) => {
  t.deepEqual(Lexer.parse('7e-8'), [{
    token: '7e-8',
    tokenType: 'FLOAT',
    col: 0,
    line: 0,
    endCol: 4,
    endLine: 0
  }])

  t.deepEqual(Lexer.parse('7e+8'), [{
    token: '7e+8',
    tokenType: 'INTEGER',
    col: 0,
    line: 0,
    endCol: 4,
    endLine: 0
  }])

  t.deepEqual(Lexer.parse('7e8'), [{
    token: '7e8',
    tokenType: 'INTEGER',
    col: 0,
    line: 0,
    endCol: 3,
    endLine: 0
  }])
})

test('The lexer emits tokens for line comments when emitComments is true', async (t) => {
  t.deepEqual(Lexer.parse('42 # answer to all questions', { emitComments: true }), [{
    token: '42',
    tokenType: 'INTEGER',
    col: 0,
    line: 0,
    endCol: 2,
    endLine: 0
  }, {
    token: '# answer to all questions',
    tokenType: 'LINE_COMMENT',
    col: 3,
    line: 0,
    endCol: 28,
    endLine: 0
  }])
})

test('The lexer emits tokens for block comments when emitComments is true', async (t) => {
  t.deepEqual(Lexer.parse('42 #< this is a\nmulti-line\n#< nested >#\nblock comment >#', { emitComments: true }), [{
    token: '42',
    tokenType: 'INTEGER',
    col: 0,
    line: 0,
    endCol: 2,
    endLine: 0
  }, {
    token: '#< this is a\nmulti-line\n#< nested >#\nblock comment >#',
    tokenType: 'BLOCK_COMMENT',
    col: 3,
    line: 0,
    endCol: 16,
    endLine: 3
  }])
})

test('The lexer emitted block comment tokens end where the comment ends', async (t) => {
  t.deepEqual(Lexer.parse('\n #< test ># \n', { emitComments: true })[0], {
    token: '#< test >#',
    tokenType: 'BLOCK_COMMENT',
    col: 1,
    line: 1,
    endCol: 11,
    endLine: 1
  })
})

test('The lexer parses nil properly', async (t) => {
  t.deepEqual(Lexer.parse('nil')[0], {
    token: 'nil',
    tokenType: 'NIL',
    col: 0,
    line: 0,
    endCol: 3,
    endLine: 0
  })
})

test('The lexer trims Windows line breaks', async (t) => {
  t.deepEqual(Lexer.parse('1 2 +\r\ntest'), [{
    token: '1',
    tokenType: 'INTEGER',
    col: 0,
    line: 0,
    endCol: 1,
    endLine: 0
  }, {
    token: '2',
    tokenType: 'INTEGER',
    col: 2,
    line: 0,
    endCol: 3,
    endLine: 0
  }, {
    token: '+',
    tokenType: 'REFERENCE',
    col: 4,
    line: 0,
    endCol: 5,
    endLine: 0
  }, {
    token: 'test',
    tokenType: 'REFERENCE',
    col: 0,
    line: 1,
    endCol: 4,
    endLine: 1
  }])
})
