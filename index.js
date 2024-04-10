import { LuaVM } from "./dist/index.js";

const vm = new LuaVM();
vm.loadScript(`
  y = {
    x = 1,
    z = {1, 2, 3},
  }
`);
