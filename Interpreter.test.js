import test from 'ava'
const { execute } = require('./test/helpers/util')
const types = require('./types')

test('Param list in ExeArrs should work as expected', (t) => {
  const { stack } = execute('{ ( n :Int ) } exec')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Params)
})
