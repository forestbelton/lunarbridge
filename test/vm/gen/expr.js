import { expect } from "chai";

import {
  ConstantPool,
  TemporaryRegisterAllocator,
  T,
  GenState,
} from "../../../dist/vm/gen/utils.js";
import { ExprGenVisitor } from "../../../dist/vm/gen/expr.js";
import { K, Opcode } from "../../../dist/vm/insn.js";
import { ConstantExpr } from "../../../dist/ast/ast.js";

describe("expression generation", () => {
  let visitor = new ExprGenVisitor(new GenState());

  beforeEach(() => {
    visitor = new ExprGenVisitor(new GenState());
  });

  it("constants", () => {
    const gen1 = visitor.visit(new ConstantExpr(0));
    expect(gen1.dst).to.deep.equal(T(0));
    expect(gen1.insns).to.deep.equal([
      { type: Opcode.LOADK, dst: T(0), src: K(0) },
    ]);

    const gen2 = visitor.visit(new ConstantExpr("abc"));
    expect(gen2.dst).to.deep.equal(T(1));
    expect(gen2.insns).to.deep.equal([
      { type: Opcode.LOADK, dst: T(1), src: K(1) },
    ]);

    const gen3 = visitor.visit(new ConstantExpr(true));
    expect(gen3.dst).to.deep.equal(T(2));
    expect(gen3.insns).to.deep.equal([
      { type: Opcode.LOADK, dst: T(2), src: K(2) },
    ]);

    const gen4 = visitor.visit(new ConstantExpr(true));
    expect(gen4.dst).to.deep.equal(T(3));
    expect(gen4.insns).to.deep.equal([
      { type: Opcode.LOADK, dst: T(3), src: K(2) },
    ]);

    const gen5 = visitor.visit(new ConstantExpr(null));
    expect(gen5.dst).to.deep.equal(T(4));
    expect(gen5.insns).to.deep.equal([
      { type: Opcode.LOADK, dst: T(4), src: K(3) },
    ]);
  });

  it("unary operations", () => {});
});
