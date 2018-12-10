import test from 'ava'
import DocParser from './DocParser'

test('DocParser gets the signature of a function', async (t) => {
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
    ],
    tags: {}
  }])
})

test('DocParser gets the signature of an undocumented function', async (t) => {
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
    ],
    tags: undefined
  }])
})

test('DocParser supports missing function descriptions', async (t) => {
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
    ],
    tags: {}
  }])
})

test('DocParser supports missing @param tags', async (t) => {
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
    ],
    tags: {}
  }])
})

test('DocParser supports incomplete @param tags', async (t) => {
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
    ],
    tags: {}
  }])
})

test('DocParser supports missing @return tags', async (t) => {
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
    ],
    tags: {}
  }])
})

test('DocParser supports functions that return nothing', async (t) => {
  t.deepEqual(DocParser.getFunctions('noop: (->) {} fun'), [{
    name: 'noop',
    description: undefined,
    params: [],
    returns: [],
    tags: undefined
  }])

  t.deepEqual(DocParser.getFunctions('noop: () {} fun'), [{
    name: 'noop',
    description: undefined,
    params: [],
    returns: [],
    tags: undefined
  }])

  t.deepEqual(DocParser.getFunctions('pop: (top :Obj) {} fun'), [{
    name: 'pop',
    description: undefined,
    params: [{
      name: 'top',
      type: ':Obj',
      description: undefined
    }],
    returns: [],
    tags: undefined
  }])
})

test('DocParser supports functions with multiple return values', async (t) => {
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
    ],
    tags: {}
  }])
})

test('DocParser supports functions without params', async (t) => {
  t.deepEqual(DocParser.getFunctions(`test: {} fun`), [{
    name: 'test',
    description: undefined,
    params: [],
    returns: [],
    tags: undefined
  }])
})

test('DocParser finds examples for functions', async (t) => {
  t.deepEqual(DocParser.getFunctions(`
#<
A demo function.
@example "foo bar" demo # does something

@example
# a multiline example
42 {
  demo
} fori

@return A value
>#
demo: ( -> :Obj) {} fun
  `), [{
    name: 'demo',
    description: 'A demo function.',
    params: [],
    returns: [{
      type: ':Obj',
      description: 'A value'
    }],
    tags: {
      example: [ // note how surrounding empty lines are trimmed
        '"foo bar" demo # does something',
        '# a multiline example\n42 {\n  demo\n} fori'
      ]
    }
  }])
})

test('DocParser does not crash on broken input', async (t) => {
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
    `)
  }, 'should not throw on invalid @param tags')

  t.notThrows(() => DocParser.getVariables('#< >#'),
    'should not throw on comments that are not followed by a token'
  )
})

test('DocParser finds cond-fun declarations', async (t) => {
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
    ],
    tags: {}
  }])
})

test('DocParser finds variable declarations with long syntax', async (t) => {
  t.deepEqual(DocParser.getVariables(`
#<
The answer to life, the universe and everything.
>#
answer: 42 !
  `), [{
    name: 'answer',
    description: 'The answer to life, the universe and everything.',
    tags: {}
  }])
})

test('DocParser finds variable declarations with short syntax', async (t) => {
  t.deepEqual(DocParser.getVariables(`
#<
The answer to life, the universe and everything.
>#
42 answer!
  `), [{
    name: 'answer',
    description: 'The answer to life, the universe and everything.',
    tags: {}
  }])
})

test('DocParser finds variable declarations with short syntax if the value is a symbol', async (t) => {
  // this is an edge case, because test: could also be the start of the long syntax
  t.deepEqual(DocParser.getVariables(`
test: var!
  `), [{
    name: 'var',
    description: undefined,
    tags: undefined
  }])
})

test('DocParser only finds the first declaration of a variable', async (t) => {
  t.deepEqual(DocParser.getVariables(`
#< Test variable >#
42 test!

#< Re-declare the variable >#
21 test!
  `), [{
    name: 'test',
    description: 'Test variable',
    tags: {}
  }])
})

test('DocParser finds two successive variable definitions', async (t) => {
  t.deepEqual(DocParser.getVariables('21 a! 42 b!'), [{
    name: 'a',
    description: undefined,
    tags: undefined
  }, {
    name: 'b',
    description: undefined,
    tags: undefined
  }])
})

test('DocParser finds datadef struct declarations', async (t) => {
  t.deepEqual(DocParser.getDatadefs(`
#< A 2d point. >#
:Point (
  #< Position on the x-axis >#
  x :Num,

  #< Position on the y-axis >#
  y :Num
) datadef
  `), [{
    name: ':Point',
    description: 'A 2d point.',
    type: 'struct',
    tags: {},
    fields: [{
      name: 'x',
      type: ':Num',
      description: 'Position on the x-axis',
      tags: {}
    }, {
      name: 'y',
      type: ':Num',
      description: 'Position on the y-axis',
      tags: {}
    }]
  }])
})

test('DocParser finds datadef union type declarations', async (t) => {
  t.deepEqual(DocParser.getDatadefs(`
#< A 2d point. >#
Point: [
  #< An euclidian point. >#
  Euclid: (
    #< Position on the x-axis >#
    x :Num,
    
    #< Position on the y-axis >#
    y :Num
  )

  #< A point in polar coordinates. >#
  Polar: (
    #< The angular coordinate >#
    theta :Num,
    
    #< The radial coordinate >#
    magnitude :Num
  )
] datadef
  `), [{
    name: ':Point',
    description: 'A 2d point.',
    type: 'union',
    tags: {},
    types: [':Euclid', ':Polar']
  }, {
    name: ':Euclid',
    description: 'An euclidian point.',
    type: 'struct',
    tags: {},
    fields: [{
      name: 'x',
      type: ':Num',
      tags: {},
      description: 'Position on the x-axis'
    }, {
      name: 'y',
      type: ':Num',
      tags: {},
      description: 'Position on the y-axis'
    }]
  }, {
    name: ':Polar',
    description: 'A point in polar coordinates.',
    type: 'struct',
    tags: {},
    fields: [{
      name: 'theta',
      type: ':Num',
      tags: {},
      description: 'The angular coordinate'
    }, {
      name: 'magnitude',
      type: ':Num',
      tags: {},
      description: 'The radial coordinate'
    }]
  }])
})

test('DocParser works fine with undocumented union type declarations', async (t) => {
  t.deepEqual(DocParser.getDatadefs(`
Point: [
  Euclid: (
    x :Num,
    y :Num
  )

  Polar: (
    theta :Num,
    magnitude :Num
  )
] datadef
  `), [{
    name: ':Point',
    description: undefined,
    tags: undefined,
    type: 'union',
    types: [':Euclid', ':Polar']
  }, {
    name: ':Euclid',
    description: undefined,
    tags: undefined,
    type: 'struct',
    fields: [{
      name: 'x',
      type: ':Num',
      description: undefined,
      tags: undefined
    }, {
      name: 'y',
      type: ':Num',
      description: undefined,
      tags: undefined
    }]
  }, {
    name: ':Polar',
    description: undefined,
    tags: undefined,
    type: 'struct',
    fields: [{
      name: 'theta',
      type: ':Num',
      description: undefined,
      tags: undefined
    }, {
      name: 'magnitude',
      type: ':Num',
      description: undefined,
      tags: undefined
    }]
  }])
})

test('DocParser works fine with undocumented struct type declarations', async (t) => {
  t.deepEqual(DocParser.getDatadefs(`
    Polar: (
      theta :Num,
      magnitude :Num
    ) datadef
  `), [{
    name: ':Polar',
    description: undefined,
    tags: undefined,
    type: 'struct',
    fields: [{
      name: 'theta',
      type: ':Num',
      description: undefined,
      tags: undefined
    }, {
      name: 'magnitude',
      type: ':Num',
      description: undefined,
      tags: undefined
    }]
  }])
})

test('DocParser does not crash on invalid input', (t) => {
  // not a variable declaration, but could be one
  t.deepEqual(DocParser.getVariables(':Test'), [])
})

test('DocParser does not use block comments that are not in the line above the token that is documented', (t) => {
  t.deepEqual(DocParser.getVariables(`
    #<
    Unrelated documentation
    >#

    42 foo!
  `), [{
    name: 'foo',
    description: undefined,
    tags: undefined
  }])

  t.deepEqual(DocParser.getFunctions(`
    #<
    Unrelated documentation
    >#

    test: (x) {} fun
  `), [{
    name: 'test',
    description: undefined,
    params: [{ name: 'x', type: undefined, description: undefined }],
    returns: [],
    tags: undefined
  }])

  t.deepEqual(DocParser.getDatadefs(`
    #<
    Unrelated documentation
    >#

    Point: (
      #< not the documentation for x >#
    
      x :Int,
      y :Int
    ) datadef
  `), [{
    name: ':Point',
    description: undefined,
    type: 'struct',
    tags: undefined,
    fields: [{
      name: 'x',
      type: ':Int',
      description: undefined,
      tags: undefined
    }, {
      name: 'y',
      type: ':Int',
      description: undefined,
      tags: undefined
    }]
  }])

  t.deepEqual(DocParser.getDatadefs(`
  #< ignore this >#

  Point: [
    #< unrelated >#

    Euclid: (
      x :Num,
      y :Num
    )
  ] datadef
    `), [{
    name: ':Point',
    description: undefined,
    type: 'union',
    tags: undefined,
    types: [':Euclid']
  }, {
    name: ':Euclid',
    description: undefined,
    type: 'struct',
    tags: undefined,
    fields: [{
      name: 'x',
      type: ':Num',
      description: undefined,
      tags: undefined
    }, {
      name: 'y',
      type: ':Num',
      description: undefined,
      tags: undefined
    }]
  }])
})

test('DocParser finds symbols', (t) => {
  t.deepEqual(DocParser.getSymbols(`
    :foo
    foo:

    #< Bar >#
    bar:

    #< unrelated comment >#

    :buzz
  `), [{
    name: ':foo',
    description: undefined,
    tags: undefined
  }, {
    name: ':bar',
    description: 'Bar',
    tags: {}
  }, {
    name: ':buzz',
    description: undefined,
    tags: undefined
  }])
})

test('DocParser can include the source ranges of a function', async (t) => {
  const functions = DocParser.getFunctions(`
fac: (n :Int -> :Int) {
  { n n 1 - recur * } { 1 } n 1 > if
} fun
  `, { withRanges: true })

  t.deepEqual(functions, [{
    name: 'fac',
    description: undefined,
    params: [
      { name: 'n', type: ':Int', description: undefined }
    ],
    returns: [
      { type: ':Int', description: undefined }
    ],
    tags: undefined,
    source: {
      params: {
        start: { line: 1, col: 5 }, // opening (
        end: { line: 1, col: 20 } // closing )
      },
      body: {
        start: { line: 1, col: 22 }, // opening {
        end: { line: 3, col: 0 } // closing }
      }
    }
  }])
})

test('DocParser can include the source ranges of a function without params or with empty params', async (t) => {
  t.deepEqual(DocParser.getFunctions('test: {} fun', { withRanges: true }), [{
    name: 'test',
    description: undefined,
    params: [],
    returns: [],
    tags: undefined,
    source: {
      params: undefined,
      body: {
        start: { line: 0, col: 6 }, // opening {
        end: { line: 0, col: 7 } // closing }
      }
    }
  }])

  t.deepEqual(DocParser.getFunctions('test: () {} fun', { withRanges: true }), [{
    name: 'test',
    description: undefined,
    params: [],
    returns: [],
    tags: undefined,
    source: {
      params: {
        start: { line: 0, col: 6 }, // opening (
        end: { line: 0, col: 7 } // closing )
      },
      body: {
        start: { line: 0, col: 9 }, // opening {
        end: { line: 0, col: 10 } // closing }
      }
    }
  }])
})

test('DocParser finds param lists with ranges', (t) => {
  t.deepEqual(DocParser.getParamsLists('"test" (x :Int, y :Flt -> :Str)', { withRanges: true }), [{
    params: [{
      doc: undefined,
      name: 'x',
      type: ':Int'
    }, {
      doc: undefined,
      name: 'y',
      type: ':Flt'
    }],
    returns: [
      ':Str'
    ],
    source: {
      start: {
        col: 7,
        line: 0
      },
      end: {
        col: 30,
        line: 0
      }
    }
  }])
})
