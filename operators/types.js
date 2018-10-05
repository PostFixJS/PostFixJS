const types = require('../types')
const { getDatadefType } = require('./datadef')

module.exports.type = {
  name: 'type',
  execute (interpreter) {
    const obj = interpreter._stack.pop()
    const datadefType = getDatadefType(obj)
    if (datadefType) {
      interpreter._stack.push(new types.Sym(datadefType))
    } else {
      interpreter._stack.push(new types.Sym(obj.getTypeName().substr(1)))
    }
  }
}

module.exports.isArr = {
  name: 'arr?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Arr))
  }
}

module.exports.isBool = {
  name: 'bool?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Bool))
  }
}

module.exports.isExeArr = {
  name: 'exearr?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.ExeArr))
  }
}

module.exports.isFlt = {
  name: 'flt?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Flt))
  }
}

module.exports.isInt = {
  name: 'int?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Int))
  }
}

module.exports.isNil = {
  name: 'nil?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Nil))
  }
}

module.exports.isNum = {
  name: 'num?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Num))
  }
}

module.exports.isObj = {
  name: 'obj?',
  execute (interpreter) {
    const value = interpreter._stack.pop()
    // although Nil inherits from Obj, it is not an Obj in PostFix
    interpreter._stack.push(types.Bool.valueOf(!(value instanceof types.Nil) && value instanceof types.Obj))
  }
}

module.exports.isParams = {
  name: 'params?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Params))
  }
}

module.exports.isStr = {
  name: 'str?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Str))
  }
}

module.exports.isSym = {
  name: 'sym?',
  execute (interpreter) {
    interpreter._stack.push(types.Bool.valueOf(interpreter._stack.pop() instanceof types.Sym))
  }
}

module.exports.toStr = {
  name: 'str',
  execute (interpreter) {
    interpreter._stack.push(new types.Str(interpreter._stack.pop().toString()))
  }
}

module.exports.toFlt = {
  name: 'flt',
  execute (interpreter) {
    const value = interpreter._stack.pop()
    if (value instanceof types.Flt) {
      interpreter._stack.push(value)
    } else if (value instanceof types.Int) {
      interpreter._stack.push(new types.Flt(value.value))
    } else if (value instanceof types.Str) {
      const fltValue = parseFloat(value.value, 10)
      if (!isNaN(fltValue)) {
        interpreter._stack.push(new types.Flt(fltValue))
      } else {
        interpreter._stack.push(types.Nil.nil)
      }
    } else {
      interpreter._stack.push(types.Nil.nil)
    }
  }
}

module.exports.toInt = {
  name: 'int',
  execute (interpreter) {
    const value = interpreter._stack.pop()
    if (value instanceof types.Int) {
      interpreter._stack.push(value)
    } else if (value instanceof types.Flt) {
      interpreter._stack.push(new types.Int(Math.floor(value.value)))
    } else if (value instanceof types.Str) {
      const intValue = parseInt(value.value, 10)
      if (!isNaN(intValue)) {
        interpreter._stack.push(new types.Int(intValue))
      } else {
        interpreter._stack.push(types.Nil.nil)
      }
    } else {
      interpreter._stack.push(types.Nil.nil)
    }
  }
}

module.exports.toSym = {
  name: 'sym',
  execute (interpreter, token) {
    const value = interpreter._stack.pop()
    if (value instanceof types.Sym) {
      interpreter._stack.push(value)
    } else if (value instanceof types.Str) {
      const symbolName = value.value.replace(/[ \n\r\t]/g, '-')
      interpreter._stack.push(new types.Sym(symbolName))
    } else {
      throw new types.Err(`Only :Str and :Sym can be converted to :Sym, got ${value.getTypeName()} instead`, token)
    }
  }
}

module.exports.toExeArr = {
  name: 'exearr',
  execute (interpreter) {
    const value = interpreter._stack.pop()
    if (value instanceof types.ExeArr) {
      interpreter._stack.push(value)
    } else if (value instanceof types.Arr) {
      interpreter._stack.push(new types.ExeArr([...value.items]))
    } else {
      interpreter._stack.push(new types.ExeArr([value]))
    }
  }
}

module.exports.toArr = {
  name: 'arr',
  execute (interpreter) {
    const value = interpreter._stack.pop()
    if (value instanceof types.ExeArr) {
      interpreter._stack.push(new types.Arr([...value.items]))
    } else if (value instanceof types.Arr) {
      interpreter._stack.push(value)
    } else {
      interpreter._stack.push(new types.Arr([value]))
    }
  }
}
