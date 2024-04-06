import { Insn, Opcode } from "./insn.js";
import { LuaVM } from "./vm.js";

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

export type LuaConstant = null | boolean | number | string;

export type LuaValue = LuaConstant | LuaFunction<any> | LuaTable;

export type LuaFunctionSource<Filename> = {
  filename: Filename;
  lineNumberStart: number;
  lineNumberEnd: number;
};

export type LuaFunctionLocal = {
  name: string;
  pcStart: number;
  pcEnd: number;
};

export class LuaFunction<Filename> {
  source: LuaFunctionSource<Filename>;
  maxStackSize: number;
  instructions: Insn[];
  constants: LuaConstant[];
  functions: LuaFunction<void>[];
  sourceLines: number[];
  locals: LuaFunctionLocal[];
  upvalues: string[];

  constructor(
    source: LuaFunctionSource<Filename>,
    maxStackSize: number,
    instructions: Insn[],
    constants: LuaConstant[],
    functions: LuaFunction<void>[],
    sourceLines: number[],
    locals: LuaFunctionLocal[],
    upvalues: string[]
  ) {
    this.source = source;
    this.maxStackSize = maxStackSize;
    this.instructions = instructions;
    this.constants = constants;
    this.functions = functions;
    this.sourceLines = sourceLines;
    this.locals = locals;
    this.upvalues = upvalues;
  }
}

class TodoError extends Error {}

export class LuaFunctionContext {
  vm: LuaVM;
  func: LuaFunction<any>;
  registers: LuaValue[];
  instructionPointer: number;

  constructor(vm: LuaVM, func: LuaFunction<any>) {
    this.vm = vm;
    this.func = func;
    this.registers = new Array(func.maxStackSize);
    this.instructionPointer = 0;
  }

  step() {
    const insn = this.func.instructions[this.instructionPointer++];
    switch (insn[0]) {
      case Opcode.MOVE:
        this.registers[insn[1]] = this.registers[insn[2]];
        break;

      case Opcode.LOADK:
        this.registers[insn[1]] = this.func.constants[insn[2]];
        break;

      case Opcode.LOADBOOL:
        this.registers[insn[1]] = !!insn[2];
        if (insn[3] !== 0) {
          this.instructionPointer++;
        }
        break;

      case Opcode.LOADNIL:
        for (let i = insn[1]; i <= insn[2]; i++) {
          this.registers[i] = null;
        }
        break;

      case Opcode.GETUPVAL:
        throw new TodoError();

      case Opcode.GETGLOBAL:
        const key = this.func.constants[insn[2]];
        if (typeof key !== "string") {
          throw new TodoError();
        }
        let global = null;
        if (typeof this.vm.globals[key] !== "undefined") {
          global = this.vm.globals[key];
        }
        this.registers[insn[1]] = global;
        break;

      case Opcode.SETGLOBAL:
        const key1 = this.func.constants[insn[2]];
        if (typeof key1 !== "string") {
          throw new TodoError();
        }
        this.vm.globals[key1] = this.registers[insn[1]];
        break;
    }
  }
}
