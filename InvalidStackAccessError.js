/**
 * Error that is thrown on stack underflows or when accessing the
 * stack outside of a lambda function's range.
 */
class InvalidStackAccessError extends Error {
}

module.exports = InvalidStackAccessError
