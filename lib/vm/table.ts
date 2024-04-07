import { LuaValue } from "./util.js";

export class LuaTable {
  nextID: number;
  items: Map<LuaValue, LuaValue>;
  metatable: LuaTable | null;

  constructor(items?: LuaValue[] | Map<LuaValue, LuaValue>) {
    this.nextID = 1;
    this.items = new Map();
    this.metatable = null;

    if (items instanceof Array) {
      this.nextID = items.length + 1;
      items.forEach((item, i) => {
        this.items.set(i + 1, item);
      });
    } else if (items instanceof Map) {
      this.items = items;
    }
  }

  get(key: LuaValue): LuaValue {
    const value = this.items.get(key);
    return typeof value !== "undefined" ? value : null;
  }

  set(key: LuaValue, value: LuaValue) {
    this.items.set(key, value);
  }

  insert(value: LuaValue) {
    this.items.set(this.nextID++, value);
  }

  size() {
    return this.items.size;
  }
}
