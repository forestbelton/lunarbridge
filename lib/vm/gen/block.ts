import { Block } from "../../ast/ast.js";
import { StatementGenVisitor } from "./stmt.js";
import { RawInsn } from "./utils.js";

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
