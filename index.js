import { LuaRuntime } from "./build/runtime.js";

const runtime = new LuaRuntime();
const result = runtime.execute(`{1}`);
console.log(result);
