import { LuaFunctionContext } from "./func.js";
import { pp } from "./util.js";

export enum Opcode {
  MOVE = "MOVE",
  LOADK = "LOADK",
  LOADBOOL = "LOADBOOL",
  LOADNIL = "LOADNIL",
  GETGLOBAL = "GETGLOBAL",
  GETUPVAL = "GETUPVAL",
  GETTABLE = "GETTABLE",
  SETGLOBAL = "SETGLOBAL",
  SETUPVAL = "SETUPVAL",
  SETTABLE = "SETTABLE",
  NEWTABLE = "NEWTABLE",
  SELF = "SELF",
  ADD = "ADD",
  SUB = "SUB",
  MUL = "MUL",
  DIV = "DIV",
  MOD = "MOD",
  POW = "POW",
  UNM = "UNM",
  NOT = "NOT",
  LEN = "LEN",
  CONCAT = "CONCAT",
  JMP = "JMP",
  EQ = "EQ",
  LT = "LT",
  LE = "LE",
  TEST = "TEST",
  TESTSET = "TESTSET",
  CALL = "CALL",
  TAILCALL = "TAILCALL",
  RETURN = "RETURN",
  FORLOOP = "FORLOOP",
  FORPREP = "FORPREP",
  TFORLOOP = "TFORLOOP",
  SETLIST = "SETLIST",
  CLOSE = "CLOSE",
  CLOSURE = "CLOSURE",
  VARARG = "VARARG",
}

export enum OperandType {
  R = "R", // Register
  K = "K", // Constant
  T = "T", // Temporary
}

export type Operand<T extends OperandType> = {
  type: T;
  index: number;
};

export const operand =
  <Type extends OperandType>(type: Type): ((index: number) => Operand<Type>) =>
  (index: number) => {
    if (index < 0) {
      throw new Error();
    }
    return { type, index };
  };

export type R = Operand<OperandType.R>;

export const R = operand(OperandType.R);

export type K = Operand<OperandType.K>;

export const K = operand(OperandType.K);

export type RK = R | K;

export const isR = (rk: RK): rk is R => rk.type === OperandType.R;

export const isK = (rk: RK): rk is K => rk.type === OperandType.K;

type InsnT<Type extends Opcode, Data> = { type: Type } & Data;

type InsnUnaryOp<R, Type extends Opcode> = InsnT<Type, { dst: R; src: R }>;

type InsnBinOp<R, Type extends Opcode> = InsnT<
  Type,
  { dst: R; lhs: R | K; rhs: R | K }
>;

type InsnRelOp<R, Type extends Opcode> = InsnT<
  Type,
  { cond: boolean; lhs: R | K; rhs: R | K }
>;

export type JumpInsn = InsnT<Opcode.JMP, { offset: number }>;

export type BaseInsn<R> =
  | InsnT<Opcode.MOVE, { dst: R; src: R }>
  | InsnT<Opcode.LOADK, { dst: R; src: K }>
  | InsnT<Opcode.LOADBOOL, { dst: R; value: boolean; cond: boolean }>
  | InsnT<Opcode.LOADNIL, { start: R; end: R }>
  | InsnT<Opcode.GETUPVAL, { dst: R; index: number }>
  | InsnT<Opcode.GETGLOBAL, { dst: R; key: K }>
  | InsnT<Opcode.GETTABLE, { dst: R; src: R; key: R | K }>
  | InsnT<Opcode.SETGLOBAL, { key: K; value: R }>
  | InsnT<Opcode.SETUPVAL, { index: number; value: R }>
  | InsnT<Opcode.SETTABLE, { table: R; key: R | K; value: R | K }>
  | InsnT<Opcode.NEWTABLE, { dst: R }>
  | InsnT<Opcode.SELF, { dst: R; table: R; field: R | K }>
  | InsnBinOp<R, Opcode.ADD>
  | InsnBinOp<R, Opcode.SUB>
  | InsnBinOp<R, Opcode.MUL>
  | InsnBinOp<R, Opcode.DIV>
  | InsnBinOp<R, Opcode.MOD>
  | InsnBinOp<R, Opcode.POW>
  | InsnUnaryOp<R, Opcode.UNM>
  | InsnUnaryOp<R, Opcode.NOT>
  | InsnUnaryOp<R, Opcode.LEN>
  | InsnT<Opcode.CONCAT, { dst: R; start: R; end: R }>
  | JumpInsn
  | InsnRelOp<R, Opcode.EQ>
  | InsnRelOp<R, Opcode.LT>
  | InsnRelOp<R, Opcode.LE>
  | InsnT<Opcode.TEST, { src: R; value: boolean }>
  | InsnT<Opcode.TESTSET, { dst: R; src: R; value: boolean }>
  | InsnT<Opcode.CALL, { func: R; arity: number; retvals: number }>
  | InsnT<Opcode.TAILCALL, { func: R; arity: number }>
  | InsnT<Opcode.RETURN, { start: R; retvals: number }>
  | InsnT<Opcode.FORLOOP, { start: R; startoffset: number }>
  | InsnT<Opcode.FORPREP, { start: R; endoffset: number }>
  | InsnT<Opcode.TFORLOOP, { start: R; numvars: number }>
  | InsnT<Opcode.SETLIST, { table: R; length: number }>
  | InsnT<Opcode.CLOSE, { index: number }>
  | InsnT<Opcode.CLOSURE, { dst: R; index: number }>
  | InsnT<Opcode.VARARG, { start: R; arity: number }>;

export type Insn = BaseInsn<R>;

export const disassembleAt = (
  ctx: LuaFunctionContext,
  programCounter: number
): string =>
  `PC=${programCounter} ` +
  disassemble(ctx.func.instructions[programCounter], ctx);

export const disassemble = (insn: Insn, ctx?: LuaFunctionContext): string => {
  switch (insn.type) {
    case Opcode.MOVE:
      return `MOVE ${pp(insn.dst)}, ${pp(insn.src, ctx)}`;
    case Opcode.LOADK:
      return `LOADK ${pp(insn.dst)}, ${pp(insn.src, ctx)}`;
    case Opcode.LOADNIL:
      return `LOADNIL ${pp(insn.start)}, ${pp(insn.end)}`;
    case Opcode.GETGLOBAL:
      return `GETGLOBAL ${pp(insn.key, ctx)}, ${pp(insn.dst, ctx)}`;
    case Opcode.GETTABLE:
      return `GETTABLE ${pp(insn.dst)}, ${pp(insn.src)}, ${pp(insn.key, ctx)}`;
    case Opcode.SETGLOBAL:
      return `SETGLOBAL ${pp(insn.key, ctx)}, ${pp(insn.value, ctx)}`;
    case Opcode.SETTABLE:
      return `SETTABLE ${pp(insn.table)}, ${pp(insn.key)}, ${pp(insn.value)}`;
    case Opcode.NEWTABLE:
      return `NEWTABLE ${pp(insn.dst)}`;
    case Opcode.ADD:
      return `ADD ${pp(insn.dst)}, ${pp(insn.lhs, ctx)}, ${pp(insn.rhs, ctx)}`;
    case Opcode.SUB:
      return `SUB ${pp(insn.dst)}, ${pp(insn.lhs, ctx)}, ${pp(insn.rhs, ctx)}`;
    case Opcode.MUL:
      return `MUL ${pp(insn.dst)}, ${pp(insn.lhs, ctx)}, ${pp(insn.rhs, ctx)}`;
    case Opcode.DIV:
      return `DIV ${pp(insn.dst)}, ${pp(insn.lhs, ctx)}, ${pp(insn.rhs, ctx)}`;
    case Opcode.MOD:
      return `MOD ${pp(insn.dst)}, ${pp(insn.lhs, ctx)}, ${pp(insn.rhs, ctx)}`;
    case Opcode.POW:
      return `POW ${pp(insn.dst)}, ${pp(insn.lhs, ctx)}, ${pp(insn.rhs, ctx)}`;
    case Opcode.UNM:
      return `UNM ${pp(insn.dst)}, ${pp(insn.src, ctx)}`;
    case Opcode.NOT:
      return `NOT ${pp(insn.dst)}, ${pp(insn.src, ctx)}`;
    case Opcode.LEN:
      return `LEN ${pp(insn.dst)}, ${pp(insn.src, ctx)}`;
    case Opcode.TEST:
      return `TEST ${pp(insn.src, ctx)}, ${pp(insn.value)}`;
    case Opcode.TESTSET:
      return `TESTSET ${pp(insn.dst)}, ${pp(insn.src, ctx)}, ${pp(insn.value)}`;
    case Opcode.CALL:
      return `CALL ${pp(insn.func)}, ${pp(insn.arity)}, ${pp(insn.retvals)}`;
    case Opcode.RETURN:
      return `RETURN ${pp(insn.start)}, ${pp(insn.retvals)}`;
    case Opcode.FORPREP:
      return `FORPREP ${pp(insn.start)}, ${pp(insn.endoffset)}`;
    case Opcode.CLOSURE:
      return `CLOSURE ${pp(insn.dst)}, $F${insn.index}`;
    default:
      throw new Error();
  }
};
