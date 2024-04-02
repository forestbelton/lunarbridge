export class LuaEnvironment {
  parent?: LuaEnvironment;
  values: Record<string, LuaValue>;

  constructor(parent?: LuaEnvironment, values?: Record<string, LuaValue>) {
    this.parent = parent;
    this.values = values || {};
  }

  get(key: string): LuaValue {
    let value = null;
    if (typeof this.values[key] !== "undefined") {
      value = this.values[key];
    } else if (typeof this.parent !== "undefined") {
      value = this.parent.get(key);
    }
    return value;
  }

  set(key: string, value: LuaValue) {
    if (typeof this.parent !== "undefined" && this.parent.get(key) !== null) {
      this.parent.set(key, value);
    } else {
      this.values[key] = value;
    }
  }
}

export type LuaFunction = (...args: LuaValue[]) => LuaValue;

export type LuaValue =
  | null
  | boolean
  | number
  | string
  | LuaTable
  | LuaFunction;

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

  metamethod(name: string): LuaFunction | null {
    if (this.metatable === null) {
      return null;
    }

    const value = this.metatable.get(name);
    return typeof value !== "function" ? null : value;
  }
}
