import { Insn, K, R, RK, isR } from "./insn.js";
import { LuaConstant, LuaValue } from "./util.js";

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

export const registerList = (
  stack: LuaValue[],
  base: number,
  length: number
) => {
  return new Proxy(stack, {
    get(target: LuaValue[], prop: string, receiver: any) {
      if (prop === "length") {
        return length;
      }
      const offset = parseInt(prop, 10);
      if (offset < 0 || offset >= length) {
        throw new Error();
      }
      return target[base + parseInt(prop, 10)];
    },
    set(target: LuaValue[], prop: string, value: any, receiver: any) {
      const index = base + parseInt(prop, 10);
      if (typeof target[index] !== "undefined") {
        target[index] = value;
        return true;
      }
      return false;
    },
  });
};

export class LuaFunctionContext {
  func: LuaFunction<any>;
  registers: LuaValue[];
  instructionPointer: number;

  constructor(stack: LuaValue[], func: LuaFunction<any>, numParams: number) {
    this.func = func;
    this.registers = registerList(
      stack,
      stack.length - numParams,
      func.numRegisters
    );
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
