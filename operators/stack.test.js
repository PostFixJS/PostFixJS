import test from 'ava'
const types = require('../types')
const { execute } = require('../test/helpers/util')

test('stack-count gets the stack height', (t) => {
  const { stack } = execute('1 2 3 4 5 stack-count')
  t.is(stack.count, 6)
  const count = stack.pop()
  t.true(count instanceof types.Int)
  t.is(count.value, 5)
})

test('stack-count gets the accessible stack height in lambda functions', (t) => {
  const { stack } = execute('1 1 1 1 1 (-> :Int) { 1 1 stack-count x! pop pop x } lam exec')
  t.is(stack.count, 6)
  const count = stack.pop()
  t.true(count instanceof types.Int)
  t.is(count.value, 2)
})
