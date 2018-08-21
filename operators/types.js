const types = require('../types')

module.exports.type = {
  name: 'type',
  execute (interpreter) {
    const obj = interpreter._stack.pop()
    interpreter._stack.push(new types.Sym(obj.getTypeName().substr(1)))
  }
}

module.exports.isArr = {
  name: 'arr?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Arr))
  }
}

module.exports.isBool = {
  name: 'bool?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Bool))
  }
}

module.exports.isExeArr = {
  name: 'exearr?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.ExeArr))
  }
}

module.exports.isFlt = {
  name: 'flt?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Flt))
  }
}

module.exports.isInt = {
  name: 'int?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Int))
  }
}

module.exports.isNil = {
  name: 'nil?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Nil))
  }
}

module.exports.isNum = {
  name: 'num?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Num))
  }
}

module.exports.isObj = {
  name: 'obj?',
  execute (interpreter) {
    const value = interpreter._stack.pop()
    // although Nil inherits from Obj, it is not an Obj in PostFix
    interpreter._stack.push(new types.Bool(!(value instanceof types.Nil) && value instanceof types.Obj))
  }
}

module.exports.isParams = {
  name: 'params?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Params))
  }
}

module.exports.isStr = {
  name: 'str?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Str))
  }
}

module.exports.isSym = {
  name: 'sym?',
  execute (interpreter) {
    interpreter._stack.push(new types.Bool(interpreter._stack.pop() instanceof types.Sym))
  }
}
