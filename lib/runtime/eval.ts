import {
  AssignStatement,
  BinaryOperator,
  Block,
  BreakStatement,
  CallStatement,
  ConstantExpr,
  DeclareStatement,
  DoStatement,
  Ellipsis,
  ForInStatement,
  ForRangeStatement,
  FunctionExpr,
  FunctionStatement,
  Identifier,
  IfElseStatement,
  LabelStatement,
  RepeatStatement,
  TableExpr,
  UnaryOperator,
  Var,
  WhileStatement,
} from "../parser/ast.js";
import { ExprVisitor, StatementVisitor } from "../parser/visitor.js";
import {
  LuaError,
  LuaType,
  LuaTypeError,
  getType,
  getTypeName,
  isFalsy,
  isTruthy,
} from "./utils.js";
import { LuaEnvironment, LuaTable, LuaValue } from "./value.js";

const BIN_OPS: Record<BinaryOperator, (x: LuaValue, y: LuaValue) => LuaValue> =
  {
    // @ts-ignore
    "+": (x, y) => x + y,
    // @ts-ignore
    "-": (x, y) => x - y,
    // @ts-ignore
    "*": (x, y) => x * y,
    // @ts-ignore
    "/": (x, y) => x / y,
    // @ts-ignore
    "//": (x, y) => Math.floor(x / y),
    // @ts-ignore
    "%": (x, y) => x % y,
    // @ts-ignore
    "&": (x, y) => x & y,
    // @ts-ignore
    "|": (x, y) => x | y,
    // @ts-ignore
    "~": (x, y) => x ^ y,
    // @ts-ignore
    "<<": (x, y) => x << y,
    // @ts-ignore
    ">>": (x, y) => x >> y,
    // @ts-ignore
    "..": (x, y) => x + y,
    // @ts-ignore
    "<": (x, y) => x < y,
    // @ts-ignore
    "<=": (x, y) => x <= y,
    // @ts-ignore
    ">": (x, y) => x > y,
    // @ts-ignore
    ">=": (x, y) => x >= y,
    // @ts-ignore
    "==": (x, y) => x === y,
    // @ts-ignore
    "~=": (x, y) => x !== y,
    // @ts-ignore
    and: (x, y) => x && y,
    // @ts-ignore
    or: (x, y) => x || y,
    // @ts-ignore
    "^": (x, y) => Math.pow(x, y),
  };

export const evalBlock = (env: LuaEnvironment, block: Block): LuaValue => {
  const stmtVisitor = new InterpretStatementVisitor(env);
  const exprVisitor = new InterpretExprVisitor(env);

  block.statements.forEach((stmt) => {
    stmtVisitor.visit(stmt);
  });

  let value = null;
  if (block.returnExprs.length === 1) {
    value = exprVisitor.visit(block.returnExprs[0]);
  } else if (block.returnExprs.length > 1) {
    // TODO: Fix this, it's not really correct.
    value = new LuaTable(
      block.returnExprs.map((expr) => exprVisitor.visit(expr))
    );
  }
  return value;
};

export class InterpretExprVisitor extends ExprVisitor<LuaValue> {
  env: LuaEnvironment;

  constructor(env: LuaEnvironment) {
    super();
    this.env = env;
  }

  unaryOp(op: UnaryOperator, expr: LuaValue): LuaValue {
    switch (op) {
      case "~":
        if (typeof expr === "number") {
          return ~expr;
        } else if (expr instanceof LuaTable) {
          const func = expr.metamethod("__bnot");
          if (func !== null) {
            return func(expr, expr);
          }
        }
        throw new LuaTypeError("perform bitwise operation on", expr);
      case "-":
        if (typeof expr === "number") {
          return ~expr;
        } else if (expr instanceof LuaTable) {
          const func = expr.metamethod("__unm");
          if (func !== null) {
            return func(expr, expr);
          }
        }
        throw new LuaTypeError("perform bitwise operation on", expr);
      case "not":
        return isFalsy(expr);
      case "#":
        if (typeof expr === "string") {
          return expr.length;
        } else if (expr instanceof LuaTable) {
          const func = expr.metamethod("__len");
          return func !== null ? func(expr, expr) : expr.size();
        }
        throw new LuaTypeError("get length of", expr);
    }
  }

  binOp(op: BinaryOperator, left: LuaValue, right: LuaValue): LuaValue {
    return BIN_OPS[op](left, right);
  }

  constant(expr: ConstantExpr): LuaValue {
    if (expr.value instanceof Ellipsis) {
      throw new LuaError("varargs not implemented");
    }
    return expr.value;
  }

  func(expr: FunctionExpr): LuaValue {
    return (...args: LuaValue[]) => {
      const params: Record<string, LuaValue> = {};
      expr.params.forEach((param, i) => {
        params[param] = i < args.length ? args[i] : null;
      });
      const envWithParams = new LuaEnvironment(this.env, params);
      return evalBlock(envWithParams, expr.body);
    };
  }

  identifier(expr: Identifier): LuaValue {
    return this.env.get(expr.name);
  }

  table(expr: TableExpr<LuaValue>): LuaValue {
    const table = new LuaTable();
    expr.fields.forEach((field) => {
      if (field instanceof Array) {
        table.set(field[0], field[1]);
      } else {
        table.insert(field);
      }
    });
    return table;
  }

  index(target: LuaValue, key: LuaValue): LuaValue {
    if (!(target instanceof LuaTable)) {
      throw new LuaError(`attempt to index a ${getTypeName(target)} value`);
    }
    return target.get(key);
  }

  call(target: LuaValue, args: LuaValue[], method?: string): LuaValue {
    if (typeof target !== "function") {
      throw new LuaTypeError("call", target);
    } else if (typeof method !== "undefined") {
      throw new LuaError("method calls not implemented");
    }
    return target(...args);
  }
}

export class InterpretStatementVisitor extends StatementVisitor<void> {
  env: LuaEnvironment;
  exprVisitor: InterpretExprVisitor;

  constructor(env: LuaEnvironment) {
    super();
    this.env = env;
    this.exprVisitor = new InterpretExprVisitor(env);
  }

  assign(stmt: AssignStatement): void {
    stmt.vars.forEach((v, i) => {
      const expr =
        i < stmt.exprs.length ? this.exprVisitor.visit(stmt.exprs[i]) : null;
      this._setVar(v, expr);
    });
  }

  _setVar(v: Var, expr: LuaValue) {
    if (v instanceof Identifier) {
      this.env.set(v.name, expr);
    } else {
      throw new LuaError("complex assignment not implemented");
    }
  }

  label(stmt: LabelStatement): void {
    throw new Error("Method not implemented.");
  }

  break(stmt: BreakStatement): void {
    throw new Error("Method not implemented.");
  }

  do(stmt: DoStatement): void {
    throw new Error("Method not implemented.");
  }

  while(stmt: WhileStatement): void {
    let cond = this.exprVisitor.visit(stmt.cond);
    while (isTruthy(cond)) {
      evalBlock(new LuaEnvironment(this.env), stmt.body);
      cond = this.exprVisitor.visit(stmt.cond);
    }
  }

  repeat(stmt: RepeatStatement): void {
    let done = false;
    while (!done) {
      evalBlock(new LuaEnvironment(this.env), stmt.body);
      // TODO: Pretty sure cond has access to block's scope?
      done = isTruthy(this.exprVisitor.visit(stmt.cond));
    }
  }

  ifelse(stmt: IfElseStatement): void {
    throw new Error("Method not implemented.");
  }

  forrange(stmt: ForRangeStatement): void {
    let index = this.exprVisitor.visit(stmt.start);
    if (typeof index !== "number") {
      throw new LuaError(
        `bad 'for' limit (number expected, got ${getTypeName(index)})`
      );
    }

    const end = this.exprVisitor.visit(stmt.end);
    if (typeof end !== "number") {
      throw new LuaError(
        `bad 'for' limit (number expected, got ${getTypeName(end)})`
      );
    }

    const step = this.exprVisitor.visit(stmt.step);
    if (typeof step !== "number") {
      throw new LuaError(
        `bad 'for' step (number expected, got ${getTypeName(index)})`
      );
    }

    const env = new LuaEnvironment(this.env, { [stmt.name]: index });
    while (index != end) {
      evalBlock(env, stmt.body);
      index += step;
      env.set(stmt.name, index);
    }
  }

  forin(stmt: ForInStatement): void {
    throw new Error("Method not implemented.");
  }

  func(stmt: FunctionStatement): void {
    this.env.set(stmt.name, this.exprVisitor.visit(stmt.func));
  }

  declare(stmt: DeclareStatement): void {
    stmt.names.forEach((name, i) => {
      const expr =
        i < stmt.exprs.length ? this.exprVisitor.visit(stmt.exprs[i]) : null;
      this.env.set(name, expr);
    });
  }

  call(stmt: CallStatement): void {
    this.exprVisitor.visit(stmt.call);
  }
}
