import test from 'ava'
const { execute } = require('../test/helpers/util')

// TODO add more tests

test('nil should be equal to nil', (t) => {
  const { stack } = execute('nil nil =')
  t.is(stack.pop().value, true)
})
