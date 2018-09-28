import test from 'ava'
const { execute, throwsErrorMessage, checkErrorMessage } = require('../test/helpers/util')
const types = require('../types')

test('+ should add two numbers and return :Int if both are :Ints', async (t) => {
  const { stack } = await execute('1 2 + 1.5 2 + 5 5.2 +')
  t.is(stack.count, 3)
  const sum3 = stack.pop()
  t.true(sum3 instanceof types.Flt)
  t.is(sum3.value, 10.2)
  const sum2 = stack.pop()
  t.true(sum2 instanceof types.Flt)
  t.is(sum2.value, 3.5)
  const sum1 = stack.pop()
  t.true(sum1 instanceof types.Int)
  t.is(sum1.value, 3)
})

test('+ should concatenate two strings', async (t) => {
  const { stack } = await execute('"hello" " " "world" + +')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'hello world')
})

test('+ should concatenate two arrays', async (t) => {
  const { stack } = await execute('[1 2] [3 4] +')
  t.is(stack.count, 1)
  t.deepEqual(stack.pop().items.map((i) => i.value), [1, 2, 3, 4])
})

test('+ should throw if the operands cannot be concatenated', async (t) => {
  await throwsErrorMessage(t, () => execute('"1+1=" 2 +'), checkErrorMessage('+ can only add numbers and concatenate strings or arrays, but got :Str and :Int'))
})

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
