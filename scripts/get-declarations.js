/**
 * @fileoverview This is a small script that gets all function and variable definitions in the code provided as stdin and prints the definitions as JSON on stdout. When called via a console (i.e. TTY), the output is pretty-printed.
 */

const getStdin = require('get-stdin')
const DocParser = require('../DocParser')

getStdin().then((code) => {
  const functions = DocParser.getFunctions(code, { withRanges: false })
  const variables = DocParser.getVariables(code)
  if (process.stdout.isTTY) {
    console.log(JSON.stringify({ functions, variables }, null, 2))
  } else {
    console.log(JSON.stringify({ functions, variables }))
  }
})
