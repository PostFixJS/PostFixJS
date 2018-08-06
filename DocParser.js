const Lexer = require('./Lexer')
const { parseParamsList, readParamsList } = require('./tokenUtils')

/**
 * A parser for documentation.
 */
class DocParser {
  /**
   * Get all function signatures and related documentation from the given code.
   * @param {string} code PostFix code
   * @return {object[]} Function signatures with descriptions
   */
  static getFunctions (code) {
    const functions = []
    const tokens = Lexer.parse(code, { emitComments: true })

    for (let i = 0; i < tokens.length; i++) {
      const fn = getFunctionAt(tokens, i)
      if (fn !== false) {
        functions.push(fn.fn)
        i = fn.i
      }
    }

    return functions
  }
}

function getFunctionAt (tokens, i) {
  const fn = {}
  let doc
  if (tokens[i] && tokens[i].tokenType === 'BLOCK_COMMENT') {
    doc = parseDocComment(tokens[i].token)
    fn.description = doc.description
    i++
  } else {
    doc = { params: {}, returns: [] }
    fn.description = undefined
  }

  if (tokens[i] && tokens[i].tokenType === 'SYMBOL') {
    const token = tokens[i].token
    fn.name = token.indexOf(':') === 0
      ? token.substr(1)
      : token.substr(0, token.length - 1)
  }
  i++
  const params = readParamsList(tokens, i)
  if (params) {
    i = params.lastToken + 1
    const paramsAndReturns = parseParamsList(tokens.slice(params.firstToken, params.lastToken + 1))
    fn.params = paramsAndReturns.params.map((param) => ({
      name: param.name,
      type: param.type,
      description: doc.params[param.name]
    }))
    fn.returns = paramsAndReturns.returns.map((type, i) => ({
      type,
      description: doc.returns.length > i ? doc.returns[i].description : undefined
    }))
  }
  i = skipExeArr(tokens, i)
  if (tokens[i] && tokens[i].tokenType === 'REFERENCE' && tokens[i].token === 'fun') {
    return { fn, i }
  }
  return false
}

function skipExeArr (tokens, i) {
  let arrs = 1
  i++
  for (; i < tokens.length; i++) {
    if (tokens[i].tokenType === 'EXEARR_START') {
      arrs++
    } else if (tokens[i].tokenType === 'EXEARR_END') {
      arrs--
    }
    if (arrs === 0) {
      return i + 1
    }
  }
  return false
}

function parseDocComment (comment) {
  const lines = comment.substring(2, comment.length - 2).trim().split('\n')
  const firstParam = lines.findIndex((line) => line.trim()[0] === '@')
  const tags = (firstParam >= 0 ? lines.slice(firstParam) : [])
    .filter((line) => line[0] === '@')
    .map((line) => {
      const match = line.match(/^(@.+?)\s+(.+?)$/)
      return match ? { tag: match[1], value: match[2] } : null
    })
    .filter((tag) => tag != null)

  const params = tags
    .filter(({ tag }) => tag === '@param')
    .map(({ value }) => {
      const match = value.match(/(.+?)\s+(.+?)$/)
      return match ? { name: match[1], description: match[2] } : null
    })
    .filter((param) => param != null)
    .reduce((params, { name, description }) => {
      params[name] = description
      return params
    }, {})

  const returns = tags
    .filter(({ tag }) => tag === '@return')
    .map(({ value }) => ({ description: value }))

  return {
    description: (firstParam >= 0 ? lines.slice(0, firstParam) : lines).join('\n') || undefined,
    params,
    returns
  }
}

module.exports = DocParser
