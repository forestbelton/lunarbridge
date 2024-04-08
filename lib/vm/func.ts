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
  numRegisters: number;
  instructions: Insn[];
  constants: LuaConstant[];
  functions: LuaFunction<void>[];
  sourceLines: number[];
  locals: LuaFunctionLocal[];
  upvalues: string[];

  constructor(
    source: LuaFunctionSource<Filename>,
    numRegisters: number,
    instructions: Insn[],
    constants: LuaConstant[],
    functions: LuaFunction<void>[],
    sourceLines: number[],
    locals: LuaFunctionLocal[],
    upvalues: string[]
  ) {
    this.source = source;
    this.numRegisters = numRegisters;
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
    this.registers = new Array(func.numRegisters);
    this.instructionPointer = 0;
  }

  R(r: R): LuaValue {
    if (r.index >= this.registers.length) {
      throw new Error();
    }
    return this.registers[r.index];
  }

  K(k: K): LuaValue {
    if (k.index >= this.func.constants.length) {
      throw new Error();
    }
    return this.func.constants[k.index];
  }

  RK(rk: RK): LuaValue {
    return isR(rk) ? this.R(rk) : this.K(rk);
  }
}
