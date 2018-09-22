import test from 'ava'
const Interpreter = require('../Interpreter')
const operatorDocs = require('./operators')

test('all built-ins should have documentation', async (t) => {
  const interpreter = new Interpreter()

  for (const builtIn of Object.keys(interpreter._builtIns)) {
    const functionDoc = operatorDocs.functions.filter(({ name }) => name === builtIn)
    const variableDoc = operatorDocs.variables.filter(({ name }) => name === builtIn)
    const count = functionDoc.length + variableDoc.length > 0
    t.true(count, `${builtIn} should be documented`)
  }
})

test('all documented functions and variables actually exist', async (t) => {
  const interpreter = new Interpreter()
  operatorDocs.functions.forEach(({ name }) => t.truthy(interpreter._builtIns[name], `${name} is documented but not a known built-in`))
  operatorDocs.variables.forEach(({ name }) => t.truthy(interpreter._builtIns[name], `${name} is documented but not a known built-in`))
})
