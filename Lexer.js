class Lexer {
  constructor () {
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

  *getTokens () {
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
        if (this.peek === '#') {
          // comment
          this._readch()
          if (this.peek === '<') {
            // block comment
            let prev = this.peek
            while (this._readch()) {
              if (prev === '>' && this.peek === '#') {
                this._readch()
                break
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
        if (this.peek !== '\n') {
          break
        }
      }

      // this is where an actual token is recognized
      const tokenLine = this.row
      let tokenCol = this.col

      let insideString = false
      let maskNext = false
      let oldPeek = this.peek
      let token = ''

      if ('{[()]}'.includes(this.peek)) {
        this._readch()
        yield {
          token: oldPeek,
          col: tokenCol - 1,
          line: tokenLine
        }
        continue
      } else if (this.peek === '"') {
        insideString = true
        token += this.peek
        this._readch()
      } else if (this.peek === '.') {
        this.deferredToken = {
          token: 'get',
          col: this.col - 1,
          line: this.row,
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
          col: tokenCol - 1,
          line: tokenLine
        }
      }
    }
  }
}

module.exports = Lexer
