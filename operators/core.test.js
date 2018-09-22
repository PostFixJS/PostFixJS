import test from 'ava'
const { execute, checkErrorMessage, throwsErrorMessage } = require('../test/helpers/util')
const types = require('../types')

test('fun should define a function that knows itself', async (t) => {
  const { dictStack } = await execute('test: (-> :Obj) { } fun')
  const fun = dictStack.get('test')
  t.true(fun instanceof types.Lam)
  t.is(fun.dict['test'], fun)
})

test('update-lam should update the dictionaries of the given functions', async (t) => {
  const { stack } = await execute(`
    1 x!
    test: (-> :Num) { x } fun
    2 x!
    test # should still return 1
    [:test] update-lam
    test # should return 2 now
  `)
  t.is(stack.count, 2)
  t.is(stack.pop().value, 2)
  t.is(stack.pop().value, 1)
})

test('update-lam should keep recur intact', async (t) => {
  const { stack } = await execute(`
    test: (-> :Obj) { :recur vref } fun
    [:test] update-lam
    test
  `)
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Lam)
})

test('vref should put a value from the dictionary on the stack without executing it', async (t) => {
  const { stack } = await execute(`{ 42 } a! :a vref`)
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.ExeArr)
})

test('vref should throw if the reference is not found', async (t) => {
  await throwsErrorMessage(t, () => execute(`:a vref`), checkErrorMessage('Could not find a in the dictionary'))
})

test('vref should throw if no symbol is provided', async (t) => {
  await throwsErrorMessage(t, () => execute(`1 vref`), checkErrorMessage('vref expected :Sym but got :Int'))
})

test('exec should execute nested ExeArrs', async (t) => {
  const { stack } = await execute('{"pass"} x! {x} exec')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'pass')
})

test('empty? returns true for empty arrays and nil', async (t) => {
  const { stack } = await execute('{} empty? [] empty? nil empty?')
  t.is(stack.count, 3)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, true)
})

test('empty? returns false for other objects', async (t) => {
  const { stack } = await execute('{1} empty? "hello" empty? 42 empty?')
  t.is(stack.count, 3)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, false)
})
