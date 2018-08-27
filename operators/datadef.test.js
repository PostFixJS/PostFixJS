import test from 'ava'
const types = require('../types')
const { execute, checkErrorMessage } = require('../test/helpers/util')

test('datadef generates a constructor function', (t) => {
  let { dictStack } = execute('Point: (x :Num, y :Num) datadef')
  const constructor = dictStack.get('point.new')
  t.true(constructor instanceof types.Lam)
})

test('the datadef constructor constructs a struct', (t) => {
  let { stack } = execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point.new
  `)
  t.is(stack.count, 1)
  const point = stack.pop()
  t.true(point instanceof types.Arr)
  t.is(point.items.length, 4)
  t.is(point.items[0].name, 'datadef')
  t.is(point.items[1].name, 'Point')
  t.is(point.items[2].value, 3)
  t.is(point.items[3].value, 4)
})

test('the type checker checks the type', (t) => {
  let { stack } = execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point.new point?
    42 point?
  `)
  t.is(stack.count, 2)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, true)
})

test('the datadef getters get fields of a struct', (t) => {
  let { stack } = execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point.new
    point.x
  `)
  t.is(stack.count, 1)
  const x = stack.pop()
  t.true(x instanceof types.Int)
  t.is(x.value, 3)
})

test('the datadef setters set fields of a struct', (t) => {
  let { stack } = execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point.new
    42 point-y-set point.y
  `)
  t.is(stack.count, 1)
  const y = stack.pop()
  t.true(y instanceof types.Int)
  t.is(y.value, 42)
})

test('the datadef updaters update fields of a struct', (t) => {
  let { stack } = execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point.new
    { 2 * } point-x-do point.x
  `)
  t.is(stack.count, 1)
  const y = stack.pop()
  t.true(y instanceof types.Int)
  t.is(y.value, 6)
})

test('datadef can define union types with a union typecheck', (t) => {
  let { stack } = execute(`
    Point: [
      Euclid: (x :Num, y :Num)
      Polar: (theta :Num, magnitude :Num)
    ] datadef
    1 2 euclid.new
    point?
    45 2 polar.new
    point?
  `)
  t.is(stack.count, 2)
  t.is(stack.pop().value, true, 'polar shoud be a point')
  t.is(stack.pop().value, true, 'euclid should be a point')
})

test('types defined by datadef can be used for params and are checked', (t) => {
  const { stack } = execute(`
    Point: (x :Num, y :Num) datadef
    test: (x :Point -> :Point) {
      x point.x 1 +
      x point.y 1 +
      point.new
    } fun
    1 2 point.new
    test
    point?
  `)
  t.is(stack.pop().value, true)

  t.throws(() => {
    execute(`
      Point: (x :Num, y :Num) datadef
      test: (x :Point -> :Point) { 3 } fun
      1 2 point.new test
    `)
  }, checkErrorMessage('Expected return value 1 to be of type :Point but got incompatible type :Int'))

  t.throws(() => {
    execute(`
      Point: (x :Num, y :Num) datadef
      test: (x :Point -> :Point) { 3 } fun
      42 test
    `)
  }, checkErrorMessage('Expected :Point but got incompatible type :Int for parameter x'))
})
