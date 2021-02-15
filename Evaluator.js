class BaseObject {
  constructor(props) {
    this.INTEGER_OBJ = 'INTEGER';// 整型变量
    this.BOOLEAN_OBJ = 'BOOLEAN';// 布尔型变量
    this.NULL_OBJ = 'NULL';
    this.ERROR_OBJ = 'Error';// 语法错误
    this.RETURN_VALUE_OBJECT = 'Return';
    this.FUNCTION_LITERAL = 'FunctionLiteral';
    this.FUNCTION_CALL = 'FunctionCall';
    this.STRING_OBJ = 'String';
    this.ARRAY_OBJ = 'Array';
    this.HASH_OBJ = 'Hash';
  }
  // 返回当前对象的类型
  type() {return null;}
  // 打印提示信息
  inspect() {return null;}
}

class String extends BaseObject {
  constructor(props) {
    super(props);
    this.value = props.value;
  }
  type() {return this.STRING_OBJ;}
  inspect() {return `字符串 ${this.value}`;}
}

class Integer extends BaseObject {
  constructor(props) {
    super(props);
    this.value = props.value;
  }
  type() {return this.INTEGER_OBJ;}
  inspect() {return `整数 ${this.value}`;}
}

class Boolean extends BaseObject {
  constructor(props) {
    super(props);
    this.value = props.value;
  }
  type() {return this.BOOLEAN_OBJ;}
  inspect() {return `布尔 ${this.value}`;}
}

class Array extends BaseObject {
  constructor(props) {
    super(props);
    this.elements = props.elements;
  }
  type() {return this.ARRAY_OBJ;}
  inspect() {
    return `[${this.elements.map((val, i, self) => {return val.inspect();}).join(', ')}]`;
  }
}

class Hash extends BaseObject {
  constructor(props) {
    super(props);
    this.keys = props.keys;
    this.values = props.values;
  }
  type() {return this.HASH_OBJ;}
  inspect() {
    return `{${this.keys.map((val, i, self) => {return val.inspect() + ':' + this.values[i].inspect();}).join(', ')}}`;
  }
}

class Null extends BaseObject {
  constructor(props) {
    super(props);
  }
  type() {return this.NULL_OBJ;}
  inspect() {return 'null';}
}

class Error extends BaseObject {
  constructor(props) {
    super(props);
    this.msg = props.errMsg;
  }
  type() {return this.ERROR_OBJ;}
  inspect() {return this.msg;}
}

class FunctionLiteral extends BaseObject {
  constructor(props) {
    super(props);
    // 对应关键字fn
    this.token = props.token;
    // 函数形参
    this.parameters = props.identifiers;
    // 函数体里面的代码块
    this.blockStatement = props.blockStatement;
  }
  type() {return this.FUNCTION_LITERAL;}
  inspect() {
    let tips = 'fn(';
    let identifiers = [];
    for (let i = 0; i < this.parameters.length; i++) {
      identifiers[i] = this.parameters[i].text;
    }
    tips += identifiers.join(',');
    tips += '){\n' + this.blockStatement.text + '\n}';
  }
}

class FunctionCall extends BaseObject {
  constructor(props) {
    super(props);
    // 实参
    this.identifiers = props.identifiers;
    this.blockStatement = props.blockStatement;
    this.enviroment = undefined;
  }
}

class ReturnValues extends BaseObject {
  constructor(props) {
    super(props);
    // 返回值既可以是整数也可以是表达式
    this.valueObject = props.value;
  }
  type() {return this.RETURN_VALUE_OBJECT;}
  inspect() {
    this.msg = '返回 ' + this.valueObject.inspect();
    return this.msg;
  }
}

// 代码运行时环境
class Enviroment {
  constructor(props) {
    // 变量哈希表，用于绑定变量和其对应的值
    this.map = {};
    this.outer = undefined;
  }
  // 查找变量对应的赋值
  get(name) {
    let obj = this.map[name];
    if (obj !== undefined) {
      return obj;
    }
    // 在当前代码块作用域内找不到变量时，通过回溯查找外层环境是否有该变量
    if (this.outer !== undefined) {
      obj = this.outer.get(name);
    }
    return obj;
  }
  // 绑定变量和其对应的值
  set(name, obj) {
    this.map[name] = obj;
  }
}

class Evaluator {
  constructor(props) {
    // 初始化执行程序的时候，初始化全局作用域的运行时
    this.enviroment = new Enviroment();
  }
  // 创建当前作用域的运行时环境，并关联外部的运行时环境
  newEnclosedEnviroment(outerEnv) {
    let env = new Enviroment();
    env.outer = outerEnv;
    return env;
  }
  builtins(name, args) {
    // 实现内嵌函数
    switch (name) {
      case 'first':
        // 获取数组第一个元素
        if (args.length !== 1) {
          return this.newError('参数数量不正确');
        }
        if (args[0].type() !== args[0].ARRAY_OBJ) {
          return this.newError('第一个参数不是数组类型');
        }
        if (args[0].elements.length > 0) {
          console.log('数组的第一个元素是', args[0].elements[0].inspect());
          return args[0].elements[0];
        }
        return null;
      case 'rest':
        // 去掉第1个元素并返回新数组
        if (args.length !== 1) {
          return this.newError('参数数量只能有1个');
        }
        if (args[0].type() !== args[0].ARRAY_OBJ) {
          return this.newError('第一个参数必须是数组');
        }
        if (args[0].elements.length > 1) {
          let props = {};
          // 去掉第1个元素
          props.elements = args[0].elements.slice(1);
          let obj = new Array(props);
          console.log('rest返回', obj.inspect());
          return obj;
        }
        return null;
      case 'append':
        if (args.length !== 2) {
          return this.newError('参数数量只能是2个');
        }
        if (args[0].type() !== args[0].ARRAY_OBJ) {
          return this.newError('第一个参数必须是数组');
        }
        let props = {};
        props.elements = args[0].elements.slice(0);
        props.elements.push(args[1]);
        let obj = new Array(props);
        console.log('新数组是', obj.inspect());
        return obj;
      case 'len':
        // 计算字符串长度
        // 参数只能有1个
        if (args.length !== 1) {
          return this.newError('参数数量不正确');
        }
        switch (args[0].type()) {
          case args[0].STRING_OBJ:
            let obj = new Integer({value:args[0].value.length});
            console.log('len函数返回', obj.inspect());
            return obj;
          case args[0].ARRAY_OBJ:
            let props = {};
            props.value = args[0].elements.length;
            console.log('len of 数组');
            return new Integer(props);
          default:
            return this.newError('参数类型不正确');
        }
      default:
        return this.newError('未知的函数调用');
    }
  }
  eval(node) {
    // console.log('解析执行');
    let props = {};
    switch (node.type) {
      case 'Program':
        return this.evalProgram(node);
      case 'HashExpression':
        return this.evalHashExpression(node);
      case 'ArrayExpression':
        let elements = this.evalExpressions(node.elements);
        if (elements.length === 1 && this.isError(elements)) {
          return elements[0];
        }
        return new Array({elements:elements});
      case 'IndexExpression':
        let left = this.eval(node.left);
        if (this.isError(left)) {
          return left;
        }
        let index = this.eval(node.index);
        if (this.isError(index)) {
          return index;
        }
        let objValue = this.evalIndexExpression(left, index);
        if (objValue !== null && objValue !== undefined) {
          console.log(`数组下标[${index.value}]取值结果为 ${objValue.inspect()}`);
        }
        return objValue;
      case 'String':
        return new String({value:node.value});
      case 'LetStatement':
        let literalValue = this.eval(node.value);
        if (this.isError(literalValue)) {
          return literalValue;
        }
        // 把赋值语句的变量和值绑定起来
        this.enviroment.set(node.name.text, literalValue);
        return literalValue;
      case 'Identifier':
        // 解析到标识符的时候，通过运行时环境的哈希表获取其对应的值
        let value = this.evalIdentifier(node, this.enviroment);
        console.log(`标识符 ${node.text} 绑定的值为 ${value.inspect()}`);
        return value;
      case 'FunctionExpression':
        let funObj = new FunctionCall({token:node.token, identifiers:node.parameters, blockStatement:node.body});
        // 实现函数闭包功能
        // 为函数调用创建新的绑定环境
        funObj.enviroment = this.newEnclosedEnviroment(this.enviroment);
        return funObj;
      case 'CallExpression':
        console.log(`执行函数:${node.function.text}(${node.arguments.map((val, i, self) => {return val['tips'];}).join(', ')})`);
        // 把参数解析提前
        // 获取所有实参的表达式运算结果
        let args = this.evalExpressions(node.arguments);
        if (args.length === 1 && this.isError(args[0])) {
          return args[0];
        }
        let functionCall = this.eval(node.function);
        if (this.isError(functionCall)) {
          return this.builtins(node.function.text, args);
        }
        // 输出实参计算结果
        for (let i = 0; i < args.length; i++) {
          console.log(args[i].inspect());
        }
        // 保留当前绑定的环境
        let oldEnviroment = this.enviroment;
        // 设置新的变量绑定环境
        this.enviroment = functionCall.enviroment;
        // 将形参和实参绑定起来
        for (let i = 0; i < functionCall.identifiers.length; i++) {
          let name = functionCall.identifiers[i].text;
          let val = args[i];
          this.enviroment.set(name, val);
        }
        // 执行函数体内的代码
        let result = this.eval(functionCall.blockStatement);
        // 执行完函数后，恢复原有的绑定环境
        this.enviroment = oldEnviroment;
        if (result.type() === result.RETURN_VALUE_OBJECT) {
          console.log('函数调用返回', result.valueObject.inspect());
          return result.valueObject;
        }
        return result;
      case 'Integer':
        console.log('整数', node.value);
        props.value = node.value;
        return new Integer(props);
      case 'Boolean':
        props.value = node.value;
        console.log('布尔值', node.value);
        return new Boolean(props);
      case 'ExpressionStatement':
        return this.eval(node.expression);
      case 'PrefixExpression':
        let right = this.eval(node.right);
        if (this.isError(right)) {
          return right;
        }
        let objPrefix = this.evalPrefixExpression(node.operator, right);
        console.log('执行前序表达式', objPrefix.inspect());
        return objPrefix;
      case 'InfixExpression':
        return this.evalInfixExpression(node.operator, this.eval(node.left), this.eval(node.right));
      case 'IfExpression':
        return this.evalIfExpression(node);
      case 'BlockStatement':
        return this.evalStatements(node);
      case 'ReturnStatement':
        props = {};
        props.value = this.eval(node.expression);
        // 错误检测机制
        if (this.isError(props.value)) {
          return props.value;
        }
        let objReturn = new ReturnValues(props);
        console.log(objReturn.inspect());
        return objReturn;
      default:
        return new Null({});
    }
    return null;
  }
  // 执行整个程序代码
  evalProgram(program) {
    let result = null;
    // 执行每一条语句，如果遇到return语句或null语句或代码错误，则不再执行后面的语句
    for (let i = 0; i < program.statements.length; i++) {
      result = this.eval(program.statements[i]);
      if (result.type() === result.RETURN_VALUE_OBJECT) {
        return result.valueObject;
      }
      if (result.type() === result.NULL_OBJ) {
        return result;
      }
      if (result.type() === result.ERROR_OBJ) {
        console.log(result.msg);
        return result;
      }
    }
    return result;
  }
  // 解析多条表达式，获得计算结果
  evalExpressions(exps) {
    let result = [];
    for (let i = 0; i < exps.length; i++) {
      let evaluated = this.eval(exps[i]);
      if (this.isError(evaluated)) {
        return evaluated;
      }
      result[i] = evaluated;
    }
    return result;
  }
  evalIdentifier(node, env) {
    let val = env.get(node.text);
    if (val === undefined) {
      return this.newError('找不到标识符:' + node.name);
    }
    return val;
  }
  // 执行中序表达式计算
  evalInfixExpression(operator, left, right) {
    if (left.type() !== right.type()) {
      return this.newError(`中序表达式左右两边的数据 ${left.value} (${left.type()}) 与 ${right.value} (${right.type()}) 类型不匹配`);
    }
    if (left.type() === left.INTEGER_OBJ && right.type() === right.INTEGER_OBJ) {
      return this.evalIntegerInfixExpression(operator, left, right);
    }
    if (left.type() === left.STRING_OBJ && right.type() === right.STRING_OBJ) {
      return this.evalStringInfixExpression(operator, left, right);
    }
    let props = {};
    if (operator === '==') {
      props.value = left.value === right.value;
      console.log('布尔判断');
      return new Boolean(props);
    } else if (operator === '!=') {
      props.value = left.value !== right.value;
      console.log('布尔判断');
      return new Boolean(props);
    }
    return null;
  }
  // 实现字符串相加操作
  evalStringInfixExpression(operator, left, right) {
    if (operator !== '+') {
      return this.newError('未知的字符串相加操作符', operator);
    }
    let leftVal = left.value;
    let rightVal = right.value;
    let props = {};
    props.value = leftVal + rightVal;
    console.log(`字符串相加操作结果 ${props.value}`);
    return new String(props);
  }
  // 获取数组下标取值结果
  evalIndexExpression(arr, index) {
    if (arr.type() === arr.ARRAY_OBJ && index.type() === index.INTEGER_OBJ) {
      return this.evalArrayIndexExpression(arr, index);
    }
  }
  evalArrayIndexExpression(array, index) {
    let idx = index.value;
    let max = array.elements.length - 1;
    if (idx < 0 || idx > max) {
      return null;
    }
    return array.elements[idx];
  }
  evalIfExpression(ifNode) {
    console.log('开始执行if语句');
    // 判断条件是否成立
    let condition = this.eval(ifNode.condition);
    if (this.isError(condition)) {
      return condition;
    }
    if (this.isTruthy(condition)) {
      console.log('条件成立');
      return this.eval(ifNode.consequence);
    } else if (ifNode.alternative !== null) {
      console.log('条件不成立');
      return this.eval(ifNode.alternative);
    } else {
      console.log('没有else代码块');
      return null;
    }
  }
  evalStatements(node) {
    let result = null;
    for (let i = 0; i < node.statements.length; i++) {
      result = this.eval(node.statements[i]);
      // 执行语句的时候，如果当前语句是return或者代码错误，则返回当前语句，后面的代码不再执行
      if (result.type() === result.RETURN_VALUE_OBJECT || result.type() === result.ERROR_OBJ) {
        return result;
      }
    }
    return result;
  }
  evalIntegerInfixExpression(operator, left, right) {
    let leftVal = left.value;
    let rightVal = right.value;
    let props = {};
    let resultType = 'integer';
    switch (operator) {
      case '+':
        props.value = leftVal + rightVal;
        break;
      case '-':
        props.value = leftVal - rightVal;
        break;
      case '*':
        props.value = leftVal * rightVal;
        break;
      case '/':
        props.value = leftVal / rightVal;
        break;
      case '==':
        resultType = 'boolean';
        props.value = leftVal === rightVal;
        break;
      case '!=':
        resultType = 'boolean';
        props.value = leftVal !== rightVal;
        break;
      case '>':
        resultType = 'boolean';
        props.value = leftVal > rightVal;
        break;
      case '<':
        resultType = 'boolean';
        props.value = leftVal < rightVal;
        break;
      default:
        return null;
    }
    console.log('中序表达式解析执行结果', props.value);
    let result = null;
    if (resultType === 'integer') {
      result = new Integer(props);
    } else if (resultType === 'boolean') {
      result = new Boolean(props);
    }
    return result;
  }
  evalPrefixExpression(operator, right) {
    switch (operator) {
      case '!':
        return this.evalBangOperatorExpression(right);
      case '-':
        return this.evalMinusPrefixOperatorExpression(right);
      default:
        return this.newError('未知操作符', operator);
    }
  }
  isTruthy(condition) {
    if (condition.type() === condition.INTEGER_OBJ) {
      if (condition.value !== 0) {
        return true;
      }
      return false;
    }
    if (condition.type() === condition.BOOLEAN_OBJ) {
      return condition.value;
    }
    if (condition.type() === condition.NULL_OBJ) {
      return false;
    }
    return true;
  }
  isError(obj) {
    if (obj !== null) {
      return obj.type() === obj.ERROR_OBJ;
    }
    return false;
  }
  // 解析取反表达式
  evalBangOperatorExpression(right) {
    let props = {};
    if (right.type() === right.BOOLEAN_OBJ) {
      if (right.value === true) {
        props.value = false;
      }
      if (right.value === false) {
        props.value = true;
      }
    }
    if (right.type() === right.INTEGER_OBJ) {
      if (right.value === 0) {
        props.value = true;
      } else {
        props.value = false;
      }
    }
    if (right.type() === right.NULL_OBJ) {
      props.value = true;
    }
    return new Boolean(props);
  }
  // 解析取负数表达式
  evalMinusPrefixOperatorExpression(right) {
    if (right.type() !== right.INTEGER_OBJ) {
      return this.newError('未知操作符:- ', right);
    }
    let props = {};
    props.value = -right.value;
    return new Integer(props);
  }
  newError(msg) {
    let props = {};
    props.errMsg = msg;
    return new Error(props);
  }
}