import { LuaVM } from "./dist/index.js";

const vm = new LuaVM();

vm.loadScript(`
  function fib(n)
    local a = 1
    local b = 1
    for i = 1, n do
        local t = a + b
        a = b
        b = t
    end
    return a
  end

  x = fib(10)
`);

console.log(vm.globals.fib.instructions);
