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
  for (let i = 1; i < rightArrowPosition; i++) {
    const value = paramsList[i].token
    if (value[0] === ':' || value[value.length - 1] === ':') {
      // this is a symbol
      params[params.length - 1].type = value
    } else {
      // this is a parameter name
      params.push({ name: value, type: undefined })
    }
  }

  const returns = rightArrowPosition >= 0 ? paramsList.slice(rightArrowPosition + 1, -1).map((token) => token.token) : []
  return { params, returns }
}

module.exports = {
  readParamsList,
  parseParamsList
}
