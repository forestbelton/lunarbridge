import { BinOpExpr, CallExpr, IndexExpr, UnaryOpExpr } from "./ast.js";

const KEYWORDS = [
  "nil",
  "false",
  "true",
  "function",
  "do",
  "end",
  "repeat",
  "until",
  "if",
  "then",
  "break",
  "goto",
  "while",
  "elseif",
  "else",
  "for",
  "in",
  "local",
  "return",
  "or",
  "and",
  "not",
];

export const isKeyword = (str) => KEYWORDS.includes(str);

export const parseDecimal = (whole, frac, expt) => {
  let num = parseInt(whole, 10);
  if (frac !== null) {
    num += parseInt(frac, 10) / Math.pow(10, frac.length);
  }
  if (expt) {
    num *= Math.pow(10, expt);
  }
  return num;
};

export const parseHex = (whole, frac, expt) => {
  let num = parseInt(whole, 16);
  if (frac !== null) {
    num += parseInt(frac, 16) / Math.pow(16, frac.length);
  }
  if (expt) {
    num *= Math.pow(2, expt);
  }
  return num;
};

export const parseExpt = (sign, digits) =>
  parseInt(digits, 10) * (sign === "-" ? -1 : 1);

export const lassoc = (head, tail) =>
  tail.reduce(
    (result, element) => new BinOpExpr(element[0], result, element[1]),
    head
  );

export const lassoc1 = (op, exprs) =>
  exprs
    .slice(1)
    .reduce((result, element) => new BinOpExpr(op, result, element), exprs[0]);

export const unary = (ops, expr) =>
  ops.reduce((acc, op) => new UnaryOpExpr(op, acc), expr);

export const lastSuffixIs = (type, suffixes) =>
  suffixes.length === 0 || suffixes[suffixes.length - 1].type === type;

export const suffix = (type, data) => ({ type, ...data });

export const attachSuffixes = (expr, suffixes) =>
  (suffixes || []).reduce(
    (target, { type, ...data }) =>
      type === "index"
        ? new IndexExpr(data.key, target)
        : new CallExpr(target, data.args, data.method),
    expr
  );
