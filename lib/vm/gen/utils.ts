import { OperandType, Operand, operand, BaseInsn, R } from "../insn.js";
import { LuaValue } from "../util.js";

export type T = Operand<OperandType.T>;

export const T = operand(OperandType.T);

export type RawInsn = BaseInsn<T>;

export class TemporaryRegisterAllocator {
  nextRegisterIndex: number;

  constructor(startingIndex: number = 0) {
    this.nextRegisterIndex = startingIndex;
  }

  alloc(): T {
    return T(this.nextRegisterIndex++);
  }
}

export class ConstantPool {
  constants: LuaValue[];
  indexes: Map<LuaValue, number>;

  constructor() {
    this.constants = [];
    this.indexes = new Map();
  }

  indexOf(value: LuaValue): number {
    let index = this.indexes.get(value);
    if (typeof index === "undefined") {
      index = this.constants.length;
      this.constants.push(value);
      this.indexes.set(value, index);
    }
    return index;
  }
}

export type Upvalue = {
  type: "upvalue";
  index: number;
};

export type Global = {
  type: "global";
  key_constant_index: number;
};

export type Loc = T | Upvalue | Global;

export class GenState {
  allocator: TemporaryRegisterAllocator;
  constants: ConstantPool;

  constructor() {
    this.allocator = new TemporaryRegisterAllocator();
    this.constants = new ConstantPool();
  }

  location(name: string): Loc {
    return T(-1);
  }
}
