import { LuaFunction } from "./func.js";
import { Insn, Opcode, R, disassemble, disassembleAt } from "./insn.js";
import { LuaTable } from "./table.js";
import { LuaValue, coerceString, isTable, pp, toNumber } from "./util.js";
import { LuaVM } from "./vm.js";

export const step = (vm: LuaVM) => {
  let key: LuaValue = null;
  let value: LuaValue = null;
  let table: LuaValue = null;
  let lhs: number | null = null;
  let rhs: number | null = null;

  const ctx = vm.callStack[vm.callStack.length - 1];
  const programCounter = ctx.instructionPointer;
  const insn = ctx.func.instructions[ctx.instructionPointer++];

  switch (insn.type) {
    case Opcode.MOVE:
      ctx.registers[insn.dst.index] = ctx.R(insn.src);
      break;

    case Opcode.LOADK:
      ctx.registers[insn.dst.index] = ctx.K(insn.src);
      break;

    case Opcode.LOADBOOL:
      ctx.registers[insn.dst.index] = insn.value;
      if (insn.cond) {
        ctx.instructionPointer++;
      }
      break;

    case Opcode.LOADNIL:
      for (let i = insn.start.index; i <= insn.end.index; ++i) {
        ctx.registers[i] = null;
      }
      break;

    case Opcode.GETGLOBAL:
      key = ctx.K(insn.key);
      if (typeof key !== "string") {
        throw new Error();
      }
      ctx.registers[insn.dst.index] =
        typeof vm.globals[key] !== "undefined" ? vm.globals[key] : null;
      break;

    case Opcode.GETUPVAL:
      throw new Error();

    case Opcode.GETTABLE:
      table = ctx.R(insn.src);
      if (!isTable(table)) {
        throw new Error();
      }
      ctx.registers[insn.dst.index] = table.get(ctx.RK(insn.key));
      break;

    case Opcode.SETGLOBAL:
      key = ctx.K(insn.key);
      value = ctx.R(insn.value);
      if (typeof key !== "string") {
        throw new Error();
      }
      vm.globals[key] = value;
      break;

    case Opcode.SETUPVAL:
      throw new Error();

    case Opcode.SETTABLE:
      table = ctx.R(insn.table);
      if (!isTable(table)) {
        throw new Error();
      }
      table.set(ctx.RK(insn.key), ctx.RK(insn.value));
      break;

    case Opcode.NEWTABLE:
      ctx.registers[insn.dst.index] = new LuaTable();
      break;

    case Opcode.SELF:
      table = ctx.R(insn.table);
      if (!isTable(table)) {
        throw new Error();
      }
      ctx.registers[insn.dst.index] = table.get(ctx.RK(insn.field));
      ctx.registers[insn.dst.index + 1] = table;
      break;

    case Opcode.ADD:
      lhs = toNumber(ctx.RK(insn.lhs));
      rhs = toNumber(ctx.RK(insn.rhs));
      if (lhs !== null && rhs !== null) {
        ctx.registers[insn.dst.index] = lhs + rhs;
      } else {
        throw new Error();
      }
      break;

    case Opcode.SUB:
      lhs = toNumber(ctx.RK(insn.lhs));
      rhs = toNumber(ctx.RK(insn.rhs));
      if (lhs !== null && rhs !== null) {
        ctx.registers[insn.dst.index] = lhs - rhs;
      } else {
        throw new Error();
      }
      break;

    case Opcode.MUL:
      lhs = toNumber(ctx.RK(insn.lhs));
      rhs = toNumber(ctx.RK(insn.rhs));
      if (lhs !== null && rhs !== null) {
        ctx.registers[insn.dst.index] = lhs * rhs;
      } else {
        throw new Error();
      }
      break;

    case Opcode.DIV:
      lhs = toNumber(ctx.RK(insn.lhs));
      rhs = toNumber(ctx.RK(insn.rhs));
      if (lhs !== null && rhs !== null) {
        ctx.registers[insn.dst.index] = lhs / rhs;
      } else {
        throw new Error();
      }
      break;

    case Opcode.MOD:
      lhs = toNumber(ctx.RK(insn.lhs));
      rhs = toNumber(ctx.RK(insn.rhs));
      if (lhs !== null && rhs !== null) {
        ctx.registers[insn.dst.index] = lhs % rhs;
      } else {
        throw new Error();
      }
      break;

    case Opcode.POW:
      lhs = toNumber(ctx.RK(insn.lhs));
      rhs = toNumber(ctx.RK(insn.rhs));
      if (lhs !== null && rhs !== null) {
        ctx.registers[insn.dst.index] = Math.pow(lhs, rhs);
      } else {
        throw new Error();
      }
      break;

    case Opcode.UNM:
      lhs = toNumber(ctx.R(insn.src));
      if (lhs !== null) {
        ctx.registers[insn.dst.index] = -lhs;
      } else {
        throw new Error();
      }
      break;

    case Opcode.NOT:
      ctx.registers[insn.dst.index] = !ctx.R(insn.src);
      break;

    case Opcode.LEN:
      key = ctx.R(insn.src);
      if (typeof key === "string") {
        value = key.length;
      } else if (isTable(key)) {
        value = key.size();
      } else {
        throw new Error();
      }
      ctx.registers[insn.dst.index] = value;
      break;

    case Opcode.CONCAT:
      const list: string[] = [];
      for (let i = insn.start.index; i < insn.end.index; ++i) {
        value = coerceString(ctx.R(R(i)));
        if (value === null) {
          throw new Error();
        }
        list.push(value);
      }
      ctx.registers[insn.dst.index] = list.join("");
      break;

    case Opcode.JMP:
      ctx.instructionPointer += insn.offset;
      if (
        ctx.instructionPointer < 0 ||
        ctx.instructionPointer > ctx.func.instructions.length
      ) {
        throw new Error();
      }
      break;

    case Opcode.TEST:
      if (!!ctx.R(insn.src) === insn.value) {
        ctx.instructionPointer++;
      }
      break;

    case Opcode.TESTSET:
      if (!!ctx.R(insn.src) !== insn.value) {
        ctx.registers[insn.dst.index] = ctx.R(insn.src);
      } else {
        ctx.instructionPointer++;
      }
      break;

    case Opcode.CALL:
      const params: LuaValue[] = [];
      for (let i = 0; i < insn.arity - 1; ++i) {
        params.push(ctx.registers[insn.func.index + i]);
      }

      const func = ctx.registers[insn.func.index];
      if (!(func instanceof LuaFunction)) {
        throw new Error();
      }
      vm.pushContext(func, insn.func, insn.retvals, params);
      break;

    case Opcode.TAILCALL:
      throw new Error();

    case Opcode.RETURN:
      for (let i = 0; i < Math.min(insn.retvals - 1, ctx.retvals.length); ++i) {
        const index = insn.start.index + i;
        ctx.retvals[i] =
          index < ctx.registers.length ? ctx.registers[index] : null;
      }
      vm.popContext();
      break;

    case Opcode.FORPREP:
      lhs = toNumber(ctx.R(insn.start));
      rhs = toNumber(ctx.registers[insn.start.index + 2]);
      if (lhs === null || rhs === null) {
        throw new Error();
      }
      ctx.registers[insn.start.index] = lhs - rhs;
      ctx.instructionPointer += insn.endoffset;
      break;

    case Opcode.FORLOOP:
      let current = toNumber(ctx.registers[insn.start.index]);
      const end = toNumber(ctx.registers[insn.start.index + 1]);
      const step = toNumber(ctx.registers[insn.start.index + 2]);
      if (current === null || end === null || step === null) {
        throw new Error();
      }
      current += step;
      ctx.registers[insn.start.index] = current;
      if ((step >= 0 && current < end) || (step < 0 && current > end)) {
        ctx.instructionPointer += insn.startoffset;
        ctx.registers[insn.start.index + 3] = current;
      }
      break;

    case Opcode.TFORLOOP:
      throw new Error();

    case Opcode.CLOSE:
      throw new Error();

    case Opcode.CLOSURE:
      const _func = ctx.func.functions[insn.index];
      ctx.registers[insn.dst.index] = _func;
      for (let i = 0; i < _func.upvalues.length; ++i) {
        const insn = ctx.func.instructions[ctx.instructionPointer++];
        // TODO: Parse following MOVE/GETUPVAL meta-instructions
      }
      break;
  }

  console.log(disassembleAt(ctx, programCounter));
};
