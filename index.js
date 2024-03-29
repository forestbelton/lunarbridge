import { LuaRuntime } from "./lib/runtime.js";

const runtime = new LuaRuntime();

runtime.executeScript(`
tbl = {
    x = 1,
    ["y"] = 2,
    3,
}
`);
