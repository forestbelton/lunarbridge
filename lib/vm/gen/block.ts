import { Block } from "../../ast/ast.js";
import { StatementGenVisitor } from "./stmt.js";
import { GenState, RawInsn } from "./utils.js";

export const genBlock = (
  block: Block,
  state: GenState | null = null
): RawInsn[] => {
  state = state || new GenState();

  const insns: RawInsn[] = [];
  const visitor = new StatementGenVisitor(state);

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
