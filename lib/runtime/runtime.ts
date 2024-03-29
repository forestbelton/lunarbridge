import { Expr } from "../parser/ast.js";
import { parse } from "../parser/parser.js";
import { InterpretExprVisitor } from "./eval.js";
import { LuaEnvironment, LuaValue } from "./value.js";

export class LuaRuntime {
  globals: LuaEnvironment;

  constructor() {
    this.globals = {};
  }

  execute(expr: string): LuaValue {
    const result = parse(expr, { startRule: "expr" });
    return this.evalExpr(this.globals, result);
  }

  executeScript(script: string) {
    const result = parse(script);
    console.log(result);
  }

  evalExpr(env: LuaEnvironment, expr: Expr): LuaValue {
    return new InterpretExprVisitor(env).visit(expr);
  }
}
