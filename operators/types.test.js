import test from 'ava'
const { execute, checkErrorMessage } = require('../test/helpers/util')
const types = require('../types')

test('type should get the type of an Obj', (t) => {
  const { stack } = execute('42 type')
  const type = stack.pop()
  t.true(type instanceof types.Sym)
  t.is(type.name, 'Int')
})

test('arr?', (t) => {
  const { stack } = execute('[] arr? {} arr? 42 arr?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, true, false]
  )
})

test('bool?', (t) => {
  const { stack } = execute('true bool? false bool? 42 arr?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, true, false]
  )
})

test('exearr?', (t) => {
  const { stack } = execute('{} exearr? [] exearr? nil exearr?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, false, false]
  )
})

test('flt?', (t) => {
  const { stack } = execute('1.0 flt? PI flt? 42 flt?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, true, false]
  )
})

test('int?', (t) => {
  const { stack } = execute('3 int? 3.0 int? "test" int?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, false, false]
  )
})

test('nil?', (t) => {
  const { stack } = execute('true nil? [] nil? nil nil?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, false, true]
  )
})

test('num?', (t) => {
  const { stack } = execute(':test num? 42 num? 3.141 num?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, true, true]
  )
})

test('obj?', (t) => {
  const { stack } = execute('nil obj? "test" obj? [] obj?')
  // everything is an :Obj, but not :Nil
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, true, true]
  )
})

test('params?', (t) => {
  const { stack } = execute('[] params? (a b c) params? {} params?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, true, false]
  )
})

test('str?', (t) => {
  const { stack } = execute('1 str? "test" str? :str str?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, true, false]
  )
})

test('sym?', (t) => {
  const { stack } = execute(':test sym? "test" sym? 123 sym?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, false, false]
  )
})

test('str converts objects to strings', (t) => {
  const { stack } = execute('[1, 2 "test"] str')
  t.is(stack.pop().value, '[ 1, 2, "test" ]')
})

test('flt converts numbers and strings to floats', (t) => {
  const { stack } = execute('1 flt 1.5 flt "1.2" flt')
  t.is(stack.count, 3)
  const floats = stack.getElements()
  t.deepEqual(floats.map((obj) => obj.value), [1, 1.5, 1.2])
  t.true(floats[0] instanceof types.Flt)
  t.true(floats[1] instanceof types.Flt)
  t.true(floats[2] instanceof types.Flt)
})

test('flt returns nil if a string is not a number', (t) => {
  const { stack } = execute('"no number" flt')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Nil)
})

test('int converts numbers and strings to integers', (t) => {
  const { stack } = execute('1 int 1.5 int "12" int')
  t.is(stack.count, 3)
  const floats = stack.getElements()
  t.deepEqual(floats.map((obj) => obj.value), [1, 1, 12])
  t.true(floats[0] instanceof types.Int)
  t.true(floats[1] instanceof types.Int)
  t.true(floats[2] instanceof types.Int)
})

test('int returns nil if a string is not a number', (t) => {
  const { stack } = execute('"no number" int')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Nil)
})

test('sym converts strings to symbols, removing line breaks and spaces', (t) => {
  const { stack } = execute('"some string\nhere" sym')
  t.is(stack.count, 1)
  const symbol = stack.pop()
  t.true(symbol instanceof types.Sym)
  t.is(symbol.name, 'some-string-here')
})

test('sym throws an error if input is neither a symbol nor a string', (t) => {
  t.throws(() => execute('42 sym'))
}, checkErrorMessage('Only :Str and :Sym can be converted to :Sym, but got :Int instead'))

test('exearr converts an array to an executable array', (t) => {
  const { stack } = execute('[1 2 3] exearr')
  t.is(stack.count, 1)
  const exearr = stack.pop()
  t.true(exearr instanceof types.ExeArr)
  t.is(exearr.items.length, 3)
})

test('exearr wraps the element in an executable array if it is not an array', (t) => {
  const { stack } = execute('42 exearr')
  t.is(stack.count, 1)
  const exearr = stack.pop()
  t.true(exearr instanceof types.ExeArr)
  t.is(exearr.items.length, 1)
  t.is(exearr.items[0].value, 42)
})

test('arr converts any array to an array', (t) => {
  const { stack } = execute('{1 2 3} arr')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.is(arr.getTypeName(), ':Arr')
  t.is(arr.items.length, 3)
})

test('arr wraps the element in an array if it is not an array', (t) => {
  const { stack } = execute('42 arr')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.true(arr instanceof types.Arr)
  t.is(arr.items.length, 1)
  t.is(arr.items[0].value, 42)
})
