let domSourceCode = document.querySelector('#input');
let domConsole = document.querySelector('#output');
let domLexer = document.querySelector('#lexer');
let domParser = document.querySelector('#parser');
let domEval = document.querySelector('#eval');
domLexer.addEventListener('click', function() {
  let sourceCode = domSourceCode.value;
  let lexer = new Lexer(sourceCode);
  console.clear();
  lexer.run();
});

domParser.addEventListener('click', function() {
  let sourceCode = domSourceCode.value;
  let lexer = new Lexer(sourceCode), parser = new Parser(lexer);
  parser.parseProgram();
  console.clear();
  for (let i = 0; i < parser.program.statements.length; i++) {
    console.log(parser.program.statements[i].tips);
  }
});

domEval.addEventListener('click', function() {
  let sourceCode = domSourceCode.value;
  let lexer = new Lexer(sourceCode), parser = new Parser(lexer);
  let evaluator = new Evaluator();
  parser.parseProgram();
  console.clear();
  console.log(parser.program);
  evaluator.eval(parser.program);
});