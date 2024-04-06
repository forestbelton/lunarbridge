export enum Opcode {
  MOVE,
  LOADK,
  LOADBOOL,
  LOADNIL,
  GETUPVAL,
  GETGLOBAL,
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
  POW,
  UNM,
  NOT,
  CONCAT,
  JMP,
  EQ,
  LT,
  LE,
  TEST,
  CALL,
  TAILCALL,
  RETURN,
  FORLOOP,
  TFORLOOP,
  TFORPREP,
  SETLIST,
  SETLISTO,
  CLOSE,
  CLOSURE,
}

export type Insn =
  | [Opcode.MOVE, number, number]
  | [Opcode.LOADK, number, number]
  | [Opcode.LOADBOOL, number, number, number]
  | [Opcode.LOADNIL, number, number]
  | [Opcode.GETUPVAL, number, number]
  | [Opcode.GETGLOBAL, number, number]
  | [Opcode.GETTABLE, number, number]
  | [Opcode.SETGLOBAL, number, number]
  | [Opcode.SETUPVAL, number, number]
  | [Opcode.SETTABLE, number, number, number];
