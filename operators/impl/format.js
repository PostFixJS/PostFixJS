const { vsprintf } = require('sprintf-js')
const types = require('../../types')

/**
 * Format a string using the given parameters.
 * @param {string} formatStr Format string
 * @param {Arr} params PostFix array of parameters
 * @returns {string} Formatted string
 */
module.exports.format = (formatStr, params) => vsprintf(formatStr, params.items.map((obj) => {
  if (obj instanceof types.Num) {
    return obj.value
  } else if (obj instanceof types.Str) {
    return obj.value
  } else {
    return obj.toString()
  }
}))
