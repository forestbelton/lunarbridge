import { Insn, K, R, RK, isR } from "./insn.js";
import { LuaConstant, LuaValue } from "./util.js";
import { LuaVM } from "./vm.js";

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

  R(r: R): LuaValue {
    return this.registers[r.index];
  }

  K(k: K): LuaValue {
    return this.func.constants[k.index];
  }

  RK(rk: RK): LuaValue {
    return isR(rk) ? this.R(rk) : this.K(rk);
  }
}
