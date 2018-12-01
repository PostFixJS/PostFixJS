import test from 'ava'
const { execute } = require('../test/helpers/util')

test('and returns true iff both arguments are true', async (t) => {
  let { stack } = await execute(`
    false false and
    true false and
    false true and
    true true and
  `)
  t.is(stack.count, 4)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, false)
})

test('and returns true iff all elements of an array are true', async (t) => {
  let { stack } = await execute(`
    [true true true] and
    [true false true] and
  `)
  t.is(stack.count, 2)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, true)
})

test('and short-circuits', async (t) => {
  let { stack } = await execute(`
    [false { "boom" err }] and
  `)
  t.is(stack.count, 1)
  t.is(stack.pop().value, false)
})

test('or returns true iff at least one argument is true', async (t) => {
  let { stack } = await execute(`
    false false or
    true false or
    false true or
    true true or
  `)
  t.is(stack.count, 4)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, false)
})

test('or returns true iff at least one element of an array is true', async (t) => {
  let { stack } = await execute(`
    [false false false] or
    [false true false] or
  `)
  t.is(stack.count, 2)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, false)
})

test('or short-circuits', async (t) => {
  let { stack } = await execute(`
    [true { "boom" err }] or
  `)
  t.is(stack.count, 1)
  t.is(stack.pop().value, true)
})

test('not inverts a boolean', async (t) => {
  let { stack } = await execute('false not true not')
  t.is(stack.count, 2)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, true)
})
