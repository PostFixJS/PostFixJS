import test from 'ava'
const { execute, checkErrorMessage, throwsErrorMessage } = require('../test/helpers/util')
const types = require('../types')

test('type should get the type of an Obj', async (t) => {
  const { stack } = await execute('42 type')
  const type = stack.pop()
  t.true(type instanceof types.Sym)
  t.is(type.name, 'Int')
})

test('type should get the type of struct datadef instances', async (t) => {
  const { stack } = await execute(`
    Point: (x :Num, y :Num) datadef
    1 2 point type
  `)
  const type = stack.pop()
  t.true(type instanceof types.Sym)
  t.is(type.name, 'Point')
})

test('type should get the type of union datadef instances', async (t) => {
  const { stack } = await execute(`
    Point: [
      Euclid: (x :Num, y :Num)
      Polar: (theta :Num, magnitude :Num)
    ] datadef
    1 2 euclid
    type
    45 2 polar
    type
  `)
  const type2 = stack.pop()
  t.true(type2 instanceof types.Sym)
  t.is(type2.name, 'Polar')
  const type1 = stack.pop()
  t.true(type1 instanceof types.Sym)
  t.is(type1.name, 'Euclid')
})

test('arr?', async (t) => {
  const { stack } = await execute('[] arr? {} arr? 42 arr?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, true, false]
  )
})

test('bool?', async (t) => {
  const { stack } = await execute('true bool? false bool? 42 arr?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, true, false]
  )
})

test('exearr?', async (t) => {
  const { stack } = await execute('{} exearr? [] exearr? nil exearr?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, false, false]
  )
})

test('flt?', async (t) => {
  const { stack } = await execute('1.0 flt? PI flt? 42 flt?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, true, false]
  )
})

test('int?', async (t) => {
  const { stack } = await execute('3 int? 3.0 int? "test" int?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, false, false]
  )
})

test('nil?', async (t) => {
  const { stack } = await execute('true nil? [] nil? nil nil?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, false, true]
  )
})

test('num?', async (t) => {
  const { stack } = await execute(':test num? 42 num? 3.141 num?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, true, true]
  )
})

test('obj?', async (t) => {
  const { stack } = await execute('nil obj? "test" obj? [] obj?')
  // everything is an :Obj, but not :Nil
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, true, true]
  )
})

test('params?', async (t) => {
  const { stack } = await execute('[] params? (a b c) params? {} params?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, true, false]
  )
})

test('str?', async (t) => {
  const { stack } = await execute('1 str? "test" str? :str str?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [false, true, false]
  )
})

test('sym?', async (t) => {
  const { stack } = await execute(':test sym? "test" sym? 123 sym?')
  t.deepEqual(
    stack.getElements().map((obj) => obj.value),
    [true, false, false]
  )
})

test('str converts objects to strings', async (t) => {
  const { stack } = await execute('[1, 2 "test"] str')
  t.is(stack.pop().value, '[ 1 2 "test" ]')
})

test('flt converts numbers and strings to floats', async (t) => {
  const { stack } = await execute('1 flt 1.5 flt "1.2" flt')
  t.is(stack.count, 3)
  const floats = stack.getElements()
  t.deepEqual(floats.map((obj) => obj.value), [1, 1.5, 1.2])
  t.true(floats[0] instanceof types.Flt)
  t.true(floats[1] instanceof types.Flt)
  t.true(floats[2] instanceof types.Flt)
})

test('flt returns nil if a string is not a number', async (t) => {
  const { stack } = await execute('"no number" flt')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Nil)
})

test('int converts numbers and strings to integers', async (t) => {
  const { stack } = await execute('1 int 1.5 int "12" int')
  t.is(stack.count, 3)
  const floats = stack.getElements()
  t.deepEqual(floats.map((obj) => obj.value), [1, 1, 12])
  t.true(floats[0] instanceof types.Int)
  t.true(floats[1] instanceof types.Int)
  t.true(floats[2] instanceof types.Int)
})

test('int returns nil if a string is not a number', async (t) => {
  const { stack } = await execute('"no number" int')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Nil)
})

test('sym converts strings to symbols, removing line breaks and spaces', async (t) => {
  const { stack } = await execute('"some string\nhere" sym')
  t.is(stack.count, 1)
  const symbol = stack.pop()
  t.true(symbol instanceof types.Sym)
  t.is(symbol.name, 'some-string-here')
})

test('sym throws an error if input is neither a symbol nor a string', async (t) => {
  await throwsErrorMessage(t, () => execute('42 sym'),
    checkErrorMessage('Only :Str and :Sym can be converted to :Sym, got :Int instead'))
})

test('exearr converts an array to an executable array', async (t) => {
  const { stack } = await execute('[1 2 3] exearr')
  t.is(stack.count, 1)
  const exearr = stack.pop()
  t.true(exearr instanceof types.ExeArr)
  t.is(exearr.items.length, 3)
})

test('exearr wraps the element in an executable array if it is not an array', async (t) => {
  const { stack } = await execute('42 exearr')
  t.is(stack.count, 1)
  const exearr = stack.pop()
  t.true(exearr instanceof types.ExeArr)
  t.is(exearr.items.length, 1)
  t.is(exearr.items[0].value, 42)
})

test('arr converts any array to an array', async (t) => {
  const { stack } = await execute('{1 2 3} arr')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.is(arr.getTypeName(), ':Arr')
  t.is(arr.items.length, 3)
})

test('arr wraps the element in an array if it is not an array', async (t) => {
  const { stack } = await execute('42 arr')
  t.is(stack.count, 1)
  const arr = stack.pop()
  t.true(arr instanceof types.Arr)
  t.is(arr.items.length, 1)
  t.is(arr.items[0].value, 42)
})
