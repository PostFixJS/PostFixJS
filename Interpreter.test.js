import test from 'ava'
const { execute } = require('./test/helpers/util')
const types = require('./types')

test('Param list in ExeArrs should work as expected', (t) => {
  const { stack } = execute('{ ( n :Int ) } exec')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Params)
})

test('Trying to get elements from an empty stack should throw an error', (t) => {
  t.throws(() => {
    execute('42 pop pop')
  }, (e) => e instanceof types.Err && e.message === 'The stack is empty' && e.origin.line === 0 && e.origin.col === 7)
  t.throws(() => {
    execute('{ 42 pop pop } exec')
  }, (e) => e instanceof types.Err && e.message === 'The stack is empty' && e.origin.line === 0 && e.origin.col === 9)
})

test('Trying to get elements from below the stack should throw an error', (t) => {
  t.throws(() => {
    execute('42 1 copy')
  }, (e) => e instanceof types.Err && e.message === 'Stack access is out of range' && e.origin.line === 0 && e.origin.col === 5)
  t.throws(() => {
    execute('{ 42 1 copy } exec')
  }, (e) => e instanceof types.Err && e.message === 'Stack access is out of range' && e.origin.line === 0 && e.origin.col === 7)
})

test('Trying to access the foreign stack in a function should throw an error', (t) => {
  t.throws(() => {
    execute('test: { pop } fun 42 test')
  }, (e) => e instanceof types.Err && e.message === 'Inside :Lam the stack may not be accessed beyond the height it had when the :Lam was invoked')
})

test('The interpreter handles excaped quotes properly', (t) => {
  const { stack } = execute('"\\""')
  t.is(stack.pop().value, '"')
})
