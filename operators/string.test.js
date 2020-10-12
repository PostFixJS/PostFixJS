import test from 'ava'
const types = require('../types')
const { execute, throwsErrorMessage, checkErrorMessage } = require('../test/helpers/util')

test('trim should trim a string', async (t) => {
  const { stack } = await execute('"  test " trim')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'test')
})

test('lower-case should transform a string to lower-case', async (t) => {
  const { stack } = await execute('"HELLO WoRlD!" lower-case')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'hello world!')
})

test('upper-case should transform a string to upper-case', async (t) => {
  const { stack } = await execute('"hello world!" upper-case')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'HELLO WORLD!')
})

test('str->chars should transform a string to an array of characters', async (t) => {
  const { stack } = await execute('"test string" str->chars')
  t.is(stack.count, 1)
  const chars = stack.pop()
  t.true(chars instanceof types.Arr)
  t.deepEqual(
    chars.items.map((str) => str.value),
    'test string'.split('').map((str) => str.charCodeAt(0))
  )
})

test('chars->str should join an array of characters to a string', async (t) => {
  const { stack } = await execute('[84, 101, 115, 116] chars->str')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'Test')
})

test('char->str should convert a single character to a string', async (t) => {
  const { stack } = await execute('65 char->str')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'A')
})

test('split splits a string with a regex', async (t) => {
  const { stack } = await execute('"this is    a   test" "\\s+" split')
  t.is(stack.count, 1)
  const parts = stack.pop()
  t.true(parts instanceof types.Arr)
  t.deepEqual(
    parts.items.map((str) => str.value),
    ['this', 'is', 'a', 'test']
  )
})

test('replace-first should replace the first match of a regex', async (t) => {
  const { stack } = await execute('"test" "[te]" "r" replace-first')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'rest')
})

test('replace-all should replace all matches of a regex', async (t) => {
  const { stack } = await execute('"test" "[^s]" "r" replace-all')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'rrsr')
})

test('format formats a string, just like C\'s vsprintf', async (t) => {
  const { stack } = await execute('"answer to everything = %d" [42] format')
  t.is(stack.count, 1)
  t.is(stack.pop().value, 'answer to everything = 42')
})

test('using certain invalid placeholders in format strings does not crash the interpreter', async (t) => {
  await throwsErrorMessage(t, () => execute('"t%:t" [4] format'),
    checkErrorMessage('Invalid format string: "t%:t" - [sprintf] unexpected placeholder'))
})

test('parameter mismatch in format string does not crash the interpreter', async (t) => {
  await throwsErrorMessage(t, () => execute('"%d%s" ["test" 4] format'),
    checkErrorMessage('Parameters [STRING,INTEGER] do not match format string: "%d%s"' +
      ' - [sprintf] expecting number but found string'))
})

test('using the %v placeholder from the sprintf-js module does not crash the interpreter', async (t) => {
  await throwsErrorMessage(t, () => execute('"%v" { } format'),
    checkErrorMessage('The parameter for the placeholder %v was empty'))
  await throwsErrorMessage(t, () => execute('"t%2$v" { } format'),
    checkErrorMessage('The parameter for the placeholder %v was empty'))
})

test('replacement fields are forbidden as they can be abused to access javascript objects', async (t) => {
  await throwsErrorMessage(t, () => execute('"%(test)s" { "alert(\'FlX\');" } format'),
    checkErrorMessage('Replacement fields, such as "%(test)s", are not allowed'))
})