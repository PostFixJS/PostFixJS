import test from 'ava'
const Interpreter = require('../Interpreter')
const Lexer = require('../Lexer')
const types = require('../types')
const { execute, executeTimeout, checkErrorMessage, throwsErrorMessage } = require('../test/helpers/util')

test('if should execute the first branch if the condition is true', async (t) => {
  const { stack } = await execute('true { "good" } { "not good" } if')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})

test('if should execute the second branch if the condition is false', async (t) => {
  const { stack } = await execute('false { "not good" } { "good" } if')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})

test('if should work inside of ExeArrs', async (t) => {
  const { stack } = await execute('{ true { "good" } { "not good" } if } exec')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})

test('loop should be interruptible even if empty ', async (t) => {
  const interpreter = new Interpreter()
  const stepper = interpreter.startRun(Lexer.parse('{} loop'))
  await stepper.step() // {
  await stepper.step() // }
  await stepper.step() // loop
  await stepper.step() // loop the loop once
  t.pass() // if stopping the execution wouldn't be possible, this line would never be reached
})

test('break should leave a loop', async (t) => {
  const { stack } = await executeTimeout('{ 1 break } loop', 1000)
  t.is(stack.count, 1)
})

test('break should leave an executable array', async (t) => {
  const { stack } = await execute('{ 1 break 2 3 } x! x')
  t.is(stack.count, 1)
})

test('break should leave an executable array when using exec', async (t) => {
  const { stack } = await execute('{ 1 break 2 3 } exec')
  t.is(stack.count, 1)
})

test('breakif should leave a loop', async (t) => {
  const { stack } = await executeTimeout('1 3 { i! 1 true breakif } for', 1000)
  t.is(stack.count, 1)
})

test('breakif should leave an executable array', async (t) => {
  const { stack } = await execute('{ 1 true breakif 2 3 } exec')
  t.is(stack.count, 1)
})

test('break should leave an if body', async (t) => {
  const { stack } = await execute('true { 1 2 break 3 4 } if')
  t.is(stack.count, 2)
})

test('break should leave a function but not skip return value checks', async (t) => {
  await throwsErrorMessage(t, async () => {
    await execute('fn: (-> :Num) { break "break ignored" err } fun fn')
  }, checkErrorMessage('Expected fun to return 1 values but it returned 0 values'))
})

test('cond-fun should wrap a cond in a function', async (t) => {
  const { dictStack, stack } = await execute(`
    test: (x :Int -> :Int) { { x 0 > } { 42 } { true } { 0 } } cond-fun
    3 test
  `)
  const fun = dictStack.get('test')
  t.true(fun instanceof types.Lam)
  t.is(stack.count, 1)
  t.is(stack.pop().value, 42)
})

test('cond-fun should define a function that knows itself', async (t) => {
  const { dictStack } = await execute('test: () { } cond-fun')
  const fun = dictStack.get('test')
  t.true(fun instanceof types.Lam)
  t.is(fun.dict['test'], fun)
})
