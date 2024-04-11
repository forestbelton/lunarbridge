import { Block } from "../../ast/ast.js";
import { LuaFunction } from "../func.js";
import { Insn, Opcode, OperandType } from "../insn.js";
import { StatementGenVisitor } from "./stmt.js";
import { GenState, RawInsn, T } from "./utils.js";

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

  return insns;
};

const allocateInsns = (insns: RawInsn[]): Insn[] => {
  // TODO: Register allocation. For now we just allocate a register for every
  // temporary (obviously very inefficient)
  insns.forEach((insn) => {
    for (const key of Object.keys(insn)) {
      // @ts-ignore
      if (typeof insn[key] === "object" && insn[key].type === OperandType.T) {
        // @ts-ignore
        insn[key].type = OperandType.R;
      }
    }
  });

  // @ts-ignore
  return insns;
};

export const genFunc = (
  block: Block,
  state: GenState | null = null
): LuaFunction => {
  state = state || new GenState();

  const insns = genBlock(block, state);
  const allocatedInsns = allocateInsns(insns);

  return new LuaFunction(
    state.allocator.nextRegisterIndex,
    allocatedInsns,
    state.getConstants(),
    [],
    [],
    [],
    { filename: "", lineNumberStart: 0, lineNumberEnd: 0, sourceLines: [] }
  );
};
