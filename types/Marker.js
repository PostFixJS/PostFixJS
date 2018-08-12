const Obj = require('./Obj')
const Arr = require('./Arr')
const ExeArr = require('./ExeArr')
const Params = require('./Params')

/**
 * A marker object for opening arrays, executable arrays and parameter lists.
 */
class Marker extends Obj {
  /**
   * Create a new marker.
   * @param {string} Marker type, either 'ArrOpen', 'ExeArrOpen' or 'ParamsOpen'
   */
  constructor (type) {
    super()
    this.type = type
  }

  execute (interpreter) {
    if (this.type === 'ExeArrClose') {
      const items = interpreter._stack.popUntil((obj) => obj instanceof Marker && obj.type === 'ExeArrOpen')
      const exeArr = new ExeArr(items.slice(1))
      exeArr.origin = items[0].origin
      interpreter._stack.push(exeArr)
      interpreter._openExeArrs--
    } else if (this.type === 'ArrClose') {
      const items = interpreter._stack.popUntil((obj) => obj instanceof Marker && obj.type === 'ArrOpen')
      const arr = new Arr(items.slice(1))
      arr.origin = items[0].origin
      interpreter._stack.push(arr)
    } else if (this.type === 'ParamsClose') {
      const items = interpreter._stack.popUntil((obj) => obj instanceof Marker && obj.type === 'ParamsOpen')
      const params = new Params(items.slice(1), items[0].origin)
      interpreter._stack.push(params)
    } else {
      super.execute(interpreter)
      if (this.type === 'ExeArrOpen') {
        interpreter._openExeArrs++
      }
    }
  }

  getTypeName () {
    return ':Marker'
  }

  toString () {
    switch (this.type) {
      case 'ArrOpen':
        return '['
      case 'ArrClose':
        return ']'
      case 'ExeArrOpen':
        return '{'
      case 'ExeArrClose':
        return '}'
      case 'ParamsOpen':
        return '('
      case 'ParamsClose':
        return ')'
      case 'RightArrow':
        return '->'
    }
  }

  static fromToken (token) {
    const marker = new Marker({
      'ARR_START': 'ArrOpen',
      'ARR_END': 'ArrClose',
      'EXEARR_START': 'ExeArrOpen',
      'EXEARR_END': 'ExeArrClose',
      'PARAM_LIST_START': 'ParamsOpen',
      'PARAM_LIST_END': 'ParamsClose',
      'RIGHT_ARROW': 'RightArrow'
    }[token.tokenType])
    marker.origin = token
    return marker
  }
}

module.exports = Marker
