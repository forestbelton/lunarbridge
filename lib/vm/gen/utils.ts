import { LuaFunction } from "../func.js";
import { OperandType, Operand, operand, BaseInsn } from "../insn.js";
import { LuaConstant } from "../util.js";

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

export class IndexedSet<A> {
  values: A[];
  indexes: Map<A, number>;

  constructor(values?: A[]) {
    this.values = [];
    this.indexes = new Map();
    (values || []).forEach((value) => this.insert(value));
  }

  insert(value: A): number {
    let index = this.indexes.get(value);
    if (typeof index === "undefined") {
      index = this.values.length;
      this.values.push(value);
      this.indexes.set(value, index);
    }
    return index;
  }

  has(value: A): boolean {
    return this.indexes.has(value);
  }
}

export type ConstantPool = IndexedSet<LuaConstant>;

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
  functions: LuaFunction[];
  locals: Record<string, T>;
  upvalues: string[];

  constructor(locals: string[]) {
    this.allocator = new TemporaryRegisterAllocator();
    this.constants = new IndexedSet();
    this.functions = [];
    this.locals = {};
    locals.forEach((local) => {
      this.locals[local] = this.allocator.alloc();
    });
    this.upvalues = [];
  }

  location(name: string): Loc {
    if (typeof this.locals[name] !== "undefined") {
      return this.locals[name];
    }

    // TODO: Fix
    return { type: "global", key_constant_index: this.constants.insert(name) };
  }

  getConstants(): LuaConstant[] {
    return this.constants.values;
  }
}
