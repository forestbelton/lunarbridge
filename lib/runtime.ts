import { Expr } from "./parser/ast.js";
import { parse } from "./parser/index.js";

// TODO: Add support for function values
export type LuaValue = null | boolean | number | string | LuaTable;

export class LuaTable {
  items: Record<string | number, LuaValue>;
}

export type LuaEnvironment = Record<string, LuaValue>;

export class LuaRuntime {
  globals: LuaEnvironment;

  execute(expr: string): LuaValue {
    const result = parse(expr, { startRule: "expr" }) as Expr;
    return this.evalExpr(this.globals, result);
  }

  executeScript(script: string) {
    const result = parse(script);
    console.log(result);
  }

  evalExpr(env: LuaEnvironment, expr: Expr): LuaValue {
    console.log(env);
    console.log(expr);
    return null;
  }
}
