import test from 'ava'
const types = require('../types')
const { execute, checkErrorMessage, throwsErrorMessage } = require('../test/helpers/util')

test('datadef generates a constructor function', async (t) => {
  let { dictStack } = await execute('Point: (x :Num, y :Num) datadef')
  const constructor = dictStack.get('point')
  t.true(constructor instanceof types.Lam)
})

test('the datadef constructor constructs a struct', async (t) => {
  let { stack } = await execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point
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

test('the type checker checks the type', async (t) => {
  let { stack } = await execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point point?
    42 point?
  `)
  t.is(stack.count, 2)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, true)
})

test('the datadef getters get fields of a struct', async (t) => {
  let { stack } = await execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point
    point-x
  `)
  t.is(stack.count, 1)
  const x = stack.pop()
  t.true(x instanceof types.Int)
  t.is(x.value, 3)
})

test('the datadef setters set fields of a struct', async (t) => {
  let { stack } = await execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point
    42 point-y-set point-y
  `)
  t.is(stack.count, 1)
  const y = stack.pop()
  t.true(y instanceof types.Int)
  t.is(y.value, 42)
})

test('the datadef updaters update fields of a struct', async (t) => {
  let { stack } = await execute(`
    Point: (x :Num, y :Num) datadef
    3 4 point
    { 2 * } point-x-do point-x
  `)
  t.is(stack.count, 1)
  const y = stack.pop()
  t.true(y instanceof types.Int)
  t.is(y.value, 6)
})

test('datadef can define union types with a union typecheck', async (t) => {
  let { stack } = await execute(`
    Point: [
      Euclid: (x :Num, y :Num)
      Polar: (theta :Num, magnitude :Num)
    ] datadef
    1 2 euclid
    point?
    45 2 polar
    point?
    1 2 euclid
    euclid?
    45 2 polar
    polar?
    1 2 euclid
    polar?
    45 2 polar
    euclid?
  `)
  t.is(stack.count, 6)
  t.is(stack.pop().value, false, 'polar shoud not be euclid')
  t.is(stack.pop().value, false, 'euclid should not be polar')
  t.is(stack.pop().value, true, 'polar shoud be a polar')
  t.is(stack.pop().value, true, 'euclid should be a euclid')
  t.is(stack.pop().value, true, 'polar shoud be a point')
  t.is(stack.pop().value, true, 'euclid should be a point')
})

test('datadef can define union types with :ExeArr syntax', async (t) => {
  let { stack, dictStack } = await execute(`
    Point: {
      Euclid: (x :Num, y :Num)
      Polar: (theta :Num, magnitude :Num)
    } datadef

    1 2 euclid point?
  `)
  t.is(stack.count, 1)
  t.is(stack.pop().value, true)
  const constructor = dictStack.get('point?')
  t.true(constructor instanceof types.Lam)
})

test('types defined by datadef can be used for params and are checked', async (t) => {
  const { stack } = await execute(`
    Point: (x :Num, y :Num) datadef
    test: (x :Point -> :Point) {
      x point-x 1 +
      x point-y 1 +
      point
    } fun
    1 2 point
    test point?
    "hello" point?
  `)
  t.is(stack.pop().value, false)
  t.is(stack.pop().value, true)

  await throwsErrorMessage(t, () => execute(`
    Point: (x :Num, y :Num) datadef
    test: (x :Point -> :Point) { 3 } fun
    1 2 point test
  `), checkErrorMessage('Expected return value 1 to be of type :Point but got incompatible type :Int'))

  await throwsErrorMessage(t, () => execute(`
    Point: (x :Num, y :Num) datadef
    test: (x :Point -> :Point) { 3 } fun
    42 test
  `), checkErrorMessage('Expected :Point but got incompatible type :Int for parameter x'))
})

test('datadef type declarations are optional and default to :Obj', async (t) => {
  await execute(`
    Point: (x y) datadef
    1 2 point p!
    p point-y 2 test=

    p 5 point-y-set p!
    p point-y 5 test=
  `, t)
})

test('It should be possible to use datadefs as type argument', async (t) => {
  await execute(`
    Point: (x y) datadef
    euclidian: (p :Point -> :Flt) {
      p point-x 2 pow p point-y 2 pow + sqrt
    } fun
    3 4 point euclidian 5 test=
  `, t)
})

test('Recursive types should work', async (t) => {
  // recursive type (child uses parent union)
  await execute(`
    List: {
      Null: ()
      Cons: (value :Obj, next :List)
    } datadef

    null list? true test=
    42 null cons list? true test=
  `, t)

  // recursive type (child uses other child)
  await execute(`
    A: {
      Null: ()
      B: (a :C)
      C: (x :Int)
    } datadef

    42 c b a? true test=
  `, t)
})
