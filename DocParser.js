const fs = require('fs')
const Lexer = require('./Lexer')

const tokens = Lexer.parse(fs.readFileSync('./test.pf', 'utf-8'), { emitComments: true })
for (let i = 0; i < tokens.length; i++) {
    const fn = getFunctionAt(tokens, i)
    if (fn) {
        console.log(fn)
    }
}

function getFunctionAt (tokens, i) {
    const fn = {}
    if (tokens[i].tokenType === 'BLOCK_COMMENT') {
        fn.doc = tokens[i].token
        i++
        if (tokens[i].tokenType === 'SYMBOL') {
            fn.name = tokens[i].token
        }
        i++
        const params = readParamsList(tokens, i)
        if (params) {
            i = params.i
            const paramsAndReturns = parseParamsList(params.params)
            fn.params = paramsAndReturns.params
            fn.returns = paramsAndReturns.returns
        }
        console.log(fn)
        skipExeArr(tokens, i)
        if (tokens[i].tokenType === 'SYMBOL' && tokens[i].token === 'fun') {
            return fn
        }
    }
    return false
}

function readParamsList(tokens, i) {
    if (tokens[i].tokenType === 'PARAM_LIST_START') {
        const params = []
        while (i < tokens.length && tokens[i - 1].tokenType !== 'PARAM_LIST_END') {
            params.push(tokens[i])
            i++
        }
        return {params,i}
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
            params.push({ name: value })
        }
    }

    const returns = paramsList.slice(arrowRightPosition + 1, -1).map((token) => token.token)
    return { params, returns }
}
