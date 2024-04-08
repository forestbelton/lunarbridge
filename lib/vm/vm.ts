import { LuaFunctionContext } from "./func.js";
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
}
