import {
  BinaryOperator,
  Block,
  ConstantExpr,
  Ellipsis,
  FunctionExpr,
  Identifier,
  TableExpr,
  UnaryOperator,
} from "../parser/ast.js";
import { ExprVisitor, StatementVisitor } from "../parser/visitor.js";
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

export const evalBlock = (env: LuaEnvironment, block: Block): LuaValue => {
  const stmtVisitor: StatementVisitor<void> = null;
  const exprVisitor = new InterpretExprVisitor(env);

  block.statements.forEach((stmt) => {
    stmtVisitor.visit(stmt);
  });

  let value = null;
  if (block.returnExprs.length === 1) {
    value = exprVisitor.visit(block.returnExprs[0]);
  } else if (block.returnExprs.length > 1) {
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
    return (...args: LuaValue[]) => {
      const params = {};
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
