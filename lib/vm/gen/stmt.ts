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
import { ConstantPool, RawInsn, TemporaryRegisterAllocator } from "./utils.js";
import { genBlock } from "./block.js";

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
