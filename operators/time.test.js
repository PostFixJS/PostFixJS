import test from 'ava'
const types = require('../types')
const { execute } = require('../test/helpers/util')

test('time-millis gets the current time in milliseconds', async (t) => {
  const { stack } = await execute('time-millis')
  t.is(stack.count, 1)
  const time = stack.pop()
  t.true(time instanceof types.Int)
  t.true(Math.abs(Date.now() - time.value) < 50)
})

test('sleep should sleep for the given delay', async (t) => {
  const start = Date.now()
  await execute('100 sleep')
  t.true(Math.abs(100 - (Date.now() - start)) < 50)
})
