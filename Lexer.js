class Lexer {
  /**
   * Create a new lexer instance.
   * @param {object} options Options for the lexer
   * @param {bool} options.emitComments True to emit tokens for comments, defaults to false
   */
  constructor (options = {}) {
    this.options = options
    this.col = 0
    this.row = 0
    this.pos = 0
    this.input = ''
    this.peek = ' '
  }

  put (input) {
    this.input += input
    if (input.length > 0) {
      this.empty = false
    }
  }

  _readch () {
    if (this.pos < this.input.length) {
      this.peek = this.input[this.pos]
      this.pos++
      if (this.peek === '\n') {
        this.row++
        this.col = 0
      } else {
        this.col++
      }
      return true
    }
    this.empty = true
    this.peek = ' '
    return false
  }

  * getTokens () {
    while (!this.empty) {
      if (this.deferredToken != null) {
        yield this.deferredToken
        this.deferredToken = null
      }

      // skip to the next symbol
      while (!this.empty) {
        this._readch()
        if (' \t\r,'.indexOf(this.peek) >= 0) {
          continue
        }
        if (this.peek === '#') { // comment
          if (this.options.emitComments) {
            const tokenLine = this.row
            const tokenCol = this.col - 1
            let token = '#'

            this._readch()
            token += this.peek
            if (this.peek === '<') {
              // block comment
              let tokenEndLine
              let tokenEndCol
              let prev = this.peek
              let levels = 1
              while (this._readch()) {
                tokenEndCol = this.col
                tokenEndLine = this.row
                token += this.peek
                if (prev === '>' && this.peek === '#') {
                  levels--
                  if (levels === 0) {
                    this._readch()
                    break
                  } else if (this._readch()) {
                    token += this.peek
                  }
                }
                if (prev === '#' && this.peek === '<') {
                  if (this._readch()) {
                    token += this.peek
                  }
                  levels++
                }
                prev = this.peek
              }
              yield {
                token,
                tokenType: 'BLOCK_COMMENT',
                col: tokenCol,
                line: tokenLine,
                endCol: tokenEndCol,
                endLine: tokenEndLine
              }
            } else {
              // line comment
              while (this.peek !== '\n') {
                if (!this._readch()) {
                  break
                }
                token += this.peek
              }
              yield {
                token,
                tokenType: 'LINE_COMMENT',
                col: tokenCol,
                line: tokenLine,
                endCol: this.col,
                endLine: tokenLine
              }
            }
          } else {
            this._readch()
            if (this.peek === '<') {
              // block comment
              let prev = this.peek
              let levels = 1
              while (this._readch()) {
                if (prev === '>' && this.peek === '#') {
                  this._readch()
                  levels--
                  if (levels === 0) {
                    break
                  }
                }
                if (prev === '#' && this.peek === '<') {
                  this._readch()
                  levels++
                }
                prev = this.peek
              }
            } else {
              // line comment
              while (this.peek !== '\n') {
                if (!this._readch()) {
                  break
                }
              }
            }
          }
        }
        if (this.peek !== '\n') {
          break
        }
      }

      // this is where an actual token is recognized
      const tokenLine = this.row
      let tokenCol = this.col

      let insideString = false
      let maskNext = false
      let token = ''

      if ('{[()]}'.includes(this.peek)) {
        yield {
          token: this.peek,
          tokenType: Lexer.getTokenType(this.peek),
          col: tokenCol - 1,
          line: tokenLine,
          endCol: tokenCol,
          endLine: tokenLine
        }
        continue
      } else if (this.peek === '"') {
        insideString = true
        token += this.peek
        this._readch()
      } else if (this.peek === '.') {
        this.deferredToken = {
          token: 'get',
          tokenType: Lexer.getTokenType('get'),
          col: this.col - 1,
          line: this.row,
          endCol: this.col,
          endLine: this.row,
          generated: true,
          generatedReason: 'DOT_SUGAR'
        }
        this._readch()
        tokenCol = this.col
      }

      while (!this.empty) {
        if (insideString) {
          if (this.peek === '"' && !maskNext) {
            token += this.peek
            this._readch()
            break
          }
        } else {
          if (' \t,\n)]}([{'.indexOf(this.peek) >= 0) {
            break
          }
        }

        if (!maskNext) {
          if (this.peek === '\\') {
            maskNext = true
            token += this.peek
            this._readch()
            continue
          }
        } else {
          maskNext = false
        }

        token += this.peek
        if (!this._readch()) {
          break
        }
      }

      if (token !== '') {
        yield {
          token,
          tokenType: Lexer.getTokenType(token),
          col: tokenCol - 1,
          line: tokenLine,
          endCol: tokenCol + token.length - 1,
          endLine: tokenLine
        }

        // emit the deferred token here, otherwise it would get lost if the input is empty now
        if (this.deferredToken != null) {
          yield this.deferredToken
          this.deferredToken = null
        }

        // if the next token is self-delimiting, there might not be whitespace between this token and the next token
        // so it would be skipped in the next iteration; solution: emit that token here
        if ('{[()]}'.includes(this.peek)) {
          yield {
            token: this.peek,
            tokenType: Lexer.getTokenType(this.peek),
            col: this.col - 1,
            line: this.row,
            endCol: this.col,
            endLine: this.row
          }
        }
      }
    }
  }

  static getTokenType (token) {
    switch (token) {
      case '(':
        return 'PARAM_LIST_START'
      case ')':
        return 'PARAM_LIST_END'
      case '[':
        return 'ARR_START'
      case ']':
        return 'ARR_END'
      case '{':
        return 'EXEARR_START'
      case '}':
        return 'EXEARR_END'
      case '->':
        return 'RIGHT_ARROW'
      case 'true':
      case 'false':
        return 'BOOLEAN'
      case 'nil':
        return 'NIL'
    }

    // TODO how/where to handle .foo (currently handled by the lexer) and bar.!

    if (!isNaN(token)) {
      if (token.indexOf('.') >= 0 || token.indexOf('e-') >= 0) {
        return 'FLOAT'
      } else {
        return 'INTEGER'
      }
    } else if (token.length >= 2 && token[0] === '"' && token[token.length - 1] === '"') {
      return 'STRING'
    } else if (token.length >= 2 && (token[0] === ':' || token[token.length - 1] === ':')) {
      return 'SYMBOL'
    } else if (token.length >= 2 && token[token.length - 1] === '!') {
      return 'DEFINITION'
    } else {
      return 'REFERENCE'
    }
  }

  /**
   * Parse the given code and return an array of tokens.
   * @param {string} code Code to parse
   * @param {object} options Options for the lexer
   * @param {bool} options.emitComments True to emit tokens for comments, defaults to false
   * @returns {object[]} Tokens
   */
  static parse (code, options = {}) {
    const lexer = new Lexer(options)
    lexer.put(code)
    return Array.from(lexer.getTokens())
  }
}

module.exports = Lexer
