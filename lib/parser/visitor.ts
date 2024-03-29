import {
  BinOpExpr,
  BinaryOperator,
  CallExpr,
  ConstantExpr,
  Expr,
  FunctionExpr,
  Identifier,
  IndexExpr,
  UnaryOpExpr,
  UnaryOperator,
} from "./ast.js";

export abstract class ExprVisitor<A> {
  abstract unaryOp(op: UnaryOperator, expr: A): A;
  abstract binOp(op: BinaryOperator, left: A, right: A): A;
  abstract constant(expr: ConstantExpr): A;
  abstract func(expr: FunctionExpr): A;
  abstract identifier(expr: Identifier): A;
  abstract index(target: A, key: string | A): A;
  abstract call(target: A, args: A[], method?: string): A;

  visit(expr: Expr): A {
    if (expr instanceof UnaryOpExpr) {
      return this.unaryOp(expr.op, this.visit(expr.expr));
    } else if (expr instanceof BinOpExpr) {
      return this.binOp(expr.op, this.visit(expr.left), this.visit(expr.right));
    } else if (expr instanceof ConstantExpr) {
      return this.constant(expr);
    } else if (expr instanceof FunctionExpr) {
      return this.func(expr);
    } else if (expr instanceof IndexExpr) {
      let key: string | A =
        typeof expr.key === "string" ? expr.key : this.visit(expr.key);
      return this.index(this.visit(expr.target), key);
    } else if (expr instanceof CallExpr) {
      return this.call(
        this.visit(expr.target),
        expr.args.map(this.visit),
        expr.method
      );
    } else {
      throw new Error("unsupported expr");
    }
  }
}
