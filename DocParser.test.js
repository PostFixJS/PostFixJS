import test from 'ava'
import DocParser from './DocParser'

test('DocParser gets the signature of a function', (t) => {
  const functions = DocParser.getFunctions(`
#<
Calculate the factorial of the given number.
@param n Number
@return Factorial of n
>#
fac: (n :Int -> :Int) {
  { n n 1 - recur * } { 1 } n 1 > if
} fun
  `)

  t.deepEqual(functions, [{
    name: 'fac',
    description: 'Calculate the factorial of the given number.',
    params: [
      { name: 'n', type: ':Int', description: 'Number' }
    ],
    returns: [
      { type: ':Int', description: 'Factorial of n' }
    ]
  }])
})

test('DocParser gets the signature of an undocumented function', (t) => {
  const functions = DocParser.getFunctions(`
fac: (n :Int -> :Int) {
  { n n 1 - recur * } { 1 } n 1 > if
} fun
  `)

  t.deepEqual(functions, [{
    name: 'fac',
    description: undefined,
    params: [
      { name: 'n', type: ':Int', description: undefined }
    ],
    returns: [
      { type: ':Int', description: undefined }
    ]
  }])
})

test('DocParser supports missing function descriptions', (t) => {
  const functions = DocParser.getFunctions(`
#<
@param n Some number
>#
foo: (n :Int -> :Str) {} fun
  `)

  t.deepEqual(functions, [{
    name: 'foo',
    description: undefined,
    params: [
      { name: 'n', type: ':Int', description: 'Some number' }
    ],
    returns: [
      { type: ':Str', description: undefined }
    ]
  }])
})

test('DocParser supports missing @param tags', (t) => {
  const functions = DocParser.getFunctions(`
#<
A function that does things.
@return The resulting string
>#
foo: (n :Int -> :Str) {} fun
  `)

  t.deepEqual(functions, [{
    name: 'foo',
    description: 'A function that does things.',
    params: [
      { name: 'n', type: ':Int', description: undefined }
    ],
    returns: [
      { type: ':Str', description: 'The resulting string' }
    ]
  }])
})

test('DocParser supports incomplete @param tags', (t) => {
  const functions = DocParser.getFunctions(`
#<
A function that does things.
@param a
@param b
@return The resulting string
>#
foo: (a b -> :Str) {} fun
  `)

  t.deepEqual(functions, [{
    name: 'foo',
    description: 'A function that does things.',
    params: [
      { name: 'a', type: undefined, description: undefined },
      { name: 'b', type: undefined, description: undefined }
    ],
    returns: [
      { type: ':Str', description: 'The resulting string' }
    ]
  }])
})

test('DocParser supports missing @return tags', (t) => {
  const functions = DocParser.getFunctions(`
#<
A function that does things.
>#
foo: (-> :Str) {} fun
  `)

  t.deepEqual(functions, [{
    name: 'foo',
    description: 'A function that does things.',
    params: [],
    returns: [
      { type: ':Str', description: undefined }
    ]
  }])
})

test('DocParser supports functions that return nothing', (t) => {
  t.deepEqual(DocParser.getFunctions('noop: (->) {} fun'), [{
    name: 'noop',
    description: undefined,
    params: [],
    returns: []
  }])

  t.deepEqual(DocParser.getFunctions('noop: () {} fun'), [{
    name: 'noop',
    description: undefined,
    params: [],
    returns: []
  }])

  t.deepEqual(DocParser.getFunctions('pop: (top :Obj) {} fun'), [{
    name: 'pop',
    description: undefined,
    params: [{
      name: 'top',
      type: ':Obj',
      description: undefined
    }],
    returns: []
  }])
})

test('DocParser supports functions with multiple return values', (t) => {
  t.deepEqual(DocParser.getFunctions(`
#<
Get the first two elements of an array.
@param arr Array
@return First element
@return Second element
>#
firstTwo: (arr :Arr -> :Obj :Obj) {} fun
`), [{
    name: 'firstTwo',
    description: 'Get the first two elements of an array.',
    params: [
      { name: 'arr', type: ':Arr', description: 'Array' }
    ],
    returns: [
      { type: ':Obj', description: 'First element' },
      { type: ':Obj', description: 'Second element' }
    ]
  }])
})

test('DocParser does not crash on broken input', (t) => {
  t.notThrows(() => {
    DocParser.getFunctions(`
#<
test
>#`)
  }, 'should not throw if block comment is not followed by any token')

  t.notThrows(() => {
    DocParser.getFunctions(`
#<
Calculate the factorial of a number.
@param
>#
    `, 'should not throw on invalid @param tags')
  })
})

test('DocParser finds cond-fun declarations', (t) => {
  t.deepEqual(DocParser.getFunctions(`
#<
Get a number that depends on x.
@param x A number
@return Return value
>#
condFun: (x :Int -> :Num) {} cond-fun
`), [{
    name: 'condFun',
    description: 'Get a number that depends on x.',
    params: [
      { name: 'x', type: ':Int', description: 'A number' }
    ],
    returns: [
      { type: ':Num', description: 'Return value' }
    ]
  }])
})

test('DocParser finds variable declarations with long syntax', (t) => {
  t.deepEqual(DocParser.getVariables(`
#<
The answer to life, the universe and everything.
>#
answer: 42 !
  `), [{
    name: 'answer',
    description: 'The answer to life, the universe and everything.'
  }])
})

test('DocParser finds variable declarations with short syntax', (t) => {
  t.deepEqual(DocParser.getVariables(`
#<
The answer to life, the universe and everything.
>#
42 answer!
  `), [{
    name: 'answer',
    description: 'The answer to life, the universe and everything.'
  }])
})

test('DocParser finds variable declarations with short syntax if the value is a symbol', (t) => {
  // this is an edge case, because test: could also be the start of the long syntax
  t.deepEqual(DocParser.getVariables(`
test: var!
  `), [{
    name: 'var',
    description: undefined
  }])
})

test('DocParser only finds the first declaration of a variable', (t) => {
  t.deepEqual(DocParser.getVariables(`
#< Test variable >#
42 test!

#< Re-declare the variable >#
21 test!
  `), [{
    name: 'test',
    description: 'Test variable'
  }])
})

test('DocParser finds datadef struct declarations', (t) => {
  t.deepEqual(DocParser.getDatadefs(`
#< A 2d point. >#
:Point (
  #< Position on the x-axis >#
  x :Num,

  #< Position on the y-axis >#
  y :Num
) datadef
  `), [{
    name: 'Point',
    description: 'A 2d point.',
    type: 'struct',
    fields: [{
      name: 'x',
      type: ':Num',
      description: 'Position on the x-axis'
    }, {
      name: 'y',
      type: ':Num',
      description: 'Position on the y-axis'
    }]
  }])
})
