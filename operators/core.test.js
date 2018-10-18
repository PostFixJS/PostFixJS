import test from 'ava'
const { execute, checkErrorMessage, throwsErrorMessage } = require('../test/helpers/util')
const types = require('../types')

test('fun should define a function that knows itself', async (t) => {
  const { dictStack } = await execute('test: (-> :Obj) { } fun')
  const fun = dictStack.get('test')
  t.true(fun instanceof types.Lam)
  t.is(fun.dict['test'], fun)
})

test('fun can define functions without a parameter list that do not check for underflows', async (t) => {
  const { dictStack, stack } = await execute(`
    test: { 2 + dup } fun
    2 test
  `)
  t.is(stack.count, 2) // 2 + 2 = 4, dup = 4 4
  const fun = dictStack.get('test')
  t.true(fun instanceof types.Lam)
  t.is(fun.params, null)
})

test('fun can define functions without an arrow and return values in the param list that do not check the resulting stack height but do check for underflows', async (t) => {
  const { stack } = await execute(`
    sum: (a b) { a b + } fun
    2 3 sum
  `)
  t.is(stack.count, 1)
  t.is(stack.pop().value, 5)

  await throwsErrorMessage(t, () => execute(`
    brokenSum: (a b) { pop a + } fun # underflows due to the pop
    2 3 brokenSum
  `), checkErrorMessage('Stack underflow in function or lambda expression'))
})

test('fun can define functions with an arrow and return values in the param list that check the resulting stack height and prevent underflows', async (t) => {
  const { stack } = await execute(`
    sum: (a b -> :Int) { a b + } fun
    2 3 sum
  `)
  t.is(stack.count, 1)
  t.is(stack.pop().value, 5)

  await throwsErrorMessage(t, () => execute(`
    brokenSum: (a b ->) { a b + } fun # expects 0 return values
    2 3 brokenSum
  `), checkErrorMessage('Expected fun to return 0 values but it returned 1 values'))
})

test('lam can define functions without a parameter list that do not check for underflows', async (t) => {
  const { dictStack, stack } = await execute(`
    { 2 + dup } lam test!
    2 test
  `)
  t.is(stack.count, 2) // 2 + 2 = 4, dup = 4 4
  const fun = dictStack.get('test')
  t.true(fun instanceof types.Lam)
  t.is(fun.params, null)
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

test('popv should bind values to variables', async (t) => {
  const { stack, dictStack } = await execute('1 2 3 (a b c) popv')
  t.is(stack.count, 0)
  t.is(dictStack.get('a').value, 1)
  t.is(dictStack.get('b').value, 2)
  t.is(dictStack.get('c').value, 3)
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
  await throwsErrorMessage(t, () => execute(`1 vref`), checkErrorMessage('Expected operand 1 to be :Sym but got :Int instead'))
})

test('exec should execute nested ExeArrs', async (t) => {
  const { stack } = await execute('{"pass"} x! {x} exec')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'pass')
})

test('tailcall should call a function without returning and should not push a dictionary', async (t) => {
  const { stack } = await execute(`
    g: { :g-was-called } fun
    f: { :f-was-called :g tailcall :never-reached } fun
    f
  `, { maximumDictStackHeight: 2 })
  t.is(stack.count, 2)
  t.is(stack.pop().name, 'g-was-called')
  t.is(stack.pop().name, 'f-was-called')
})

test('tailcall should throw an error if the operand is not a lambda function', async (t) => {
  await throwsErrorMessage(t, () => execute(`
    1 g!
    f: { :g tailcall } fun
    f 
  `), checkErrorMessage('Expected a function (:Lam) but got :Int'))
})

test('tailcall should throw an error if it is used outside of a function', async (t) => {
  await throwsErrorMessage(t, () => execute(`
    f: { dup * } fun
    :f tailcall
  `), checkErrorMessage('tailcall can only be used in a function'))
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

test('err stops the program immediately', async (t) => {
  await throwsErrorMessage(t, () => execute('"some error" err'), checkErrorMessage('some error'))
})
