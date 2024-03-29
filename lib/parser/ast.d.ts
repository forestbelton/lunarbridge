export type Stmt = null;

export class AssignStatement {
  vars: Var[];
  exprs: Expr[];
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
