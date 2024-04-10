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
import { GenState, RawInsn, T } from "./utils.js";

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
  state: GenState;

  constructor(state: GenState) {
    super();
    this.state = state;
  }

  unaryOp(op: UnaryOperator, expr: ExprGen): ExprGen {
    const dst = this.state.allocator.alloc();
    const insn = { type: UNARY_OPERATOR_OPCODES[op], dst, src: expr.dst };
    return {
      dst,
      insns: [...expr.insns, insn],
    };
  }

  binOp(op: StrictBinaryOperator, left: ExprGen, right: ExprGen): ExprGen {
    const dst = this.state.allocator.alloc();
    const insn = {
      type: BINARY_OPERATOR_OPCODES[op],
      dst,
      lhs: left.dst,
      rhs: right.dst,
    };
    return {
      dst,
      insns: [...left.insns, ...right.insns, insn],
    };
  }

  binOpLazy(
    op: LazyBinaryOperator,
    left: ExprGen,
    rightLazy: () => ExprGen
  ): ExprGen {
    const right = rightLazy();
    const dst = this.state.allocator.alloc();
    const insns: RawInsn[] = [
      ...left.insns,
      ...right.insns,
      { type: Opcode.TESTSET, dst, src: left.dst, value: op === "or" },
      { type: Opcode.JMP, offset: 1 },
      { type: Opcode.MOVE, dst, src: right.dst },
    ];
    return { dst, insns };
  }

  constant(expr: ConstantExpr): ExprGen {
    if (expr.value instanceof Ellipsis) {
      throw new Error();
    }

    const dst = this.state.allocator.alloc();
    const src = K(this.state.constants.indexOf(expr.value));

    return { dst, insns: [{ type: Opcode.LOADK, dst, src }] };
  }

  func(expr: FunctionExpr): ExprGen {
    throw new Error("Method not implemented.");
  }

  identifier(expr: Identifier): ExprGen {
    throw new Error("Method not implemented.");
  }

  table(expr: TableExpr<ExprGen>): ExprGen {
    const dst = this.state.allocator.alloc();
    const insns: RawInsn[] = [{ type: Opcode.NEWTABLE, dst }];

    expr.fields.forEach((field) => {
      let key: K | T;
      let value: K | T;

      if (field instanceof Array) {
        if (typeof field[0] === "object") {
          key = field[0].dst;
          insns.push(...field[0].insns);
        } else {
          key = K(this.state.constants.indexOf(field[0]));
        }
        insns.push(...field[1].insns);
        value = field[1].dst;
      } else {
        key = this.state.allocator.alloc();
        value = field.dst;

        const one = this.state.constants.indexOf(1);
        insns.push(
          ...field.insns,
          { type: Opcode.LEN, dst: key, src: dst },
          { type: Opcode.ADD, dst: key, lhs: key, rhs: K(one) }
        );
      }

      insns.push({
        type: Opcode.SETTABLE,
        table: dst,
        key,
        value,
      });
    });

    return { dst, insns };
  }

  index(target: ExprGen, key: string | ExprGen): ExprGen {
    const dst = this.state.allocator.alloc();
    const insns =
      typeof key === "string" ? target.insns : [...target.insns, ...key.insns];
    const k =
      typeof key === "string" ? K(this.state.constants.indexOf(key)) : key.dst;
    insns.push({
      type: Opcode.GETTABLE,
      dst,
      src: target.dst,
      key: k,
    });
    return { dst, insns };
  }

  call(target: ExprGen, args: ExprGen[], method?: string | undefined): ExprGen {
    // TODO: Support method call (call SELF)
    if (typeof method !== "undefined") {
      throw new Error("Method not implemented.");
    }

    const insns = target.insns;
    for (let i = 0; i < args.length; ++i) {
      insns.push(...args[i].insns);
    }

    const func = this.state.allocator.alloc();
    insns.push({ type: Opcode.MOVE, dst: func, src: target.dst });
    for (let i = 0; i < args.length; ++i) {
      const dst = this.state.allocator.alloc();
      insns.push({ type: Opcode.MOVE, dst, src: args[i].dst });
    }

    // TODO: Populate `retvals` somehow
    insns.push({ type: Opcode.CALL, func, arity: args.length + 1, retvals: 0 });
    return { dst: func, insns };
  }
}
