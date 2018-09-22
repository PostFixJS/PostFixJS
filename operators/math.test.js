import test from 'ava'
const { execute } = require('../test/helpers/util')
const types = require('../types')

test('* should return an Int if both operands are Ints', async (t) => {
  const { stack } = await execute('4 8 *')
  t.is(stack.count, 1)
  const result = stack.pop()
  t.true(result instanceof types.Int)
  t.is(result.value, 32)
})

test('* should return a Flt if one of the operands is a Flt', async (t) => {
  const { stack } = await execute('0.5 8 *')
  t.is(stack.count, 1)
  const result = stack.pop()
  t.true(result instanceof types.Flt)
  t.is(result.value, 4)
})
