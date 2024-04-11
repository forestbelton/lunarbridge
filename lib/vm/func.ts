import { Insn, K, R, RK, isR } from "./insn.js";
import { LuaConstant, LuaValue } from "./util.js";

export type LuaFunctionDebugInfo = {
  filename?: string;
  lineNumberStart: number;
  lineNumberEnd: number;
  sourceLines: number[];
};

export class LuaFunction {
  numRegisters: number;
  instructions: Insn[];
  constants: LuaConstant[];
  functions: LuaFunction[];
  locals: string[];
  upvalues: string[];
  debug?: LuaFunctionDebugInfo;

  constructor(
    numRegisters: number,
    instructions: Insn[],
    constants: LuaConstant[],
    functions: LuaFunction[],
    locals: string[],
    upvalues: string[],
    debug?: LuaFunctionDebugInfo
  ) {
    this.numRegisters = numRegisters;
    this.instructions = instructions;
    this.constants = constants;
    this.functions = functions;
    this.locals = locals;
    this.upvalues = upvalues;
    this.debug = debug;
  }
}

export class LuaFunctionContext {
  func: LuaFunction;
  dst: R;
  retvals: LuaValue[];
  registers: LuaValue[];
  instructionPointer: number;

  constructor(func: LuaFunction, dst: R, retvals: number, params: LuaValue[]) {
    this.func = func;
    this.dst = dst;

    this.retvals = new Array(retvals);
    this.retvals.fill(null);

    this.registers = new Array(func.numRegisters);
    for (let i = 0; i < func.numRegisters; i++) {
      this.registers[i] = i < params.length ? params[i] : null;
    }

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
