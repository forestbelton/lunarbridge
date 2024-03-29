import { expect } from "chai";

import { parse } from "../lib/parser/index.js";
import {
  BinOpExpr,
  ConstantExpr,
  Identifier,
  TableExpr,
  FALSE,
  TRUE,
  NIL,
} from "../lib/parser/ast.js";

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

  it("should parse constant keywords", () => {
    expect(parseExpr("nil")).to.equal(NIL);
    expect(parseExpr("true")).to.equal(TRUE);
    expect(parseExpr("false")).to.equal(FALSE);
  });

  it("should parse numbers", () => {
    parseInteger("123", 123);
    parseInteger("0xff", 0xff);
    parseInteger("0xBEBADA", 0xbebada);
    parseFloat("3.0", 3.0);
    parseFloat("3.1416", 3.1416);
    parseFloat("0.31416E1", 3.1416);
    parseFloat("34e1", 340);
    parseFloat("0x1.fp10", 1984);
  });

  it("should parse tables", () => {
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

  it("should parse complex expressions", () => {
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
});
