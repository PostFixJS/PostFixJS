import test from 'ava'
const { execute } = require('../test/helpers/util')

test('if should execute the first branch if the condition is true', (t) => {
  const stack = execute('true { "good" } { "not good" } if')._stack
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})

test('if should execute the second branch if the condition is false', (t) => {
  const stack = execute('false { "not good" } { "good" } if')._stack
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})

test('if should work inside of ExeArrs', (t) => {
  const stack = execute('{ true { "good" } { "not good" } if } exec')._stack
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})
