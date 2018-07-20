const types = require('../types')

function getValues (interpreter, token) {
    const b = interpreter._stack.pop()
    const a = interpreter._stack.pop()

    if (a instanceof types.Num && b instanceof types.Num) {
        return { a: a.value, b: b.value }
        interpreter._stack.push(new types.Bool(a.value < b.value))
    } else if (a instanceof types.Str && b instanceof types.Str) {
        return { a: a.value.localeCompare(b.value), b: 0 }
    } else {
        throw new types.Err(`Can only compare :Str with :Str or :Num with :Num but got ${a.getTypeName()} and ${b.getTypeName()}`, token)
    }
}

module.exports.lessThan = {
    name: '<',
    execute: (interpreter, token) => {
        const { a, b } = getValues(interpreter, token)
        interpreter._stack.push(new types.Bool(a < b))
    }
}

module.exports.lessThanOrEqual = {
    name: '<=',
    execute: (interpreter, token) => {
        const { a, b } = getValues(interpreter, token)
        interpreter._stack.push(new types.Bool(a <= b))
    }
}

module.exports.greaterThan = {
    name: '>',
    execute: (interpreter, token) => {
        const { a, b } = getValues(interpreter, token)
        interpreter._stack.push(new types.Bool(a > b))
    }
}

module.exports.greaterThanOrEqual = {
    name: '>=',
    execute: (interpreter, token) => {
        const { a, b } = getValues(interpreter, token)
        interpreter._stack.push(new types.Bool(a >= b))
    }
}
