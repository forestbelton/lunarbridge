import {
  AssignStatement,
  Block,
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
} from "../ast/ast.js";
import { StatementVisitor } from "../ast/visitor.js";
import { RawInsn } from "./insn.js";

class StatementGenVisitor extends StatementVisitor<RawInsn[]> {
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
    throw new Error("Method not implemented.");
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
