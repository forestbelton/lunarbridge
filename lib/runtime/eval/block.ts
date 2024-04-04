import { Block } from "../../parser/ast.js";
import { LuaEnvironment, LuaTable, LuaValue } from "../value.js";
import { InterpretExprVisitor } from "./expression.js";
import { InterpretStatementVisitor } from "./statement.js";

export const evalBlock = (env: LuaEnvironment, block: Block): LuaValue => {
  const stmtVisitor = new InterpretStatementVisitor(env);
  const exprVisitor = new InterpretExprVisitor(env);

  block.statements.forEach((stmt) => {
    stmtVisitor.visit(stmt);
  });

  let value = null;
  if (block.returnExprs.length === 1) {
    value = exprVisitor.visit(block.returnExprs[0]);
  } else if (block.returnExprs.length > 1) {
    // TODO: Fix this, it's not really correct.
    value = new LuaTable(
      block.returnExprs.map((expr) => exprVisitor.visit(expr))
    );
  }
  return value;
};
