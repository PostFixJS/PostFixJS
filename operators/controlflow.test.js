import test from 'ava'
const Interpreter = require('../Interpreter')
const Lexer = require('../Lexer')
const types = require('../types')
const { execute, executeTimeout, checkErrorMessage } = require('../test/helpers/util')

test('if should execute the first branch if the condition is true', (t) => {
  const { stack } = execute('true { "good" } { "not good" } if')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})

test('if should execute the second branch if the condition is false', (t) => {
  const { stack } = execute('false { "not good" } { "good" } if')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})

test('if should work inside of ExeArrs', (t) => {
  const { stack } = execute('{ true { "good" } { "not good" } if } exec')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'good')
})

test('loop should be interruptible even if empty ', (t) => {
  const interpreter = new Interpreter()
  interpreter.startRun(Lexer.parse('{} loop'))
  interpreter.step() // {
  interpreter.step() // }
  interpreter.step() // loop
  interpreter.step() // loop the loop once
  t.pass() // if stopping the execution wouldn't be possible, this line would never be reached
})

test('break should leave a loop', async (t) => {
  const { stack } = await executeTimeout('{ 1 break } loop', 1000)
  t.is(stack.count, 1)
})

test('break should leave an executable array', (t) => {
  const { stack } = execute('{ 1 break 2 3 } x! x')
  t.is(stack.count, 1)
})

test('break should leave an executable array when using exec', (t) => {
  const { stack } = execute('{ 1 break 2 3 } exec')
  t.is(stack.count, 1)
})

test('breakif should leave a loop', async (t) => {
  const { stack } = await executeTimeout('1 3 { i! 1 true breakif } for', 1000)
  t.is(stack.count, 1)
})

test('breakif should leave an executable array', (t) => {
  const { stack } = execute('{ 1 true breakif 2 3 } exec')
  t.is(stack.count, 1)
})

test('break should leave an if body', (t) => {
  const { stack } = execute('true { 1 2 break 3 4 } if')
  t.is(stack.count, 2)
})

test('break should leave a function but not skip return value checks', (t) => {
  t.throws(() => {
    execute('fn: (-> :Num) { break "break ignored" err } fun fn')
  }, checkErrorMessage('Expected fun to return 1 values but it returned 0 values'))
})

test('cond-fun should wrap a cond in a function', (t) => {
  const { dictStack, stack } = execute(`
    test: (x :Int -> :Int) { { x 0 > } { 42 } { true } { 0 } } cond-fun
    3 test
  `)
  const fun = dictStack.get('test')
  t.true(fun instanceof types.Lam)
  t.is(stack.count, 1)
  t.is(stack.pop().value, 42)
})

test('cond-fun should define a function that knows itself', (t) => {
  const { dictStack } = execute('test: () { } cond-fun')
  const fun = dictStack.get('test')
  t.true(fun instanceof types.Lam)
  t.is(fun.dict['test'], fun)
})
