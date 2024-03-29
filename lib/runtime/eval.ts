import {
  BinaryOperator,
  ConstantExpr,
  Ellipsis,
  FunctionExpr,
  Identifier,
  TableExpr,
  UnaryOperator,
} from "../parser/ast.js";
import { ExprVisitor } from "../parser/visitor.js";
import { LuaError, LuaTypeError, getTypeName } from "./utils.js";
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
        } else {
          throw new LuaTypeError("perform bitwise operation on", expr);
        }
      case "-":
        if (typeof expr === "number") {
          return -expr;
        } else {
          throw new LuaTypeError("perform negation on", expr);
        }
      case "not":
        return expr === null || expr === false;
      case "#":
        if (typeof expr === "string") {
          return expr.length;
        } else if (expr instanceof LuaTable) {
          return expr.size();
        } else {
          throw new LuaTypeError("get length of", expr);
        }
      default:
        throw new LuaError(`unsupported unary operator ${op}`);
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
    throw new Error("Method not implemented.");
  }

  identifier(expr: Identifier): LuaValue {
    return typeof this.env[expr.name] !== "undefined"
      ? this.env[expr.name]
      : null;
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
    throw new Error("Method not implemented.");
  }
}
