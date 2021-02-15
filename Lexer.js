// 词法解析器
// 编译原理，用Reactjs用自制编译器 https://www.bilibili.com/video/BV1BJ411p71e
// 分词，将源代码分割为若干个最小记号(Token)
class Token {
  constructor(type, text, lineNumber) {
    // 代码字符串的类别
    this.tokenType = type;
    // 代码内容
    this.text = text;
    // 代码行号
    this.lineNumber = lineNumber;
  }
}

class Lexer {
  constructor(sourceCode) {
    this.initTokenType();
    this.initKeywords();
    // 全部源代码
    this.sourceCode = sourceCode;
    // this.position = 0;
    this.readPosition = 0;
    this.lineCount = 0;
    // 当前阅读到的字符
    this.currentChar = '';
  }
  // 定义所有词法元素(关键字、标识符、运算符、分号)
  initTokenType() {
    this.TokenType = {
      ILLEGAL:-2, // 非法字符串
      EOF:-1, // 文本末尾
      LET:0, // 变量赋值关键字
      IDENTIFIER:1, // 常量变量标识符
      EQUAL_SIGN:2, // 等号
      PLUS_SIGN:3, // 加号
      INTEGER:4, // 整数
      SEMICOLON:5, // 分号
      IF:6,
      ELSE:7,
      MINUS_SIGN:8, // 减号
      BANG_SIGN:9, // 感叹号
      ASTERISK:10, // 星号
      SLASH:11, // 斜杠
      LT:12, // 小于号
      GT:13, // 大于号
      COMMA:14, // 逗号
      FUNCTION:15, // 函数
      TRUE:16,
      FALSE:17,
      RETURN:18,
      LEFT_BRACE:19, // 左花括号
      RIGHT_BRACE:20, // 右花括号
      EQ:21, // 相等判断符号 ==
      NOT_EQ:22, // 不相等判断 !=
      LEFT_PARENT:23, // 左小括号
      RIGHT_PARENT:24, // 右小括号
      STRING:25, // 字符串
      LEFT_BRACKET:26, // 数组左中括号
      RIGHT_BRACKET:27, // 数组右中括号
      // LEFT_BRACE:28,
      // RIGHT_BRACE:29,
      COLON:30// 冒号
    };
  }
  // 定义编程语言的所有关键字
  initKeywords() {
    this.keywords = {};
    this.keywords['let'] = this.TokenType.LET;
    this.keywords['if'] = this.TokenType.IF;
    this.keywords['else'] = this.TokenType.ELSE;
    this.keywords['true'] = this.TokenType.TRUE;
    this.keywords['false'] = this.TokenType.FALSE;
    this.keywords['return'] = this.TokenType.RETURN;
    this.keywords['fn'] = this.TokenType.FUNCTION;
  }
  getTipsByTokenType(type) {
    switch (type) {
      case this.TokenType.EOF:
        return '文件末尾';
      case this.TokenType.LET:
        return '赋值';
      case this.TokenType.IDENTIFIER:
        return '标识符';
      case this.TokenType.EQUAL_SIGN:
        return '等号';
      case this.TokenType.PLUS_SIGN:
        return '加号';
      case this.TokenType.INTEGER:
        return '整数';
      case this.TokenType.SEMICOLON:
        return '分号';
      case this.TokenType.IF:
        return '如果';
      case this.TokenType.ELSE:
        return '否则';
      case this.TokenType.MINUS_SIGN:
        return '减号';
      case this.TokenType.BANG_SIGN:
        return '感叹号';
      case this.TokenType.ASTERISK:
        return '星号';
      case this.TokenType.SLASH:
        return '斜杠';
      case this.TokenType.LT:
        return '小于';
      case this.TokenType.GT:
        return '大于';
      case this.TokenType.COMMA:
        return '逗号';
      case this.TokenType.FUNCTION:
        return 'fn';
      case this.TokenType.TRUE:
        return '真';
      case this.TokenType.FALSE:
        return '假';
      case this.TokenType.RETURN:
        return '返回';
      case this.TokenType.LEFT_BRACE:
        return '{';
      case this.TokenType.RIGHT_BRACE:
        return '}';
      case this.TokenType.EQ:
        return '==';
      case this.TokenType.NOT_EQ:
        return '!=';
      case this.TokenType.LEFT_PARENT:
        return '(';
      case this.TokenType.RIGHT_PARENT:
        return ')';
      // case this.TokenType.LEFT_BRACE:
      //   return '{';
      // case this.TokenType.RIGHT_BRACE:
      //   return '}';
      case this.TokenType.COLON:
        return ':';
      default:
        return '未知Token';
    }
  }
  // 逐个字符阅读源代码。由于readPosition会自动后移(它位于当前字符的下一个位置)，所以识别到最后一个字符时readPosition应该等于源代码的总长度，那么读完全部源代码时readPosition应该等于源代码的总长度加1
  readChar() {
    if (this.readPosition < this.sourceCode.length) {
      this.currentChar = this.sourceCode[this.readPosition];
    } else {
      this.currentChar = -1;
    }
    if (this.readPosition <= this.sourceCode.length) {
      // 更新阅读位置
      this.readPosition++;
    }
  }
  // 获取下一个字符
  getNextChar() {
    if (this.readPosition < this.sourceCode.length) {
      return this.sourceCode[this.readPosition];
    } else {
      return null;
    }
  }
  // 忽略当前位置的空格和回车换行符
  skipCurrentWhiteSpaceAndNewLine() {
    if (this.readPosition < this.sourceCode.length) {
      while (this.currentChar === ' ' || this.currentChar === '\t' || this.currentChar === '\n') {
        // 识别到换行符的时候，行号加1
        if (this.currentChar === '\t' || this.currentChar === '\n') {
          this.lineCount++;
        }
        this.readChar();
      }
    }
  }
  // 把当前读到的文本识别成Token
  readToken() {
    let token;
    this.skipCurrentWhiteSpaceAndNewLine();
    let strIdent;
    // 识别到最后一个字符的时候，readPosition应等于源代码的总长度
    if (this.readPosition <= this.sourceCode.length) {
      // 处理固定内容的词法
      switch (this.currentChar) {
        case '"':
          let str = this.readString();
          if (str === undefined) {
            token = new Token(this.TokenType.ILLEGAL, undefined, this.lineCount);
          } else {
            token = new Token(this.TokenType.STRING, str, this.lineCount);
          }
          this.readChar();
          break;
        case '=':
          if (this.getNextChar() === '=') {
            this.readChar();
            token = new Token(this.TokenType.EQ, '==', this.lineCount);
          } else {
            token = new Token(this.TokenType.EQUAL_SIGN, this.currentChar, this.lineCount);
          }
          this.readChar();
          break;
        case ';':
          token = new Token(this.TokenType.SEMICOLON, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '+':
          token = new Token(this.TokenType.PLUS_SIGN, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '-':
          token = new Token(this.TokenType.MINUS_SIGN, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '!':
          if (this.getNextChar() === '=') {
            this.readChar();
            token = new Token(this.TokenType.NOT_EQ, '!=', this.lineCount);
          } else {
            token = new Token(this.TokenType.BANG_SIGN, this.currentChar, this.lineCount);
          }
          this.readChar();
          break;
        case '*':
          token = new Token(this.TokenType.ASTERISK, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '/':
          token = new Token(this.TokenType.SLASH, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '<':
          token = new Token(this.TokenType.LT, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '>':
          token = new Token(this.TokenType.GT, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case ',':
          token = new Token(this.TokenType.COMMA, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '{':
          token = new Token(this.TokenType.LEFT_BRACE, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '}':
          token = new Token(this.TokenType.RIGHT_BRACE, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '(':
          token = new Token(this.TokenType.LEFT_PARENT, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case ')':
          token = new Token(this.TokenType.RIGHT_PARENT, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case '[':
          token = new Token(this.TokenType.LEFT_BRACKET, this.currentChar, this.lineCount);
          this.readChar();
          break;
        case ']':
          token = new Token(this.TokenType.RIGHT_BRACKET, this.currentChar, this.lineCount);
          this.readChar();
          break;
        default:
          // 处理非固定内容的代码
          strIdent = this.readIdentifier();
          if (strIdent !== false) {
            // 区分关键字和变量
            if (this.keywords.hasOwnProperty(strIdent)) {
              token = new Token(this.keywords[strIdent], strIdent, this.lineCount);
            } else {
              token = new Token(this.TokenType.IDENTIFIER, strIdent, this.lineCount);
            }
          } else {
            strIdent = this.readNumber();
            if (strIdent !== false) {
              token = new Token(this.TokenType.INTEGER, strIdent, this.lineCount);
            } else {
              token = new Token(this.TokenType.ILLEGAL, this.currentChar, this.lineCount);
              this.readChar();
            }
          }
      }
    } else {
      token = new Token(this.TokenType.EOF, '', this.lineCount);
    }
    return token;
  }
  // 某字符是否符合标识符(常量变量)的命名规范
  isInLetter(ch) {
    return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch === '_';
  }
  // 判断某字符是否为数字
  isInDigit(ch) {
    return '0' <= ch && ch <= '9';
    // return ch.charCodeAt(0) >= 48 && ch.charCodeAt(0) <= 57;
  }
  readString() {
    // 跳过开始的双引号
    this.readChar();
    let str = '';
    while (this.currentChar !== '"' && this.currentChar !== this.TokenType.EOF) {
      str += this.currentChar;
      this.readChar();
    }
    if (this.currentChar !== '"') {
      return undefined;
    }
    return str;
  }
  // 读取标识符组合成变量名称
  readIdentifier() {
    let identifier = '';
    if (this.isInLetter(this.currentChar)) {
      identifier += this.currentChar;
      this.readChar();
      while (this.isInLetter(this.currentChar) || this.isInDigit(this.currentChar)) {
        identifier += this.currentChar;
        this.readChar();
      }
    }
    if (identifier.length > 0) {
      return identifier;
    } else {
      return false;
    }
  }
  // 读取当前位置的数字
  readNumber() {
    let number = '';
    while (this.isInDigit(this.currentChar)) {
      number += this.currentChar;
      this.readChar();
    }
    if (number.length > 0) {
      return number;
    } else {
      return false;
    }
  }
  // 主函数，从源代码生成所有Token集合
  run() {
    this.readChar();
    this.tokens = [];
    let token = this.readToken();
    while (token !== undefined && token.tokenType !== this.TokenType.EOF) {
      console.log(token);
      this.tokens.push(token);
      token = this.readToken();
    }
    this.tokens.push(token);
  }
}

// let code = new Lexer('let    five = 5;\nlet six =six;\t let seven=7;');
// code.run();

// export {Lexer};