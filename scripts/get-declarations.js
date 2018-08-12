const getStdin = require('get-stdin')
const DocParser = require('../DocParser')

getStdin().then((code) => {
  const functions = DocParser.getFunctions(code)
  const variables = DocParser.getVariables(code)
  if (process.stdout.isTTY) {
    console.log(JSON.stringify({ functions, variables }, null, 2))
  } else {
    console.log(JSON.stringify({ functions, variables }))
  }
})
