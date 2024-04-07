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
  R = "R",
  K = "K",
}

type Operand<T extends OperandType> = {
  type: T;
  index: number;
};

export type R = Operand<OperandType.R>;

export const R = (index: number): R => ({ type: OperandType.R, index });

export type K = Operand<OperandType.K>;

export const K = (index: number): K => ({ type: OperandType.K, index });

export type RK = R | K;

export const isR = (rk: RK): rk is R => rk.type === OperandType.R;

export const isK = (rk: RK): rk is K => rk.type === OperandType.K;

export type Insn_MOVE = {
  type: Opcode.MOVE;
  dst: R;
  src: R;
};

export type Insn_LOADK = {
  type: Opcode.LOADK;
  dst: R;
  src: K;
};

export type Insn_LOADBOOL = {
  type: Opcode.LOADBOOL;
  dst: R;
  value: boolean;
  cond: boolean;
};

export type Insn_LOADNIL = {
  type: Opcode.LOADNIL;
  start: R;
  end: R;
};

export type Insn_GETGLOBAL = {
  type: Opcode.GETGLOBAL;
  dst: R;
  key: K;
};

export type Insn_GETUPVAL = {
  type: Opcode.GETUPVAL;
  dst: R;
  index: number;
};

export type Insn_GETTABLE = {
  type: Opcode.GETTABLE;
  dst: R;
  src: R;
  key: RK;
};

export type Insn_SETTABLE = {
  type: Opcode.SETTABLE;
  table: R;
  key: RK;
  value: RK;
};

export type Insn_SETGLOBAL = {
  type: Opcode.SETGLOBAL;
  table: R;
  key: K;
  value: R;
};

export type Insn_SETUPVAL = {
  type: Opcode.SETUPVAL;
  index: number;
  value: R;
};

export type Insn_NEWTABLE = {
  type: Opcode.NEWTABLE;
  dst: R;
};

export type Insn_SELF = {
  type: Opcode.SELF;
  dst: R;
  table: R;
  field: RK;
};

type Insn_BINOP<Type extends Opcode> = {
  type: Type;
  dst: R;
  lhs: RK;
  rhs: RK;
};

type Insn_UNARYOP<Type extends Opcode> = {
  type: Type;
  dst: R;
  src: R;
};

type Insn_RELOP<Type extends Opcode> = {
  type: Type;
  cond: boolean;
  lhs: RK;
  rhs: RK;
};

export type Insn =
  | Insn_MOVE
  | Insn_LOADK
  | Insn_LOADBOOL
  | Insn_LOADNIL
  | Insn_GETGLOBAL
  | Insn_GETUPVAL
  | Insn_GETTABLE
  | Insn_SETTABLE
  | Insn_SETGLOBAL
  | Insn_SETUPVAL
  | Insn_NEWTABLE
  | Insn_SELF
  | Insn_BINOP<Opcode.ADD>
  | Insn_BINOP<Opcode.SUB>
  | Insn_BINOP<Opcode.MUL>
  | Insn_BINOP<Opcode.DIV>
  | Insn_BINOP<Opcode.MOD>
  | Insn_BINOP<Opcode.POW>
  | Insn_UNARYOP<Opcode.UNM>
  | Insn_UNARYOP<Opcode.NOT>
  | Insn_UNARYOP<Opcode.LEN>
  | Insn_RELOP<Opcode.EQ>
  | Insn_RELOP<Opcode.LT>
  | Insn_RELOP<Opcode.LE>;

/*export type Insn =
  | [Opcode.CONCAT, R, R, R]
  | [Opcode.JMP, number]
  | [Opcode.CALL, R, R, R]
  | [Opcode.RETURN, R, R]
  | [Opcode.TAILCALL, R, R]
  | [Opcode.VARARG, R, R]
  | [Opcode.TEST, R, boolean]
  | [Opcode.TESTSET, R, R, boolean]
  | [Opcode.FORPREP, R, number]
  | [Opcode.FORLOOP, R, number]
  | [Opcode.TFORLOOP, R, number]
  | [Opcode.NEWTABLE, R]
  | [Opcode.SETLIST, R, number, number]
  | [Opcode.CLOSE, R, number]
  | [Opcode.CLOSURE, R];
*/
