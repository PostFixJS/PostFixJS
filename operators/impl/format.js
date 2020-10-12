const { vsprintf } = require('sprintf-js')
const types = require('../../types')

/**
 * Format a string using the given parameters.
 * @param {string} formatStr Format string
 * @param {Arr} params PostFix array of parameters
 * @returns {string} Formatted string
 */
module.exports.format = (formatStr, params) => vsprintf(formatStr, params.items.map((obj) => {
  return obj instanceof types.Num
      || obj instanceof types.Str
       ? obj.value : obj.toString()
}))
