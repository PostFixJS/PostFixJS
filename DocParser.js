const Lexer = require('./Lexer')
const { parseParamsList, readParamsList, readArray, readExecutableArray, normalizeSymbol } = require('./tokenUtils')

/**
 * A parser for documentation.
 */
class DocParser {
  /**
   * Get all function signatures and related documentation from the given code.
   * @param {string} code PostFix code
   * @param {object} options Options
   * @param {bool} options.withRanges True to include body ranges of the functions
   * @return {object[]} Function signatures with descriptions
   */
  static getFunctions (code, options = { withRanges: false }) {
    const functions = []
    const tokens = Lexer.parse(code, { emitComments: true })

    for (let i = 0; i < tokens.length; i++) {
      const fn = getFunctionAt(tokens, i, options)
      if (fn !== false) {
        functions.push(fn.fn)
        i = fn.i
      }
    }

    return functions
  }

  /**
   * Get all variable declarations and related documentation from the given code.
   * @param {string} code PostFix code
   * @return {object[]} Variable names with descriptions
   */
  static getVariables (code) {
    const variables = {}
    const tokens = Lexer.parse(code, { emitComments: true })

    for (let i = 0; i < tokens.length; i++) {
      const variable = getVariableAt(tokens, i)
      if (variable !== false) {
        if (!variables[variable.variable.name]) {
          variables[variable.variable.name] = variable.variable
        }
        i = variable.i
      }
    }

    return Object.values(variables)
  }

  /**
   * Get all datadefs and related documentation from the given code.
   * @param {string} code PostFix code
   * @return {object[]} Datadef definitions with descriptions
   */
  static getDatadefs (code) {
    const datadefs = []
    const tokens = Lexer.parse(code, { emitComments: true })

    for (let i = 0; i < tokens.length; i++) {
      const datadef = getDatadefAt(tokens, i)
      if (datadef !== false) {
        if (datadef.datadef.type === 'union') {
          datadefs.push({
            name: datadef.datadef.name,
            description: datadef.datadef.description,
            type: 'union',
            types: datadef.datadef.types.map((type) => type.name),
            tags: datadef.datadef.tags
          })
          for (const element of datadef.datadef.types) {
            datadefs.push(element)
          }
        } else {
          datadefs.push(datadef.datadef)
        }
        i = datadef.i
      }
    }

    return datadefs
  }

  /**
   * Get all symbols and related documentation from the given code. Only the first occurence of a symbol is used.
   * @param {string} code PostFix code
   * @return {object[]} Symbols with descriptions
   */
  static getSymbols (code) {
    const foundSymbols = new Set()
    const symbols = []
    const tokens = Lexer.parse(code, { emitComments: true })

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].tokenType === 'SYMBOL') {
        const token = tokens[i]
        const symbolName = normalizeSymbol(token.token)
        if (!foundSymbols.has(symbolName)) {
          foundSymbols.add(symbolName)
          const docToken = tokens[i - 1]

          foundSymbols.add(token.token)
          const parsedComment = docToken != null && docToken.tokenType === 'BLOCK_COMMENT' && docToken.endLine === token.line - 1 ? parseDocComment(docToken.token) : null
          symbols.push({
            name: `:${symbolName}`,
            description: parsedComment ? parsedComment.description : undefined,
            tags: parsedComment ? parsedComment.tags : undefined
          })
        }
      }
    }

    return symbols
  }

  /**
   * Get all param lists from the given code.
   * @param {string} code PostFix code
   * @param {object} options Options
   * @param {bool} options.withRanges True to include body ranges of the param lists
   * @return {object[]} Param lists with descriptions
   */
  static getParamsLists (code, options = { withRanges: false }) {
    const paramLists = []
    const tokens = Lexer.parse(code)

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].tokenType === 'PARAM_LIST_START') {
        const range = readParamsList(tokens, i)
        if (range) {
          const paramsList = parseParamsList(tokens.slice(range.firstToken, range.lastToken + 1))
          if (options.withRanges) {
            paramsList.source = {
              start: { col: tokens[range.firstToken].col, line: tokens[range.firstToken].line },
              end: { col: tokens[range.lastToken].col, line: tokens[range.lastToken].line }
            }
          }
          paramLists.push(paramsList)
        }
      }
    }

    return paramLists
  }
}

/**
 * Get the function at the given token index.
 * @param {object[]} tokens Tokens
 * @param {number} i Starting index
 * @param {object} options Options
 * @param {bool} options.withRanges True to include body ranges of the functions
 * @returns {object} Function and index of the first token after the function, or false if no function was found
 */
function getFunctionAt (tokens, i, options = { withRanges: false }) {
  const fn = {}
  if (options.withRanges) {
    fn.source = {}
  }

  let doc
  let docToken
  if (tokens[i] && tokens[i].tokenType === 'BLOCK_COMMENT') {
    docToken = tokens[i]
    doc = parseDocComment(tokens[i].token)
    fn.description = doc.description
    fn.tags = doc.tags
    i++
  } else {
    doc = { params: {}, returns: [] }
    fn.description = undefined
    fn.tags = undefined
  }

  if (tokens[i] && tokens[i].tokenType === 'SYMBOL') {
    const token = tokens[i]
    fn.name = normalizeSymbol(token.token)

    if (docToken != null && docToken.endLine !== token.line - 1) {
      // ignore doc comments that are not in the line over the function symbol
      fn.description = undefined
      fn.tags = undefined
      doc = { params: {}, returns: [] }
    }
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
    if (options.withRanges) {
      fn.source.params = {
        start: { line: tokens[params.firstToken].line, col: tokens[params.firstToken].col },
        end: { line: tokens[params.lastToken].line, col: tokens[params.lastToken].col }
      }
    }
  } else {
    fn.params = []
    fn.returns = []
    if (options.withRanges) {
      fn.source.params = undefined
    }
  }
  if (i !== false && i < tokens.length) {
    if (options.withRanges) {
      fn.source.body = { start: { line: tokens[i].line, col: tokens[i].col } }
    }
    i = skipElement(tokens, i) // skip the executable array
  }
  if (i !== false && i < tokens.length && tokens[i].tokenType === 'REFERENCE' && (tokens[i].token === 'fun' || tokens[i].token === 'cond-fun')) {
    if (options.withRanges) {
      fn.source.body.end = { line: tokens[i - 1].line, col: tokens[i - 1].col }
    }
    return { fn, i }
  }
  return false
}

/**
 * Get the variable definition at the given token index.
 * @param {object[]} tokens Tokens
 * @param {number} i Starting index
 * @returns {object} Variable and index of the first token after the variable declaration, or false if no variable was found
 */
function getVariableAt (tokens, i) {
  const variable = {}
  let docToken
  if (tokens[i] && tokens[i].tokenType === 'BLOCK_COMMENT') {
    docToken = tokens[i]
    const { description, tags } = parseDocComment(tokens[i].token)
    variable.description = description
    variable.tags = tags
    i++
  } else {
    variable.description = undefined
    variable.tags = undefined
  }

  if (tokens[i] && tokens[i].tokenType === 'SYMBOL') {
    // :variableName value !
    const token = tokens[i]
    variable.name = normalizeSymbol(token.token)
    i++

    if (docToken != null && docToken.endLine !== token.line - 1) {
      // ignore doc comments that are not in the line over the function symbol
      variable.description = undefined
      variable.tags = undefined
    }

    if (i < tokens.length && tokens[i].tokenType === 'DEFINITION') {
      // maybe the value is a symbol, e.g. :foo bar!
      i--
    } else {
      i = skipElement(tokens, i)
      if (i === false) return false
      if (tokens[i].token === '!') {
        return { variable, i }
      }
      return false
    }
  }

  // value variableName!
  if (docToken != null && tokens[i] && docToken.endLine !== tokens[i].line - 1) {
    // ignore doc comments that are not in the line over the function symbol
    variable.description = undefined
    variable.tags = undefined
  }
  i = skipElement(tokens, i)
  if (i === false) return false
  if (tokens[i].tokenType === 'DEFINITION') {
    variable.name = tokens[i].token.substr(0, tokens[i].token.length - 1)
    return { variable, i }
  }

  return false
}

/**
 * Get the data definition at the given token index.
 * @param {object[]} tokens Tokens
 * @param {number} i Starting index
 * @returns {object} Function and index of the first token after the datadef, or false if no datadef was found
 */
function getDatadefAt (tokens, i) {
  const datadef = {}
  let docToken
  if (tokens[i] && tokens[i].tokenType === 'BLOCK_COMMENT') {
    docToken = tokens[i]
    const { description, tags } = parseDocComment(tokens[i].token)
    datadef.description = description
    datadef.tags = tags
    i++
  } else {
    datadef.description = undefined
    datadef.tags = undefined
  }

  if (tokens[i] && tokens[i].tokenType === 'SYMBOL') {
    if (docToken != null && docToken.endLine !== tokens[i].line - 1) {
      // ignore doc comments that are not in the line over the function symbol
      datadef.description = undefined
      datadef.tags = undefined
    }

    const token = tokens[i].token
    datadef.name = normalizeSymbol(token, true)
    i++
    if (i >= tokens.length) return false

    if (tokens[i].tokenType === 'PARAM_LIST_START') {
      // struct
      const params = readParamsList(tokens, i)
      if (params) {
        i = params.lastToken + 1
        if (tokens[i] && tokens[i].tokenType === 'REFERENCE' && tokens[i].token === 'datadef') {
          const struct = parseParamsList(tokens.slice(params.firstToken, params.lastToken + 1))
          datadef.type = 'struct'
          datadef.fields = struct.params.map((param) => {
            const parsedDocs = param.doc && parseDocComment(param.doc)
            return {
              name: param.name,
              type: param.type,
              description: parsedDocs ? parsedDocs.description : undefined,
              tags: parsedDocs ? parsedDocs.tags : undefined
            }
          })
          return { datadef, i }
        }
      }
    } else if (tokens[i].tokenType === 'ARR_START' || tokens[i].tokenType === 'EXEARR_START') {
      // union
      const union = tokens[i].tokenType === 'ARR_START' ? readArray(tokens, i) : readExecutableArray(tokens, i)
      if (union) {
        i = union.lastToken + 1
        if (tokens[i] && tokens[i].tokenType === 'REFERENCE' && tokens[i].token === 'datadef') {
          datadef.type = 'union'
          datadef.types = []

          let next = { description: undefined, tags: undefined }
          let nextDescriptionToken
          for (let i = union.firstToken + 1; i < union.lastToken; i++) {
            if (tokens[i].tokenType === 'BLOCK_COMMENT') {
              nextDescriptionToken = tokens[i]
              const { description, tags } = parseDocComment(tokens[i].token)
              next.description = description
              next.tags = tags
            } else if (tokens[i].tokenType === 'SYMBOL') {
              next.name = normalizeSymbol(tokens[i].token, true)
              i++

              const params = readParamsList(tokens, i)
              if (params) {
                const struct = parseParamsList(tokens.slice(params.firstToken, params.lastToken + 1))
                next.type = 'struct'
                next.fields = struct.params.map((param) => {
                  const parsedDocs = param.doc && parseDocComment(param.doc)
                  return {
                    name: param.name,
                    type: param.type,
                    description: parsedDocs ? parsedDocs.description : undefined,
                    tags: parsedDocs ? parsedDocs.tags : undefined
                  }
                })

                if (nextDescriptionToken != null && nextDescriptionToken.endLine !== tokens[i].line - 1) {
                  // ignore doc comments that are not in the line over the function symbol
                  next.description = undefined
                  next.tags = undefined
                }

                datadef.types.push(next)
                next = { description: undefined, tags: undefined }
                i = params.lastToken // + 1 is done by the for loop
              }
            }
          }

          return { datadef, i: union.lastToken + 1 }
        }
      }
    }
  }

  return false
}

/**
 * Skip the element at the given token index. If it is an array, executable array or param list, the entire array or list is skipped.
 * @param {Token[]} tokens Tokens
 * @param {number} i Starting index
 * @returns {number} The index of the token after the skipped element or false if out of range
 */
function skipElement (tokens, i) {
  if (i >= tokens.length) {
    return false
  }
  const openToken = tokens[i].tokenType
  let closeToken
  switch (tokens[i].tokenType) {
    case 'PARAM_LIST_START':
      closeToken = 'PARAM_LIST_END'
      break
    case 'ARR_START':
      closeToken = 'ARR_END'
      break
    case 'EXEARR_START':
      closeToken = 'EXEARR_END'
      break
    default:
      return i < tokens.length - 1 ? i + 1 : false
  }

  let depth = 1
  i++
  for (; i < tokens.length; i++) {
    if (tokens[i].tokenType === openToken) {
      depth++
    } else if (tokens[i].tokenType === closeToken) {
      depth--
    }
    if (depth === 0) {
      return i < tokens.length - 1 ? i + 1 : false
    }
  }
  return false
}

/**
 * Parse a Javadoc-style documentation comment. It supports return and param tags.
 * @param {string} comment Raw documentation comment, including <# and #>
 * @returns {object} Parsed comment with params, returns and description
 */
function parseDocComment (comment) {
  const lines = comment.substring(2, comment.length - 2).trim().split('\n')
  const firstTag = lines.findIndex((line) => line.trim()[0] === '@')
  const tags = (firstTag >= 0 ? lines.slice(firstTag) : [])
    .reduce((tags, line) => {
      const match = line.match(/^(@.+?)(\s+(.+?))?$/)
      if (match) {
        if (match[3]) {
          return [...tags, { tag: match[1], value: [match[3]] }]
        } else {
          return [...tags, { tag: match[1], value: [] }]
        }
      } else if (tags.length > 0) {
        if (tags[tags.length - 1].value == null) {
          tags[tags.length - 1].value = [line]
        } else {
          tags[tags.length - 1].value.push(line)
        }
      }
      return tags
    }, [])
    .filter((tag) => tag.value != null && tag.value.length > 0)
    .map((tag) => {
      let lastNonEmptyLine = tag.value.length - 1
      while (lastNonEmptyLine >= 0 && tag.value[lastNonEmptyLine].trim().length === 0) {
        lastNonEmptyLine--
      }
      tag.value = tag.value.slice(0, lastNonEmptyLine + 1).join('\n')
      return tag
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
    description: (firstTag >= 0 ? lines.slice(0, firstTag) : lines).join('\n') || undefined,
    params,
    returns,
    tags: tags
      .filter(({ tag }) => tag !== '@param' && tag !== '@return')
      .reduce((tags, { tag, value }) => {
        tag = tag.substr(1) // remove the @
        if (!tags[tag]) {
          tags[tag] = [value]
        } else {
          tags[tag].push(value)
        }
        return tags
      }, {})
  }
}

module.exports = DocParser
