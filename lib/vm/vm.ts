import { LuaFunctionContext, LuaValue } from "./func.js";

export class LuaVM {
  globals: Record<string, LuaValue>;
  callStack: LuaFunctionContext[];

  constructor() {
    this.globals = {};
    this.callStack = [];
  }
}
