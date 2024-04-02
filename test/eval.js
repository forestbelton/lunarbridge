import { expect } from "chai";

import { InterpretExprVisitor } from "../dist/runtime/eval.js";
import { LuaEnvironment, LuaTable } from "../dist/runtime/value.js";
import { ConstantExpr, TableExpr, UnaryOpExpr } from "../dist/parser/ast.js";

describe("evaluation", () => {
  describe("expressions", () => {
    const visitor = new InterpretExprVisitor(new LuaEnvironment());

    it("constants", () => {
      expect(visitor.visit(new ConstantExpr(null))).to.equal(null);
      expect(visitor.visit(new ConstantExpr(true))).to.equal(true);
      expect(visitor.visit(new ConstantExpr(false))).to.equal(false);
      expect(visitor.visit(new ConstantExpr(""))).to.equal("");
      expect(visitor.visit(new ConstantExpr("test"))).to.equal("test");
      expect(visitor.visit(new ConstantExpr(123))).to.equal(123);
      expect(visitor.visit(new ConstantExpr(-456))).to.equal(-456);
      expect(visitor.visit(new ConstantExpr(0.5))).to.be.closeTo(0.5, 0.000001);
    });

    describe("unary operations", () => {
      it("bitwise not", () => {
        expect(() =>
          visitor.visit(new UnaryOpExpr("~", new ConstantExpr(null)))
        ).to.throw("attempt to perform bitwise operation on a nil value");

        expect(() =>
          visitor.visit(new UnaryOpExpr("~", new ConstantExpr(false)))
        ).to.throw("attempt to perform bitwise operation on a boolean value");

        expect(() =>
          visitor.visit(new UnaryOpExpr("~", new ConstantExpr("abc")))
        ).to.throw("attempt to perform bitwise operation on a string value");

        expect(() =>
          visitor.visit(new UnaryOpExpr("~", new TableExpr([])))
        ).to.throw("attempt to perform bitwise operation on a table value");

        expect(
          visitor.visit(new UnaryOpExpr("~", new ConstantExpr(0)))
        ).to.equal(~0, "number");

        const table = new LuaTable();
        table.metatable = new LuaTable(new Map([["__bnot", (x) => x]]));
        expect(visitor.unaryOp("~", table)).to.equal(
          table,
          "__bnot metamethod invoked"
        );
      });

      it("logical not", () => {
        expect(
          visitor.visit(new UnaryOpExpr("not", new ConstantExpr(false)))
        ).to.equal(true, "false");
        expect(
          visitor.visit(new UnaryOpExpr("not", new ConstantExpr(true)))
        ).to.equal(false, "true");

        expect(
          visitor.visit(new UnaryOpExpr("not", new ConstantExpr(null)))
        ).to.equal(true, "nil");

        expect(
          visitor.visit(new UnaryOpExpr("not", new ConstantExpr(0)))
        ).to.equal(false, "zero");
        expect(
          visitor.visit(new UnaryOpExpr("not", new ConstantExpr(123)))
        ).to.equal(false, "positive number");
        expect(
          visitor.visit(new UnaryOpExpr("not", new ConstantExpr(-123)))
        ).to.equal(false, "negative number");

        expect(
          visitor.visit(new UnaryOpExpr("not", new ConstantExpr("")))
        ).to.equal(false, "empty string");
        expect(
          visitor.visit(new UnaryOpExpr("not", new ConstantExpr("abc")))
        ).to.equal(false, "nonempty string");

        expect(
          visitor.visit(new UnaryOpExpr("not", new TableExpr([])))
        ).to.equal(false, "empty table");
        expect(
          visitor.visit(
            new UnaryOpExpr(
              "not",
              new TableExpr([new ConstantExpr("x"), new ConstantExpr(1)])
            )
          )
        ).to.equal(false, "nonempty table");
      });

      it("negate", () => {
        expect(() =>
          visitor.visit(new UnaryOpExpr("-", new ConstantExpr(null)))
        ).to.throw("attempt to perform negation on a nil value");

        expect(() =>
          visitor.visit(new UnaryOpExpr("-", new ConstantExpr(false)))
        ).to.throw("attempt to perform negation on a boolean value");

        expect(() =>
          visitor.visit(new UnaryOpExpr("-", new ConstantExpr("abc")))
        ).to.throw("attempt to perform negation on a string value");

        expect(() =>
          visitor.visit(new UnaryOpExpr("-", new TableExpr([])))
        ).to.throw("attempt to perform negation on a table value");

        expect(
          visitor.visit(new UnaryOpExpr("-", new ConstantExpr(123)))
        ).to.equal(-123, "number");

        const table = new LuaTable();
        table.metatable = new LuaTable(new Map([["__unm", (x) => x]]));
        expect(visitor.unaryOp("-", table)).to.equal(
          table,
          "__bnot metamethod invoked"
        );
      });

      it("length", () => {
        expect(
          visitor.visit(new UnaryOpExpr("#", new ConstantExpr("")))
        ).to.equal(0, "empty string length");

        expect(
          visitor.visit(new UnaryOpExpr("#", new ConstantExpr("test")))
        ).to.equal(4, "nonempty string length");

        expect(visitor.visit(new UnaryOpExpr("#", new TableExpr([])))).to.equal(
          0,
          "empty table length"
        );

        expect(
          visitor.visit(
            new UnaryOpExpr(
              "#",
              new TableExpr([
                [new ConstantExpr(1), new ConstantExpr(0)],
                [new ConstantExpr(2), new ConstantExpr(1)],
              ])
            )
          )
        ).to.equal(2, "nonempty table length");

        const table = new LuaTable();
        table.metatable = new LuaTable(new Map([["__len", (x) => x]]));
        expect(visitor.unaryOp("#", table)).to.equal(
          table,
          "__len metamethod invoked"
        );
      });
    });
  });
});
