import {
  ConstantExpr,
  Ellipsis,
  FunctionExpr,
  Identifier,
  LazyBinaryOperator,
  StrictBinaryOperator,
  TableExpr,
  UnaryOperator,
} from "../../parser/ast.js";
import { ExprVisitor } from "./visitor.js";
import {
  LuaError,
  LuaType,
  LuaTypeError,
  getType,
  getTypeName,
  isTruthy,
} from "../utils.js";
import { LuaEnvironment, LuaTable, LuaValue } from "../value.js";
import { evalBlock } from "./block.js";
import { BINARY_OPERATIONS, UNARY_OPERATIONS } from "./operator.js";

export class InterpretExprVisitor extends ExprVisitor<LuaValue> {
  env: LuaEnvironment;

  constructor(env: LuaEnvironment) {
    super();
    this.env = env;
  }

  unaryOp(op: UnaryOperator, expr: LuaValue): LuaValue {
    return UNARY_OPERATIONS[op](expr);
  }

  binOp(op: StrictBinaryOperator, left: LuaValue, right: LuaValue): LuaValue {
    return BINARY_OPERATIONS[op](left, right);
  }

  binOpLazy(
    op: LazyBinaryOperator,
    left: LuaValue,
    rightLazy: () => LuaValue
  ): LuaValue {
    switch (op) {
      case "and":
        return isTruthy(left) ? isTruthy(rightLazy()) : false;
      case "or":
        return isTruthy(left) ? true : isTruthy(rightLazy());
    }
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
    // TODO: Support indexing strings?
    if (!(target instanceof LuaTable)) {
      throw new LuaError(`attempt to index a ${getTypeName(target)} value`);
    }
    return target.get(key);
  }

  call(target: LuaValue, args: LuaValue[], method?: string): LuaValue {
    // TODO: Implement __call metamethod
    if (typeof target === "function") {
      return target(...args);
    } else if (typeof method !== "undefined") {
      if (getType(target) !== LuaType.TABLE) {
        throw new LuaError(`attempt to index a ${getTypeName(target)} value`);
      }
      // @ts-ignore
      const methodFunc = target.get(method);
      if (typeof methodFunc !== "function") {
        throw new LuaTypeError("call", methodFunc);
      }
      return methodFunc(target, ...args);
    }
    throw new LuaTypeError("call", target);
  }
}
