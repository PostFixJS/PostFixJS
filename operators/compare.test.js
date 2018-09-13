import test from 'ava'
const { execute } = require('../test/helpers/util')

// TODO add more tests

test('nil should be equal to nil', (t) => {
  const { stack } = execute('nil nil =')
  t.is(stack.pop().value, true)
})

test('arrays should be comparable and have a well-defined order', (t) => {
  // arrays of equal length behave as you would expect (compare item-by-item)
  // otherwise, the first min(a.length, b.length) items are compared; if they are
  // equal to each other, the shorter array is considered to be smaller

  t.is(execute('[1 "x"] [2] <').stack.pop().value, true)
  t.is(execute('[2, "z"] [2, "a"] <').stack.pop().value, false)

  t.is(execute('[1] [2] <').stack.pop().value, true)
  t.is(execute('[1] [2] <=').stack.pop().value, true)
  t.is(execute('[1] [2] >').stack.pop().value, false)
  t.is(execute('[1] [2] >=').stack.pop().value, false)

  t.is(execute('[2, 3] [2] <').stack.pop().value, false)
  t.is(execute('[2, 3] [2] <=').stack.pop().value, false)
  t.is(execute('[2, 3] [2] >').stack.pop().value, true)
  t.is(execute('[2, 3] [2] >=').stack.pop().value, true)

  t.is(execute('[2, 3] [2] =').stack.pop().value, false)
  t.is(execute('[2, 3] [2, 3] =').stack.pop().value, true)
})
