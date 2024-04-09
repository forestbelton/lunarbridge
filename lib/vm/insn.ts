export enum Opcode {
  MOVE,
  LOADK,
  LOADBOOL,
  LOADNIL,
  GETGLOBAL,
  GETUPVAL,
  GETTABLE,
  SETGLOBAL,
  SETUPVAL,
  SETTABLE,
  NEWTABLE,
  SELF,
  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
  POW,
  UNM,
  NOT,
  LEN,
  CONCAT,
  JMP,
  EQ,
  LT,
  LE,
  TEST,
  TESTSET,
  CALL,
  TAILCALL,
  RETURN,
  FORLOOP,
  FORPREP,
  TFORLOOP,
  SETLIST,
  CLOSE,
  CLOSURE,
  VARARG,
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
  | InsnT<Opcode.RETURN, { start: R; retvals: R }>
  | InsnT<Opcode.FORLOOP, { start: R; startoffset: number }>
  | InsnT<Opcode.FORPREP, { start: R; endoffset: number }>
  | InsnT<Opcode.TFORLOOP, { start: R; numvars: number }>
  | InsnT<Opcode.SETLIST, { table: R; length: number }>
  | InsnT<Opcode.CLOSE, { index: number }>
  | InsnT<Opcode.CLOSURE, { dst: R; index: number }>
  | InsnT<Opcode.VARARG, { start: R; arity: number }>;

export type Insn = BaseInsn<R>;
