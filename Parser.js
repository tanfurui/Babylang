// 先定义词法解析器，把源代码分解成一个个Token，然后定义抽象语法树的节点Node，再定义变量标识符、整型、算术表达式，接着定义各种语句类型Statement，如：Let、Return等，最后执行Parser类的parseProgram方法得到所有分析出来的Statement，记录到Program类的statements数组里。
// 语法分析器
// 代表语法树的上一个节点(AST)，可以用接口来定义
class Node {
  constructor(props) {
    this.text = '';
    this.type = '';
  }
}

// 抽象类。代表某一条完整的语句
class Statement extends Node {
  statementNode() {
    this.type = 'Statement';
    return this;
  }
}

// 表示某条符合语法规则的表达式，比如赋值语句右侧的表达式
class Expression extends Node {
  constructor(props) {
    super(props);
    this.text = props.token.text;
    this.type = 'Expression';
  }
  expressionNode() {
    return this;
  }
}

// 变量标识符
class Identifier extends Expression {
  constructor(props) {
    super(props);
    // 变量对应的Token
    this.token = props.token;
    // 变量字符串
    this.text = props.token.text;
    // 要赋值给变量的值
    this.value = '';
    this.tips = props.token.text;
    this.type = 'Identifier';
  }
}

// Return语句
class ReturnStatement extends Statement {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.expression = props.expression;
    this.tips = `返回:${props.expression.tips}`;
    this.type = 'ReturnStatement';
  }
}

// 一条完整的算术表达式
class ExpressionStatement extends Statement {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.expression = props.expression;
    this.tips = `表达式:${props.expression}`;
    this.type = 'ExpressionStatement';
  }
}

// 前序表达式(!3 -5 等等)
class PrefixExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.operator = props.operator;
    this.right = props.expression;
    this.tips = `(${this.operator}${this.right.text})`;
    this.type = 'PrefixExpression';
  }
}

// 中序表达式
class InfixExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.left = props.leftExpression;
    this.operator = props.operator;
    this.right = props.rightExpression;
    this.tips = `(${this.left.tips} ${this.operator} ${this.right.tips})`;
    this.type = 'InfixExpression';
  }
}

// Let语句
class LetStatement extends Statement {
  constructor(props) {
    super(props);
    // let关键字的token
    this.token = props.token;
    // 变量名称
    this.name = props.identifier;
    // 等号右侧的表达式
    this.value = props.expression;
    this.tips = `赋值:${this.name.text} = ${this.value.tips}`;
    this.type = 'LetStatement';
  }
}

class StringExpression extends Node {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.value = props.token.text;
    this.tips = `字符串 ${this.value}`;
    this.type = 'String';
  }
}

// 一个整数表达式
class IntegerExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.value = props.value;
    this.tips = `整数 ${this.token.text}`;
    this.type = 'Integer';
  }
}

class BooleanExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.value = props.value;
    this.tips = `布尔 ${this.value}`;
    this.type = 'Boolean';
  }
}

class ArrayExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    // elements是Expression对象列表
    this.elements = props.elements;
    this.tips = `数组 ${this.elements.map((val, i, self) => {return val['tips'];}).join(', ')}`;
    this.type = 'ArrayExpression';
  }
}

// 描述数组取值这样的语法结构 arr[1]
class IndexExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    // 数组取值[前面的表达式，它可以是变量名、数组、函数调用
    this.left = props.left;
    // index可以是数字、变量、表达式、函数调用
    this.index = props.index;
    this.tips = `([${this.left.tips} ${this.index.tips}])`;
    this.type = 'IndexExpression';
  }
}

class BlockStatement extends Statement {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.statements = props.statements;
    let tips = '';
    for (let i = 0; i < this.statements.length; i++) {
      tips += this.statements[i].tips + '\n';
    }
    this.tips = tips;
    this.type = 'BlockStatement';
  }
}

class IfExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    // if小括号内的表达式
    this.condition = props.condition;
    // if条件成立时的代码块
    this.consequence = props.consequence;
    // else部分的代码块
    this.alternative = props.alternative;
    this.tips = `IF表达式，条件:${this.condition.tips}\nif分支代码块:\n${this.consequence.tips}${this.alternative ? `\nelse分支代码块:\n${this.alternative.tips}` : ''}`;
    this.type = 'IfExpression';
  }
}

class FunctionExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    // 函数的形参
    this.parameters = props.parameters;
    // 函数内部代码块
    this.body = props.body;
    this.tips = '函数定义\n输入参数:(' + this.parameters.map((val, i, self) => {return val['text'];}).join(', ') + `)\n函数内部代码块:\n{\n${this.body.tips}}`;
    this.type = 'FunctionExpression';
  }
}

// 函数立即执行表达式
class CallExpression extends Expression {
  constructor(props) {
    super(props);
    this.token = props.token;
    this.function = props.function;
    // 实参
    this.arguments = props.arguments;
    this.tips = '函数立即执行\n输入参数:(' + this.arguments.map((val, i, self) => {return val['tips'];}).join(', ') + `)\n函数内部代码块:\n{\n${this.function.tips}}`;
    this.type = 'CallExpression';
  }
}

// 记录整个源代码解析出来的所有statement
class Program {
  constructor() {
    this.statements = [];
    this.type = 'Program';
  }
  getText() {
    if (this.statements.length > 0) {
      return this.statements[0].text;
    } else {
      return '';
    }
  }
}

// 语法分析器
class Parser {
  constructor(lexer) {
    // 词法解析器
    this.lexer = lexer;
    // 执行词法解析，获得全部token
    this.lexer.run();
    // 当前正在处理的token
    this.tokenPos = 0;
    this.currToken = null;
    // 下一个token
    this.nextToken = null;
    // 让currToken和peekToken分别初始化为第1个token和第2个token
    this.goNextToken();
    this.goNextToken();
    this.program = new Program();
    // 解析算术表达式是编译原理中的难点，例如：-5 + --5 * 2 + (foobar / add(2,3)) 包含了取反、自减、加法、乘法、出发，乘法的优先级比加法高，小括号的优先级又比乘法高，还夹杂着变量标识符和函数调用。斯坦福大学教授梵高·普拉特发明了一种非常聪明且优雅的解析算法，JS语言的静态检测器JSLint依靠的就是该算法。
    // 算术表达式解析时要考虑的因素之多，使得它成为了编译原理中有关语法解析这部分的重点和难点，解析算法的设计和实现充分展示了计算机科学中“分而治之”和“递归”的精妙核心原则。编译原理的一大难点在于它蕴含很多抽象的概念，而很多复杂算法的设计和实现有赖于对这些抽象概念的理解和把握。好在普拉特解析法有别于传统的编译原理语法解析算法，它简单、精致、易理解。
    // 定义运算符的优先级，数值越大优先级越高
    this.LOWEST = 0;
    this.EQUALS = 1;// 等于号 ==
    this.LESSGREATER = 2;// 小于号和大于号 < or >
    this.SUM = 3;// 加号 +
    this.PRODUCT = 4;// 乘号和除号 * or /
    this.PREFIX = 5;// 前序表达式 -X or !X
    this.CALL = 6;// 函数调用 myFunction(x)
    this.INDEX = 7;// 数组取值具有最高优先级
    // 普拉特解析法，通过查找哈希表来解析当前遇到的Token类型来解析复杂的算术表达式
    this.prefixParseFns = {};
    this.prefixParseFns[this.lexer.TokenType.IDENTIFIER] = this.parseIdentifier;
    this.prefixParseFns[this.lexer.TokenType.INTEGER] = this.parseInteger;// 整数
    this.prefixParseFns[this.lexer.TokenType.BANG_SIGN] = this.parsePrefixExpression;// 感叹号
    this.prefixParseFns[this.lexer.TokenType.MINUS_SIGN] = this.parsePrefixExpression;// 减号
    this.prefixParseFns[this.lexer.TokenType.TRUE] = this.parseBoolean;
    this.prefixParseFns[this.lexer.TokenType.FALSE] = this.parseBoolean;
    this.prefixParseFns[this.lexer.TokenType.LEFT_PARENT] = this.parseGroupedExpression;
    this.prefixParseFns[this.lexer.TokenType.IF] = this.parseIfExpression;// 如果关键字
    this.prefixParseFns[this.lexer.TokenType.FUNCTION] = this.parseFunctionExpression;// 函数关键字
    this.prefixParseFns[this.lexer.TokenType.STRING] = this.parseStringExpression;// 函数关键字
    this.prefixParseFns[this.lexer.TokenType.LEFT_BRACKET] = this.parseArrayExpression;// 函数关键字
    // 初始化操作符优先级表
    this.initPrecedencesMap();
    // 初始化表达式解析函数表
    this.registerInfixMap();
  }
  // 操作符优先级表
  initPrecedencesMap() {
    this.precedencesMap = {};
    this.precedencesMap[this.lexer.TokenType.EQ] = this.EQUALS;
    this.precedencesMap[this.lexer.TokenType.NOT_EQ] = this.EQUALS;
    this.precedencesMap[this.lexer.TokenType.LT] = this.LESSGREATER;
    this.precedencesMap[this.lexer.TokenType.GT] = this.LESSGREATER;
    this.precedencesMap[this.lexer.TokenType.PLUS_SIGN] = this.SUM;
    this.precedencesMap[this.lexer.TokenType.MINUS_SIGN] = this.SUM;
    this.precedencesMap[this.lexer.TokenType.SLASH] = this.PRODUCT;
    this.precedencesMap[this.lexer.TokenType.ASTERISK] = this.PRODUCT;// 星号 *
    this.precedencesMap[this.lexer.TokenType.LEFT_PARENT] = this.CALL;
    this.precedencesMap[this.lexer.TokenType.LEFT_BRACKET] = this.INDEX;// 数组取值(左中括号)
  }
  // 中序表达式对应的解析函数
  registerInfixMap() {
    this.infixParseFns = {};
    this.infixParseFns[this.lexer.TokenType.PLUS_SIGN] = this.parseInfixExpression;
    this.infixParseFns[this.lexer.TokenType.MINUS_SIGN] = this.parseInfixExpression;
    this.infixParseFns[this.lexer.TokenType.SLASH] = this.parseInfixExpression;
    this.infixParseFns[this.lexer.TokenType.ASTERISK] = this.parseInfixExpression;
    this.infixParseFns[this.lexer.TokenType.EQ] = this.parseInfixExpression;
    this.infixParseFns[this.lexer.TokenType.NOT_EQ] = this.parseInfixExpression;
    this.infixParseFns[this.lexer.TokenType.LT] = this.parseInfixExpression;
    this.infixParseFns[this.lexer.TokenType.GT] = this.parseInfixExpression;
    this.infixParseFns[this.lexer.TokenType.LEFT_PARENT] = this.parseCallExpression;
    this.infixParseFns[this.lexer.TokenType.LEFT_BRACKET] = this.parseIndexExpression;
  }
  getCurrPrecedence() {
    let precedence = this.precedencesMap[this.currToken.tokenType];
    if (precedence !== undefined) {
      return precedence;
    }
    return this.LOWEST;
  }
  getNextPrecedence() {
    let precedence = this.precedencesMap[this.nextToken.tokenType];
    if (precedence !== undefined) {
      return precedence;
    }
    return this.LOWEST;
  }
  goNextToken() {
    // 一次必须读入两个Token，这样我们才了解当前解析代码的意图，例如假设当前解析的代码是 5; 那么peekToken对应的就是分号，这样解析器就知道当前解析的代码表示一个整数。
    this.currToken = this.nextToken;
    this.nextToken = this.lexer.tokens[this.tokenPos];
    this.tokenPos++;
  }
  // 把所有token解析为各种statement
  parseProgram() {
    while (this.currToken.tokenType !== this.lexer.TokenType.EOF) {
      let statement = this.parseStatement();
      if (statement !== null) {
        this.program.statements.push(statement);
      }
      this.goNextToken();
    }
    return this.program;
  }
  // 分析各种语句
  parseStatement() {
    // let statement = null;
    switch (this.currToken.tokenType) {
      case this.lexer.TokenType.LET:
        return this.parseLetStatement();
      case this.lexer.TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        // 解析算术表达式
        return this.parseExpressionStatement();
    }
  }
  // 解析并返回一条LetStatement语句
  parseLetStatement() {
    // 构造LetStatement对象的参数，包含token(let)、identifier(标识符名称)、expression(赋值表达式)
    let props = {};
    // 当前token为LET
    props.token = this.currToken;
    // 判断LET后面是不是标识符
    if (!this.goNextTokenIfNextIs(this.lexer.TokenType.IDENTIFIER)) {
      return null;
    }
    // LET语句左侧的标识符名称
    props.identifier = new Identifier({token:this.currToken});
    // 判断标识符后面是不是等号
    if (!this.goNextTokenIfNextIs(this.lexer.TokenType.EQUAL_SIGN)) {
      return null;
    }
    // // 判断等号后面是不是整数表达式
    // if (!this.goNextTokenIfNextIs(this.lexer.TokenType.INTEGER)) {
    //   return null;
    // }
    // LET语句右侧的赋值表达式
    // props.expression = new Expression({token:this.currToken});
    this.goNextToken();
    props.expression = this.parseExpression(this.LOWEST);
    // 判断整数表达式后面是不是分号
    if (!this.goNextTokenIfNextIs(this.lexer.TokenType.SEMICOLON)) {
      return null;
    }
    return new LetStatement(props);
  }
  // 解析Return语句
  parseReturnStatement() {
    let props = {};
    // Return本身
    props.token = this.currToken;
    // if (!this.goNextTokenIfNextIs(this.lexer.TokenType.INTEGER)) {
    //   return null;
    // }
    // props.expression = new Expression({token:this.currToken});
    this.goNextToken();
    props.expression = this.parseExpression(this.LOWEST);
    if (!this.goNextTokenIfNextIs(this.lexer.TokenType.SEMICOLON)) {
      return null;
    }
    return new ReturnStatement(props);
  }
  // 解析算术表达式语句
  parseExpressionStatement() {
    let statement = new ExpressionStatement({token:this.currToken, expression:this.parseExpression(this.LOWEST)});
    // 如果表达式后面跟着一个分号，则跳过它
    if (this.nextTokenIs(this.lexer.TokenType.SEMICOLON)) {
      this.goNextToken();
    }
    return statement;
  }
  // 通过查表的方式执行对应的算术表达式解析函数 precedence运算符优先级
  parseExpression(precedence) {
    let prefixParser = this.prefixParseFns[this.currToken.tokenType];
    if (prefixParser === null || prefixParser === undefined) {
      console.log(`当前token没有对应的解析函数:${this.currToken.text}`);
      return null;
    }
    let expression = prefixParser(this);
    // 如果当前表达式后面还有运算符，即可视为中序表达式，若该运算符优先级较高，则先跳到运算符右侧优先计算右侧的结果，再返回执行当前的中序表达式
    while (!this.nextTokenIs(this.lexer.TokenType.SEMICOLON)) {
      if (this.getNextPrecedence() > precedence) {
        let infixParser = this.infixParseFns[this.nextToken.tokenType];
        if (infixParser === null || infixParser === undefined) {
          return expression;
        }
        // 跳到运算符的位置
        this.goNextToken();
        expression = infixParser(this, expression);
      } else {
        // 如果当前表达式后面的运算符优先级较低或者优先级相同，则先返回当前表达式参与运算
        return expression;
      }
    }
    return expression;
  }
  // 解析前序表达式。一旦遇到感叹号、负号等前序表达式，解析器就会通过查表执行该函数
  parsePrefixExpression(parser) {
    let props = {};
    props.token = parser.currToken;
    // 操作符本身
    props.operator = parser.currToken.text;
    // 解析完操作符之后，跳到下一个Token，解析前序操作符后面的表达式
    parser.goNextToken();
    props.expression = parser.parseExpression(parser.PREFIX);
    return new PrefixExpression(props);
  }
  // 解析中序表达式
  parseInfixExpression(parser, leftExpression) {
    let props = {};
    props.token = parser.currToken;
    props.leftExpression = leftExpression;
    // 运算符本身
    props.operator = parser.currToken.text;
    // 运算符优先级
    let precedence = parser.getCurrPrecedence();
    // 跳过运算符，来到表达式右边
    parser.goNextToken();
    // 带上当前运算符的优先级，参与右侧表达式的运算
    props.rightExpression = parser.parseExpression(precedence);
    return new InfixExpression(props);
  }
  // 解析数组取值
  parseIndexExpression(parser, leftExpression) {
    let props = {};
    props.token = parser.currToken;
    props.left = leftExpression;
    parser.goNextToken();
    props.index = parser.parseExpression(parser.LOWEST);
    if (!parser.goNextTokenIfNextIs(parser.lexer.TokenType.RIGHT_BRACKET)) {
      return null;
    }
    let obj = new IndexExpression(props);
    console.log('数组指定下标', obj.index.tips);
    return new IndexExpression(props);
  }
  // 解析函数调用表达式
  parseCallExpression(parser, functionExpression) {
    return new CallExpression({token:parser.currToken, function:functionExpression, arguments:parser.parseCallArguments(parser)});
  }
  // 解析函数调用参数
  parseCallArguments(parser) {
    let args = [];
    if (parser.nextTokenIs(parser.lexer.TokenType.RIGHT_PARENT)) {
      parser.goNextToken();
      return args;
    }
    parser.goNextToken();
    args.push(parser.parseExpression(parser.LOWEST));
    // 参数之间以逗号分隔
    while (parser.nextTokenIs(parser.lexer.TokenType.COMMA)) {
      parser.goNextToken();
      parser.goNextToken();
      args.push(parser.parseExpression(parser.LOWEST));
    }
    // 调用的参数要以右小括号结尾
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.RIGHT_PARENT) !== true) {
      return null;
    }
    return args;
  }
  // 解析算术表达式里被小括号包裹的表达式
  parseGroupedExpression(parser) {
    // 跳过左小括号
    parser.goNextToken();
    let expression = parser.parseExpression(parser.LOWEST);
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.RIGHT_PARENT) !== true) {
      return null;
    }
    return expression;
  }
  parseIfExpression(parser) {
    let props = {};
    // if本身
    props.token = parser.currToken;
    // 跳到if后面的左小括号
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.LEFT_PARENT) !== true) {
      return null;
    }
    // 跳过左小括号
    parser.goNextToken();
    // 解析小括号里的条件表达式
    props.condition = parser.parseExpression(parser.LOWEST);
    // 跳到if条件后面的右小括号
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.RIGHT_PARENT) !== true) {
      return null;
    }
    // 跳到if条件后面的左花括号
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.LEFT_BRACE) !== true) {
      return null;
    }
    props.consequence = parser.parseBlockStatement(parser);
    // if可能有else分支
    if (parser.nextTokenIs(parser.lexer.TokenType.ELSE) === true) {
      parser.goNextToken();
      if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.LEFT_BRACE) !== true) {
        return null;
      }
      props.alternative = parser.parseBlockStatement(parser);
    }
    return new IfExpression(props);
  }
  parseBlockStatement(parser) {
    let props = {};
    // 代码块左花括号Token本身
    props.token = parser.currToken;
    props.statements = [];
    // 跳过左花括号，进入代码块内部
    parser.goNextToken();
    // 解析代码块里的语句直到读取到右花括号
    while (!parser.currTokenIs(parser.lexer.TokenType.RIGHT_BRACE)) {
      let statement = parser.parseStatement();
      if (statement !== null) {
        props.statements.push(statement);
      }
      parser.goNextToken();
    }
    return new BlockStatement(props);
  }
  parseFunctionExpression(parser) {
    let props = {};
    props.token = parser.currToken;
    // 函数关键字后面要跟着一个左小括号
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.LEFT_PARENT) !== true) {
      return null;
    }
    // 解析函数参数
    props.parameters = parser.parseFunctionParameters(parser);
    // 函数参数后面要跟着一个左花括号
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.LEFT_BRACE) !== true) {
      return null;
    }
    // 解析函数体内的语句
    props.body = parser.parseBlockStatement(parser);
    return new FunctionExpression(props);
  }
  // 解析函数参数
  parseFunctionParameters(parser) {
    let parameters = [];
    // 一个函数是可以完全没有输入参数的
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.RIGHT_PARENT)) {
      return parameters;
    }
    parser.goNextToken();
    // 函数参数必然是标识符(语法设计规定)
    parameters.push(new Identifier({token:parser.currToken}));
    while (parser.nextTokenIs(parser.lexer.TokenType.COMMA)) {
      parser.goNextToken();
      parser.goNextToken();
      parameters.push(new Identifier({token:parser.currToken}));
    }
    // 判断是不是以右小括号结尾
    if (parser.goNextTokenIfNextIs(parser.lexer.TokenType.RIGHT_PARENT) !== true) {
      return null;
    }
    return parameters;
  }
  parseStringExpression(parser) {
    return new StringExpression({token:parser.currToken});
  }
  // 数组元素是多种多样的：数字、变量、表达式、函数调用，每一个元素都要当成表达式来解析
  parseArrayExpression(parser) {
    // 解析数组元素的终止符是右中括号
    let obj = new ArrayExpression({token:parser.currToken, elements:parser.parseExpressionList(parser.lexer.TokenType.RIGHT_BRACKET)});
    console.log('解析数组', obj.tips);
    return obj;
  }
  // 解析算术表达式里的标识符
  parseIdentifier(parser) {
    return parser.createIdentifier();
  }
  parseInteger(parser) {
    let intProps = {};
    intProps.token = parser.currToken;
    intProps.value = parseInt(parser.currToken.text);
    if (isNaN(intProps.value)) {
      console.log('无法解析整数型的Token');
      return null;
    }
    return new IntegerExpression(intProps);
  }
  // 解析布尔型表达式
  parseBoolean(parser) {
    return new BooleanExpression({token:parser.currToken, value:parser.currTokenIs(parser.lexer.TokenType.TRUE)});
  }
  // 解析数组元素
  parseExpressionList(endToken) {
    let list = [];
    if (this.nextTokenIs(endToken)) {
      this.goNextToken();
      return list;
    }
    this.goNextToken();
    list.push(this.parseExpression(this.LOWEST));
    while (this.nextTokenIs(this.lexer.TokenType.COMMA)) {
      this.goNextToken();
      this.goNextToken();// 越过逗号
      list.push(this.parseExpression(this.LOWEST));
    }
    if (!this.goNextTokenIfNextIs(endToken)) {
      return null;
    }
    return list;
  }
  createIdentifier() {
    return new Identifier({token:this.currToken});
  }
  // 判断当前Token的类型
  currTokenIs(tokenType) {
    return this.currToken.tokenType === tokenType;
  }
  // 判断下一个Token的类型
  nextTokenIs(tokenType) {
    return this.nextToken.tokenType === tokenType;
  }
  goNextTokenIfNextIs(tokenType) {
    if (this.nextTokenIs(tokenType)) {
      this.goNextToken();
      return true;
    } else {
      return false;
    }
  }
}

// export {Parser};