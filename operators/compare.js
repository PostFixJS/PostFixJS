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

function isEqual (a, b) {
    if (a instanceof types.Arr && b instanceof types.Arr) {
        if (a === b) {
            return true
        }
        if (a.items.length === b.items.length) {
            for (let i = 0; i < a.items.length; i++) {
                if (!isEqual(a.items[i], b.items[i])) {
                    return false
                }
            }
            return true
        }
    } else if (a instanceof types.Num && b instanceof types.Num) {
        return a.value === b.value
    } else if (a instanceof types.Str && b instanceof types.Str) {
        return a.value === b.value
    } else if (a instanceof types.Bool && b instanceof types.Bool) {
        return a.value === b.value
    }
    return false
}

function isApproxEqual (a, b, tolerance) {
    if (a instanceof types.Arr && b instanceof types.Arr) {
        if (a === b) {
            return true
        }
        if (a.items.length === b.items.length) {
            for (let i = 0; i < a.items.length; i++) {
                if (!isApproxEqual(a.items[i], b.items[i])) {
                    return false
                }
            }
            return true
        }
    } else if (a instanceof types.Num && b instanceof types.Num) {
        return Math.abs(a.value - b.value) <= tolerance
    } else if (a instanceof types.Str && b instanceof types.Str) {
        return a.value === b.value
    } else if (a instanceof types.Bool && b instanceof types.Bool) {
        return a.value === b.value
    }
    return false
}

module.exports.equal = {
    name: '=',
    execute: (interpreter) => {
        const a = interpreter._stack.pop()
        const b = interpreter._stack.pop()
        interpreter._stack.push(new types.Bool(isEqual(a, b)))
    }
}

module.exports.notEqual = {
    name: '!=',
    execute: (interpreter) => {
        const a = interpreter._stack.pop()
        const b = interpreter._stack.pop()
        interpreter._stack.push(new types.Bool(!isEqual(a, b)))
    }
}

module.exports.approxEqual = {
    name: '~=',
    execute: (interpreter) => {
        const tolerance = interpreter._stack.popNumber()
        const a = interpreter._stack.pop()
        const b = interpreter._stack.pop()
        interpreter._stack.push(new types.Bool(isApproxEqual(a, b, tolerance.value)))
    }
}

module.exports.notApproxEqual = {
    name: '!~=',
    execute: (interpreter) => {
        const tolerance = interpreter._stack.popNumber()
        const a = interpreter._stack.pop()
        const b = interpreter._stack.pop()
        interpreter._stack.push(new types.Bool(!isApproxEqual(a, b, tolerance.value)))
    }
}
