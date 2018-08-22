import test from 'ava'
const { execute, checkErrorMessage } = require('../test/helpers/util')
const types = require('../types')

test('update-lam should update the dictionaries of the given functions', (t) => {
  const { stack } = execute(`
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

test('update-lam should keep recur intact', (t) => {
  const { stack } = execute(`
    test: (-> :Obj) { :recur vref } fun
    [:test] update-lam
    test
  `)
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Lam)
})

test('vref should put a value from the dictionary on the stack without executing it', (t) => {
  const { stack } = execute(`{ 42 } a! :a vref`)
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.ExeArr)
})

test('vref should throw if the reference is not found', (t) => {
  t.throws(() => execute(`:a vref`)._stack, checkErrorMessage('Could not find a in the dictionary'))
})

test('vref should throw if no symbol is provided', (t) => {
  t.throws(() => execute(`1 vref`)._stack, checkErrorMessage('vref expected :Sym but got :Int'))
})

test('exec should execute nested ExeArrs', (t) => {
  const { stack } = execute('{"pass"} x! {x} exec')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'pass')
})

test('empty? returns true for empty arrays and nil', (t) => {
  const { stack } = execute('{} empty? [] empty? nil empty?')
  t.is(stack.count, 3)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, true)
  t.is(stack.pop().value, true)
})

test('empty? returns false for other objects', (t) => {
  const { stack } = execute('{1} empty? "hello" empty? 42 empty?')
  t.is(stack.count, 3)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, false)
})
