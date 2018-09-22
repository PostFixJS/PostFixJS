import test from 'ava'
const types = require('../types')
const { execute, checkErrorMessage, throwsErrorMessage } = require('../test/helpers/util')

test('rand-flt generates a random number between 0 (inclusive) and 1 (exclusive)', async (t) => {
  const { stack } = await execute('rand-flt')
  t.is(stack.count, 1)
  const rnd = stack.pop()
  t.true(rnd instanceof types.Flt)
  t.true(rnd.value >= 0 && rnd.value < 1)
})

test('rand-int generates a random number between 0 (inclusive) and n (exclusive)', async (t) => {
  const { stack } = await execute('16 rand-int')
  t.is(stack.count, 1)
  const rnd = stack.pop()
  t.true(rnd instanceof types.Int)
  t.true(rnd.value >= 0 && rnd.value < 42)
})

test('rand-int throws if n is not positive', async (t) => {
  await throwsErrorMessage(t,
    () => execute('0 rand-int'),
    checkErrorMessage('rand-int expected a positive upper bound but got 0 instead')
  )
  await throwsErrorMessage(t,
    () => execute('-7 rand-int'),
    checkErrorMessage('rand-int expected a positive upper bound but got -7 instead')
  )
})

test('rand-seed seeds the random number generator', async (t) => {
  const { stack } = await execute('1337 rand-seed rand-flt 1337 rand-seed rand-flt')
  t.is(stack.count, 2)
  const a = stack.pop().value
  const b = stack.pop().value
  t.true(a === b)
})
