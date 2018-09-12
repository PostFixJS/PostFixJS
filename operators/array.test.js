import test from 'ava'
const { execute, checkErrorMessage } = require('../test/helpers/util')
const types = require('../types')

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
  t.is(stack.popString().value, 'b')
})

test('get should throw if the index is out of the range of the array', (t) => {
  t.throws(() => execute('[1,2,3] 3 get'), checkErrorMessage('Index is out of range (index is 3 but the :Arr has length 3)'))
})

test('get should get the i-th character of a string', (t) => {
  const { stack } = execute('"PostFix" 4 get')
  t.is(stack.count, 1)
  t.is(stack.popString().value, 'F')
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
  t.is(stack.pop().value, 'accept')
})

// TODO specify when set should throw

test('key-get should get a value by its key', (t) => {
  const { stack } = execute('[foo: "bar", bar: 2] :bar 0 key-get')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 2)
})

test('key-get should return the default value of the key is not found', (t) => {
  const { stack } = execute('[foo: "bar", bar: 2] :baz "default" key-get')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'default')
})

test('key-get should return the default value of the key has no value', (t) => {
  const { stack } = execute('[foo:] :foo "default" key-get')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'default')
})

test('key-set should replace a value of a key', (t) => {
  const { stack } = execute('[a: 1 b: 2 c: 3] :b "hello" key-set')
  t.is(stack.count, 1)
  const arr = stack.pop().items
  t.is(arr.length, 6)
  t.is(arr[3].getTypeName(), ':Str')
  t.is(arr[3].value, 'hello')
})

test('key-set should append a key and a value to an array', (t) => {
  const { stack } = execute('[] :foo "hello" key-set')
  t.is(stack.count, 1)
  const arr = stack.pop().items
  t.is(arr.length, 2)
  t.is(arr[0].getTypeName(), ':Sym')
  t.is(arr[0].name, 'foo')
  t.is(arr[1].getTypeName(), ':Str')
  t.is(arr[1].value, 'hello')
})

test('key-update updates a key', (t) => {
  const { stack } = execute('[:foo "bar" :bar 2] :foo "" { length } key-update')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.true(arr instanceof types.Arr)
  t.is(arr.items[1].value, 3)
})

test('key-update adds a missing key', (t) => {
  const { stack } = execute('[:bar 2] :foo "test" { length } key-update')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.true(arr instanceof types.Arr)
  t.is(arr.items[2].name, 'foo')
  t.is(arr.items[3].value, 4)
})

test('shuffle shuffles an array', (t) => {
  // this test could theoretically fail, but it's pretty unlikely
  const { stack } = execute('[ 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ] shuffle')
  t.is(stack.count, 1)
  t.notDeepEqual(
    stack.pop().items.map(item => item.value),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  )
})

test('reverse reverses an array', (t) => {
  const { stack } = execute('[4 :b "c"] reverse')
  t.is(stack.count, 1)
  const items = stack.pop().items
  t.is(items.length, 3)
  t.is(items[0].value, 'c')
  t.is(items[1].name, 'b')
  t.is(items[2].value, 4)
})

test('reverse reverts a string', (t) => {
  const { stack } = execute('"!skrow tI" reverse')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'It works!')
})

test('append appends an item to an array', (t) => {
  const { stack } = execute('["a"] "b" append')
  t.is(stack.count, 1)
  t.deepEqual(stack.pop().items.map((obj) => obj.value), ['a', 'b'])
})

test('remove removes the first occurence of a value in an array', (t) => {
  const { stack } = execute('[1 1 2 3 1] 1 remove')
  t.is(stack.count, 1)
  t.deepEqual(stack.pop().items.map((obj) => obj.value), [1, 2, 3, 1])
})

test('remove does not modify the array if the value is not found', (t) => {
  const { stack } = execute('[1 1 2 3 1] 4 remove')
  t.is(stack.count, 1)
  t.deepEqual(stack.pop().items.map((obj) => obj.value), [1, 1, 2, 3, 1])
})

test('remove-at removes an item from an array', (t) => {
  const { stack } = execute('[1, 2, 3] 2 remove-at')
  t.is(stack.count, 1)
  t.deepEqual(stack.pop().items.map((i) => i.value), [1, 2])
})

test('remove-at removes a character from a string', (t) => {
  const { stack } = execute('"test" 1 remove-at')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'tst')
})

test('find finds the first equal item in an array', (t) => {
  const { stack } = execute('[1 2 2] 2 find')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 1)
})

test('find finds the first occurence of a substring in a string', (t) => {
  const { stack } = execute('"test test" "st" find')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 2)
})

test('find returns nil if the item was not found', (t) => {
  const { stack } = execute('"test test" "x" find')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Nil)
})

test('find-from finds the first occurence after a given index in an array', (t) => {
  const { stack } = execute('[2 1 2 3] 2 1 find-from')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 2)
})

test('find-from finds the first occurence after a given index in a string', (t) => {
  const { stack } = execute('"hello world" "o" 5 find-from')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 7)
})

test('contains checks if an array contains an item', (t) => {
  const { stack } = execute('[1 2 3] 3 contains [4 5 6] 7 contains')
  t.is(stack.count, 2)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, true)
})

test('contains checks if a string contains a substring', (t) => {
  const { stack } = execute('"hello" "el" contains "hi" "e" contains')
  t.is(stack.count, 2)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, true)
})

test('slice gets a slice of an array', (t) => {
  const { stack } = execute('[1 2 3 4 5] 1 3 slice')
  t.is(stack.count, 1)
  const array = stack.pop()
  t.true(array instanceof types.Arr)
  t.deepEqual(array.items.map((i) => i.value), [2, 3])
})

test('slice gets everything to the end of the array if no end is given', (t) => {
  const { stack } = execute('[1 2 3 4 5] 1 slice')
  t.is(stack.count, 1)
  const array = stack.pop()
  t.true(array instanceof types.Arr)
  t.deepEqual(array.items.map((i) => i.value), [2, 3, 4, 5])
})

test('slice gets a slice of a string', (t) => {
  const { stack } = execute('"postfix" 4 6 slice')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'fi')
})

test('slice gets everything to the end of the string if no end is given', (t) => {
  const { stack } = execute('"postfix" 4 slice')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'fix')
})

test('insert inserts an item into an array', (t) => {
  const { stack } = execute('[1 2 3] 1 "hello" insert')
  t.is(stack.count, 1)
  t.deepEqual(stack.pop().items.map((i) => i.value), [1, 'hello', 2, 3])
})

test('insert inserts a character into a string', (t) => {
  const { stack } = execute('"test" 2 65 insert')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'teAst')
})

test('array creates an array with a given length and initial value', (t) => {
  const { stack } = execute('5 "test" array')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.true(arr instanceof types.Arr)
  t.is(arr.items.length, 5)
  t.true(arr.items.every((i) => i instanceof types.Str && i.value === 'test'))
})

test('array creates an array with a given length and initial value', (t) => {
  const { stack } = execute('5 "test" array')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.true(arr instanceof types.Arr)
  t.is(arr.items.length, 5)
  t.true(arr.items.every((i) => i instanceof types.Str && i.value === 'test'))
})

test('array creates an array with a given length and runs the initializer function for every index', (t) => {
  const { stack } = execute('5 { 2 pow } array')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.true(arr instanceof types.Arr)
  t.is(arr.items.length, 5)
  t.deepEqual(arr.items.map((i) => i.value), [0, 1, 4, 9, 16])
})

test('sort sorts an array', (t) => {
  const { stack } = execute('[ 6 1 4 7 1 3 ] sort')
  t.is(stack.count, 1)
  const sortedArray = stack.pop()
  t.true(sortedArray instanceof types.Arr)
  t.deepEqual(sortedArray.items.map((item) => item.value), [1, 1, 3, 4, 6, 7])
})
