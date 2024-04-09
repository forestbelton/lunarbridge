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
import { GenState, RawInsn } from "./utils.js";
import { genBlock } from "./block.js";

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
    throw new Error("Method not implemented.");
  }
  repeat(stmt: RepeatStatement): RawInsn[] {
    throw new Error("Method not implemented.");
  }
  ifelse(stmt: IfElseStatement): RawInsn[] {
    const insns: RawInsn[] = [];
    for (let ifBody of stmt.ifBodies) {
      const cond = this.exprVisitor.visit(ifBody[0]);
    }
    if (stmt.elseBody !== null) {
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
    throw new Error("Method not implemented.");
  }
}
