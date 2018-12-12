import test from 'ava'
const { execute, runPostFixTests, throwsErrorMessage, checkErrorMessage } = require('./test/helpers/util')
const types = require('./types')

test('Param list in ExeArrs should work as expected', async (t) => {
  const { stack } = await execute('{ ( n :Int ) } exec')
  t.is(stack.count, 1)
  t.true(stack.pop() instanceof types.Params)
})

test('Trying to get elements from an empty stack should throw an error', async (t) => {
  await throwsErrorMessage(t, async () => {
    await execute('42 pop pop')
  }, (e) => e instanceof types.Err && e.message === 'The stack is empty' && e.origin.line === 0 && e.origin.col === 7)
  await throwsErrorMessage(t, async () => {
    await execute('{ 42 pop pop } exec')
  }, (e) => e instanceof types.Err && e.message === 'The stack is empty' && e.origin.line === 0 && e.origin.col === 9)
})

test('Trying to get elements from below the stack should throw an error', async (t) => {
  await throwsErrorMessage(t, async () => {
    await execute('42 1 copy')
  }, (e) => e instanceof types.Err && e.message === 'Stack access is out of range' && e.origin.line === 0 && e.origin.col === 5)
  await throwsErrorMessage(t, async () => {
    await execute('{ 42 1 copy } exec')
  }, (e) => e instanceof types.Err && e.message === 'Stack access is out of range' && e.origin.line === 0 && e.origin.col === 7)
})

test('Trying to access the foreign stack in a function with a parameter list should throw an error', async (t) => {
  await throwsErrorMessage(t, async () => {
    await execute('test: () { pop } fun 42 test')
  }, (e) => e instanceof types.Err && e.message === 'Stack underflow in function or lambda expression')
})

test('Variables defined while executing a function do not affect the lambda dict', async (t) => {
  const { stack } = await execute(`
    1 a!
    :foo { 2 x! } fun
    foo
    :foo vref
  `)
  const foo = stack.pop()
  t.true(foo instanceof types.Lam)
  t.truthy(foo.dict.a, 'a should be in the lambda dict')
  t.falsy(foo.dict.x, 'x should not be in the lambda dict')
})

test('The interpreter handles escape sequences properly', async (t) => {
  const { stack } = await execute(`[
    "\\""  length 1 =
    "\\\\" length 1 =
    "\\n"  length 1 =
    "\\r"  length 1 =
    "\\t"  length 1 =
  ]`)
  t.true(stack.pop().items.every((x) => x.value === true))
})

test('Reference counting should copy arrays before modification', async (t) => {
  const { stack } = await execute('[1 2] dup 3 append')
  t.deepEqual(stack.pop().items.map((i) => i.value), [1, 2, 3])
  t.deepEqual(stack.pop().items.map((i) => i.value), [1, 2])
})

test('Reference counting should copy deep arrays before modification', async (t) => {
  const { stack } = await execute('[ 1, 2, [ 1, 2, 3 ] ] dup [2 1] 42 path-set !=')
  t.is(stack.pop().value, true)
})

test('Reference counting should copy objects from the dict', async (t) => {
  const { stack } = await execute('[0] x! x 1 append x !=')
  t.is(stack.pop().value, true)
})

test('It should not be possible to use a number as variable name', async (t) => {
  await throwsErrorMessage(t, () => execute(`"hello" 1!`), checkErrorMessage('Invalid variable name "1"'))
  await throwsErrorMessage(t, () => execute(`42 "hello" !`), checkErrorMessage('Expected operand 1 to be :Sym but got :Int instead'))
})

test('BinTree example', async (t) => {
  await runPostFixTests(`
    BinTree: {
      Leaf: ()
      Node: (value :Num, left :BinTree, right :BinTree)
    } datadef

    tree-sum: (t :BinTree -> :Num) {
        { t leaf? } { 0 }
        { t node? } { 
            t node-value 
            t node-left tree-sum + 
            t node-right tree-sum +
        }
    } cond-fun
    
    1 leaf leaf node node1!
    4 leaf leaf node node4!
    3 leaf node4 node node3!
    5 node1 node3 node node5!

    node5 tree-sum 13 test=
  `, t)
})

test('The interpreter should support proper tail calls in if bodies', async (t) => {
  const { stack } = await execute(`
    factorial_tr: (acc :Int, n :Int) {
      n 1 > { acc n * n 1 - recur } { acc } if
    } fun
    factorial: (n :Int) { 1 n factorial_tr } fun
    6 factorial
  `, { maximumDictStackHeight: 2 })
  t.is(stack.count, 1)
  t.is(stack.pop().value, 720)
})

test('The interpreter should support proper tail calls in cond bodies', async (t) => {
  const { stack } = await execute(`
    factorial_tr: (acc :Int, n :Int) {
      { { n 1 > } { acc n * n 1 - recur }
       { true } { acc } } cond
    } fun
    factorial: (n :Int) { 1 n factorial_tr } fun
    6 factorial
  `, { maximumDictStackHeight: 2 })
  t.is(stack.count, 1)
  t.is(stack.pop().value, 720)
})

test('The interpreter should support proper tail calls in cond-fun bodies', async (t) => {
  const { stack } = await execute(`
    factorial_tr: (acc :Int, n :Int) {
      { n 1 > } { acc n * n 1 - recur }
      { true } { acc }
    } cond-fun
    factorial: (n :Int) { 1 n factorial_tr } fun
    6 factorial
  `, { maximumDictStackHeight: 2 })
  t.is(stack.count, 1)
  t.is(stack.pop().value, 720)
})

test('The interpreter should support proper tail calls when using exec', async (t) => {
  const { stack, dictStack } = await execute(`
  factorial_tr: (acc :Int, n :Int) {
    { { n 1 > } { acc n * n 1 - recur: vref exec }
     { true } { acc } } cond
  } fun
  factorial: (n :Int) { 1 n factorial_tr: vref exec } fun
  6 factorial: vref exec
  `, { maximumDictStackHeight: 2 })
  t.is(stack.count, 1)
  t.is(stack.pop().value, 720)
  t.is(dictStack.count, 1)
})

test('Proper tail calls can be disabled', async (t) => {
  await throwsErrorMessage(t, () => execute(`
    factorial_tr: (acc :Int, n :Int) {
      { n 1 > } { acc n * n 1 - recur }
      { true } { acc }
    } cond-fun
    factorial: (n :Int) { 1 n factorial_tr } fun
    6 factorial
  `, {
    maximumDictStackHeight: 2,
    interpreterOptions: { enableProperTailCalls: false }
  }),
  checkErrorMessage('Exceeded the expected maximum dict stack height of 2'))
})

test('Explicit tail calls should still work if proper tail calls are disabled', async (t) => {
  await t.notThrowsAsync(() => execute(`
    factorial_tr: (acc :Int, n :Int) {
      { n 1 > } { acc n * n 1 - :recur tailcall }
      { true } { acc }
    } cond-fun
    factorial: (n :Int) { 1 n :factorial_tr tailcall } fun
    6 factorial
  `, {
    maximumDictStackHeight: 2,
    interpreterOptions: { enableProperTailCalls: false }
  }))
})

test('Numbers support E-notation', async (t) => {
  await runPostFixTests(`
    2e5 200000 test=
    2e-2 0.02 test=
  `, t)
})
