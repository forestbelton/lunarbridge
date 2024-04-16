export class Block {
  statements: Stmt[];

  constructor(statements: Stmt[], returnExprs: Expr[] | null) {
    this.statements = statements;
    if (returnExprs !== null) {
      this.statements.push(new ReturnStatement(returnExprs));
    }
  }
}

export type Stmt =
  | AssignStatement
  | LabelStatement
  | BreakStatement
  | DoStatement
  | WhileStatement
  | RepeatStatement
  | IfElseStatement
  | ForRangeStatement
  | ForInStatement
  | FunctionStatement
  | DeclareStatement
  | CallStatement
  | ReturnStatement;

export type Var = Identifier | IndexExpr;

export class AssignStatement {
  vars: Var[];
  exprs: Expr[];

  constructor(vars: Var[], exprs: Expr[]) {
    this.vars = vars;
    this.exprs = exprs;
  }
}

export class LabelStatement {
  label: string;

  constructor(label: string) {
    this.label = label;
  }
}

export class BreakStatement {}

export class GotoStatement {
  label: string;

  constructor(label: string) {
    this.label = label;
  }
}

export class DoStatement {
  body: Block;

  constructor(body: Block) {
    this.body = body;
  }
}

export class WhileStatement {
  cond: Expr;
  body: Block;

  constructor(cond: Expr, body: Block) {
    this.cond = cond;
    this.body = body;
  }
}

export class RepeatStatement {
  cond: Expr;
  body: Block;

  constructor(cond: Expr, body: Block) {
    this.cond = cond;
    this.body = body;
  }
}

export class IfElseStatement {
  ifBodies: [Expr, Block][];
  elseBody: Block | null;

  constructor(ifBodies: [Expr, Block][], elseBody: Block | null) {
    this.ifBodies = ifBodies;
    this.elseBody = elseBody;
  }
}

export class ForRangeStatement {
  name: string;
  start: Expr;
  end: Expr;
  step: Expr;
  body: Block;

  constructor(name: string, start: Expr, end: Expr, step: Expr, body: Block) {
    this.name = name;
    this.start = start;
    this.end = end;
    this.step = step;
    this.body = body;
  }
}

export class ForInStatement {
  names: string[];
  exprs: Expr[];
  body: Block;

  constructor(names: string[], exprs: Expr[], body: Block) {
    this.names = names;
    this.exprs = exprs;
    this.body = body;
  }
}

export class FunctionStatement {
  name: string;
  local: boolean;
  func: FunctionExpr;

  constructor(name: string, local: boolean, func: FunctionExpr) {
    this.name = name;
    this.local = local;
    this.func = func;
  }
}

export class DeclareStatement {
  names: string[];
  exprs: Expr[];

  constructor(names: string[], exprs: Expr[]) {
    this.names = names;
    this.exprs = exprs;
  }
}

export class CallStatement {
  call: CallExpr;

  constructor(call: CallExpr) {
    this.call = call;
  }
}

export class ReturnStatement {
  exprs: Expr[];

  constructor(exprs: Expr[]) {
    this.exprs = exprs;
  }
}

export type Expr =
  | UnaryOpExpr
  | BinOpExpr
  | ConstantExpr
  | FunctionExpr
  | Identifier
  | TableExpr<Expr>
  | IndexExpr
  | CallExpr;

export class Identifier {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export type UnaryOperator = "-" | "not" | "#";

export class UnaryOpExpr {
  op: UnaryOperator;
  expr: Expr;

  constructor(op: UnaryOperator, expr: Expr) {
    this.op = op;
    this.expr = expr;
  }
}

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "^"
  | "%"
  /* TODO: Implement 5.3 operators
  | "//"
  | "&"
  | "~"
  | "|"
  | ">>"
  | "<<"*/
  | ".."
  | LazyBinaryOperator;

export type RelationalOperator = "<" | "<=" | ">" | ">=" | "==" | "~=";

export type LazyBinaryOperator = "and" | "or";

export type StrictBinaryOperator = Exclude<BinaryOperator, LazyBinaryOperator>;

export const isBinopLazy = (op: BinaryOperator): op is LazyBinaryOperator =>
  op === "and" || op === "or";

export class BinOpExpr {
  op: BinaryOperator;
  left: Expr;
  right: Expr;

  constructor(op: BinaryOperator, left: Expr, right: Expr) {
    this.op = op;
    this.left = left;
    this.right = right;
  }
}

export class Ellipsis {}

export type ConstantValue = null | boolean | number | string | Ellipsis;

export class ConstantExpr {
  value: ConstantValue;

  constructor(value: ConstantValue) {
    this.value = value;
  }
}

export const NIL = new ConstantExpr(null);

export const TRUE = new ConstantExpr(true);

export const FALSE = new ConstantExpr(false);

export const ELLIPSIS = new ConstantExpr(new Ellipsis());

export class FunctionExpr {
  params: string[];
  body: Block;

  constructor(params: string[], body: Block) {
    this.params = params;
    this.body = body;
  }
}

export type TableField<A> = [string, A] | [A, A] | A;

export class TableExpr<A> {
  fields: TableField<A>[];

  constructor(fields: TableField<A>[]) {
    this.fields = fields;
  }
}

export class IndexExpr {
  key: Expr;
  target: Expr;

  constructor(key: Expr, target: Expr) {
    this.key = key;
    this.target = target;
  }
}

export class CallExpr {
  target: Expr;
  args: Expr[];
  method?: string;

  constructor(target: Expr, args: Expr[], method?: string) {
    this.target = target;
    this.args = args;
    this.method = method;
  }
}
