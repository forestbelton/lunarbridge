import { parse } from "../parser/parser.js";
import { LuaFunctionContext } from "./func.js";
import { genFunc } from "./gen/block.js";
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

    const func = genFunc(block);
    console.log(func.instructions);

    const context = new LuaFunctionContext(this.valueStack, func, 0);
    this.callStack.push(context);
    this.run();
  }

  run() {
    while (this.callStack.length > 0) {
      step(this);
    }
  }
}
