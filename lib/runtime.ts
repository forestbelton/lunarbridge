import {
  BinaryOperator,
  ConstantExpr,
  Expr,
  FunctionExpr,
  Identifier,
  UnaryOperator,
} from "./parser/ast.js";
import { parse } from "./parser/index.js";
import { ExprVisitor } from "./parser/visitor.js";

// TODO: Add support for function values
export type LuaValue = null | boolean | number | string | LuaTable;

export class LuaTable {
  items: Record<string | number, LuaValue>;
}

export type LuaEnvironment = Record<string, LuaValue>;

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

class InterpretExprVisitor extends ExprVisitor<LuaValue> {
  env: LuaEnvironment;

  constructor(env: LuaEnvironment) {
    super();
    this.env = env;
  }

  unaryOp(op: UnaryOperator, expr: LuaValue): LuaValue {
    throw new Error("Method not implemented.");
  }

  binOp(op: BinaryOperator, left: LuaValue, right: LuaValue): LuaValue {
    return BIN_OPS[op](left, right);
  }

  constant(expr: ConstantExpr): LuaValue {
    return expr.value;
  }

  func(expr: FunctionExpr): LuaValue {
    throw new Error("Method not implemented.");
  }

  identifier(expr: Identifier): LuaValue {
    return typeof this.env[expr.name] !== "undefined"
      ? this.env[expr.name]
      : null;
  }

  index(target: LuaValue, key: string | LuaValue): LuaValue {
    throw new Error("Method not implemented.");
  }

  call(target: LuaValue, args: LuaValue[], method?: string): LuaValue {
    throw new Error("Method not implemented.");
  }
}

export class LuaRuntime {
  globals: LuaEnvironment;

  execute(expr: string): LuaValue {
    const result = parse(expr, { startRule: "expr" });
    return this.evalExpr(this.globals, result);
  }

  executeScript(script: string) {
    const result = parse(script);
    console.log(result);
  }

  evalExpr(env: LuaEnvironment, expr: Expr): LuaValue {
    console.log(env);
    console.log(expr);
    return new InterpretExprVisitor(env).visit(expr);
  }
}
