/**
 * Get the tokens of a parameter list from an array of tokens.
 * @param {object[]} tokens Array of tokens
 * @param {number} i Index of a PARAM_LIST_START token
 * @returns {object|bool} Index of the first and last token (inclusive) of the parameter list or false if no parameter list is found
 */
function readParamsList (tokens, i) {
  if (tokens[i] && tokens[i].tokenType === 'PARAM_LIST_START') {
    const firstToken = i
    while (i < tokens.length && tokens[i - 1].tokenType !== 'PARAM_LIST_END') {
      i++
    }
    return {
      firstToken,
      lastToken: i - 1
    }
  }
  return false
}

/**
 * Parse the given tokens into lists of parameters and return values.
 * @param {object[]} paramsList Tokens of the parameter list, including the brackets
 * @returns {object} Parameters and return values, with names and types
 */
function parseParamsList (paramsList) {
  let rightArrowPosition = paramsList.findIndex((token) => token.tokenType === 'RIGHT_ARROW')
  if (rightArrowPosition < 0) {
    rightArrowPosition = paramsList.length - 1
  }

  const params = []
  let lastComment = null
  for (let i = 1; i < rightArrowPosition; i++) {
    const value = paramsList[i].token
    if (value[0] === ':' || value[value.length - 1] === ':') {
      if (params.length > 0) {
        // this is a symbol
        params[params.length - 1].type = normalizeSymbol(value, true)
      }
    } else if (isCommentToken(paramsList[i])) {
      // this is a comment
      if (paramsList[i].tokenType === 'BLOCK_COMMENT') {
        lastComment = paramsList[i]
      }
    } else {
      // this is a parameter name
      params.push({
        name: value,
        type: undefined,
        doc: lastComment != null && lastComment.endLine === paramsList[i].line - 1 ? lastComment.token : undefined
      })
      lastComment = undefined
    }
  }

  const returns = rightArrowPosition >= 0 ? paramsList.slice(rightArrowPosition + 1, -1).map((token) => token.token) : []
  return { params, returns }
}

/**
 * Get the tokens of an array from an array of tokens.
 * @param {object[]} tokens Array of tokens
 * @param {number} i Index of a ARR_START token
 * @returns {object|bool} Index of the first and last token (inclusive) of the array or false if no array is found
 */
function readArray (tokens, i) {
  let depth = 0
  if (tokens[i] && tokens[i].tokenType === 'ARR_START') {
    const firstToken = i
    while (i < tokens.length) {
      if (tokens[i].tokenType === 'ARR_START') {
        depth++
      } else if (tokens[i].tokenType === 'ARR_END') {
        depth--
        if (depth === 0) {
          return {
            firstToken,
            lastToken: i
          }
        }
      }
      i++
    }
  }
  return false
}

/**
 * Check if the given token is a comment.
 * @param {object} token Token
 * @returns True if the token is a comment token, false otherwise
 */
function isCommentToken (token) {
  return token.tokenType === 'BLOCK_COMMENT' || token.tokenType === 'LINE_COMMENT'
}

/**
 * Normalize a symbol name.
 * @param {string} name Symbol name (with or without colon)
 * @param {boolean} withColon True to prefix the symbol with a colon, false to omit them
 * @returns Normalized symbol (with or without leading colon)
 */
function normalizeSymbol (name, withColon = false) {
  const cleanName = name.indexOf(':') === 0
    ? name.substr(1)
    : name.substr(0, name.length - 1)
  return withColon ? `:${cleanName}` : cleanName
}

module.exports = {
  readParamsList,
  parseParamsList,
  readArray,
  isCommentToken,
  normalizeSymbol
}
