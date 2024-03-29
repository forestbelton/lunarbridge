import { expect } from "chai";

import { parse } from "../build/parser/parser.js";
import {
  CallExpr,
  IndexExpr,
  UnaryOpExpr,
  BinOpExpr,
  ConstantExpr,
  Identifier,
  TableExpr,
  FALSE,
  TRUE,
  NIL,
} from "../build/parser/ast.js";

const EPSILON = 0.000001;

describe("expressions", () => {
  const parseExpr = (s) => parse(s, { startRule: "expr" });

  const parseInteger = (s, x) => {
    const result = parseExpr(s);
    expect(result).to.be.an.instanceof(ConstantExpr);
    expect(result.value).to.be.a("number");
    expect(result.value).to.equal(x);
  };

  const parseFloat = (s, x) => {
    const result = parseExpr(s);
    expect(result).to.be.an.instanceof(ConstantExpr);
    expect(result.value).to.be.a("number");
    expect(result.value).to.be.closeTo(x, EPSILON);
  };

  it("constant keywords", () => {
    expect(parseExpr("nil")).to.equal(NIL);
    expect(parseExpr("true")).to.equal(TRUE);
    expect(parseExpr("false")).to.equal(FALSE);
  });

  it("numbers", () => {
    parseInteger("123", 123);
    parseInteger("0xff", 0xff);
    parseInteger("0xBEBADA", 0xbebada);
    parseFloat("3.0", 3.0);
    parseFloat("3.1416", 3.1416);
    parseFloat("0.31416E1", 3.1416);
    parseFloat("34e1", 340);
    parseFloat("0x1.fp10", 1984);
  });

  it("tables", () => {
    const result = parseExpr(`{x=1, [y]=true, {1,2,3},}`);
    expect(result).to.be.an.instanceof(TableExpr);
    expect(result.fields).to.have.lengthOf(3);
    expect(result.fields[0]).to.deep.equal(["x", new ConstantExpr(1)]);
    expect(result.fields[1]).to.deep.equal([new Identifier("y"), TRUE]);
    expect(result.fields[2]).to.deep.equal(
      new TableExpr([
        new ConstantExpr(1),
        new ConstantExpr(2),
        new ConstantExpr(3),
      ])
    );
  });

  it("binary operations", () => {
    expect(parseExpr("x < 1 + 2 * 3")).to.deep.equal(
      new BinOpExpr(
        "<",
        new Identifier("x"),
        new BinOpExpr(
          "+",
          new ConstantExpr(1),
          new BinOpExpr("*", new ConstantExpr(2), new ConstantExpr(3))
        )
      )
    );

    expect(parseExpr("1 ^ 2 ^ 3")).to.deep.equal(
      new BinOpExpr(
        "^",
        new ConstantExpr(1),
        new BinOpExpr("^", new ConstantExpr(2), new ConstantExpr(3))
      )
    );
  });

  it("unary operations", () => {
    expect(parseExpr("#tbl")).to.deep.equal(
      new UnaryOpExpr("#", new Identifier("tbl"))
    );
  });

  it("indexed values", () => {
    expect(parseExpr("tbl.x")).to.deep.equal(
      new IndexExpr(new ConstantExpr("x"), new Identifier("tbl"))
    );

    expect(parseExpr("tbl[1]")).to.deep.equal(
      new IndexExpr(new ConstantExpr(1), new Identifier("tbl"))
    );

    expect(parseExpr("tbl1.tbl2.x")).to.deep.equal(
      new IndexExpr(
        new ConstantExpr("x"),
        new IndexExpr(new ConstantExpr("tbl2"), new Identifier("tbl1"))
      )
    );
  });

  it("calls", () => {
    expect(parseExpr("foo(1,2,3)")).to.deep.equal(
      new CallExpr(new Identifier("foo"), [
        new ConstantExpr(1),
        new ConstantExpr(2),
        new ConstantExpr(3),
      ])
    );

    expect(parseExpr("tbl:method(true)")).to.deep.equal(
      new CallExpr(new Identifier("tbl"), [new ConstantExpr(true)], "method")
    );
  });
});
