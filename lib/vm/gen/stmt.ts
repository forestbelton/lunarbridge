import {
  AssignStatement,
  BreakStatement,
  CallStatement,
  DeclareStatement,
  DoStatement,
  ForInStatement,
  ForRangeStatement,
  FunctionStatement,
  IfElseStatement,
  LabelStatement,
  RepeatStatement,
  WhileStatement,
} from "../../ast/ast.js";
import { StatementVisitor } from "../../ast/visitor.js";
import { ExprGenVisitor } from "./expr.js";
import { GenState, RawInsn, T } from "./utils.js";
import { genBlock } from "./block.js";
import { JumpInsn, Opcode } from "../insn.js";

export class StatementGenVisitor extends StatementVisitor<RawInsn[]> {
  state: GenState;
  exprVisitor: ExprGenVisitor;

  constructor(state: GenState) {
    super();
    this.state = state;
    this.exprVisitor = new ExprGenVisitor(state);
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

    const cond = this.exprVisitor.visit(stmt.cond);
    const body = genBlock(stmt.body, this.state);

    const test: RawInsn = { type: Opcode.TEST, src: cond.dst, value: false };
    const skip: JumpInsn = { type: Opcode.JMP, offset: body.length };
    const loop: JumpInsn = {
      type: Opcode.JMP,
      offset: -(body.length + 2 + cond.insns.length + 1),
    };

    insns.push(...cond.insns, test, skip, ...body, loop);

    return insns;
  }

  repeat(stmt: RepeatStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }

  ifelse(stmt: IfElseStatement): RawInsn[] {
    const insns: RawInsn[] = [];
    const jumps: Record<number, JumpInsn> = {};

    for (const ifBody of stmt.ifBodies) {
      const [cond, block] = ifBody;
      const condInsns = this.exprVisitor.visit(cond);

      insns.push(...condInsns.insns, {
        type: Opcode.TEST,
        src: condInsns.dst,
        value: false,
      });

      const jump: JumpInsn = { type: Opcode.JMP, offset: -1 };
      jumps[insns.length] = jump;
      insns.push(jump);

      const blockInsns = genBlock(block, this.state);
      insns.push(...blockInsns);
    }

    if (stmt.elseBody !== null) {
      const elseInsns = genBlock(stmt.elseBody, this.state);
      insns.push(...elseInsns);
    }

    // Fix jumps
    const end = insns.length;
    for (const [index, jump] of Object.entries(jumps)) {
      jump.offset = end - parseInt(index, 10);
    }

    return insns;
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
    const { insns } = this.exprVisitor.visit(stmt.call);
    return insns;
  }
}
