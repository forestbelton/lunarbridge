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
  | TableExpr
  | IndexExpr
  | CallExpr;

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
  name: string | null;
  params: string[];
  body: Block;
  local: boolean;

  constructor(
    name: string | null,
    params: string[],
    body: Block,
    local: boolean
  );
}
