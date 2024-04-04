import { expect } from "chai";

import { InterpretExprVisitor } from "../dist/runtime/eval.js";
import { LuaEnvironment, LuaTable } from "../dist/runtime/value.js";
import {
  BinOpExpr,
  Block,
  ConstantExpr,
  FunctionExpr,
  Identifier,
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

    it("functions", () => {
      const func = visitor.visit(
        new FunctionExpr(
          ["x"],
          new Block(
            [],
            [new BinOpExpr("+", new Identifier("x"), new ConstantExpr(1))]
          )
        )
      );

      expect(func).to.be.a("function");
      expect(func(123)).to.equal(124);
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

    describe("binary operations", () => {
      describe("addition", () => {
        it("number + number", () => {
          expect(
            visitor.visit(
              new BinOpExpr("+", new ConstantExpr(1), new ConstantExpr(2))
            )
          ).to.equal(3);
        });
        it("number + metamethod", () => {
          const tableRight = new LuaTable();
          tableRight.metatable = new LuaTable(
            new Map([["__add", (x, y) => y]])
          );
          expect(visitor.binOp("+", tableRight, 1)).to.equal(1);

          const tableLeft = new LuaTable();
          tableLeft.metatable = new LuaTable(new Map([["__add", (x, y) => x]]));
          expect(visitor.binOp("+", 1, tableLeft)).to.equal(1);
        });
      });
    });

    describe("concatenation", () => {
      it("number .. string", () => {
        expect(
          visitor.visit(
            new BinOpExpr("..", new ConstantExpr("a"), new ConstantExpr(123))
          )
        ).to.equal("a123");
      });

      it("string .. number", () => {
        expect(
          visitor.visit(
            new BinOpExpr("..", new ConstantExpr("123"), new ConstantExpr("a"))
          )
        ).to.equal("123a");
      });

      it("string .. string", () => {
        expect(
          visitor.visit(
            new BinOpExpr(
              "..",
              new ConstantExpr("abc"),
              new ConstantExpr("def")
            )
          )
        ).to.equal("abcdef");
      });

      it("metamethod", () => {
        const tableRight = new LuaTable();
        tableRight.metatable = new LuaTable(
          new Map([["__concat", (x, y) => "abc" + y.toString()]])
        );
        expect(visitor.binOp("..", tableRight, 123)).to.equal("abc123");

        const tableLeft = new LuaTable();
        tableLeft.metatable = new LuaTable(
          new Map([["__concat", (x, y) => x.toString() + "abc"]])
        );
        expect(visitor.binOp("..", 123, tableLeft)).to.equal("123abc");
      });

      it("invalid value", () => {
        expect(() =>
          visitor.visit(
            new BinOpExpr("..", new ConstantExpr(null), new ConstantExpr("a"))
          )
        ).to.throw("attempt to concatenate a nil value");
        expect(() =>
          visitor.visit(
            new BinOpExpr("..", new TableExpr([]), new ConstantExpr("a"))
          )
        ).to.throw("attempt to concatenate a table value");
        expect(() =>
          visitor.visit(
            new BinOpExpr("..", new ConstantExpr(false), new ConstantExpr("a"))
          )
        ).to.throw("attempt to concatenate a boolean value");
        expect(() =>
          visitor.visit(
            new BinOpExpr(
              "..",
              new FunctionExpr([], new Block([], [])),
              new ConstantExpr("a")
            )
          )
        ).to.throw("attempt to concatenate a function value");
      });
    });
  });
});
