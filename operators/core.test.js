import test from 'ava'
const { execute } = require('../test/helpers/util')
const types = require('../types')

test('vref should put a value from the dictionary on the stack without executing it', (t) => {
  const stack = execute(`{ 42 } a! :a vref`)._stack
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.ExeArr)
})

test('vref should throw if the reference is not found', (t) => {
  t.throws(() => execute(`:a vref`)._stack, (err) => {
    return err.message === 'Could not find a in the dictionary'
  })
})

test('vref should throw if no symbol is provided', (t) => {
  t.throws(() => execute(`1 vref`)._stack, (err) => {
    return err.message === 'vref expected :Sym but got :Int'
  })
})
