const types = require('../types')

module.exports.datadef = {
  name: 'datadef',
  execute (interpreter, token) {
    const definition = interpreter._stack.pop()
    const name = new types.Sym(interpreter._stack.pop().name)

    // TODO error handling

    if (definition instanceof types.Params) {
      defineStruct(interpreter, definition, name)
    } else if (definition instanceof types.Arr) {
      const variants = []
      for (let i = 0; i < definition.items.length - 1; i += 2) {
        const name = definition.items[i]
        const variantDefinition = definition.items[i + 1]
        defineStruct(interpreter, variantDefinition, name)
        variants.push(name)
      }
      defineUnionTest(interpreter, variants, name)
    } else {
      throw new types.Err(`datadef expects a struct declaration (:Params) or a union type definition (:Arr) but got ${definition.getTypeName()} instead`)
    }
  }
}

function defineStruct (interpreter, definition, name) {
  const structName = name.name.toLowerCase()
  const defs = {}

  const op = (name) => new types.Op(interpreter.getBuiltIn(name))

  // Note: In PostFix logic, the lam returns the type defined by the user,
  // but since the functions are generated, the expensive struct type check is skipped
  const constructor = new types.Lam(
    [
      new types.Marker('ArrOpen'),
      new types.Sym('datadef'),
      name,
      ...definition.params.map((p) => new types.Ref(p.ref.name)),
      new types.Marker('ArrClose')
    ],
    new types.Params(
      definition.params,
      [new types.Sym('Obj')]
    ),
    interpreter._dictStack.copyDict()
  )

  // [ { o arr? } { o length 2 >= } { o 0 get :datadef = } { o 1 get <type> = } ] and
  const oParamRef = new types.Ref('o')
  const typeChecker = new types.Lam(
    [
      new types.Arr([
        new types.ExeArr([ oParamRef, op('arr?') ]),
        new types.ExeArr([ oParamRef, op('length'), new types.Int(2), op('>=') ]),
        new types.ExeArr([ oParamRef, new types.Int(0), op('get'), new types.Sym('datadef'), op('=') ]),
        new types.ExeArr([ oParamRef, new types.Int(1), op('get'), name, op('=') ])
      ]),
      op('and')
    ],
    new types.Params(
      [{ ref: oParamRef, type: new types.Sym('Obj') }],
      [new types.Sym('Bool')]
    ),
    interpreter._dictStack.copyDict()
  )

  interpreter._dictStack.put(`${structName}.new`, constructor)
  interpreter._dictStack.put(`${structName}?`, typeChecker)

  // getters, setters and updaters
  const xParamRef = new types.Ref('x')
  for (let i = 0; i < definition.params.length; i++) {
    const param = definition.params[i]

    // getter (o <index> get)
    defs[`${structName}.${param.ref.name}`] = new types.Lam(
      [
        oParamRef,
        new types.Int(i + 2),
        op('get')
      ],
      new types.Params(
        [{ ref: oParamRef, type: name }],
        [param.type]
      ),
      interpreter._dictStack.copyDict()
    )

    // setter (o <index> <value> set)
    defs[`${structName}-${param.ref.name}-set`] = new types.Lam(
      [
        oParamRef,
        new types.Int(i + 2),
        xParamRef,
        op('set')
      ],
      new types.Params(
        [{ ref: oParamRef, type: name }, { ref: xParamRef, type: param.type }],
        [name]
      ),
      interpreter._dictStack.copyDict()
    )

    // updater
    defs[`${structName}-${param.ref.name}-do`] = new types.Lam(
      [
        oParamRef,
        new types.Int(i + 2),
        oParamRef,
        new types.Int(i + 2),
        op('get'),
        xParamRef,
        op('set')
      ],
      new types.Params(
        [{ ref: oParamRef, type: name }, { ref: xParamRef, type: new types.Sym('ExeArr') }],
        [name]
      ),
      interpreter._dictStack.copyDict()
    )

    for (const name of Object.keys(defs)) {
      interpreter._dictStack.put(name, defs[name])
    }
  }
}

function defineUnionTest (interpreter, variants, name) {
  // [ { o <t1>? } { o <t2>? } ... ] or
  const unionName = name.name.toLowerCase()
  const oParamRef = new types.Ref('o')
  interpreter._dictStack.put(`${unionName}?`, new types.Lam(
    [
      new types.Arr(variants.map((variant) =>
        new types.ExeArr([ oParamRef, new types.Ref(`${variant.name.toLowerCase()}?`) ])
      )),
      new types.Op(interpreter.getBuiltIn('or'))
    ],
    new types.Params(
      [{ ref: oParamRef, type: new types.Sym('Obj') }],
      [new types.Sym('Bool')]
    ),
    interpreter._dictStack.copyDict()
  ))
}
