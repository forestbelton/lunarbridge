import { expect } from "chai";

import { parse } from "../lib/parser/index.js";
import { ConstantExpr, FALSE, TRUE, NIL } from "../lib/parser/ast.js";

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
});
