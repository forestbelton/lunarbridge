import { parse } from "./build/parser/parser.js";
import { LuaRuntime } from "./build/runtime/runtime.js";
import { LuaEnvironment, LuaTable } from "./build/runtime/value.js";

const runtime = new LuaRuntime(
  new LuaEnvironment(undefined, {
    a: new LuaTable([1, 2, 3]),
  })
);

// console.log("a[1] =", runtime.execute(`a[1]`));
// console.log("a[4] =", runtime.execute(`a[4]`));
// console.log("b =", runtime.execute("b"));
// console.log(parse("() return 1 end", { startRule: "funcbody" }));

console.log(runtime.execute("(function() return 1 end)()"));
