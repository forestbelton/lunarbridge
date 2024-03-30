import { LuaValue, LuaTable } from "./value.js";

export class LuaError extends Error {}

export class LuaTypeError extends LuaError {
  constructor(message: string, value: LuaValue) {
    super(`attempt to ${message} a ${getTypeName(value)} value`);
  }
}

export const getTypeName = (value: LuaValue): string => {
  if (typeof value === "string") {
    return "string";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else if (typeof value === "function") {
    return "function";
  } else if (value === null) {
    return "nil";
  } else if (value instanceof LuaTable) {
    return "table";
  }
  throw new LuaError("tried to get name of unknown type");
};

export const isTruthy = (value: LuaValue) => value !== null && value !== false;

export const isFalsy = (value: LuaValue) => !isTruthy(value);
