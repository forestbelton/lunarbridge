import { LuaFunction } from "./func.js";
import { LuaTable } from "./table.js";

export type LuaConstant = null | boolean | number | string;

export type LuaValue = LuaConstant | LuaFunction<any> | LuaTable;

export const isTable = (x: LuaValue): x is LuaTable => x instanceof LuaTable;

export const toNumber = (x: LuaValue): number | null => {
  let value: number | null = null;

  if (typeof x === "number") {
    value = x;
  } else if (typeof x === "string") {
    value = parseFloat(x);
  }

  return value;
};

export const coerceString = (x: LuaValue): string | null => {
  let value: string | null = null;

  if (typeof x === "number") {
    value = x.toString();
  } else if (typeof x === "string") {
    value = x;
  }

  return value;
};

const EMPTY_TABLE = new LuaTable();

export const metatable = (x: LuaValue): LuaTable => {
  let table = EMPTY_TABLE;

  if (x instanceof LuaTable) {
    table = x.metatable || EMPTY_TABLE;
  }

  return table;
};
