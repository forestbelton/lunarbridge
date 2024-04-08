import {
  ConstantExpr,
  Ellipsis,
  FunctionExpr,
  Identifier,
  LazyBinaryOperator,
  StrictBinaryOperator,
  TableExpr,
  UnaryOperator,
} from "../../ast/ast.js";
import { ExprVisitor } from "../../ast/visitor.js";
import { K, Opcode } from "../insn.js";
import {
  ConstantPool,
  RawInsn,
  T,
  TemporaryRegisterAllocator,
} from "./utils.js";

export type ExprGen = {
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
