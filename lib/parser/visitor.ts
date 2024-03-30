import {
  AssignStatement,
  BinOpExpr,
  BinaryOperator,
  BreakStatement,
  CallExpr,
  CallStatement,
  ConstantExpr,
  DeclareStatement,
  DoStatement,
  Expr,
  ForInStatement,
  ForRangeStatement,
  FunctionExpr,
  FunctionStatement,
  Identifier,
  IfElseStatement,
  IndexExpr,
  LabelStatement,
  RepeatStatement,
  Stmt,
  TableExpr,
  TableField,
  UnaryOpExpr,
  UnaryOperator,
  WhileStatement,
} from "./ast.js";

export abstract class ExprVisitor<A> {
  abstract unaryOp(op: UnaryOperator, expr: A): A;
  abstract binOp(op: BinaryOperator, left: A, right: A): A;
  abstract constant(expr: ConstantExpr): A;
  abstract func(expr: FunctionExpr): A;
  abstract identifier(expr: Identifier): A;
  abstract table(expr: TableExpr<A>): A;
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
    } else if (expr instanceof Identifier) {
      return this.identifier(expr);
    } else if (expr instanceof TableExpr) {
      const fields: TableField<A>[] = expr.fields.map((field) => {
        if (field instanceof Array) {
          if (typeof field[0] === "string") {
            return [field[0], this.visit(field[1])];
          } else {
            return [this.visit(field[0]), this.visit(field[1])];
          }
        } else {
          return this.visit(field);
        }
      });
      return this.table(new TableExpr(fields));
    } else if (expr instanceof IndexExpr) {
      let key: string | A =
        typeof expr.key === "string" ? expr.key : this.visit(expr.key);
      return this.index(this.visit(expr.target), key);
    } else if (expr instanceof CallExpr) {
      return this.call(
        this.visit(expr.target),
        expr.args.map((arg) => this.visit(arg)),
        expr.method
      );
    } else {
      throw new Error("unsupported expr: " + expr);
    }
  }
}

export abstract class StatementVisitor<A> {
  abstract assign(stmt: AssignStatement): A;
  abstract label(stmt: LabelStatement): A;
  abstract break(stmt: BreakStatement): A;
  abstract do(stmt: DoStatement): A;
  abstract while(stmt: WhileStatement): A;
  abstract repeat(stmt: RepeatStatement): A;
  abstract ifelse(stmt: IfElseStatement): A;
  abstract forrange(stmt: ForRangeStatement): A;
  abstract forin(stmt: ForInStatement): A;
  abstract func(stmt: FunctionStatement): A;
  abstract declare(stmt: DeclareStatement): A;
  abstract call(stmt: CallStatement): A;

  visit(stmt: Stmt): A {
    if (stmt instanceof AssignStatement) {
      return this.assign(stmt);
    } else if (stmt instanceof LabelStatement) {
      return this.label(stmt);
    } else if (stmt instanceof BreakStatement) {
      this.break(stmt);
    } else if (stmt instanceof DoStatement) {
      this.do(stmt);
    } else if (stmt instanceof WhileStatement) {
      this.while(stmt);
    } else if (stmt instanceof RepeatStatement) {
      this.repeat(stmt);
    } else if (stmt instanceof IfElseStatement) {
      this.ifelse(stmt);
    } else if (stmt instanceof ForRangeStatement) {
      this.forrange(stmt);
    } else if (stmt instanceof ForInStatement) {
      this.forin(stmt);
    } else if (stmt instanceof FunctionStatement) {
      this.func(stmt);
    } else if (stmt instanceof DeclareStatement) {
      this.declare(stmt);
    } else if (stmt instanceof CallStatement) {
      this.call(stmt);
    } else {
      throw new Error("unsupported stmt: " + stmt);
    }
  }
}
