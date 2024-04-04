import { parse } from "../parser/parser.js";
import { evalBlock } from "./eval/block.js";
import { InterpretExprVisitor } from "./eval/expression.js";
import { LuaEnvironment, LuaValue } from "./value.js";

export class LuaRuntime {
  globals: LuaEnvironment;

  constructor(globals?: Record<string, LuaValue>) {
    this.globals = new LuaEnvironment(undefined, globals);
  }

  execute(rawExpr: string): LuaValue {
    const expr = parse(rawExpr, { startRule: "expr" });
    return new InterpretExprVisitor(this.globals).visit(expr);
  }

  executeScript(script: string) {
    const block = parse(script);
    evalBlock(this.globals, block);
  }
}
