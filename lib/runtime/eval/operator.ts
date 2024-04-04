import {
  BinaryOperator,
  LazyBinaryOperator,
  UnaryOperator,
} from "../../parser/ast.js";
import {
  LuaError,
  LuaTypeError,
  coerceString,
  getTypeName,
  isTruthy,
} from "../utils.js";
import { LuaTable, LuaValue } from "../value.js";

export type UnaryOperation = (x: LuaValue) => LuaValue;

const bitNegate: UnaryOperation = (x) => {
  if (typeof x === "number") {
    return ~x;
  }

  if (x instanceof LuaTable) {
    const func = x.metamethod("__bnot");
    if (func !== null) {
      return func(x, x);
    }
  }

  throw new LuaTypeError("perform bitwise operation on", x);
};

const arithNegate: UnaryOperation = (x) => {
  if (typeof x === "number") {
    return -x;
  }

  if (x instanceof LuaTable) {
    const func = x.metamethod("__unm");
    if (func !== null) {
      return func(x, x);
    }
  }

  throw new LuaTypeError("perform negation on", x);
};

const lengthOf: UnaryOperation = (x) => {
  if (typeof x === "string") {
    return x.length;
  }

  if (x instanceof LuaTable) {
    const func = x.metamethod("__len");
    return func !== null ? func(x, x) : x.size();
  }

  throw new LuaTypeError("get length of", x);
};

export const UNARY_OPERATIONS: Record<UnaryOperator, UnaryOperation> = {
  "~": bitNegate,
  "-": arithNegate,
  not: (x) => !isTruthy(x),
  "#": lengthOf,
};

export type BinaryOperation = (x: LuaValue, y: LuaValue) => LuaValue;

const arithOp =
  (
    name: string,
    metafield: string,
    op: (x: number, y: number) => number
  ): BinaryOperation =>
  (left: LuaValue, right: LuaValue): LuaValue => {
    if (typeof left === "number" && typeof right === "number") {
      return op(left, right);
    }

    if (left instanceof LuaTable) {
      const method = left.metamethod(metafield);
      if (method !== null) {
        return method(left, right);
      }
    }

    if (right instanceof LuaTable) {
      const method = right.metamethod(metafield);
      if (method !== null) {
        return method(left, right);
      }
    }

    throw new LuaError(
      `attempt to ${name} a '${getTypeName(left)}' with a '${getTypeName(
        right
      )}'`
    );
  };

const relOp =
  (
    metafield: string,
    op: (x: number | string, y: number | string) => boolean
  ): BinaryOperation =>
  (left: LuaValue, right: LuaValue): boolean => {
    if (typeof left === "number" && typeof right === "number") {
      return op(left, right);
    }

    if (typeof left === "string" && typeof right === "string") {
      return op(left, right);
    }

    if (left instanceof LuaTable) {
      const method = left.metamethod(metafield);
      if (method !== null) {
        return isTruthy(method(left, right));
      }
    }

    if (right instanceof LuaTable) {
      const method = right.metamethod(metafield);
      if (method !== null) {
        return isTruthy(method(left, right));
      }
    }

    throw new LuaError(
      `attempt to compare a '${getTypeName(left)}' with a '${getTypeName(
        right
      )}'`
    );
  };

const concatenate = (x: LuaValue, y: LuaValue) => {
  const leftString = coerceString(x);
  const rightString = coerceString(y);

  if (leftString !== null && rightString !== null) {
    return leftString + rightString;
  }

  if (x instanceof LuaTable) {
    const method = x.metamethod("__concat");
    if (method !== null) {
      return method(x, y);
    }
  }

  if (y instanceof LuaTable) {
    const method = y.metamethod("__concat");
    if (method !== null) {
      return method(x, y);
    }
  }

  if (leftString === null) {
    throw new LuaTypeError("concatenate", x);
  } else {
    throw new LuaTypeError("concatenate", y);
  }
};

const equals: BinaryOperation = (left: LuaValue, right: LuaValue): boolean => {
  let isEqual = false;

  if (left === right) {
    isEqual = true;
  } else if (left instanceof LuaTable && right instanceof LuaTable) {
    const leftMethod = left.metamethod("__eq");
    const rightMethod = right.metamethod("__eq");
    if (leftMethod !== null) {
      isEqual = isTruthy(leftMethod(left, right));
    } else if (rightMethod !== null) {
      isEqual = isTruthy(rightMethod(left, right));
    }
  }

  return isEqual;
};

export const BINARY_OPERATIONS: Record<
  Exclude<BinaryOperator, LazyBinaryOperator>,
  BinaryOperation
> = {
  "+": arithOp("add", "__add", (x, y) => x + y),
  "-": arithOp("subtract", "__sub", (x, y) => x - y),
  "*": arithOp("multiply", "__mul", (x, y) => x * y),
  "/": arithOp("divide", "__div", (x, y) => x / y),
  "%": arithOp("modulo", "__mod", (x, y) => x % y),
  "^": arithOp("exponentiate", "__pow", (x, y) => Math.pow(x, y)),
  "//": arithOp("floor divide", "__idiv", (x, y) => Math.floor(x / y)),

  // TODO: Behavior similar to the addition operation, except that Lua will
  //       try a metamethod if any operand is neither an integer nor a float
  //       coercible to an integer.
  "&": arithOp("bitwise and", "__band", (x, y) => x & y),
  "|": arithOp("bitwise or", "__bor", (x, y) => x | y),
  "~": arithOp("bitwise xor", "__bxor", (x, y) => x ^ y),
  "<<": arithOp("left shift", "__shl", (x, y) => x << y),
  ">>": arithOp("right shift", "__shr", (x, y) => x >> y),

  "..": concatenate,

  "<": relOp("__lt", (x, y) => x < y),
  "<=": relOp("__le", (x, y) => x <= y),
  ">": relOp("__lt", (x, y) => x < y),
  ">=": relOp("__le", (x, y) => x <= y),

  "==": equals,
  "~=": (x: LuaValue, y: LuaValue) => !equals(x, y),
};
