import { LuaVM } from "./dist/index.js";

const vm = new LuaVM();
vm.loadScript(`
  x = 1 * 2
`);
