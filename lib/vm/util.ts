import { LuaFunction, LuaFunctionContext } from "./func.js";
import { RK, isR } from "./insn.js";
import { LuaTable } from "./table.js";

export type LuaConstant = null | boolean | number | string;

export type LuaValue = LuaConstant | LuaFunction | LuaTable;

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

export const prettyPrintValue = (x: LuaValue): string => {
  let str: string;

  if (
    typeof x === "number" ||
    typeof x === "string" ||
    typeof x === "boolean"
  ) {
    str = x.toString();
  } else if (x instanceof LuaTable) {
    str = "table";
  } else if (x instanceof LuaFunction) {
    str = "function";
  } else {
    str = "nil";
  }

  return str;
};

export const pp = (
  rk: RK | number | boolean,
  ctx?: LuaFunctionContext
): string => {
  let str: string;

  if (typeof rk === "number" || typeof rk === "boolean") {
    str = "$" + rk.toString();
  } else if (isR(rk)) {
    str = `%R${rk.index}`;
    if (typeof ctx !== "undefined") {
      str = `${str} (${prettyPrintValue(ctx.RK(rk))})`;
    }
  } else {
    str = `$K${rk.index}`;
    if (typeof ctx !== "undefined") {
      str = `${str} (${prettyPrintValue(ctx.RK(rk))})`;
    }
  }

  return str;
};
