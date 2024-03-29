import { LuaRuntime } from "./lib/runtime.js";

const runtime = new LuaRuntime();
const result = runtime.execute(`1 + 2 * 3`);
console.log(result);
