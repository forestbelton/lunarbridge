import { parse } from "../parser/parser.js";
import { LuaFunctionContext } from "./func.js";
import { genBlock } from "./gen/block.js";
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
    const insns = genBlock(block);
    console.log(insns);
  }
}
