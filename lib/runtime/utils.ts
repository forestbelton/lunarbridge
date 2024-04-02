import { LuaValue, LuaTable } from "./value.js";

export class LuaError extends Error {}

export class LuaTypeError extends LuaError {
  constructor(message: string, value: LuaValue) {
    super(`attempt to ${message} a ${getTypeName(value)} value`);
  }
}

export enum LuaType {
  BOOLEAN,
  FUNCTION,
  NIL,
  NUMBER,
  STRING,
  TABLE,
}

export const getType = (value: LuaValue): LuaType => {
  let type: LuaType | undefined;

  if (typeof value === "string") {
    type = LuaType.STRING;
  } else if (typeof value === "number") {
    type = LuaType.NUMBER;
  } else if (typeof value === "boolean") {
    type = LuaType.BOOLEAN;
  } else if (typeof value === "function") {
    type = LuaType.FUNCTION;
  } else if (value === null) {
    type = LuaType.NIL;
  } else if (value instanceof LuaTable) {
    type = LuaType.TABLE;
  }

  if (typeof type === "undefined") {
    throw new LuaError("tried to get name of unknown type");
  }

  return type;
};

const LUA_TYPE_NAMES: Record<LuaType, string> = {
  [LuaType.BOOLEAN]: "boolean",
  [LuaType.FUNCTION]: "function",
  [LuaType.NIL]: "nil",
  [LuaType.NUMBER]: "number",
  [LuaType.STRING]: "string",
  [LuaType.TABLE]: "table",
};

export const getTypeName = (value: LuaValue): string =>
  LUA_TYPE_NAMES[getType(value)];

export const isTruthy = (value: LuaValue) => value !== null && value !== false;

export const isFalsy = (value: LuaValue) => !isTruthy(value);
