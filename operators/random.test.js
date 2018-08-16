import test from 'ava'
const types = require('../types')
const { execute, checkErrorMessage } = require('../test/helpers/util')

test('rand-flt generates a random number between 0 (inclusive) and 1 (exclusive)', (t) => {
  const { stack } = execute('rand-flt')
  t.is(stack.count, 1)
  const rnd = stack.pop()
  t.true(rnd instanceof types.Flt)
  t.true(rnd.value >= 0 && rnd.value < 1)
})

test('rand-int generates a random number between 0 (inclusive) and n (exclusive)', (t) => {
  const { stack } = execute('16 rand-int')
  t.is(stack.count, 1)
  const rnd = stack.pop()
  t.true(rnd instanceof types.Int)
  t.true(rnd.value >= 0 && rnd.value < 42)
})

test('rand-int throws if n is not positive', (t) => {
  t.throws(
    () => execute('0 rand-int'),
    checkErrorMessage('rand-int expected a positive upper bound but got 0 instead')
  )
  t.throws(
    () => execute('-7 rand-int'),
    checkErrorMessage('rand-int expected a positive upper bound but got -7 instead')
  )
})

test('rand-seed seeds the random number generator', (t) => {
  const { stack } = execute('1337 rand-seed rand-flt 1337 rand-seed rand-flt')
  t.is(stack.count, 2)
  const a = stack.pop().value
  const b = stack.pop().value
  t.true(a === b)
})
