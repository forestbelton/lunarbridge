import { LuaRuntime } from "./build/runtime/runtime.js";

const runtime = new LuaRuntime();
runtime.executeScript(`
  function fib(n)
    a = 1
    b = 1
    for i = 1, n do
      t = a + b
      a = b
      b = t
    end
    return a
  end
`);

console.log(runtime.execute("fib(10)"));
