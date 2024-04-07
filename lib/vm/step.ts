import { LuaFunctionContext } from "./func.js";
import { Opcode } from "./insn.js";
import { LuaTable } from "./table.js";
import { LuaValue, isTable, toNumber } from "./util.js";

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
      const lhs = toNumber(ctx.RK(insn.lhs));
      const rhs = toNumber(ctx.RK(insn.rhs));
      if (lhs !== null && rhs !== null) {
        ctx.registers[insn.dst.index] = lhs + rhs;
      } else {
        throw new Error();
      }
      break;
  }
};
