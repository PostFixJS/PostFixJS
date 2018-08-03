const Lexer = require('./Lexer')

class DocParser {
  static * getFunctions (code) {
    const tokens = Lexer.parse(code, { emitComments: true })
    for (let i = 0; i < tokens.length; i++) {
      const fn = getFunctionAt(tokens, i)
      if (fn !== false) {
        yield fn.fn
        i = fn.i
      }
    }
  }
}

function getFunctionAt (tokens, i) {
  const fn = {}
  let doc
  if (tokens[i].tokenType === 'BLOCK_COMMENT') {
    doc = parseDocComment(tokens[i].token)
    fn.description = doc.description
    i++
  } else {
    doc = { params: {}, returns: [] }
    fn.description = undefined
  }

  if (tokens[i].tokenType === 'SYMBOL') {
    const token = tokens[i].token
    fn.name = token.indexOf(':') === 0
      ? token.substr(1)
      : token.substr(0, token.length - 1)
  }
  i++
  const params = readParamsList(tokens, i)
  if (params) {
    i = params.i
    const paramsAndReturns = parseParamsList(params.params)
    fn.params = paramsAndReturns.params.map((param) => ({
      ...param,
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

function readParamsList (tokens, i) {
  if (tokens[i] && tokens[i].tokenType === 'PARAM_LIST_START') {
    const params = []
    while (i < tokens.length && tokens[i - 1].tokenType !== 'PARAM_LIST_END') {
      params.push(tokens[i])
      i++
    }
    return {params, i}
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

function parseParamsList (paramsList) {
  const arrowRightPosition = paramsList.findIndex((token) => token.tokenType === 'RIGHT_ARROW')

  const params = []
  for (let i = 1; i < arrowRightPosition; i++) {
    const value = paramsList[i].token
    if (value[0] === ':' || value[value.length - 1] === ':') {
      // this is a symbol
      params[params.length - 1].type = value
    } else {
      // this is a parameter name
      params.push({ name: value, type: undefined })
    }
  }

  const returns = arrowRightPosition >= 0 ? paramsList.slice(arrowRightPosition + 1, -1).map((token) => token.token) : []
  return { params, returns }
}

function parseDocComment (comment) {
  const lines = comment.substring(2, comment.length - 2).trim().split('\n')
  const firstParam = lines.findIndex((line) => line.trim()[0] === '@')
  const tags = (firstParam >= 0 ? lines.slice(firstParam) : [])
    .filter((line) => line[0] === '@')
    .map((line) => {
      const match = line.match(/^(@.+?)\s+(.+?)$/)
      return { tag: match[1], value: match[2] }
    })

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
