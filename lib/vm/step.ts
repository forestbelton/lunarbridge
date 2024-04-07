import { LuaFunctionContext } from "./func.js";
import { Opcode, R } from "./insn.js";
import { LuaTable } from "./table.js";
import { LuaValue, coerceString, isTable, toNumber } from "./util.js";

export const step = (ctx: LuaFunctionContext) => {
  let key: LuaValue = null;
  let value: LuaValue = null;
  let table: LuaValue = null;
  let lhs: number | null = null;
  let rhs: number | null = null;

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
        typeof ctx.vm.globals[key] !== "undefined" ? ctx.vm.globals[key] : null;
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
      if (typeof key !== "string") {
        throw new Error();
      }
      ctx.vm.globals[key] = ctx.R(insn.value);
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
    case Opcode.TAILCALL:
    case Opcode.RETURN:
    case Opcode.FORLOOP:
    case Opcode.FORPREP:
    case Opcode.TFORLOOP:
    case Opcode.CLOSE:
    case Opcode.CLOSURE:
      throw new Error();
  }
};
