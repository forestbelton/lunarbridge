{{
  import {
    AssignStatement,
    BinOpExpr,
    Block,
    BreakStatement,
    CallStatement,
    ConstantExpr,
    DeclareStatement,
    DoStatement,
    FunctionExpr,
    GotoStatement,
    ELLIPSIS,
    FALSE,
    ForRangeStatement,
    ForInStatement,
    FunctionStatement,
    Identifier,
    IfElseStatement,
    LabelStatement,
    NIL,
    RepeatStatement,
    TableExpr,
    TRUE,
    UnaryOpExpr,
    WhileStatement,
  } from "../ast/ast.js";

  import {
    attachSuffixes,
    isKeyword,
    lassoc,
    lassoc1,
    lastSuffixIs,
    parseDecimal,
    parseExpt,
    parseHex,
    suffix,
    unary
  } from "./utils.js";
}}

chunk = WS b:block { return b }

block = stmts:statement* exprs:(RETURN @exprs? SEMI?)? { return new Block(stmts.filter(stmt => stmt !== null), exprs || []); }

statement
  = SEMI                                                                                 { return null }
  / vars:var|1.., COMMA| EQUALS exprs:exprs                                              { return new AssignStatement(vars, exprs) }
  / DCOLON label:NAME DCOLON                                                             { return new LabelStatement(label) }
  / BREAK                                                                                { return new BreakStatement() }
  / GOTO label:NAME                                                                      { return new GotoStatement(label) }
  / DO body:block END                                                                    { return new DoStatement(body) }
  / WHILE cond:expr DO body:block END                                                    { return new WhileStatement(cond, body) }
  / REPEAT body:block UNTIL cond:expr                                                    { return new RepeatStatement(cond, body) }
  / IF ifbodies:ifbody|1.., ELSEIF| elsebody:(ELSE @block)? END                          { return new IfElseStatement(ifbodies, elsebody) }
  / FOR name:NAME EQUALS start:expr COMMA end:expr step:(COMMA @expr)? DO body:block END { return new ForRangeStatement(name, start, end, step || new ConstantExpr(1), body) }
  / FOR names:NAME|1.., COMMA| IN exprs:exprs DO body:block END                          { return new ForInStatement(names, exprs, body) }
  / local:LOCAL? FUNCTION name:funcname func:funcbody                                    { return new FunctionStatement(name, !!local, func) }
  / LOCAL names:attnamelist exprs:(EQUALS @exprs)?                                       { return new DeclareStatement(names, exprs) }
  / call:functioncall                                                                    { return new CallStatement(call) }

ifbody      = cond:expr THEN body:block             { return [cond, body] }
funcname    = $(NAME (DOT NAME)* (COLON NAME)?)
attnamelist = h:NAME attrib t:(COMMA @NAME attrib)* { return [h, ...t] }
attrib      = (LT NAME GT)?

// Expressions
exprs       = expr|1.., COMMA|
expr        = or_expr
or_expr     = exprs:and_expr|1.., OR|                      { return lassoc1('or', exprs) }
and_expr    = exprs:rel_expr|1.., AND|                     { return lassoc1('and', exprs) }
rel_expr    = head:bitor_expr tail:(RELOP bitor_expr)*     { return lassoc(head, tail) }
bitor_expr  = exprs:bitxor_expr|1.., BITOR|                { return lassoc1('|', exprs) }
bitxor_expr = ops:TILDE* expr:bitand_expr                  { return unary(ops || [], expr) }
bitand_expr = exprs:shift_expr|1.., BITAND|                { return lassoc1('&', exprs) }
shift_expr  = head:concat_expr tail:(SHIFTOP concat_expr)* { return lassoc(head, tail) }
concat_expr = left:add_expr right:(CONCAT @concat_expr)?   { return right ? new BinOpExpr('..', left, right) : left }
add_expr    = head:mul_expr tail:(ADDOP mul_expr)*         { return lassoc(head, tail) }
mul_expr    = head:unary_expr tail:(MULOP unary_expr)*     { return lassoc(head, tail) }
unary_expr  = ops:UNARYOP* expr:expt_expr                  { return unary(ops || [], expr) }
expt_expr   = left:base_expr right:(CARET @expt_expr)?     { return right ? new BinOpExpr('^', left, right) : left }

base_expr
  = NIL                                        { return NIL }
  / FALSE                                      { return FALSE }
  / TRUE                                       { return TRUE }
  / n:numeral                                  { return new ConstantExpr(n) }
  / s:literalstring                            { return new ConstantExpr(s) }
  / ELLIPSIS                                   { return ELLIPSIS }
  / FUNCTION func:funcbody                     { return func }
  / tableconstructor
  / expr:primary_expr suffixes:(index / call)* { return attachSuffixes(expr, suffixes) }

primary_expr
  = name:NAME               { return new Identifier(name) }
  / LPAREN expr:expr RPAREN { return expr }

index
  = DOT key:NAME               { return suffix("index", { key: new ConstantExpr(key) }) }
  / LBRACKET key:expr RBRACKET { return suffix("index", { key }) }

call
  = COLON method:NAME args:args { return suffix("call", { method, args }) }
  / args:args                   { return suffix("call", { args }) }

var          = expr:primary_expr suffixes:(index / call)* &{ return lastSuffixIs("index", suffixes) } { return attachSuffixes(expr, suffixes) }
functioncall = expr:primary_expr suffixes:(index / call)* &{ return lastSuffixIs("call", suffixes) }  { return attachSuffixes(expr, suffixes) }

args
  = LPAREN args:exprs? RPAREN { return args || [] }
  / table:tableconstructor    { return [table] }
  / str:literalstring         { return [str] }

funcbody = LPAREN params:parlist? RPAREN body:block END { return new FunctionExpr(params || [], body); }

parlist
  = names:NAME|1.., COMMA| varargs:(COMMA ELLIPSIS)? {
    if (varargs) {
    	names.push("...")
    }
    return names
  }
  / ELLIPSIS { return ["..."] }

tableconstructor = LBRACE fields:field|.., (COMMA / SEMI)| (COMMA / SEMI)? RBRACE { return new TableExpr(fields) }

field
  = LBRACKET key:expr RBRACKET EQUALS value:expr { return [key, value] }
  / key:NAME EQUALS value:expr                   { return [key, value] }
  / expr:expr                                    { return expr }

// Terminals
numeral = data:(hex / decimal) WS                                                    { return data }
decimal = whole:$[0-9]+ frac:('.' @$[0-9]+)? expt:([eE] @expt)?                      { return parseDecimal(whole, frac, expt) }
hex     = '0' [xX] whole:$[0-9a-fA-F]+ frac:('.' @$[0-9a-fA-F]+)? expt:([pP] @expt)? { return parseHex(whole, frac, expt) }
expt    = sign:[+-]? digits:$[0-9]+                                                  { return parseExpt(sign, digits) }

literalstring = '"stub"'

NAME    = s:$([a-zA-Z_] [a-zA-Z0-9_]*) WS &{ return !isKeyword(s) }                  { return s }

// Keywords
BREAK    = 'break' WS
DO       = 'do' WS
ELSE     = 'else' WS
ELSEIF   = 'elseif' WS
END      = 'end' WS
FALSE    = 'false' WS
GOTO     = 'goto' WS
LOCAL    = 'local' WS
IF       = 'if' WS
IN       = 'in' WS
FOR      = 'for' WS
FUNCTION = 'function' WS
NIL      = 'nil' WS
REPEAT   = 'repeat' WS
RETURN   = 'return' WS
THEN     = 'then' WS
TRUE     = 'true' WS
UNTIL    = 'until' WS
WHILE    = 'while' WS

// Operators
ADDOP   = op:('+' / '-') WS                             { return op }
AND     = op:'and' WS                                   { return op }
BITAND  = op:'&' WS                                     { return op }
BITOR   = op:'|' WS                                     { return op }
MULOP   = op:('*' / '//' / '/' / '%') WS                { return op }
OR      = op:'or' WS                                    { return op }
RELOP   = op:('<' / '>' / '<=' / '>=' / '~=' / '==') WS { return op }
SHIFTOP = op:('<<' / '>>') WS                           { return op }
TILDE   = op:'~' WS                                     { return op }
UNARYOP = op:('not ' / '#' / '-' / '~') WS              { return op }

// Punctuation
CARET    = '^' WS
COMMA    = ',' WS
COLON    = ':' WS
CONCAT   = '..' WS
DCOLON   = '::' WS
DOT      = '.' WS
ELLIPSIS = '...' WS
EQUALS   = '=' WS
GT       = '>' WS
LPAREN   = '(' WS
LT       = '<' WS
RBRACE   = '}' WS
RBRACKET = ']' WS
RPAREN   = ')' WS
SEMI     = ';' WS
LBRACKET = '[' WS
LBRACE   = '{' WS

WS = [ \r\t\n]*
