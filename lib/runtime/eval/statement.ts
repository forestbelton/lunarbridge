import {
  AssignStatement,
  BreakStatement,
  CallStatement,
  DeclareStatement,
  DoStatement,
  ForInStatement,
  ForRangeStatement,
  FunctionStatement,
  Identifier,
  IfElseStatement,
  LabelStatement,
  RepeatStatement,
  Var,
  WhileStatement,
} from "../../parser/ast.js";
import { LuaError, getTypeName, isTruthy } from "../utils.js";
import { LuaEnvironment, LuaValue } from "../value.js";
import { evalBlock } from "./block.js";
import { InterpretExprVisitor } from "./expression.js";
import { StatementVisitor } from "./visitor.js";

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
