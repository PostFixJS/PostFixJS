const { vsprintf } = require('sprintf-js')
const types = require('../../types')

/**
 * Format a string using the given parameters.
 * @param {string} formatStr Format string
 * @param {Arr} params PostFix array of parameters
 * @param {token} token Originating token
 * @returns {string} Formatted string
 */
module.exports.format = (formatStr, params, token) => {
  if (verify(formatStr, params, token)) {
    try {
      return vsprintf(formatStr, params.items.map((obj) => {
        return obj instanceof types.Num
        || obj instanceof types.Str
          ? obj.value : obj.toString()
      }))
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new types.Err(`Invalid format string: "${formatStr}" - ${e.message}`, token)
      } else if (e instanceof TypeError && e.message === "Cannot read property 'valueOf' of undefined") {
        throw new types.Err(`The parameter for the placeholder %v was empty`, token) // %v is currently disabled
      } else if (e instanceof TypeError && e.message === "arg.toPrecision is not a function") {
        throw new types.Err(`Did not get a number for a placeholder which expects a number`, token)
      } else if (e instanceof TypeError && e.message.includes("[sprintf] expecting")) {
        throw new types.Err('Parameters [' + params.items.map(item => item.origin.tokenType).toString()
          + `] do not match format string: "${formatStr}" - ${e.message}`, token)
      } else if (e instanceof TypeError && e.message.includes("[sprintf]")) {
        throw new types.Err(e.message, token)
      } else {
        throw e
      }
    }
  }
}

function verify (formatStr, params, token) {
  // TODO: This is a hotfix. The actual bug is in the module sprintf-js. Update as soon as my PR has been accepted
  const placeholders = [...formatStr
    .matchAll(/\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/g)]
  if (params.items.some(item => item instanceof Function))
    throw new types.Err(`Malicious code execution has been prevented`, token)
  if (placeholders.some(match => match[8] === 'g' && Number(match[7]) === 0))
    throw new types.Err(`Precision for %g must be between 1 and 100`, token)
  // Can be abused for uncontrolled code execution
  if (placeholders.some(match => match.some(ph => ph != null && ph.includes('('))))
    throw new types.Err(`Replacement fields, such as "${formatStr}", are not allowed`, token)
  if (placeholders.some(match => match[8] === 'v'))
    throw new types.Err(`The usage of %v is temporarily restricted`, token)

  // Will only be reached if we did not trigger any security measures
  return true
}
