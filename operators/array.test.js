import test from 'ava'
const { execute, checkErrorMessage } = require('../test/helpers/util')

test('length should return length of strings', (t) => {
  const { stack } = execute('"hello world" length')
  t.is(stack.count, 1)
  t.is(stack.popNumber().value, 11)
})

test('length should return length of arrays', (t) => {
  const { stack } = execute('["a" "b" "c"] length')
  t.is(stack.count, 1)
  t.is(stack.popNumber().value, 3)
})

test('length should throw if the argument is neither :Str nor :Arr', (t) => {
  t.throws(() => execute('42 length'), checkErrorMessage('length expects :Arr or :Str but got :Int instead'))
})

test('get should get the i-th element of an array', (t) => {
  const { stack } = execute('["a" "b" "c"] 1 get')
  t.is(stack.count, 1)
  t.is(stack.popString().value, "b")
})

test('get should throw if the index is out of the range of the array', (t) => {
  t.throws(() => execute('[1,2,3] 3 get'), checkErrorMessage('Index is out of range (index is 3 but the :Arr has length 3)'))
})

test('get should get the i-th character of a string', (t) => {
  const { stack } = execute('"PostFix" 4 get')
  t.is(stack.count, 1)
  t.is(stack.popString().value, "F")
})

test('get should throw if the index is out of the range of the string', (t) => {
  t.throws(() => execute('"PostFix" 42 get'), checkErrorMessage('Index is out of range (index is 42 but the :Str has length 7)'))
})

test('get should throw if it is called with invalid arguments', (t) => {
  t.throws(() => execute('42 0 get'), checkErrorMessage('get expects the first argument to be :Arr or :Str but got :Int instead'))
  t.throws(() => execute('"PostFix" false get'), checkErrorMessage('get expects the second argument to be an :Int but got :Bool instead'))
})

test('set should set the i-th element of an array', (t) => {
  const { stack } = execute('[1,2,3] 2 4 set')
  t.is(stack.count, 1)
  t.deepEqual(stack.pop().items.map((i) => i.value), [1, 2, 4])
})

test('set should set the i-th character of a string', (t) => {
  const { stack } = execute('"accent" 4 "p" set')
  t.is(stack.count, 1)
  t.is(stack.pop().value, "accept")
})

// TODO specify when set should throw
