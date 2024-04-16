import { parse } from "../parser/parser.js";
import { LuaFunction, LuaFunctionContext } from "./func.js";
import { genFunc } from "./gen/block.js";
import { R } from "./insn.js";
import { step } from "./step.js";
import { LuaValue } from "./util.js";

export class LuaVM {
  globals: Record<string, LuaValue>;
  callStack: LuaFunctionContext[];
  valueStack: LuaValue[];

  constructor() {
    this.globals = {};
    this.callStack = [];
    this.valueStack = [];
  }

  loadScript(script: string) {
    const block = parse(script);
    const func = genFunc(block, []);
    this.pushContext(func, R(0), 0, []);
    this.run();
  }

  pushContext(func: LuaFunction, dst: R, retvals: number, params: LuaValue[]) {
    const context = new LuaFunctionContext(func, dst, retvals, params);
    this.callStack.push(context);
  }

  popContext() {
    const context = this.callStack.pop();
    if (typeof context === "undefined") {
      throw new Error();
    }
    if (this.callStack.length === 0) {
      return;
    }
    const dst = context.dst.index;
    const next = this.callStack[this.callStack.length - 1];
    for (let i = 0; i < context.retvals.length; ++i) {
      next.registers[dst + i] = context.retvals[i];
    }
  }

  run() {
    while (this.callStack.length > 0) {
      step(this);
    }
  }
}
