const types = require('../types')
const { getDatadefType, getTypeNameWithDatadef, checkType } = require('../types/util')

module.exports.datadef = {
  name: 'datadef',
  * execute (interpreter, token) {
    let definition = interpreter._stack.pop()
    const nameArg = interpreter._stack.pop()

    if (!(nameArg instanceof types.Sym)) {
      throw new types.Err(`datadef expects a name (:Sym) as first argument but got ${definition.getTypeName()} instead`, token)
    }
    if (nameArg.name[0].toUpperCase() !== nameArg.name[0]) {
      throw new types.Err('The first character in the name of a datadef must be capitalized', token)
    }

    const name = new types.Sym(nameArg.name)
    if (definition instanceof types.Params) {
      defineStruct(interpreter, definition, name)
    } else if (definition instanceof types.Arr) {
      if (definition instanceof types.ExeArr) {
        if(definition instanceof types.Lam)
          throw new types.Err('Lambdas are not allowed in datadef definitions', token)
        // convert the :ExeArr to :Arr by executing it
        yield * interpreter.executeObj(new types.Marker('ArrOpen'))
        yield * interpreter.executeObj(definition)
        yield * interpreter.executeObj(new types.Marker('ArrClose'))
        definition = interpreter._stack.pop()
      }

      if (definition.items.length === 0) {
        throw new types.Err('The datadef union type definition does not contain any variants', token)
      }
      if (definition.items.length % 2 !== 0) {
        throw new types.Err('datadef union type definitions must contain variant names (:Sym) followed by parameter lists (:Params)', token)
      }

      const variants = []
      const defs = {}
      for (let i = 0; i < definition.items.length - 1; i += 2) {
        const name = definition.items[i]
        const variantDefinition = definition.items[i + 1]
        if (!(name instanceof types.Sym)) {
          throw new types.Err(`datadef variant names must be symbols (:Sym) but got ${name.getTypeName()} instead`, name.origin || token)
        }
        if (name.name[0].toUpperCase() !== name.name[0]) {
          throw new types.Err('The first character in the name of datadef variant must be capitalized', token)
        }
        if (!(variantDefinition instanceof types.Params)) {
          throw new types.Err(`datadef variants need a parameter list (:Params) but got ${variantDefinition.getTypeName()} instead`, variantDefinition.origin || token)
        }
        variants.push(name)
        Object.assign(defs, defineStruct(interpreter, variantDefinition, name))
      }
      const typeChecker = defineUnionTest(interpreter, variants, name)

      // recursive type support, make the sub type functions aware of each other and the union type (only the type check is required)
      for (const defName of Object.keys(defs)) {
        if (defs[defName].dict) {
          defs[defName].dict[`${name.name.toLowerCase()}?`] = typeChecker
        }
        for (const variant of variants) {
          if (defs[defName].dict) {
            defs[defName].dict[`${variant.name.toLowerCase()}?`] = defs[`${variant.name.toLowerCase()}?`]
          }
        }
      }
    } else {
      throw new types.Err(`datadef expects a struct declaration (:Params) or a union type definition (:Arr) but got ${definition.getTypeName()} instead`, token)
    }
  }
}

function defineStruct (interpreter, definition, name) {
  const structName = name.name.toLowerCase()
  const defs = {}

  const constructor = new types.Op({
    name: structName,
    * execute (interpreter, token) {
      const params = new types.Params(
        definition.params,
        [new types.Sym('Obj')]
      )
      yield * params.checkParams(interpreter, { callerToken: token })
      const values = []
      for (let i = 0; i < params.params.length; i++) {
        values.push(interpreter._stack.pop())
      }
      interpreter._stack.push(new types.Arr([
        new types.Sym('datadef'),
        name,
        ...values.reverse()
      ]))
    }
  })
  defs[structName] = constructor

  const typeChecker = new types.Op({
    name: `${structName}?`,
    execute (interpreter) {
      interpreter._stack.push(types.Bool.valueOf(getDatadefType(interpreter._stack.pop()) === name.name))
    }
  })
  defs[`${structName}?`] = typeChecker

  interpreter._dictStack.put(structName, constructor)
  interpreter._dictStack.put(`${structName}?`, typeChecker)

  const structNameRef = new types.Ref(structName)
  const updaterRef = new types.Ref('updater')

  // getters, setters and updaters
  for (let i = 0; i < definition.params.length; i++) {
    const param = definition.params[i]

    // getter (o <index> get)
    defs[`${structName}-${param.ref.name}`] = new types.Op({
      name: `${structName}-${param.ref.name}`,
      * execute (interpreter, token) {
        const params = new types.Params([{ ref: structNameRef, type: name }])
        yield * params.checkParams(interpreter, { callerToken: token })
        const obj = interpreter._stack.pop()
        if (obj.items.length <= i + 2) {
          // could happen when the user destroys the array
          throw new types.Err(`Invalid ${name} instance`, token)
        }
        interpreter._stack.push(obj.items[i + 2])
      }
    })

    // setter (o <index> <value> set)
    defs[`${structName}-${param.ref.name}-set`] = new types.Op({
      name: `${structName}-${param.ref.name}-set`,
      * execute (interpreter, token) {
        const params = new types.Params([
          { ref: structNameRef, type: name },
          { ref: param.ref, type: param.type || new types.Sym('Obj') }])
        yield * params.checkParams(interpreter, { callerToken: token })

        const value = interpreter._stack.pop()
        const obj = interpreter._stack.pop()
        if (obj.items.length <= i + 2) {
          // could happen when the user destroys the array
          throw new types.Err(`Invalid ${name} instance`, token)
        }
        const newObj = obj.copy()
        newObj.items[i + 2] = value
        value.refs++
        interpreter._stack.push(newObj)
      }
    })

    // updater (o <index> o <index> get <update> set)
    defs[`${structName}-${param.ref.name}-do`] = new types.Op({
      name: `${structName}-${param.ref.name}-do`,
      * execute (interpreter, token) {
        const params = new types.Params([
          { ref: structNameRef, type: name },
          { ref: updaterRef, type: new types.Sym('ExeArr') }
        ])
        yield * params.checkParams(interpreter, { callerToken: token })

        const updater = interpreter._stack.pop()
        const obj = interpreter._stack.pop()
        if (obj.items.length <= i + 2) {
          // could happen when the user destroys the array
          throw new types.Err(`Invalid ${name} instance`, token)
        }

        interpreter._stack.push(obj.items[i + 2])
        yield * interpreter.executeObj(updater)
        const newValue = interpreter._stack.pop()

        const expectedType = param.type || new types.Sym('Obj')
        switch (yield * checkType(expectedType, newValue, interpreter)) {
          case 'unexpected':
            throw new types.Err(`Expected the updater function to return ${expectedType.toString()} but it returned the incompatible type ${getTypeNameWithDatadef(newValue)}`, token || updater.origin)
          case 'unknown': // should never happen
            throw new types.Err(`Expected updater function to return the unknown type ${expectedType.toString()}`, token || updater.origin)
        }

        const newObj = obj.copy()
        newObj.items[i + 2] = newValue
        newValue.refs++
        interpreter._stack.push(newObj)
      }
    })
  }

  for (const name of Object.keys(defs)) {
    interpreter._dictStack.put(name, defs[name])
  }

  return defs
}

function defineUnionTest (interpreter, variants, name) {
  // [ { o <t1>? } { o <t2>? } ... ] or
  const unionName = name.name.toLowerCase()
  const test = new types.Op({
    name: `${unionName}?`,
    * execute (interpreter) {
      const obj = interpreter._stack.pop()
      for (const variant of variants) {
        interpreter._stack.push(obj)
        yield * interpreter.executeObj(interpreter._dictStack.get(`${variant.name.toLowerCase()}?`))
        const result = interpreter._stack.pop()
        if (result instanceof types.Bool && result.value) {
          interpreter._stack.push(types.Bool.true)
          return
        }
      }
      interpreter._stack.push(types.Bool.false)
    }
  })
  interpreter._dictStack.put(`${unionName}?`, test)

  return test
}
