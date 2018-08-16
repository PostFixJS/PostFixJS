import test from 'ava'
const Interpreter = require('../Interpreter')
const Lexer = require('../Lexer')
const { execute } = require('../test/helpers/util')

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
