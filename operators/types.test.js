import test from 'ava'
const { execute } = require('../test/helpers/util')
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