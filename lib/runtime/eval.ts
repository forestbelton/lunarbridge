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
  Expr,
  ForInStatement,
  ForRangeStatement,
  FunctionExpr,
  FunctionStatement,
  Identifier,
  IfElseStatement,
  LabelStatement,
  LazyBinaryOperator,
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
  coerceString,
  getType,
  getTypeName,
  isFalsy,
  isTruthy,
} from "./utils.js";
import { LuaEnvironment, LuaTable, LuaValue } from "./value.js";

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

const arithOp = (
  name: string,
  metafield: string,
  op: (x: number, y: number) => number,
  left: LuaValue,
  right: LuaValue
): number => {
  let value: number | undefined;
  if (typeof left === "number" && typeof right === "number") {
    value = op(left, right);
  } else if (left instanceof LuaTable && left.metamethod(metafield) !== null) {
    // @ts-ignore
    value = left.metamethod(metafield)(left, right);
  } else if (
    right instanceof LuaTable &&
    right.metamethod(metafield) !== null
  ) {
    // @ts-ignore
    value = right.metamethod(metafield)(left, right);
  }
  if (typeof value === "undefined") {
    throw new LuaError(
      `attempt to ${name} a '${getTypeName(left)}' with a '${getTypeName(
        right
      )}'`
    );
  }
  return value;
};

const relOp = (
  metafield: string,
  op: (x: number | string, y: number | string) => boolean,
  left: LuaValue,
  right: LuaValue
): boolean => {
  let value: boolean | undefined;
  if (typeof left === "number" && typeof right === "number") {
    value = op(left, right);
  } else if (typeof left === "string" && typeof right === "string") {
    value = op(left, right);
  } else if (left instanceof LuaTable && left.metamethod(metafield) !== null) {
    // @ts-ignore
    value = left.metamethod(metafield)(left, right);
  } else if (
    right instanceof LuaTable &&
    right.metamethod(metafield) !== null
  ) {
    // @ts-ignore
    value = right.metamethod(metafield)(left, right);
  }
  if (typeof value === "undefined") {
    throw new LuaError(
      `attempt to compare a '${getTypeName(left)}' with a '${getTypeName(
        right
      )}'`
    );
  }
  return value;
};

const equals = (left: LuaValue, right: LuaValue): boolean => {
  let isEqual = false;

  if (left === right) {
    isEqual = true;
  } else if (left instanceof LuaTable && right instanceof LuaTable) {
    const leftMethod = left.metamethod("__eq");
    const rightMethod = right.metamethod("__eq");
    if (leftMethod !== null) {
      isEqual = isTruthy(leftMethod(left, right));
    } else if (rightMethod !== null) {
      isEqual = isTruthy(rightMethod(left, right));
    }
  }

  return isEqual;
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
          return -expr;
        } else if (expr instanceof LuaTable) {
          const func = expr.metamethod("__unm");
          if (func !== null) {
            return func(expr, expr);
          }
        }
        throw new LuaTypeError("perform negation on", expr);
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

  binOp(
    op: Exclude<BinaryOperator, LazyBinaryOperator>,
    left: LuaValue,
    right: LuaValue
  ): LuaValue {
    switch (op) {
      case "+":
        return arithOp("add", "__add", (x, y) => x + y, left, right);
      case "-":
        return arithOp("subtract", "__sub", (x, y) => x - y, left, right);
      case "*":
        return arithOp("multiply", "__mul", (x, y) => x * y, left, right);
      case "/":
        return arithOp("divide", "__div", (x, y) => x / y, left, right);
      case "%":
        return arithOp("modulo", "__mod", (x, y) => x % y, left, right);
      case "^":
        return arithOp(
          "exponentiate",
          "__pow",
          (x, y) => Math.pow(x, y),
          left,
          right
        );
      case "//":
        return arithOp(
          "floor divide",
          "__idiv",
          (x, y) => Math.floor(x / y),
          left,
          right
        );
      // TODO: Behavior similar to the addition operation, except that Lua will
      //       try a metamethod if any operand is neither an integer nor a float
      //       coercible to an integer.
      case "&":
        return arithOp("bitwise and", "__band", (x, y) => x & y, left, right);
      case "|":
        return arithOp("bitwise or", "__bor", (x, y) => x | y, left, right);
      case "~":
        return arithOp("bitwise xor", "__bxor", (x, y) => x ^ y, left, right);
      case "<<":
        return arithOp("left shift", "__shl", (x, y) => x << y, left, right);
      case ">>":
        return arithOp("right shift", "__shr", (x, y) => x >> y, left, right);
      case "..":
        const leftString = coerceString(left);
        const rightString = coerceString(right);
        if (leftString !== null && rightString !== null) {
          return leftString + rightString;
        } else if (left instanceof LuaTable) {
          const method = left.metamethod("__concat");
          if (method !== null) {
            return method(left, right);
          }
        } else if (right instanceof LuaTable) {
          const method = right.metamethod("__concat");
          if (method !== null) {
            return method(left, right);
          }
        }
        if (leftString === null) {
          throw new LuaTypeError("concatenate", left);
        } else {
          throw new LuaTypeError("concatenate", right);
        }
      case "<":
        return relOp("__lt", (x, y) => x < y, left, right);
      case "<=":
        return relOp("__le", (x, y) => x <= y, left, right);
      case ">":
        return relOp("__lt", (x, y) => x < y, right, left);
      case ">=":
        return relOp("__le", (x, y) => x <= y, right, left);
      case "==":
        return equals(left, right);
      case "~=":
        return !equals(left, right);
    }
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
    let done = false;
    for (let i = 0; i < stmt.ifBodies.length; ++i) {
      const [cond, block] = stmt.ifBodies[i];
      if (isTruthy(this.exprVisitor.visit(cond))) {
        evalBlock(new LuaEnvironment(this.env), block);
        done = true;
        break;
      }
    }
    if (!done && stmt.elseBody !== null) {
      evalBlock(new LuaEnvironment(this.env), stmt.elseBody);
    }
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
