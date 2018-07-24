import test from 'ava'
const { execute, checkErrorMessage } = require('../test/helpers/util')
const types = require('../types')

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

test('type should get the type of an Obj', (t) => {
  const { stack } = execute('42 type')
  const type = stack.pop()
  t.true(type instanceof types.Sym)
  t.is(type.name, 'Int')
})

test('exec should execute nested ExeArrs', (t) => {
  const { stack } = execute('{"pass"} x! {x} exec')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'pass')
})
