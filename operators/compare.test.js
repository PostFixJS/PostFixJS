import test from 'ava'
const { execute, throwsErrorMessage, checkErrorMessage } = require('../test/helpers/util')

test('number number comparisons', async (t) => {
  t.is((await execute('1 2 <')).stack.pop().value, true)
  t.is((await execute('2 2 <')).stack.pop().value, false)

  t.is((await execute('1 2 <=')).stack.pop().value, true)
  t.is((await execute('2 2 <=')).stack.pop().value, true)
  t.is((await execute('3 2 <=')).stack.pop().value, false)

  t.is((await execute('2 1 >')).stack.pop().value, true)
  t.is((await execute('2 2 >')).stack.pop().value, false)

  t.is((await execute('3 2 >=')).stack.pop().value, true)
  t.is((await execute('2 2 >=')).stack.pop().value, true)
  t.is((await execute('1 2 >=')).stack.pop().value, false)

  t.is((await execute('2 2 =')).stack.pop().value, true)
  t.is((await execute('1 2 =')).stack.pop().value, false)

  t.is((await execute('2 2 !=')).stack.pop().value, false)
  t.is((await execute('1 2 !=')).stack.pop().value, true)

  t.is((await execute('2.5 2 0.4 ~=')).stack.pop().value, false)
  t.is((await execute('2.5 2 0.5 ~=')).stack.pop().value, true) // approxEqual is defined as <= tolerance
  t.is((await execute('2.5 2 0.6 ~=')).stack.pop().value, true)

  t.is((await execute('2.5 2 0.4 !~=')).stack.pop().value, true)
  t.is((await execute('2.5 2 0.5 !~=')).stack.pop().value, false) // notApproxEqual is defined as > tolerance
  t.is((await execute('2.5 2 0.6 !~=')).stack.pop().value, false)
})

test('string string comparisons', async (t) => {
  t.is((await execute('"ab"  "abc" <')).stack.pop().value, true)
  t.is((await execute('"abc" "abc" <')).stack.pop().value, false)
  t.is((await execute('"abc" "bbc" <')).stack.pop().value, true)

  t.is((await execute('"ab"  "abc" <=')).stack.pop().value, true)
  t.is((await execute('"abc" "abc" <=')).stack.pop().value, true)
  t.is((await execute('"bbc" "abc" <=')).stack.pop().value, false)

  t.is((await execute('"abc" "ab"  >')).stack.pop().value, true)
  t.is((await execute('"abc" "abc" >')).stack.pop().value, false)
  t.is((await execute('"bbc" "abc" >')).stack.pop().value, true)

  t.is((await execute('"ab"  "abc" >=')).stack.pop().value, false)
  t.is((await execute('"abc" "abc" >=')).stack.pop().value, true)
  t.is((await execute('"bbc" "abc" >=')).stack.pop().value, true)

  t.is((await execute('"abc" "abc" =')).stack.pop().value, true)
  t.is((await execute('"ab"  "abc" =')).stack.pop().value, false)
  t.is((await execute('"abc" "bbc" =')).stack.pop().value, false)

  t.is((await execute('"abc" "abc" !=')).stack.pop().value, false)
  t.is((await execute('"ab"  "abc" !=')).stack.pop().value, true)
  t.is((await execute('"abc" "bbc" !=')).stack.pop().value, true)

  t.is((await execute('"abc" "abc" 0 ~=')).stack.pop().value, true)
  t.is((await execute('"ab"  "abc" 1 ~=')).stack.pop().value, false)
  t.is((await execute('"abc" "bbc" 5 ~=')).stack.pop().value, false)

  t.is((await execute('"abc" "abc" 0 !~=')).stack.pop().value, false)
  t.is((await execute('"ab"  "abc" 1 !~=')).stack.pop().value, true)
  t.is((await execute('"abc" "bbc" 5 !~=')).stack.pop().value, true)
})

test('boolean boolean comparisons', async (t) => {
  t.is((await execute('true true   <')).stack.pop().value, false)
  t.is((await execute('false false <')).stack.pop().value, false)
  t.is((await execute('true false  <')).stack.pop().value, false)
  t.is((await execute('false true  <')).stack.pop().value, true)

  t.is((await execute('true true   <=')).stack.pop().value, true)
  t.is((await execute('false false <=')).stack.pop().value, true)
  t.is((await execute('true false  <=')).stack.pop().value, false)
  t.is((await execute('false true  <=')).stack.pop().value, true)

  t.is((await execute('true true   >')).stack.pop().value, false)
  t.is((await execute('false false >')).stack.pop().value, false)
  t.is((await execute('true false  >')).stack.pop().value, true)
  t.is((await execute('false true  >')).stack.pop().value, false)

  t.is((await execute('true true   >=')).stack.pop().value, true)
  t.is((await execute('false false >=')).stack.pop().value, true)
  t.is((await execute('true false  >=')).stack.pop().value, true)
  t.is((await execute('false true  >=')).stack.pop().value, false)

  t.is((await execute('true true   =')).stack.pop().value, true)
  t.is((await execute('false false =')).stack.pop().value, true)
  t.is((await execute('true false  =')).stack.pop().value, false)
  t.is((await execute('false true  =')).stack.pop().value, false)

  t.is((await execute('true true   !=')).stack.pop().value, false)
  t.is((await execute('false false !=')).stack.pop().value, false)
  t.is((await execute('true false  !=')).stack.pop().value, true)
  t.is((await execute('false true  !=')).stack.pop().value, true)

  t.is((await execute('true true   0 ~=')).stack.pop().value, true)
  t.is((await execute('false false 1 ~=')).stack.pop().value, true)
  t.is((await execute('true false  5 ~=')).stack.pop().value, false)
  t.is((await execute('false true 10 ~=')).stack.pop().value, false)

  t.is((await execute('true true   0 !~=')).stack.pop().value, false)
  t.is((await execute('false false 1 !~=')).stack.pop().value, false)
  t.is((await execute('true false  5 !~=')).stack.pop().value, true)
  t.is((await execute('false true 10 !~=')).stack.pop().value, true)
})

test('symbol symbol comparisons', async (t) => {
  t.is((await execute(':Ab  :Abc <')).stack.pop().value, true)
  t.is((await execute(':Abc :Abc <')).stack.pop().value, false)
  t.is((await execute(':Abc :Bbc <')).stack.pop().value, true)

  t.is((await execute(':Ab  :Abc <=')).stack.pop().value, true)
  t.is((await execute(':Abc :Abc <=')).stack.pop().value, true)
  t.is((await execute(':Bbc :Abc <=')).stack.pop().value, false)

  t.is((await execute(':Abc :Ab  >')).stack.pop().value, true)
  t.is((await execute(':Abc :Abc >')).stack.pop().value, false)
  t.is((await execute(':Bbc :Abc >')).stack.pop().value, true)

  t.is((await execute(':Ab  :Abc >=')).stack.pop().value, false)
  t.is((await execute(':Abc :Abc >=')).stack.pop().value, true)
  t.is((await execute(':Bbc :Abc >=')).stack.pop().value, true)

  t.is((await execute(':Abc :Abc =')).stack.pop().value, true)
  t.is((await execute(':Ab  :Abc =')).stack.pop().value, false)
  t.is((await execute(':Abc :Bbc =')).stack.pop().value, false)

  t.is((await execute(':Abc :Abc !=')).stack.pop().value, false)
  t.is((await execute(':Ab  :Abc !=')).stack.pop().value, true)
  t.is((await execute(':Abc :Bbc !=')).stack.pop().value, true)

  t.is((await execute(':Abc :Abc 0 ~=')).stack.pop().value, true)
  t.is((await execute(':Ab  :Abc 1 ~=')).stack.pop().value, false)
  t.is((await execute(':Abc :Bbc 5 ~=')).stack.pop().value, false)

  t.is((await execute(':Abc :Abc 0 !~=')).stack.pop().value, false)
  t.is((await execute(':Ab  :Abc 1 !~=')).stack.pop().value, true)
  t.is((await execute(':Abc :Bbc 5 !~=')).stack.pop().value, true)
})

test('nil nil comparisons', async (t) => {
  t.is((await execute('nil nil <')).stack.pop().value, false)
  t.is((await execute('nil nil <=')).stack.pop().value, true)
  t.is((await execute('nil nil >')).stack.pop().value, false)
  t.is((await execute('nil nil >=')).stack.pop().value, true)
  t.is((await execute('nil nil =')).stack.pop().value, true)
  t.is((await execute('nil nil !=')).stack.pop().value, false)
  t.is((await execute('nil nil 5 ~=')).stack.pop().value, true)
  t.is((await execute('nil nil 5 !~=')).stack.pop().value, false)
})

test('arrays should be comparable and have a well-defined order', async (t) => {
  // arrays of equal length behave as you would expect (compare item-by-item)
  // otherwise, the first min(a.length, b.length) items are compared; if they are
  // equal to each other, the shorter array is considered to be smaller

  t.is((await execute('[1 "x"] [2] <')).stack.pop().value, true)
  t.is((await execute('[2, "z"] [2, "a"] <')).stack.pop().value, false)

  t.is((await execute('[1] [2] <')).stack.pop().value, true)
  t.is((await execute('[1] [2] <=')).stack.pop().value, true)
  t.is((await execute('[1] [2] >')).stack.pop().value, false)
  t.is((await execute('[1] [2] >=')).stack.pop().value, false)

  t.is((await execute('[2, 3] [2] <')).stack.pop().value, false)
  t.is((await execute('[2, 3] [2] <=')).stack.pop().value, false)
  t.is((await execute('[2, 3] [2] >')).stack.pop().value, true)
  t.is((await execute('[2, 3] [2] >=')).stack.pop().value, true)

  t.is((await execute('[2, 3] [2] =')).stack.pop().value, false)
  t.is((await execute('[2, 3] [2, 3] =')).stack.pop().value, true)

  t.is((await execute('[1 2] [1.2 1.7] 0.5 ~=')).stack.pop().value, true)
  t.is((await execute('[1 2] [1.2 1.7] 0.1 ~=')).stack.pop().value, false)

  await throwsErrorMessage(t, () => execute('[1] ["2"] <'), checkErrorMessage('Cannot compare :Int and :Str at index 0'))
})
