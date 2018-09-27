import test from 'ava'
const { execute, throwsErrorMessage } = require('./test/helpers/util')
const types = require('./types')

test('Param list in ExeArrs should work as expected', async (t) => {
  const { stack } = await execute('{ ( n :Int ) } exec')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Params)
})

test('Trying to get elements from an empty stack should throw an error', async (t) => {
  await throwsErrorMessage(t, async () => {
    await execute('42 pop pop')
  }, (e) => e instanceof types.Err && e.message === 'The stack is empty' && e.origin.line === 0 && e.origin.col === 7)
  await throwsErrorMessage(t, async () => {
    await execute('{ 42 pop pop } exec')
  }, (e) => e instanceof types.Err && e.message === 'The stack is empty' && e.origin.line === 0 && e.origin.col === 9)
})

test('Trying to get elements from below the stack should throw an error', async (t) => {
  await throwsErrorMessage(t, async () => {
    await execute('42 1 copy')
  }, (e) => e instanceof types.Err && e.message === 'Stack access is out of range' && e.origin.line === 0 && e.origin.col === 5)
  await throwsErrorMessage(t, async () => {
    await execute('{ 42 1 copy } exec')
  }, (e) => e instanceof types.Err && e.message === 'Stack access is out of range' && e.origin.line === 0 && e.origin.col === 7)
})

test('Trying to access the foreign stack in a function with a parameter list should throw an error', async (t) => {
  await throwsErrorMessage(t, async () => {
    await execute('test: () { pop } fun 42 test')
  }, (e) => e instanceof types.Err && e.message === 'Stack underflow in function or lambda expression')
})

test('The interpreter handles excaped quotes properly', async (t) => {
  const { stack } = await execute('"\\""')
  t.is(stack.pop().value, '"')
})

test('Reference counting should copy arrays before modification', async (t) => {
  const { stack } = await execute('[1 2] dup 3 append')
  t.deepEqual(stack.pop().items.map((i) => i.value), [1, 2, 3])
  t.deepEqual(stack.pop().items.map((i) => i.value), [1, 2])
})

test('Reference counting should copy deep arrays before modification', async (t) => {
  const { stack } = await execute('[ 1, 2, [ 1, 2, 3 ] ] dup [2 1] 42 path-set !=')
  t.is(stack.pop().value, true)
})

test('Reference counting should copy objects from the dict', async (t) => {
  const { stack } = await execute('[0] x! x 1 append x !=')
  t.is(stack.pop().value, true)
})
