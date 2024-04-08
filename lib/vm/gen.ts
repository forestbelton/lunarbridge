import {
  AssignStatement,
  Block,
  BreakStatement,
  CallStatement,
  ConstantExpr,
  DeclareStatement,
  DoStatement,
  Ellipsis,
  ForInStatement,
  ForRangeStatement,
  FunctionExpr,
  FunctionStatement,
  Identifier,
  IfElseStatement,
  LabelStatement,
  LazyBinaryOperator,
  RepeatStatement,
  StrictBinaryOperator,
  TableExpr,
  UnaryOperator,
  WhileStatement,
} from "../ast/ast.js";
import { ExprVisitor, StatementVisitor } from "../ast/visitor.js";
import { K, Opcode, RawInsn, T } from "./insn.js";
import { LuaValue } from "./util.js";

export class TemporaryRegisterAllocator {
  nextRegisterIndex: number;

  constructor() {
    this.nextRegisterIndex = 0;
  }

  alloc(): T {
    return T(this.nextRegisterIndex++);
  }
}

export class ConstantPool {
  constants: LuaValue[];
  indexes: Map<LuaValue, number>;

  constructor() {
    this.constants = [];
    this.indexes = new Map();
  }

  indexOf(value: LuaValue): number {
    let index = this.indexes.get(value);
    if (typeof index === "undefined") {
      index = this.constants.length;
      this.constants.push(value);
      this.indexes.set(value, index);
    }
    return index;
  }
}

type ExprGen = {
  dst: T;
  insns: RawInsn[];
};

// TODO: Implement concat (different format from other binops)
// @ts-ignore
const BINARY_OPERATOR_OPCODES: Record<
  StrictBinaryOperator,
  | Opcode.ADD
  | Opcode.SUB
  | Opcode.MUL
  | Opcode.DIV
  | Opcode.MOD
  | Opcode.POW /* | Opcode.CONCAT */
> = {
  "+": Opcode.ADD,
  "-": Opcode.SUB,
  "*": Opcode.MUL,
  "/": Opcode.DIV,
  "%": Opcode.MOD,
  "^": Opcode.POW,
  /* "..": Opcode.CONCAT, */
};

const UNARY_OPERATOR_OPCODES: Record<
  UnaryOperator,
  Opcode.UNM | Opcode.NOT | Opcode.LEN
> = {
  "-": Opcode.UNM,
  not: Opcode.NOT,
  "#": Opcode.LEN,
};

export class ExprGenVisitor extends ExprVisitor<ExprGen> {
  constants: ConstantPool;
  registerAllocator: TemporaryRegisterAllocator;

  constructor(
    constants: ConstantPool,
    registerAllocator: TemporaryRegisterAllocator
  ) {
    super();
    this.constants = constants;
    this.registerAllocator = registerAllocator;
  }

  unaryOp(op: UnaryOperator, expr: ExprGen): ExprGen {
    const dst = this.registerAllocator.alloc();
    const type = UNARY_OPERATOR_OPCODES[op];
    const insns = expr.insns;
    insns.push({ type, dst, src: expr.dst });
    return { dst, insns };
  }

  binOp(op: StrictBinaryOperator, left: ExprGen, right: ExprGen): ExprGen {
    const dst = this.registerAllocator.alloc();
    const type = BINARY_OPERATOR_OPCODES[op];
    const insns: RawInsn[] = [
      ...left.insns,
      ...right.insns,
      { type, dst, lhs: left.dst, rhs: right.dst },
    ];
    return { dst, insns };
  }

  binOpLazy(
    op: LazyBinaryOperator,
    left: ExprGen,
    rightLazy: () => ExprGen
  ): ExprGen {
    throw new Error("Method not implemented.");
  }

  constant(expr: ConstantExpr): ExprGen {
    if (expr.value instanceof Ellipsis) {
      throw new Error();
    }

    const dst = this.registerAllocator.alloc();
    const index = this.constants.indexOf(expr.value);

    return {
      dst,
      insns: [{ type: Opcode.LOADK, dst, src: K(index) }],
    };
  }

  func(expr: FunctionExpr): ExprGen {
    throw new Error("Method not implemented.");
  }

  identifier(expr: Identifier): ExprGen {
    throw new Error("Method not implemented.");
  }

  table(expr: TableExpr<ExprGen>): ExprGen {
    throw new Error("Method not implemented.");
  }

  index(target: ExprGen, key: string | ExprGen): ExprGen {
    throw new Error("Method not implemented.");
  }

  call(target: ExprGen, args: ExprGen[], method?: string | undefined): ExprGen {
    throw new Error("Method not implemented.");
  }
}

export class StatementGenVisitor extends StatementVisitor<RawInsn[]> {
  constants: ConstantPool;
  registerAllocator: TemporaryRegisterAllocator;
  exprVisitor: ExprGenVisitor;

  constructor() {
    super();
    this.constants = new ConstantPool();
    this.registerAllocator = new TemporaryRegisterAllocator();
    this.exprVisitor = new ExprGenVisitor(
      this.constants,
      this.registerAllocator
    );
  }

  assign(stmt: AssignStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  label(stmt: LabelStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  break(stmt: BreakStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  do(stmt: DoStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  while(stmt: WhileStatement): RawInsn[] {
    const insns: RawInsn[] = [];
    const bodyInsns = genBlock(stmt.body);

    return insns;
  }
  repeat(stmt: RepeatStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  ifelse(stmt: IfElseStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  forrange(stmt: ForRangeStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  forin(stmt: ForInStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  func(stmt: FunctionStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  declare(stmt: DeclareStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  call(stmt: CallStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
}

export const genBlock = (block: Block): RawInsn[] => {
  const insns: RawInsn[] = [];
  const visitor = new StatementGenVisitor();

  block.statements.forEach((stmt) => {
    const stmtInsns = visitor.visit(stmt);
    for (let i = 0; i < stmtInsns.length; ++i) {
      insns.push(stmtInsns[i]);
    }
  });

  if (block.returnExprs.length > 0) {
    // TODO: Generate RETURN instruction
  }

  return insns;
};
