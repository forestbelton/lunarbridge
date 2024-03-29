import { LuaRuntime } from "./build/runtime/runtime.js";
import { LuaTable } from "./build/runtime/value.js";

const runtime = new LuaRuntime();
runtime.globals.a = new LuaTable([1, 2, 3]);

console.log("a[1] =", runtime.execute(`a[1]`));
console.log("a[4] =", runtime.execute(`a[4]`));
console.log("b =", runtime.execute("b"));
