import { expect } from "chai";

import { InterpretExprVisitor } from "../dist/runtime/eval.js";
import { LuaEnvironment, LuaTable } from "../dist/runtime/value.js";
import {
  Block,
  ConstantExpr,
  FunctionExpr,
  TableExpr,
  UnaryOpExpr,
} from "../dist/parser/ast.js";

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
      describe("bitwise not", () => {
        it("number", () => {
          expect(
            visitor.visit(new UnaryOpExpr("~", new ConstantExpr(0)))
          ).to.equal(~0);
        });

        it("metamethod", () => {
          const table = new LuaTable();
          table.metatable = new LuaTable(new Map([["__bnot", (x) => x]]));
          expect(visitor.unaryOp("~", table)).to.equal(
            table,
            "__bnot metamethod invoked"
          );
        });

        it("invalid value", () => {
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
        });
      });

      describe("logical not", () => {
        it("boolean", () => {
          expect(
            visitor.visit(new UnaryOpExpr("not", new ConstantExpr(false)))
          ).to.equal(true, "false");
          expect(
            visitor.visit(new UnaryOpExpr("not", new ConstantExpr(true)))
          ).to.equal(false, "true");
        });

        it("nil", () => {
          expect(
            visitor.visit(new UnaryOpExpr("not", new ConstantExpr(null)))
          ).to.equal(true, "nil");
        });

        it("number", () => {
          expect(
            visitor.visit(new UnaryOpExpr("not", new ConstantExpr(0)))
          ).to.equal(false);
          expect(
            visitor.visit(new UnaryOpExpr("not", new ConstantExpr(123)))
          ).to.equal(false);
          expect(
            visitor.visit(new UnaryOpExpr("not", new ConstantExpr(-123)))
          ).to.equal(false);
        });

        it("string", () => {
          expect(
            visitor.visit(new UnaryOpExpr("not", new ConstantExpr("")))
          ).to.equal(false);
          expect(
            visitor.visit(new UnaryOpExpr("not", new ConstantExpr("abc")))
          ).to.equal(false);
        });

        it("table", () => {
          expect(
            visitor.visit(new UnaryOpExpr("not", new TableExpr([])))
          ).to.equal(false);
          expect(
            visitor.visit(
              new UnaryOpExpr(
                "not",
                new TableExpr([new ConstantExpr("x"), new ConstantExpr(1)])
              )
            )
          ).to.equal(false);
        });

        it("function", () => {
          expect(
            visitor.visit(
              new UnaryOpExpr("not", new FunctionExpr([], new Block([])))
            )
          ).to.equal(false);
        });
      });

      describe("arithmetic not", () => {
        it("number", () => {
          expect(
            visitor.visit(new UnaryOpExpr("-", new ConstantExpr(123)))
          ).to.equal(-123, "number");
        });

        it("metamethod", () => {
          const table = new LuaTable();
          table.metatable = new LuaTable(new Map([["__unm", (x) => x]]));
          expect(visitor.unaryOp("-", table)).to.equal(
            table,
            "__bnot metamethod invoked"
          );
        });

        it("invalid value", () => {
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
        });
      });

      describe("length", () => {
        it("string", () => {
          expect(
            visitor.visit(new UnaryOpExpr("#", new ConstantExpr("")))
          ).to.equal(0);
          expect(
            visitor.visit(new UnaryOpExpr("#", new ConstantExpr("test")))
          ).to.equal(4);
        });

        it("table", () => {
          expect(
            visitor.visit(new UnaryOpExpr("#", new TableExpr([])))
          ).to.equal(0);

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
          ).to.equal(2);
        });

        it("metamethod", () => {
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
});
