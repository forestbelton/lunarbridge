export class Block {
  statements: Stmt[];
  returnExprs: Expr[];

  constructor(statements: Stmt[], returnExprs: Expr[]);
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
  | CallStatement;

export type Var = Identifier | IndexExpr;

export class AssignStatement {
  vars: Var[];
  exprs: Expr[];

  constructor(vars: Var[], exprs: Expr[]);
}

export class LabelStatement {
  label: string;

  constructor(label: string);
}

export class BreakStatement {}

export class GotoStatement {
  label: string;

  constructor(label: string);
}

export class DoStatement {
  body: Block;

  constructor(body: Block);
}

export class WhileStatement {
  cond: Expr;
  body: Block;

  constructor(cond: Expr, body: Block);
}

export class RepeatStatement {
  cond: Expr;
  body: Block;

  constructor(cond: Expr, body: Block);
}

export class IfElseStatement {
  ifBodies: [Expr, Block][];
  elseBody: [Expr, Block] | null;

  constructor(ifBodies: [Expr, Block][], elseBody: [Expr, Block] | null);
}

export class ForRangeStatement {
  name: string;
  start: Expr;
  end: Expr;
  step: Expr;
  body: Block;

  constructor(name: string, start: Expr, end: Expr, step: Expr, body: Block);
}

export class ForInStatement {
  names: string[];
  exprs: Expr[];
  body: Block;

  constructor(names: string[], exprs: Expr[], body: Block);
}

export class FunctionStatement {
  name: string;
  local: boolean;
  func: FunctionExpr;

  constructor(name: string, local: boolean, func: FunctionExpr);
}

export class DeclareStatement {
  names: string[];
  exprs: Expr[];

  constructor(names: string[], exprs: Expr[]);
}

export class CallStatement {
  call: CallExpr;

  constructor(call: CallExpr);
}

export type Expr =
  | UnaryOpExpr
  | BinOpExpr
  | ConstantExpr
  | FunctionExpr
  | Identifier
  | TableExpr
  | IndexExpr
  | CallExpr;

export class Identifier {
  name: string;

  constructor(name: string);
}

export type UnaryOperator = "-" | "not" | "#" | "~";

export class UnaryOpExpr {
  op: UnaryOperator;
  expr: Expr;

  constructor(op: UnaryOperator, expr: Expr);
}

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "//"
  | "^"
  | "%"
  | "&"
  | "~"
  | "|"
  | ">>"
  | "<<"
  | ".."
  | "<"
  | "<="
  | ">"
  | ">="
  | "=="
  | "~="
  | "and"
  | "or";

export class BinOpExpr {
  op: BinaryOperator;
  left: Expr;
  right: Expr;

  constructor(op: BinaryOperator, left: Expr, right: Expr);
}

export type ConstantValue = null | boolean | number | string;

export class ConstantExpr {
  value: ConstantValue;

  constructor(value: ConstantValue);
}

export const NIL: ConstantExpr;

export const TRUE: ConstantExpr;

export const FALSE: ConstantExpr;

export class FunctionExpr {
  params: string[];
  body: Block;

  constructor(params: string[], body: Block);
}

type TableField = [string, Expr] | [Expr, Expr] | Expr;

export class TableExpr {
  fields: TableField[];
}

type IndexKind = "name" | "expr";

export class IndexExpr {
  target: Expr;
  kind: IndexKind;
  key: string | Expr;

  constructor(kind: IndexKind, key: string | Expr, target: Expr);
}

export class CallExpr {
  target: Expr;
  args: Expr[];
  method?: string;

  constructor(target: Expr, args: Expr[], method?: string);
}
